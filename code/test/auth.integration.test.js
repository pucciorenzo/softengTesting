import request from 'supertest';
import { app } from '../app';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import "jest-extended"
import { Group, User } from '../models/User';
import bcrypt from "bcryptjs"
import { categories, transactions } from '../models/model';

dotenv.config();


dotenv.config();

beforeAll(async () => {
  const dbName = "testingDatabaseController";
  const url = `${process.env.MONGO_URI}/${dbName}`;

  await mongoose.connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

});

afterAll(async () => {
  await mongoose.connection.db.dropDatabase();
  await mongoose.connection.close();
});

//necessary setup to ensure that each test can insert the data it needs
beforeEach(async () => {
  await User.deleteMany({});
  await Group.deleteMany({});
  await categories.deleteMany({});
  await transactions.deleteMany({});
})


describe('register', () => {
  test('should register user successfully', async () => {
    const body = {
      username: "user1",
      email: "user1@ezwallet.com",
      password: "password1"
    }

    const response = await request(app)
      .post("/api/register").send(body);

    expect(response.status).toEqual(200);
    expect(response.body).toHaveProperty("data.message");
  });
});

describe("registerAdmin", () => {
  test('should register admin successfully', async () => {

    const body = {
      username: "admin1",
      email: "admin1@ezwallet.com",
      password: "password1"
    }

    const response = await request(app)
      .post("/api/admin")
      .send(body);

    expect(response.status).toBe(200);
    expect(response.body.data).toHaveProperty("message");
  });
})

describe('login', () => {

  test('Should login successfully', async () => {

    User.create({
      username: "user1",
      email: "user1@ezwallet.com",
      password: await bcrypt.hash("password1", 12)
    })


    const body = {
      email: "user1@ezwallet.com",
      password: "password1"
    }

    const response = await request(app).
      post("/api/login")
      .send(body);

    //console.log(JSON.stringify(response, null, 2));
    expect(response.status).toEqual(200);
    expect(response.header["set-cookie"]).toEqual(
      expect.arrayContaining([
        expect.stringContaining("accessToken"),
        expect.stringContaining("refreshToken"),
      ])
    );
    expect(response.body.data).toHaveProperty("accessToken");
    expect(response.body.data).toHaveProperty("refreshToken");

  });
});

describe('logout', () => {
  test('Should logout successfully', async () => {

    User.create({
      username: "user1",
      email: "user1@ezwallet.com",
      password: await bcrypt.hash("password1", 12),
      refreshToken: "validRefreshToken"
    })

    const response = await request(app)
      .get("/api/logout")
      .set('Cookie', ["accessToken=validAccessToken;refreshToken=validRefreshToken"]);

    console.log(JSON.stringify(response, null, 2));
    expect(response.status).toEqual(200);
    expect(response.header["set-cookie"]).toEqual(
      expect.arrayContaining([
        expect.stringContaining("accessToken"),
        expect.stringContaining("refreshToken"),
      ])
    );
    expect(response.status).toEqual(200);
    expect(response.body.data).toHaveProperty("message");

  });
});
