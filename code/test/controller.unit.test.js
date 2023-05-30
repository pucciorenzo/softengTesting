import request from 'supertest';
import { app } from '../app';
import { categories, transactions } from '../models/model';
import { User } from '../models/User';
import { verifyAuth } from '../controllers/utils';
import { createCategory, createTransaction, deleteCategory, getCategories, updateCategory } from '../controllers/controller';

jest.mock('../models/model');
jest.mock('../controllers/utils');
jest.mock('../models/User');

beforeEach(() => {
    verifyAuth.mockClear();

    categories.find.mockClear();
    transactions.find.mockClear();

    categories.findOne.mockClear();
    transactions.findOne.mockClear();
    User.findOne.mockClear();

    categories.updateMany.mockClear();
    transactions.updateMany.mockClear();
    User.updateMany.mockClear();

    categories.deleteMany.mockClear();
    transactions.deleteMany.mockClear();
    User.deleteMany.mockClear();

    categories.deleteOne.mockClear();
    transactions.deleteOne.mockClear();
    User.deleteOne.mockClear();

    transactions.aggregate.mockClear();

    categories.prototype.save.mockClear();
    transactions.prototype.save.mockClear();
    User.prototype.save.mockClear();


});

describe(
    "createCategory",
    () => {
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

                verifyAuth.mockImplementation(() => { return { flag: true, cause: 'Authorized' } })
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

        verifyAuth.mockImplementation(() => { return { flag: true, cause: 'Authorized' } });
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

        verifyAuth.mockImplementation(() => { return { flag: true, cause: 'Authorized' } });
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

        verifyAuth.mockImplementation(() => { return { flag: true, cause: 'Authorized' } });
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

        verifyAuth.mockImplementation(() => { return { flag: true, cause: 'Authorized' } });
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

        verifyAuth.mockImplementation(() => { return { flag: true, cause: 'Authorized' } });
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
    test('Dummy test, change it', () => {
        expect(true).toBe(true);
    });
})

describe("getTransactionsByUser", () => {
    test('Dummy test, change it', () => {
        expect(true).toBe(true);
    });
})

describe("getTransactionsByUserByCategory", () => {
    test('Dummy test, change it', () => {
        expect(true).toBe(true);
    });
})

describe("getTransactionsByGroup", () => {
    test('Dummy test, change it', () => {
        expect(true).toBe(true);
    });
})

describe("getTransactionsByGroupByCategory", () => {
    test('Dummy test, change it', () => {
        expect(true).toBe(true);
    });
})

describe("deleteTransaction", () => {
    test('Dummy test, change it', () => {
        expect(true).toBe(true);
    });
})

describe("deleteTransactions", () => {
    test('Dummy test, change it', () => {
        expect(true).toBe(true);
    });
})
