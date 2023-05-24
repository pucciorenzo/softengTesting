import request from 'supertest';
import { app } from '../app';
import { User } from '../models/User.js';
import jwt from 'jsonwebtoken';
const bcrypt = require("bcryptjs")

jest.mock("bcryptjs")
jest.mock('../models/User.js');

describe('register', () => {
  test('should return 400 if user with the same username already exists', async () => {
    const existingUser = { username: "existinguser", email: "existinguser@gmail.com", password: "password" };
    User.findOne.mockResolvedValueOnce(existingUser);
  
    const requestBody = {
      username: "existinguser",
      email: "newuser@gmail.com",
      password: "password",
    };
  
    const response = await request(app)
      .post("/api/register")
      .send(requestBody);
  
    expect(response.body).toEqual({ message: "username already taken" });
    expect(response.status).toBe(400);
  });
/*
  test('should return 400 if user with the same email already exists', async () => {
    User.findOne.mockResolvedValueOnce(null);
    User.findOne.mockResolvedValueOnce({});

    const requestBody = {
      username: "newuser",
      email: "test@example.com",
      password: "testpassword",
    };

    const response = await request(app)
      .post("/api/register")
      .send(requestBody);

    expect(response.body).toEqual({ message: "you are already registered" });
    expect(response.status).toBe(400);
  });

  test('should register a new user successfully', async () => {
    User.findOne.mockResolvedValueOnce(null);
    User.create.mockResolvedValueOnce({});

    bcrypt.hash.mockResolvedValueOnce("hashed-password");

    const requestBody = {
      username: "newuser",
      email: "test@example.com",
      password: "testpassword",
    };

    const response = await request(app)
      .post("/api/register")
      .send(requestBody);

    expect(response.body).toBe("user added successfully");
    expect(response.status).toBe(200);
  }); */
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
