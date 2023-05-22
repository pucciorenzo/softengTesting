import request from 'supertest';
import { app } from '../app';
import { categories, transactions } from '../models/model';
import { createCategory } from '../controllers/controller';

import * as utils from '../controllers/utils';


jest.mock('../models/model');
jest.mock('../controllers/utils');


beforeEach(() => {
    categories.find.mockClear();
    categories.prototype.save.mockClear();
    transactions.find.mockClear();
    transactions.deleteOne.mockClear();
    transactions.aggregate.mockClear();
    transactions.prototype.save.mockClear();

    utils.verifyAuth.mockClear();
});

describe(
    "createCategory",
    () =>
        test('should return saved category',
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
                //jest.spyOn(utils, 'verifyAuth').mockResolvedValue({ authorized: true, cause: 'Authorized' });
                utils.verifyAuth = jest.fn(() => { return { authorized: true, cause: 'Authorized' } });
                jest.spyOn(categories.prototype, 'save').mockResolvedValue({ type: "testType", color: "testColor" });
                jest.spyOn(categories, 'find').mockResolvedValue({ type: "testType", color: "testColor" });
                await createCategory(mockReq, mockRes);
                expect(utils.verifyAuth).toHaveBeenCalledWith(mockReq, mockRes, { authType: 'Admin' });
                //expect(categories.find).toHaveBeenCalledWith({ type: "testType" });
                expect(mockRes.status).toHaveBeenCalledWith(200)
                expect(mockRes.json).toHaveBeenCalledWith({ data: { type: "testType", color: "testColor" }, message: mockRes.locals.message })
            }
        )
);


/**
 * Edit a category's type or color
  - Request Body Content: An object having attributes `type` and `color` equal to the new values to assign to the category
  - Response `data` Content: An object with parameter `message` that confirms successful editing and a parameter `count` that is equal to the count of transactions whose category was changed with the new type
  - Optional behavior:
    - error 401 returned if the specified category does not exist
    - error 401 is returned if new parameters have invalid values
 */

describe("updateCategory", () => {
    test('Dummy test, change it', () => {
        expect(true).toBe(true);
    });
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
