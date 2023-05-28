import request from 'supertest';
import { app } from '../app';
import { User } from '../models/User.js';
import jwt from 'jsonwebtoken';
import { register } from '../controllers/auth.js';

const bcrypt = require("bcryptjs")

jest.mock("bcryptjs")
jest.mock('../models/User.js');

describe("register", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should return success message if user is successfully registered', async () => {
    const mockFindOne = jest.spyOn(User, 'findOne');
    mockFindOne.mockResolvedValue(null);

    const mockCreate = jest.spyOn(User, 'create');
    mockCreate.mockResolvedValue({ username: 'testuser', email: 'test@email.com' });

    const mockHash = jest.spyOn(bcrypt, 'hash');
    mockHash.mockResolvedValue('hashedPassword');

    const requestBody = {
      username: 'testuser',
      email: 'test@email.com',
      password: 'password123',
    };

    const mockReq = { body: requestBody };
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await register(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith('user added succesfully');
    expect(mockHash).toHaveBeenCalledWith('password123', 12);
  });

  test('should return 400 if the email is not well formatted', async () => {
    const requestBody = {
      username: 'testuser',
      email: 'invalid-email',
      password: 'password123',
    };
  
    const mockReq = { body: requestBody };
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  
    await register(mockReq, mockRes);
  
    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({ message: 'Invalid email format' });
  });

  test('should return 400 if user with the same email already exists', async () => {
    const mockFindOne = jest.spyOn(User, 'findOne');
    mockFindOne.mockResolvedValue({ email: 'test@example.com' });

    const requestBody = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123',
    };

    const mockReq = { body: requestBody };
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await register(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({ message: 'you are already registered' });
  });

  test('should return 400 if user with the same username already exists', async () => {
    const mockFindOne = jest.spyOn(User, 'findOne');
    mockFindOne.mockResolvedValueOnce({ username: 'testuser' });

    const requestBody = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123',
    };

    const mockReq = { body: requestBody };
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await register(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({ message: 'username already taken' });
  });

});


describe("registerAdmin", () => { 
    test('Dummy test, change it', () => {
        expect(true).toBe(true);
    });
})

describe('login', () => { 
    test('Dummy test, change it', () => {
        expect(true).toBe(true);
    });
});

describe('logout', () => { 
    test('Dummy test, change it', () => {
        expect(true).toBe(true);
    });
});
