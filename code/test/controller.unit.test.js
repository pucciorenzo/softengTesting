import request from 'supertest';
import { app } from '../app';
import { categories, transactions } from '../models/model';
import { Group, User } from '../models/User';
import { handleAmountFilterParams, handleDateFilterParams, verifyAuth } from '../controllers/utils';
import { createCategory, createTransaction, deleteCategory, deleteTransaction, deleteTransactions, getAllTransactions, getCategories, getTransactionsByGroup, getTransactionsByGroupByCategory, getTransactionsByUser, getTransactionsByUserByCategory, updateCategory } from '../controllers/controller';

jest.mock('../models/model');
jest.mock('../controllers/utils');
jest.mock('../models/User');

beforeEach(() => {
    verifyAuth.mockClear();
    handleDateFilterParams.mockClear();
    handleAmountFilterParams.mockClear();

    categories.find.mockClear();
    transactions.find.mockClear();

    categories.findOne.mockClear();
    transactions.findOne.mockClear();
    User.findOne.mockClear();
    Group.findOne.mockClear();

    categories.updateMany.mockClear();
    transactions.updateMany.mockClear();
    User.updateMany.mockClear();
    Group.updateMany.mockClear();

    categories.deleteMany.mockClear();
    transactions.deleteMany.mockClear();
    User.deleteMany.mockClear();
    Group.deleteMany.mockClear();

    categories.deleteOne.mockClear();
    transactions.deleteOne.mockClear();
    User.deleteOne.mockClear();
    Group.deleteOne.mockClear();

    transactions.aggregate.mockClear();

    categories.prototype.save.mockClear();
    transactions.prototype.save.mockClear();
    User.prototype.save.mockClear();
    Group.prototype.save.mockClear();


});

describe("createCategory", () => {
    test('should create new category',
        async () => {

            const mockReq = {
                body: {
                    type: "testType",
                    color: "testColor"
                }
            }
            const mockRes = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
                locals: {
                }
            }
            const mockResStatus = 200
            const mockResData = {
                data: {
                    type: "testType",
                    color: "testColor"
                }
            }

            verifyAuth.mockReturnValue({ flag: true, cause: 'Authorized' })
            jest.spyOn(categories, 'findOne').mockResolvedValue(null);
            jest.spyOn(categories.prototype, 'save').mockResolvedValue({ _id: "0", type: "testType", color: "testColor" });

            await createCategory(mockReq, mockRes);

            expect(verifyAuth).toHaveBeenCalledWith(mockReq, mockRes, { authType: 'Admin' });
            expect(categories.prototype.save).toHaveBeenCalledWith();
            //expect(categories.find).toHaveBeenCalledWith({ type: "testType" });
            expect(mockRes.status).toHaveBeenCalledWith(mockResStatus);
            expect(mockRes.json).toHaveBeenCalledWith(mockResData);
        }
    );
})

