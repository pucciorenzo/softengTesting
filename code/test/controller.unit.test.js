import request from 'supertest';
import { app } from '../app';
import { categories, transactions } from '../models/model';

jest.mock('../models/model');

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

        test(
            'should return 401 unauthorized if empty accessToken',
            async () => {
                const response = await request(app).post("/api/categories").set('Cookie', 'accessToken=');
                expect(response.body).toStrictEqual({ message: "Unauthorized" });
                expect(response.status).toBe(401);
            }
        );

        test(
            'should return 401 unauthorized if wrong accessToken',
            async () => {
                const response = await request(app).post("/api/categories").set('Cookie', 'accessToken=AnyValue');
                expect(response.body).toStrictEqual({ message: "Unauthorized" });
                expect(response.status).toBe(401);
            }
        );

        test(
            'should return saved category',
            async () => {
                //jest.spyOn('../controllers/utils.js',verifyAuth).mockImplementation(() => true);
                const savedCategory = { type: "testtype", color: "testcolor" };
                jest.spyOn(categories.prototype, 'save').mockImplementation(() => Promise.resolve(savedCategory));
                const response = await request(app).post("/api/categories").set('Cookie', 'accessToken=accessToken').set('body', savedCategory);
                expect(response.status).toBe(200);
                expect(response.body).toStrictEqual(savedCategory);
            }
        );

        test(
            'should catch database saving error',
            async () => {
                //jest.spyOn('../controllers/utils.js',verifyAuth).mockImplementation(() => true);
                const savedCategory = { type: "testtype", color: "testcolor" };
                jest.spyOn(categories.prototype, 'save').mockImplementation(() => { throw new Error("Could not save") });
                const response = await request(app).post("/api/categories").set('Cookie', 'accessToken=accessToken').set('body', savedCategory);
                expect(response.status).toBe(400);
                expect(response.body).toStrictEqual( {error:"Could not save"} );
            }
        );
    }
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
