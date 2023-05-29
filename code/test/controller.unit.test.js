import request from 'supertest';
import { app } from '../app';
import { categories, transactions } from '../models/model';
import { verifyAuth } from '../controllers/utils';
import { createCategory, updateCategory } from '../controllers/controller';

jest.mock('../models/model');
jest.mock('../controllers/utils');

beforeEach(() => {
    categories.find.mockClear();
    categories.prototype.save.mockClear();
    transactions.find.mockClear();
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
                        error: ""
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
                    message: "category updated successfully."
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
    test('Dummy test, change it', () => {
        expect(true).toBe(true);
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