describe("updateCategory", () => {
    test(
        "should update a category's both type and color",
        async () => {

            const mockReq = {
                params: {
                    type: "currentType"
                },
                body: {
                    type: "newType",
                    color: "newColor"
                }
            }
            const mockRes = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
                locals: {
                }
            }
            const mockCurrentCategory =
            {
                _id: '0',
                type: 'currentType',
                color: 'currentColor',
                save: jest.fn()
            }
            const mockResStatus = 200
            const mockResData = {
                data: {
                    message: "Category edited successfully",
                    count: 5
                }
            }

            verifyAuth.mockImplementation(() => {
                return { flag: true, cause: 'Authorized' }
            })
            categories.findOne
                .mockResolvedValueOnce(
                    mockCurrentCategory
                )
                .mockResolvedValueOnce(null);
            transactions.updateMany.mockResolvedValue({ modifiedCount: mockResData.data.count });

            await updateCategory(mockReq, mockRes);

            expect(verifyAuth).toHaveBeenCalledWith(mockReq, mockRes, { authType: 'Admin' });
            expect(categories.findOne).toHaveBeenCalledWith({ type: mockReq.params.type });
            expect(categories.findOne).toHaveBeenCalledWith({ type: mockReq.body.type });
            expect(mockCurrentCategory.save).toHaveBeenCalled()
            expect(transactions.updateMany).toHaveBeenCalledWith({ type: mockReq.params.type }, { type: mockReq.body.type });
            expect(mockRes.status).toHaveBeenCalledWith(mockResStatus);
            expect(mockRes.json).toHaveBeenCalledWith(mockResData);
        }
    );

    test(
        "should update a category's color only",
        async () => {

            const mockReq = {
                params: {
                    type: "currentType"
                },
                body: {
                    type: "currentType",
                    color: "newColor"
                }
            }
            const mockRes = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
                locals: {
                }
            }
            const mockCurrentCategory =
            {
                _id: '0',
                type: 'currentType',
                color: 'currentColor',
                save: jest.fn()
            }
            const mockResStatus = 200
            const mockResData = {
                data: {
                    message: "Category edited successfully",
                    count: 5
                }
            }
            verifyAuth.mockImplementation(() => {
                return { flag: true, cause: 'Authorized' }
            });
            categories.findOne
                .mockResolvedValueOnce(mockCurrentCategory)
            transactions.updateMany.mockResolvedValue({ modifiedCount: mockResData.data.count });

            await updateCategory(mockReq, mockRes);

            expect(verifyAuth).toHaveBeenCalledWith(mockReq, mockRes, { authType: 'Admin' });
            expect(categories.findOne).toHaveBeenCalledWith({ type: mockReq.params.type });
            expect(mockCurrentCategory.save).toHaveBeenCalled()
            expect(transactions.updateMany).toHaveBeenCalledWith({ type: mockReq.params.type }, { type: mockReq.body.type });
            expect(mockRes.status).toHaveBeenCalledWith(mockResStatus);
            expect(mockRes.json).toHaveBeenCalledWith(mockResData);
        }
    );
})

describe("deleteCategory", () => {
    test('should delete all categories except oldest and set transactions to oldest', async () => {
        const mockReq = {
            params: {
            },
            body: {
                types: ["C", "B", "A", "D", "E"]
            }
        }
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {
            }
        }
        const mockCategories = [
            { _id: 0, type: "A", color: "A" },
            { _id: 1, type: "B", color: "B" },
            { _id: 2, type: "C", color: "C" },
            { _id: 3, type: "D", color: "D" },
            { _id: 4, type: "E", color: "E" },
        ]

        const mockTypesToDelete = ["C", "B", "D", "E"];
        const mockModifiedCount = 15;
        const mockResStatus = 200
        const mockResData = {
            data: {
                message: "Categories deleted",
                count: mockModifiedCount
            }
        }

        verifyAuth.mockReturnValue({ flag: true, cause: 'Authorized' });
        categories.find.mockResolvedValue(mockCategories);
        categories.deleteMany.mockResolvedValue();
        transactions.updateMany.mockResolvedValue({ modifiedCount: mockModifiedCount });

        await deleteCategory(mockReq, mockRes);

        expect(verifyAuth).toHaveBeenCalledWith(mockReq, mockRes, { authType: 'Admin' });
        expect(categories.deleteMany).toHaveBeenCalledWith({ type: { $in: mockTypesToDelete } });
        expect(transactions.updateMany).toHaveBeenCalledWith({ type: { $in: mockTypesToDelete } }, { type: mockCategories[0].type });
        expect(mockRes.status).toHaveBeenCalledWith(mockResStatus);
        expect(mockRes.json).toHaveBeenCalledWith(mockResData);

    });

    test('should delete all categories and set transactions to oldest', async () => {
        const mockReq = {
            params: {
            },
            body: {
                types: ["C", "B", "A", "D"]
            }
        }
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {
            }
        }
        const mockCategories = [
            { _id: 0, type: "A", color: "A" },
            { _id: 1, type: "B", color: "B" },
            { _id: 2, type: "C", color: "C" },
            { _id: 3, type: "D", color: "D" },
            { _id: 4, type: "E", color: "E" },
        ]
        const mockTypesToDelete = ["C", "B", "A", "D"];
        const mockModifiedCount = 15;
        const mockResStatus = 200
        const mockResData = {
            data: {
                message: "Categories deleted",
                count: mockModifiedCount
            }
        }

        verifyAuth.mockReturnValue({ flag: true, cause: 'Authorized' });
        categories.find.mockResolvedValue(mockCategories);
        categories.deleteMany.mockResolvedValue();
        transactions.updateMany.mockResolvedValue({ modifiedCount: mockModifiedCount });

        await deleteCategory(mockReq, mockRes);

        expect(verifyAuth).toHaveBeenCalledWith(mockReq, mockRes, { authType: 'Admin' });
        expect(categories.deleteMany).toHaveBeenCalledWith({ type: { $in: mockTypesToDelete } });
        expect(transactions.updateMany).toHaveBeenCalledWith({ type: { $in: mockTypesToDelete } }, { type: "E" });
        expect(mockRes.status).toHaveBeenCalledWith(mockResStatus);
        expect(mockRes.json).toHaveBeenCalledWith(mockResData);

    });
})

