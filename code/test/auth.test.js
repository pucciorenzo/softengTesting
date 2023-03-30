import request from 'supertest';
import { app } from '../app'; // Assuming you have an app.js file where you import and use the routes
import User from '../models/User.js';
import jwt from 'jsonwebtoken';
const bcrypt = require("bcryptjs")

jest.mock('../models/User.js');

describe('register', () => {
  test('should return 400 if user already exists', async () => {
    jest.spyOn(User, "findOne").mockImplementation(() => ({ email: 'test@example.com' }))
    const response = await request(app)
      .post('/api/register')
      .send({ username: 'test', email: 'test@example.com', password: 'password' });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('you are already registered');
  });

  test('should create a new user and return 200', async () => {
    jest.spyOn(User, "findOne").mockImplementation(() => null)
    jest.spyOn(bcrypt, "hash").mockImplementation(() => "hashedPassword")
    jest.spyOn(User, "create").mockImplementation(() => ({ username: 'test', email: 'test@example.com', password: 'hashedPassword' }))
    const response = await request(app)
      .post('/api/register')
      .send({ username: 'test', email: 'test@example.com', password: 'password' });

    expect(response.status).toBe(200);
    expect(response.text).toBe('"user added succesfully"');
  });


  test('should return 500 if there is an error', async () => {
    jest.spyOn(User, "findOne").mockImplementation(() => null)
    jest.spyOn(User, "create").mockRejectedValue(new Error("An error occurred"))
    const response = await request(app)
      .post('/api/register')
      .send({ username: 'test', email: 'test@example.com', password: 'password' });

    expect(response.status).toBe(500);
  });
});

describe('login', () => {
  test('should return 400 if user is not registered', async () => {
    jest.spyOn(User, "findOne").mockImplementation(() => null)
    const response = await request(app)
      .post('/api/login')
      .send({ email: 'test@example.com', password: 'password' });

    expect(response.status).toBe(400);
    expect(response.text).toBe('\"please you need to register\"');
  });

  test('should return 400 if the password is incorrect', async () => {
    jest.spyOn(User, "findOne").mockImplementation(() => ({ email: 'test@example.com', password: 'hashedPassword' }))
    jest.spyOn(bcrypt, "compare").mockResolvedValue(false)

    const response = await request(app)
      .post('/api/login')
      .send({ email: 'test@example.com', password: 'wrongPassword' });

    expect(response.status).toBe(400);
    expect(response.text).toBe('\"wrong credentials\"');
  });

  test('should return 200 and the access token if the credentials are correct', async () => {
    const existingUser = {
      email: 'test@example.com',
      password: 'hashedPassword',
      _id: 'someId',
      username: 'testUser',
      save: jest.fn().mockResolvedValue({ refreshToken: 'refreshToken' }),
    };
    jest.spyOn(User, "findOne").mockImplementation(() => existingUser)
    jest.spyOn(bcrypt, "compare").mockResolvedValue(true)
    jest.spyOn(jwt, 'sign').mockImplementation(() => 'accessToken');

    const response = await request(app)
      .post('/api/login')
      .send({ email: 'test@example.com', password: 'password' });

    expect(response.status).toBe(200);
    expect(response.text).toBe('\"accessToken\"');
  });

  test('should return error for accessing protected route without a token', async () => {
    const response = await request(app)
      .get('/api/refresh')
      .send();

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty('message', 'Unauthorized');
  });

  test("should 500 in case of an error", async () => {
    const existingUser = {
      email: 'test@example.com',
      password: 'hashedPassword',
      _id: 'someId',
      username: 'testUser',
      save: jest.fn().mockResolvedValue({ refreshToken: 'refreshToken' }),
    };
    jest.spyOn(User, "findOne").mockImplementation(() => existingUser)
    jest.spyOn(bcrypt, "compare").mockRejectedValue(() => { new Error("An error occurred") })

    const response = await request(app)
      .post("/api/login")
      .send()

    expect(response.status).toBe(500)
  })
});

