import request from 'supertest';
import { app } from '../app';
import { categories, transactions } from '../models/model';
import { createCategory, updateCategory } from '../controllers/controller';

import * as utils from '../controllers/utils';


jest.mock('../models/model');
jest.mock('../controllers/utils');


beforeEach(() => {
    categories.find.mockClear();
    categories.findOne.mockClear();
    categories.prototype.save.mockClear();
    transactions.find.mockClear();
    transactions.deleteOne.mockClear();
    transactions.aggregate.mockClear();
    transactions.updateMany.mockClear();
    transactions.prototype.save.mockClear();

    utils.verifyAuth.mockClear();
});

describe(
    "createCategory",
    () =>
        test('authorized and no error, should return saved category',
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
                        message: "category added"
                    }
                }

                utils.verifyAuth.mockImplementation(() => { return { authorized: true, cause: 'Authorized' } })
                jest.spyOn(categories.prototype, 'save').mockResolvedValue({ type: "testType", color: "testColor" });
                jest.spyOn(categories, 'find').mockResolvedValue({ type: "testType", color: "testColor" });

                await createCategory(mockReq, mockRes);
                expect(utils.verifyAuth).toHaveBeenCalledWith(mockReq, mockRes, { authType: 'Admin' });
                expect(categories.prototype.save).toHaveBeenCalledWith();
                //expect(categories.find).toHaveBeenCalledWith({ type: "testType" });
                expect(mockRes.status).toHaveBeenCalledWith(200);
                expect(mockRes.json).toHaveBeenCalledWith({ data: { type: "testType", color: "testColor" }, message: mockRes.locals.message });

            }
        ),

    test('not authorized, should return unauthorized',
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
                    message: "unauthorized"
                }
            }

            utils.verifyAuth.mockImplementation(() => { return { authorized: false, cause: mockRes.locals.message } })

            await createCategory(mockReq, mockRes);
            expect(utils.verifyAuth).toHaveBeenCalledWith(mockReq, mockRes, { authType: 'Admin' });
            expect(mockRes.status).toHaveBeenCalledWith(401);
            expect(mockRes.json).toHaveBeenCalledWith({ message: mockRes.locals.message });

        }
    ),

    test(
        'database saving error: should return error',
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
                    message: "database saving error"
                }
            }

            //utils.verifyAuth = jest.fn(() => { return { authorized: true, cause: 'Authorized' } });
            utils.verifyAuth.mockImplementation(() => { return { authorized: true, cause: 'Authorized' } });
            jest.spyOn(categories.prototype, 'save').mockImplementation(() => { throw new Error(mockRes.locals.message) });
            jest.spyOn(categories, 'find').mockResolvedValue({ type: "testType", color: "testColor" });

            await createCategory(mockReq, mockRes);
            expect(utils.verifyAuth).toHaveBeenCalledWith(mockReq, mockRes, { authType: 'Admin' });
            expect(categories.prototype.save).toThrow(Error(mockRes.locals.message));
            //expect(categories.find).toHaveBeenCalledWith({ type: "testType" });
            expect(mockRes.status).toHaveBeenCalledWith(500);
            expect(mockRes.json).toHaveBeenCalledWith({ error: mockRes.locals.message });

        }
    ),



);


/**
 * Edit a category's type or color
  - Request Body Content: An object having attributes `type` and `color` equal to the new values to assign to the category
  - Response `data` Content: An object with parameter `message` that confirms successful editing and a parameter `count` that is equal to the count of transactions whose category was changed with the new type
  - Optional behavior:
    - error 401 returned if the specified category does not exist
    - error 401 is returned if new parameters have invalid values
 */