describe("getCategories", () => {
    test('should retreive all categories', async () => {
        const mockReq = {
            params: {
            },
            body: {
            }
        }
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {
            }
        }
        const mockCategories = [
            { _id: 0, type: "A", color: "A" },
            { _id: 1, type: "B", color: "B" },
            { _id: 2, type: "C", color: "C" },
            { _id: 3, type: "D", color: "D" },
            { _id: 4, type: "E", color: "E" },
        ]
        const mockResStatus = 200
        const mockResData = {
            data: [
                { type: "A", color: "A" },
                { type: "B", color: "B" },
                { type: "C", color: "C" },
                { type: "D", color: "D" },
                { type: "E", color: "E" },
            ]
        }

        verifyAuth.mockReturnValue({ flag: true, cause: 'Authorized' });
        categories.find.mockResolvedValue(mockCategories);

        await getCategories(mockReq, mockRes);

        expect(verifyAuth).toHaveBeenCalledWith(mockReq, mockRes, { authType: 'Simple' });
        expect(mockRes.status).toHaveBeenCalledWith(mockResStatus);
        expect(mockRes.json).toHaveBeenCalledWith(mockResData);

    });

    test('should retreive no category', async () => {
        const mockReq = {
            params: {
            },
            body: {
            }
        }
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {
            }
        }
        const mockCategories = []
        const mockResStatus = 200
        const mockResData = {
            data: []
        }

        verifyAuth.mockReturnValue({ flag: true, cause: 'Authorized' });
        categories.find.mockResolvedValue(mockCategories);

        await getCategories(mockReq, mockRes);

        expect(verifyAuth).toHaveBeenCalledWith(mockReq, mockRes, { authType: 'Simple' });
        expect(mockRes.status).toHaveBeenCalledWith(mockResStatus);
        expect(mockRes.json).toHaveBeenCalledWith(mockResData);

    });
})

describe("createTransaction", () => {
    test('should create transaction', async () => {
        const mockReq = {
            params: {
                username: "user1",
            },
            body: {
                username: "user1",
                amount: 100,
                type: "A"
            }
        }
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {
            }
        }
        const mockDate = Date.now();
        const mockTransaction = {
            _id: 0,
            username: mockReq.body.username,
            amount: mockReq.body.amount,
            type: mockReq.body.type,
            date: mockDate
        }

        const mockResStatus = 200
        const mockResData = {
            data: {
                username: mockReq.body.username,
                amount: mockReq.body.amount,
                type: mockReq.body.type,
                date: mockDate
            }
        }

        verifyAuth.mockReturnValue({ flag: true, cause: 'Authorized' });
        User.findOne.mockResolvedValue(true);
        categories.findOne.mockResolvedValue(true);
        transactions.prototype.save.mockResolvedValue(mockTransaction);

        await createTransaction(mockReq, mockRes);

        expect(verifyAuth).toHaveBeenCalledWith(mockReq, mockRes, { authType: 'User', username: mockReq.params.username });
        expect(mockRes.status).toHaveBeenCalledWith(mockResStatus);
        expect(mockRes.json).toHaveBeenCalledWith(mockResData);
    });
})