describe('refreshToken', () => {
  test('should return new access token on refresh', async () => {
    const userCredentials = {
      email: 'test@example.com',
      password: 'password123'
    };
    const existingUser = {
      email: 'test@example.com',
      password: 'password123',
      _id: 'someId',
      username: 'testUser',
      save: jest.fn().mockResolvedValue({ refreshToken: 'refreshToken' }),
    };
    jest.spyOn(User, "findOne").mockImplementation(() => existingUser)
    jest.spyOn(bcrypt, "compare").mockImplementation(() => true)
    jest.spyOn(jwt, 'sign').mockImplementation(() => 'accessToken');
    jest.spyOn(jwt, "verify").mockImplementation(() => "refreshedToken")
    User.prototype.save.mockResolvedValue(existingUser)
    const loginResponse = await request(app)
      .post('/api/login')
      .set("Cookie", [])
      .send(userCredentials);
    const refreshToken = loginResponse.body;

    const response = await request(app)
      .post('/api/refresh')
      .set("Cookie", [`accessToken=${refreshToken};refreshToken=${refreshToken}`])

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('accessToken');
  });
  test('should return 401 if no refresh token is provided', async () => {
    const response = await request(app)
      .post('/api/refresh')
      .send();

    expect(response.status).toBe(401);
  });

  test('should return 400 if no user is found with the provided refresh token', async () => {
    jest.spyOn(User, "findOne").mockImplementation(() => null)
    const response = await request(app)
      .post('/api/refresh')
      .set("Cookie", [`accessToken=accessToken;refreshToken=invalidRefreshToken`])

    expect(response.status).toBe(400);
    expect(response.text).toBe('\"user not found\"');
  });

  test('should return 403 if refresh token is invalid', async () => {
    const user = { username: 'testUser', refreshToken: 'validRefreshToken' };
    jest.spyOn(User, "findOne").mockImplementation(() => user)
    jest.spyOn(jwt, "verify").mockImplementation(() => ({ error: "invalidToken" }))

    const response = await request(app)
      .post('/api/refresh')
      .set("Cookie", [`accessToken=accessToken;refreshToken=invalidRefreshToken`])

    expect(response.status).toBe(403);
  });

  test('should return 200 and a new access token if refresh token is valid', async () => {
    const user = { username: 'testUser', refreshToken: 'validRefreshToken' };
    const refreshToken = "validRefreshToken"
    const accessToken = "validAccessToken"
    jest.spyOn(User, "findOne").mockImplementation(() => user)
    jest.spyOn(jwt, "verify").mockImplementation(() => "newAccessToken")

    const response = await request(app)
      .post('/api/refresh')
      .set("Cookie", [`accessToken=${accessToken};refreshToken=${refreshToken}`])

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('accessToken', "newAccessToken");
  });
});

describe('logout', () => {

  test('should return 200 if no refresh token is provided', async () => {
    const response = await request(app)
      .get('/api/logout')
      .send();

    expect(response.status).toBe(200);
    expect(response.text).toBe('\"you are already logged out\"');
  });

  test('should return 400 if no user is found with the provided refresh token', async () => {
    const refreshToken = "invalidRefreshToken"
    jest.spyOn(User, "findOne").mockImplementation(() => null)
    const response = await request(app)
      .get('/api/logout')
      .set("Cookie", [`accessToken=${refreshToken};refreshToken=${refreshToken}`])

    expect(response.status).toBe(400);
    expect(response.text).toBe('\"user not found\"');
  });

  test('should return 200 and log out the user if a valid refresh token is provided', async () => {
    const existingUser = {
      _id: 'someId',
      username: 'testUser',
      refreshToken: 'validRefreshToken',
      save: jest.fn().mockResolvedValue({ refreshToken: null }),
    };
    jest.spyOn(User, "findOne").mockImplementation(() => existingUser)
    const response = await request(app)
      .get('/api/logout')
      .set('Cookie', 'accessToken=validAccessToken;refreshToken=validRefreshToken');

    expect(response.status).toBe(200);
    expect(response.text).toBe('\"logged out\"');
    expect(existingUser.save).toHaveBeenCalled();
  });

  test("should return 500 in case of an error", async () => {
    const existingUser = {
      _id: 'someId',
      username: 'testUser',
      refreshToken: 'validRefreshToken',
      save: jest.fn().mockRejectedValue(new Error("An error has occurred")),
    };
    jest.spyOn(User, "findOne").mockImplementation(() => existingUser)
    const response = await request(app)
      .get('/api/logout')
      .set('Cookie', 'accessToken=validAccessToken;refreshToken=validRefreshToken');

    expect(response.status).toBe(500);
  })
});