describe(
    "updateCategory",
    () =>
        test(
            "should return unauthorized",
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
                        message: "unauthorized"
                    }
                }

                utils.verifyAuth.mockImplementation(() => { return { authorized: false, cause: mockRes.locals.message } })

                await updateCategory(mockReq, mockRes);
                expect(utils.verifyAuth).toHaveBeenCalledWith(mockReq, mockRes, { authType: 'Admin' });
                expect(mockRes.status).toHaveBeenCalledWith(401);
                expect(mockRes.json).toHaveBeenCalledWith({ message: mockRes.locals.message });
            }
        ),

    test(
        "should return category does not exist",
        async () => {

            const mockReq = {
                params: {
                    category: "oldType"
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
                    message: "category does not exist"
                }
            }

            utils.verifyAuth.mockImplementation(() => { return { authorized: true, cause: mockRes.locals.message } })
            categories.findOne.mockImplementationOnce(() => { return null });

            await updateCategory(mockReq, mockRes);
            expect(utils.verifyAuth).toHaveBeenCalledWith(mockReq, mockRes, { authType: 'Admin' });
            expect(categories.findOne).toHaveBeenCalledWith({ type: mockReq.params.category });
            expect(mockRes.status).toHaveBeenCalledWith(401);
            expect(mockRes.json).toHaveBeenCalledWith({ message: mockRes.locals.message });
        }
    ),

    test(
        "should return new category exists",
        async () => {

            const mockReq = {
                params: {
                    category: "oldType"
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
                    message: "new category exists"
                }
            }

            utils.verifyAuth.mockImplementation(() => { return { authorized: true, cause: mockRes.locals.message } })
            categories.findOne.mockImplementationOnce(() => { return 1 }).mockImplementationOnce(() => { return 1 });

            await updateCategory(mockReq, mockRes);
            expect(utils.verifyAuth).toHaveBeenCalledWith(mockReq, mockRes, { authType: 'Admin' });
            expect(categories.findOne).toHaveBeenCalledWith({ type: mockReq.params.category });
            expect(categories.findOne).toHaveBeenCalledWith({ type: mockReq.body.type });
            expect(mockRes.status).toHaveBeenCalledWith(401);
            expect(mockRes.json).toHaveBeenCalledWith({ message: mockRes.locals.message });
        }
    ),

    test(
        "should return 'database category update error'",
        async () => {

            const mockReq = {
                params: {
                    category: "oldType"
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
                    message: 'database category update error'
                }
            }

            utils.verifyAuth.mockImplementation(() => { return { authorized: true, cause: mockRes.locals.message } })
            categories.findOne.mockImplementationOnce(() => { return 1 }).mockImplementationOnce(() => { return 0 });
            categories.updateOne.mockImplementationOnce(() => { throw new Error(mockRes.locals.message) });
            await updateCategory(mockReq, mockRes);
            expect(utils.verifyAuth).toHaveBeenCalledWith(mockReq, mockRes, { authType: 'Admin' });
            expect(categories.findOne).toHaveBeenCalledWith({ type: mockReq.params.category });
            expect(categories.findOne).toHaveBeenCalledWith({ type: mockReq.body.type });
            expect(mockRes.status).toHaveBeenCalledWith(500);
            expect(mockRes.json).toHaveBeenCalledWith({ error: mockRes.locals.message });
        }
    ),

    test(
        "should return database transaction update many error",
        async () => {

            const mockReq = {
                params: {
                    category: "oldType"
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
                    message: "database transaction update many error"
                }
            }

            utils.verifyAuth.mockImplementation(() => { return { authorized: true, cause: mockRes.locals.message } })
            categories.findOne.mockImplementationOnce(() => { return 1 }).mockImplementationOnce(() => { return 0 });
            categories.updateOne.mockImplementationOnce(() => { return "success" });
            transactions.updateMany.mockImplementationOnce(() => { throw new Error(mockRes.locals.message) });

            await updateCategory(mockReq, mockRes);
            expect(utils.verifyAuth).toHaveBeenCalledWith(mockReq, mockRes, { authType: 'Admin' });
            expect(categories.findOne).toHaveBeenCalledWith({ type: mockReq.params.category });
            expect(categories.findOne).toHaveBeenCalledWith({ type: mockReq.body.type });
            expect(mockRes.status).toHaveBeenCalledWith(500);
            expect(mockRes.json).toHaveBeenCalledWith({ error: mockRes.locals.message });
        }
    ),

    test(
        "should return update successful",
        async () => {

            const mockReq = {
                params: {
                    category: "oldType"
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
                    message: "category updated successfully."
                }
            }

            const mockUpdateMany = {
                modifiedCount: 5
            }

            utils.verifyAuth.mockImplementation(() => { return { authorized: true, cause: mockRes.locals.message } })
            categories.findOne.mockImplementationOnce(() => { return 1 }).mockImplementationOnce(() => { return 0 });
            categories.updateOne.mockImplementationOnce(() => { return "success" });
            transactions.updateMany.mockImplementationOnce(() => { return mockUpdateMany });

            await updateCategory(mockReq, mockRes);
            expect(utils.verifyAuth).toHaveBeenCalledWith(mockReq, mockRes, { authType: 'Admin' });
            expect(categories.findOne).toHaveBeenCalledWith({ type: mockReq.params.category });
            expect(categories.findOne).toHaveBeenCalledWith({ type: mockReq.body.type });
            expect(transactions.updateMany).toHaveBeenCalledWith({ type: mockReq.params.category }, { type: mockReq.body.type });
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith({ data: { count: 5 }, message: "category updated successfully." });
        }
    ),

)

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