describe("getAllTransactions", () => {
    test('should retreive all transactions', async () => {
        const mockReq = {
            params: {
            },
            body: {
            }
        }
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {
            }
        }
        const mockDate = Date.now();
        const mockTransactionAggregateFilter = [
            {
                $lookup: {
                    from: "categories",
                    localField: "type",
                    foreignField: "type",
                    as: "categories_info"
                }
            },
            { $unwind: "$categories_info" }
        ]
        const mockTransactionAggregate = [
            { _id: 1, username: "user1", amount: 100.00, type: "type1", date: mockDate, categories_info: { _id: 1, type: "type1", color: "color1" } },
            { _id: 2, username: "user2", amount: 200.00, type: "type2", date: mockDate, categories_info: { _id: 2, type: "type2", color: "color2" } },
            { _id: 3, username: "user3", amount: 300.00, type: "type3", date: mockDate, categories_info: { _id: 3, type: "type3", color: "color3" } },
            { _id: 4, username: "user4", amount: 400.00, type: "type4", date: mockDate, categories_info: { _id: 4, type: "type4", color: "color4" } },
            { _id: 5, username: "user5", amount: 500.00, type: "type5", date: mockDate, categories_info: { _id: 5, type: "type5", color: "color5" } },
        ]
        const mockResStatus = 200
        const mockResData = {
            data: [
                { username: "user1", amount: 100.00, type: "type1", date: mockDate, color: "color1" },
                { username: "user2", amount: 200.00, type: "type2", date: mockDate, color: "color2" },
                { username: "user3", amount: 300.00, type: "type3", date: mockDate, color: "color3" },
                { username: "user4", amount: 400.00, type: "type4", date: mockDate, color: "color4" },
                { username: "user5", amount: 500.00, type: "type5", date: mockDate, color: "color5" },
            ]
        }

        verifyAuth.mockReturnValue({ flag: true, cause: 'Authorized' });
        transactions.aggregate.mockResolvedValue(mockTransactionAggregate);

        await getAllTransactions(mockReq, mockRes);

        expect(verifyAuth).toHaveBeenCalledWith(mockReq, mockRes, { authType: "Admin" });
        expect(transactions.aggregate).toHaveBeenCalledWith(mockTransactionAggregateFilter);
        expect(mockRes.status).toHaveBeenCalledWith(mockResStatus);
        expect(mockRes.json).toHaveBeenCalledWith(mockResData);
    });
})

