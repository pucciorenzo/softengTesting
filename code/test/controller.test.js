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

describe('Categories', () => {
  test('should create a new category and return the saved data', async () => {
    const newCategory = { type: 'investment', color: '#fcbe44' };
    categories.prototype.save.mockResolvedValue(newCategory);

    const response = await request(app)
      .post('/api/categories')
      .set('Cookie', 'accessToken=validAccessToken;refreshToken=validRefreshToken')
      .send(newCategory);

    expect(response.status).toBe(200);
    expect(response.body).toEqual(newCategory);
  });

  test("should return a 401 error if accessed without authorization", async () => {
    const newCategory = { type: 'investment', color: '#fcbe44' };
    const response = await request(app)
      .post("/api/categories")
      .send(newCategory)

    expect(response.status).toBe(401)
  })

  test('should return all categories', async () => {
    const allCategories = [{ type: 'investment', color: '#fcbe44' }, { type: 'expense', color: '#d9534f' },];
    jest.spyOn(categories, "find").mockImplementation(() => allCategories)

    const response = await request(app)
      .get('/api/categories')
      .set('Cookie', 'accessToken=validAccessToken;refreshToken=validRefreshToken')

    expect(response.status).toBe(200);
    expect(response.body).toEqual(allCategories);
  });


  test("should return a 401 error if accessed without authorization", async () => {
    const response = await request(app)
      .get("/api/categories")

    expect(response.status).toBe(401)
  })
});

describe('Transactions', () => {
  test('should create a new transaction and return the saved data', async () => {
    const newTransaction = { name: 'Test', amount: 1000, type: 'investment' };
    transactions.prototype.save.mockResolvedValue(newTransaction);
    const response = await request(app)
      .post('/api/transaction')
      .set('Cookie', 'accessToken=validAccessToken;refreshToken=validRefreshToken')
      .send(newTransaction);

    expect(response.status).toBe(200);
    expect(response.body).toEqual(newTransaction);
  });

  test("should return a 401 error if accessed without authorization", async () => {
    const newTransaction = { name: 'Test', amount: 1000, type: 'investment' };
    const response = await request(app)
      .post("/api/transaction")
      .send(newTransaction)

    expect(response.status).toBe(401)
  })

  test('should return all transactions', async () => {
    const allTransactions = [{ _id: '1', name: 'Test1', amount: 1000, type: 'investment', date: '2023-01-01' }, { _id: '2', name: 'Test2', amount: 500, type: 'expense', date: '2023-01-02' },];
    jest.spyOn(transactions, "find").mockImplementation(() => allTransactions)
    const response = await request(app)
      .get('/api/transaction')
      .set('Cookie', 'accessToken=validAccessToken;refreshToken=validRefreshToken')

    expect(response.status).toBe(200);
    expect(response.body).toEqual(allTransactions);
  });

  test("should return a 401 error if accessed without authorization", async () => {
    const response = await request(app)
      .get("/api/transaction")

    expect(response.status).toBe(401)
  })

  test('should delete a transaction by id', async () => {
    const idToDelete = '1';
    jest.spyOn(transactions, "deleteOne").mockImplementation(() => ({ n: 1, ok: 1, deletedCount: 1 }))
    const response = await request(app)
      .delete('/api/transaction')
      .set('Cookie', 'accessToken=validAccessToken;refreshToken=validRefreshToken')
      .send({ _id: idToDelete });

    expect(response.status).toBe(200);
    expect(response.text).toBe('\"deleted\"');
  });


  test("should return a 401 error if accessed without authorization", async () => {
    const idToDelete = '1';
    const response = await request(app)
      .delete("/api/transaction")
      .send({ _id: idToDelete })

    expect(response.status).toBe(401)
  })

  test('should return transactions with category labels', async () => {
    const transactionsWithLabels = [{ _id: '1', name: 'Test1', amount: 1000, type: 'investment', color: '#fcbe44' }, { _id: '2', name: 'Test2', amount: 500, type: 'expense', color: '#d9534f' },];

    transactions.aggregate.mockResolvedValue(transactionsWithLabels);
    const response = await request(app)
      .get('/api/labels')
      .set('Cookie', 'accessToken=validAccessToken;refreshToken=validRefreshToken')

    expect(response.status).toBe(200);
    expect(response.body).toEqual(transactionsWithLabels);
  });

  test("should return a 401 error if accessed without authorization", async () => {
    const response = await request(app)
      .get("/api/labels")

    expect(response.status).toBe(401)
  })
});

describe('Error handling', () => {

  test('should return a 400 error for invalid category creation', async () => {
    const invalidCategory = { type: '', color: '#fcbe44' };
    categories.prototype.save.mockRejectedValue(new Error("Invalid category"))
    const response = await request(app)
      .post('/api/categories')
      .set('Cookie', 'accessToken=validAccessToken;refreshToken=validRefreshToken')
      .send(invalidCategory);

    expect(response.status).toBe(400);
  });

  test('should return a 400 error for invalid transaction creation', async () => {
    const invalidTransaction = { name: '', amount: 1000, type: 'investment' };

    transactions.prototype.save.mockRejectedValue(new Error("Invalid transaction"))
    const response = await request(app)
      .post('/api/transaction')
      .set('Cookie', 'accessToken=validAccessToken;refreshToken=validRefreshToken')
      .send(invalidTransaction);

    expect(response.status).toBe(400);
  });

  test('should return a 404 error for non-existent endpoint', async () => {
    const response = await request(app)
      .get('/api/nonexistent');

    expect(response.status).toBe(404);
  });

  test("should return a 400 error for errors while fetching category labels", async () => {
    transactions.aggregate.mockRejectedValue(new Error("An error has occurred"));
    const response = await request(app)
      .get('/api/labels')
      .set('Cookie', 'accessToken=validAccessToken;refreshToken=validRefreshToken')

    expect(response.status).toBe(400);
  })
});