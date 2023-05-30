import request from 'supertest';
import { app } from '../app';
import { categories, transactions } from '../models/model';
import { verifyAuth } from '../controllers/utils';
import { createCategory, deleteCategory, updateCategory } from '../controllers/controller';

jest.mock('../models/model');
jest.mock('../controllers/utils');

beforeEach(() => {
    verifyAuth.mockClear();

    categories.find.mockClear();
    categories.findOne.mockClear();
    categories.prototype.save.mockClear();
    categories.deleteMany.mockClear();
    transactions.find.mockClear();
    transactions.findOne.mockClear();
    transactions.updateMany.mockClear();
    transactions.deleteOne.mockClear();
    transactions.aggregate.mockClear();
    transactions.prototype.save.mockClear();
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

                verifyAuth.mockImplementation(() => { return { flag: true, cause: 'Authorized' } })
                jest.spyOn(categories, 'findOne').mockResolvedValue(null);
                jest.spyOn(categories.prototype, 'save').mockResolvedValue({ _id: "0", type: "testType", color: "testColor" });

                await createCategory(mockReq, mockRes);

                expect(verifyAuth).toHaveBeenCalledWith(mockReq, mockRes, { authType: 'Admin' });
                expect(categories.prototype.save).toHaveBeenCalledWith();
                //expect(categories.find).toHaveBeenCalledWith({ type: "testType" });
                expect(mockRes.status).toHaveBeenCalledWith(200);
                expect(mockRes.json).toHaveBeenCalledWith({ data: { type: "testType", color: "testColor" }, message: mockRes.locals.message });
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
            expect(mockRes.status).toHaveBeenCalledWith(200);
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
            expect(mockRes.status).toHaveBeenCalledWith(200);
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
            { _id: 0, type: "A" },
            { _id: 1, type: "B" },
            { _id: 2, type: "C" },
            { _id: 3, type: "D" },
            { _id: 4, type: "E" },
        ]
        const mockTypesToDelete = ["C", "B", "D", "E"];
        const mockModifiedCount = 15;
        const mockResData = {
            message: "Categories deleted",
            count: mockModifiedCount
        }

        verifyAuth.mockImplementation(() => { return { flag: true, cause: 'Authorized' } });
        categories.find.mockResolvedValue(mockCategories);
        categories.deleteMany.mockResolvedValue();
        transactions.updateMany.mockResolvedValue({ modifiedCount: mockModifiedCount });

        await deleteCategory(mockReq, mockRes);

        expect(verifyAuth).toHaveBeenCalledWith(mockReq, mockRes, { authType: 'Admin' });
        expect(categories.deleteMany).toHaveBeenCalledWith({ type: { $in: mockTypesToDelete } });
        expect(transactions.updateMany).toHaveBeenCalledWith({ type: { $in: mockTypesToDelete } }, { type: mockCategories[0].type });
        expect(mockRes.status).toHaveBeenCalledWith(200);
        expect(mockRes.json).toHaveBeenCalledWith({ data: mockResData });

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
            { _id: 0, type: "A" },
            { _id: 1, type: "B" },
            { _id: 2, type: "C" },
            { _id: 3, type: "D" },
            { _id: 4, type: "E" },
        ]
        const mockTypesToDelete = ["C", "B", "A", "D"];
        const mockModifiedCount = 15;
        const mockResData = {
            message: "Categories deleted",
            count: mockModifiedCount
        }

        verifyAuth.mockImplementation(() => { return { flag: true, cause: 'Authorized' } });
        categories.find.mockResolvedValue(mockCategories);
        categories.deleteMany.mockResolvedValue();
        transactions.updateMany.mockResolvedValue({ modifiedCount: mockModifiedCount });

        await deleteCategory(mockReq, mockRes);

        expect(verifyAuth).toHaveBeenCalledWith(mockReq, mockRes, { authType: 'Admin' });
        expect(categories.deleteMany).toHaveBeenCalledWith({ type: { $in: mockTypesToDelete } });
        expect(transactions.updateMany).toHaveBeenCalledWith({ type: { $in: mockTypesToDelete } }, { type: "E" });
        expect(mockRes.status).toHaveBeenCalledWith(200);
        expect(mockRes.json).toHaveBeenCalledWith({ data: mockResData });

    });
})

describe("getCategories", () => {
    test('Dummy test, change it', () => {
        expect(true).toBe(true);
    });
})

describe("createTransaction", () => {
    test('Dummy test, change it', () => {
        expect(true).toBe(true);
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