describe("getTransactionsByUser", () => {
    test('should return all users transactions (user route with date)', async () => {
        const mockDate = "2023-04-01";
        const mockUsername = "user1";
        const mockReq = {
            url: "/api/users/user1/transactions?date=" + mockDate,
            query: {
                date: mockDate
            }
            ,
            params: {
                username: mockUsername
            },
            body: {
            }
        }
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {
            }
        }
        const mockDateFilter = {
            date:
            {
                $gte: new Date("2023-04-01T00:00:00.000Z"),
                $lte: new Date("2023-04-01T23:59:59.999Z")
            },
        }
        const mockAmountFilter = {}
        const mockTransactionAggregateFilter = [
            {
                $lookup: {
                    from: "categories",
                    localField: "type",
                    foreignField: "type",
                    as: "categories_info"
                }
            },
            {
                $match: {
                    username: mockUsername,
                    ...mockDateFilter,
                    ...mockAmountFilter
                }
            },
            { $unwind: "$categories_info" }
        ]
        const mockTransactionAggregate = [
            { _id: 1, username: "user1", amount: 100.00, type: "type1", date: mockDate, categories_info: { _id: 1, type: "type1", color: "color1" } },
            { _id: 2, username: "user1", amount: 200.00, type: "type2", date: mockDate, categories_info: { _id: 2, type: "type2", color: "color2" } },
            { _id: 3, username: "user1", amount: 300.00, type: "type3", date: mockDate, categories_info: { _id: 3, type: "type3", color: "color3" } },
            { _id: 4, username: "user1", amount: 400.00, type: "type4", date: mockDate, categories_info: { _id: 4, type: "type4", color: "color4" } },
            { _id: 5, username: "user1", amount: 500.00, type: "type5", date: mockDate, categories_info: { _id: 5, type: "type5", color: "color5" } },
        ]
        const mockResStatus = 200
        const mockResData = {
            data: [
                { username: "user1", amount: 100.00, type: "type1", date: mockDate, color: "color1" },
                { username: "user1", amount: 200.00, type: "type2", date: mockDate, color: "color2" },
                { username: "user1", amount: 300.00, type: "type3", date: mockDate, color: "color3" },
                { username: "user1", amount: 400.00, type: "type4", date: mockDate, color: "color4" },
                { username: "user1", amount: 500.00, type: "type5", date: mockDate, color: "color5" },
            ]
        }
        verifyAuth.mockReturnValue({ flag: true, cause: 'Authorized' });
        handleDateFilterParams.mockImplementation(() => mockDateFilter);
        handleAmountFilterParams.mockImplementation(() => mockAmountFilter);
        User.findOne.mockResolvedValue(true);
        transactions.aggregate.mockResolvedValue(mockTransactionAggregate);

        await getTransactionsByUser(mockReq, mockRes);

        expect(verifyAuth).toHaveBeenCalledWith(mockReq, mockRes, { authType: "User", username: mockUsername });
        expect(handleDateFilterParams).toHaveBeenCalledWith(mockReq);
        expect(handleAmountFilterParams).toHaveBeenCalledWith(mockReq);
        expect(User.findOne).toHaveBeenCalledWith({ username: mockUsername });
        expect(transactions.aggregate).toHaveBeenCalledWith(mockTransactionAggregateFilter);
        expect(mockRes.status).toHaveBeenCalledWith(mockResStatus);
        expect(mockRes.json).toHaveBeenCalledWith(mockResData);
    });
})

describe("getTransactionsByUserByCategory", () => {
    test('should show all user transactions of  given category (user route)', async () => {
        const mockUsername = "user1";
        const mockCategoryType = "type1";
        const mockReq = {
            url: "/api/users/" + mockUsername + "/transactions/category/" + mockCategoryType,
            query: {
            }
            ,
            params: {
                username: mockUsername,
                category: mockCategoryType
            },
            body: {
            }
        }
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {
            }
        }
        const mockTransactionAggregateFilter = [
            {
                $lookup: {
                    from: "categories",
                    localField: "type",
                    foreignField: "type",
                    as: "categories_info"
                }
            },
            {
                $match: {
                    username: mockUsername,
                    type: mockCategoryType
                }
            },
            { $unwind: "$categories_info" }
        ]
        const mockDate = Date.now();
        const mockTransactionAggregate = [
            { _id: 1, username: mockUsername, amount: 100.00, type: mockCategoryType, date: mockDate, categories_info: { _id: 1, type: mockCategoryType, color: "color1" } },
            { _id: 2, username: mockUsername, amount: 200.00, type: mockCategoryType, date: mockDate, categories_info: { _id: 1, type: mockCategoryType, color: "color1" } },
            { _id: 3, username: mockUsername, amount: 300.00, type: mockCategoryType, date: mockDate, categories_info: { _id: 1, type: mockCategoryType, color: "color1" } },
            { _id: 4, username: mockUsername, amount: 400.00, type: mockCategoryType, date: mockDate, categories_info: { _id: 1, type: mockCategoryType, color: "color1" } },
            { _id: 5, username: mockUsername, amount: 500.00, type: mockCategoryType, date: mockDate, categories_info: { _id: 1, type: mockCategoryType, color: "color1" } },
        ]
        const mockResStatus = 200
        const mockResData = {
            data: [
                { username: "user1", amount: 100.00, type: "type1", date: mockDate, color: "color1" },
                { username: "user1", amount: 200.00, type: "type1", date: mockDate, color: "color1" },
                { username: "user1", amount: 300.00, type: "type1", date: mockDate, color: "color1" },
                { username: "user1", amount: 400.00, type: "type1", date: mockDate, color: "color1" },
                { username: "user1", amount: 500.00, type: "type1", date: mockDate, color: "color1" },
            ]
        }
        verifyAuth.mockReturnValue({ flag: true, cause: 'Authorized' });
        User.findOne.mockResolvedValue(true);
        categories.findOne.mockResolvedValue(true);
        transactions.aggregate.mockResolvedValue(mockTransactionAggregate);

        await getTransactionsByUserByCategory(mockReq, mockRes);

        expect(verifyAuth).toHaveBeenCalledWith(mockReq, mockRes, { authType: "User", username: mockUsername });
        expect(User.findOne).toHaveBeenCalledWith({ username: mockUsername });
        expect(categories.findOne).toHaveBeenCalledWith({ type: mockCategoryType });
        expect(transactions.aggregate).toHaveBeenCalledWith(mockTransactionAggregateFilter);
        expect(mockRes.status).toHaveBeenCalledWith(mockResStatus);
        expect(mockRes.json).toHaveBeenCalledWith(mockResData);
    });
})

