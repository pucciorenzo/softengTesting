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
                expect(response.body).toStrictEqual({ error: "Could not save" });
            }
        );
    }
);

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