describe("getTransactionsByGroup", () => {
    test('should show all transactions of member of a group (user route)', async () => {
        const mockGroupName = "group1";
        const mockPopulatedGroup = {
            _id: 1,
            name: mockGroupName,
            members: [
                { email: "user1@ezwallet.com", user: { _id: "1", username: "user1" } },
                { email: "user2@ezwallet.com", user: { _id: "2", username: "user2" } },
                { email: "user3@ezwallet.com", user: { _id: "3", username: "user3" } },
                { email: "user4@ezwallet.com", user: { _id: "4", username: "user4" } },
                { email: "user5@ezwallet.com", user: { _id: "5", username: "user5" } },
            ]
        }
        const mockGroup = {
            _id: 1,
            name: mockGroupName,
            members: [
                { email: "user1@ezwallet.com", user: "1" },
                { email: "user2@ezwallet.com", user: "2" },
                { email: "user3@ezwallet.com", user: "3" },
                { email: "user4@ezwallet.com", user: "4" },
                { email: "user5@ezwallet.com", user: "5" },
            ],
            populate: jest.fn().mockResolvedValue(mockPopulatedGroup)
        }
        const mockReq = {
            url: "/api/groups/" + mockGroupName + "/transactions",
            query: {
            }
            ,
            params: {
                name: mockGroupName
            },
            body: {
            }
        }
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {
            }
        }
        const mockTransactionAggregateFilter = [
            {
                $lookup: {
                    from: "categories",
                    localField: "type",
                    foreignField: "type",
                    as: "categories_info"
                }
            }
            , {
                $match: {
                    username: {
                        $in: mockPopulatedGroup.members.map(m => m.user.username)
                    }
                },
            },
            { $unwind: "$categories_info" }
        ]
        const mockDate = Date.now();
        const mockTransactionAggregate = [
            { _id: 1, username: "user1", amount: 100.00, type: "type1", date: mockDate, categories_info: { _id: 1, type: "type1", color: "color1" } },
            { _id: 2, username: "user2", amount: 200.00, type: "type1", date: mockDate, categories_info: { _id: 1, type: "type1", color: "color1" } },
            { _id: 3, username: "user3", amount: 300.00, type: "type1", date: mockDate, categories_info: { _id: 1, type: "type1", color: "color1" } },
            { _id: 4, username: "user4", amount: 400.00, type: "type1", date: mockDate, categories_info: { _id: 1, type: "type1", color: "color1" } },
            { _id: 5, username: "user5", amount: 500.00, type: "type1", date: mockDate, categories_info: { _id: 1, type: "type1", color: "color1" } },
        ]
        const mockResStatus = 200
        const mockResData = {
            data: [
                { username: "user1", amount: 100.00, type: "type1", date: mockDate, color: "color1" },
                { username: "user2", amount: 200.00, type: "type1", date: mockDate, color: "color1" },
                { username: "user3", amount: 300.00, type: "type1", date: mockDate, color: "color1" },
                { username: "user4", amount: 400.00, type: "type1", date: mockDate, color: "color1" },
                { username: "user5", amount: 500.00, type: "type1", date: mockDate, color: "color1" },
            ]
        }

        Group.findOne.mockResolvedValue(mockGroup);
        verifyAuth.mockReturnValue({ flag: true, cause: 'Authorized' });
        transactions.aggregate.mockResolvedValue(mockTransactionAggregate);

        await getTransactionsByGroup(mockReq, mockRes);

        expect(Group.findOne).toHaveBeenCalledWith({ name: mockGroupName });
        expect(mockGroup.populate).toHaveBeenCalled();
        expect(verifyAuth).toHaveBeenCalledWith(mockReq, mockRes, { authType: "Group", emails: ["user1@ezwallet.com", "user2@ezwallet.com", "user3@ezwallet.com", "user4@ezwallet.com", "user5@ezwallet.com"] });
        expect(transactions.aggregate).toHaveBeenCalledWith(mockTransactionAggregateFilter);
        expect(mockRes.status).toHaveBeenCalledWith(mockResStatus);
        expect(mockRes.json).toHaveBeenCalledWith(mockResData);
    });
})

describe("getTransactionsByGroupByCategory", () => {
    test('should show all transactions of member of a group (user route)', async () => {
        const mockGroupName = "group1";
        const mockCategory = "type1";
        const mockPopulatedGroup = {
            _id: 1,
            name: mockGroupName,
            members: [
                { email: "user1@ezwallet.com", user: { _id: "1", username: "user1" } },
                { email: "user2@ezwallet.com", user: { _id: "2", username: "user2" } },
                { email: "user3@ezwallet.com", user: { _id: "3", username: "user3" } },
                { email: "user4@ezwallet.com", user: { _id: "4", username: "user4" } },
                { email: "user5@ezwallet.com", user: { _id: "5", username: "user5" } },
            ]
        }
        const mockGroup = {
            _id: 1,
            name: mockGroupName,
            members: [
                { email: "user1@ezwallet.com", user: "1" },
                { email: "user2@ezwallet.com", user: "2" },
                { email: "user3@ezwallet.com", user: "3" },
                { email: "user4@ezwallet.com", user: "4" },
                { email: "user5@ezwallet.com", user: "5" },
            ],
            populate: jest.fn().mockResolvedValue(mockPopulatedGroup)
        }
        const mockReq = {
            url: "/api/groups/" + mockGroupName + "/transactions/category/" + mockCategory,
            query: {
            }
            ,
            params: {
                name: mockGroupName,
                category: mockCategory
            },
            body: {
            }
        }
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {
            }
        }
        const mockTransactionAggregateFilter = [
            {
                $lookup: {
                    from: "categories",
                    localField: "type",
                    foreignField: "type",
                    as: "categories_info"
                }
            }
            , {
                $match: {
                    username: {
                        $in: mockPopulatedGroup.members.map(m => m.user.username)
                    },
                    type: mockCategory
                },
            },
            { $unwind: "$categories_info" }
        ]
        const mockDate = Date.now();
        const mockTransactionAggregate = [
            { _id: 1, username: "user1", amount: 100.00, type: "type1", date: mockDate, categories_info: { _id: 1, type: "type1", color: "color1" } },
            { _id: 2, username: "user2", amount: 200.00, type: "type1", date: mockDate, categories_info: { _id: 1, type: "type1", color: "color1" } },
            { _id: 3, username: "user3", amount: 300.00, type: "type1", date: mockDate, categories_info: { _id: 1, type: "type1", color: "color1" } },
            { _id: 4, username: "user4", amount: 400.00, type: "type1", date: mockDate, categories_info: { _id: 1, type: "type1", color: "color1" } },
            { _id: 5, username: "user5", amount: 500.00, type: "type1", date: mockDate, categories_info: { _id: 1, type: "type1", color: "color1" } },
        ]
        const mockResStatus = 200
        const mockResData = {
            data: [
                { username: "user1", amount: 100.00, type: "type1", date: mockDate, color: "color1" },
                { username: "user2", amount: 200.00, type: "type1", date: mockDate, color: "color1" },
                { username: "user3", amount: 300.00, type: "type1", date: mockDate, color: "color1" },
                { username: "user4", amount: 400.00, type: "type1", date: mockDate, color: "color1" },
                { username: "user5", amount: 500.00, type: "type1", date: mockDate, color: "color1" },
            ]
        }

        Group.findOne.mockResolvedValue(mockGroup);
        verifyAuth.mockReturnValue({ flag: true, cause: 'Authorized' });
        transactions.aggregate.mockResolvedValue(mockTransactionAggregate);

        await getTransactionsByGroupByCategory(mockReq, mockRes);

        expect(Group.findOne).toHaveBeenCalledWith({ name: mockGroupName });
        expect(mockGroup.populate).toHaveBeenCalled();
        expect(verifyAuth).toHaveBeenCalledWith(mockReq, mockRes, { authType: "Group", emails: ["user1@ezwallet.com", "user2@ezwallet.com", "user3@ezwallet.com", "user4@ezwallet.com", "user5@ezwallet.com"] });
        expect(transactions.aggregate).toHaveBeenCalledWith(mockTransactionAggregateFilter);
        expect(mockRes.status).toHaveBeenCalledWith(mockResStatus);
        expect(mockRes.json).toHaveBeenCalledWith(mockResData);
    });
})

describe("deleteTransaction", () => {
    test('should delete a transaction', async () => {
        const mockUsername = "user1";
        const mockTransaction_id = "id1";
        const mockReq = {
            params: {
                username: mockUsername
            },
            body: {
                _id: mockTransaction_id
            }
        }
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {
            }
        }
        const mockTransaction = {
            _id: "id1", username: "user1", type: "type1", date: Date.now()
        }
        const mockResStatus = 200
        const mockResData = {
            data: {
                message: "Transaction deleted"
            }
        }
        verifyAuth.mockReturnValue({ flag: true, cause: "authorized" });
        User.findOne.mockResolvedValue(true);
        transactions.findOne.mockResolvedValue(mockTransaction);
        transactions.deleteOne.mockResolvedValue(true);

        await deleteTransaction(mockReq, mockRes);

        expect(verifyAuth).toHaveBeenCalledWith(mockReq, mockRes, { authType: "User", username: mockUsername });
        expect(User.findOne).toHaveBeenCalledWith({ username: mockUsername });
        expect(transactions.findOne).toHaveBeenCalledWith({ _id: mockTransaction_id });
        expect(transactions.deleteOne).toHaveBeenCalledWith({ _id: mockTransaction_id });
        expect(mockRes.status).toHaveBeenCalledWith(mockResStatus);
        expect(mockRes.json).toHaveBeenCalledWith(mockResData);
    });
})

describe("deleteTransactions", () => {
    test('should delete all transactions in an array', async () => {
        const mockTransaction_ids = [
            "id1",
            "id2",
            "id3",
            "id4",
            "id5",
        ];
        const mockReq = {
            params: {
            },
            body: {
                _ids: mockTransaction_ids
            }
        }
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {
            }
        }
        const mockResStatus = 200
        const mockResData = {
            data: {
                message: "Transactions deleted"
            }
        }
        verifyAuth.mockReturnValue({ flag: true, cause: "authorized" });
        transactions.countDocuments.mockResolvedValue(true);
        transactions.deleteMany.mockResolvedValue(true);

        await deleteTransactions(mockReq, mockRes);

        expect(verifyAuth).toHaveBeenCalledWith(mockReq, mockRes, { authType: "Admin" });
        expect(transactions.countDocuments).toHaveBeenCalledWith({ _id: "id1" });
        expect(transactions.countDocuments).toHaveBeenCalledWith({ _id: "id2" });
        expect(transactions.countDocuments).toHaveBeenCalledWith({ _id: "id3" });
        expect(transactions.countDocuments).toHaveBeenCalledWith({ _id: "id4" });
        expect(transactions.countDocuments).toHaveBeenCalledWith({ _id: "id5" });
        expect(transactions.deleteMany).toHaveBeenCalledWith({ _id: { $in: mockTransaction_ids } });
        expect(mockRes.status).toHaveBeenCalledWith(mockResStatus);
        expect(mockRes.json).toHaveBeenCalledWith(mockResData);
    })
})
