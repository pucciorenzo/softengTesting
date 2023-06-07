import request from 'supertest';
import { app } from '../app';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import "jest-extended"
import { Group, User } from '../models/User';
import bcrypt from "bcryptjs"
import { categories, transactions } from '../models/model';

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
afterEach(async () => {
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

  test('Returns a 400 error if the email in the request body identifies an already existing user ', async () => {

    await User.insertMany(
      [
        { username: "user1", email: "user1@ezwallet.com", password: "password1", role: "Regular" },
      ]
    );


    const body = {
      username: "user0",
      email: "user1@ezwallet.com",
      password: "password1"
    }

    const response = await request(app)
      .post("/api/register").send(body);

    expect(response.status).toEqual(400);
    expect(response.body).toHaveProperty("error");
  });


  test('Returns a 400 error if the username in the request body identifies an already existing user ', async () => {

    await User.insertMany(
      [
        { username: "user1", email: "user1@ezwallet.com", password: "password1", role: "Regular" },
      ]
    );


    const body = {
      username: "user1",
      email: "user0@ezwallet.com",
      password: "password1"
    }

    const response = await request(app)
      .post("/api/register").send(body);

    console.log(response);
    expect(response.status).toEqual(400);
    expect(response.body).toHaveProperty("error");
  });


  test('Returns a 400 error if the email in the request body is not in a valid email format  ', async () => {

    await User.insertMany(
      [
        { username: "user1", email: "user1@ezwallet.com", password: "password1", role: "Regular" },
      ]
    );


    const body = {
      username: "user2",
      email: "user2.@ezwallet.com",
      password: "password1"
    }

    const response = await request(app)
      .post("/api/register").send(body);

    //console.log(response);
    expect(response.status).toEqual(400);
    expect(response.body).toHaveProperty("error");
  });

  test('Returns a 400 error if at least one of the parameters in the request body is an empty string ', async () => {

    await User.insertMany(
      [
        { username: "user1", email: "user1@ezwallet.com", password: "password1", role: "Regular" },
      ]
    );


    const body = {
      username: "user2",
      email: "user2@ezwallet.com",
      password: ""
    }

    const response = await request(app)
      .post("/api/register").send(body);

    //console.log(response);
    expect(response.status).toEqual(400);
    expect(response.body).toHaveProperty("error");
  });

  test('Returns a 400 error if the request body does not contain all the necessary attributes ', async () => {

    await User.insertMany(
      [
        { username: "user1", email: "user1@ezwallet.com", password: "password1", role: "Regular" },
      ]
    );


    const body = {
      email: "user2@ezwallet.com",
      password: "password1"
    }

    const response = await request(app)
      .post("/api/register").send(body);

    console.log(response);
    expect(response.status).toEqual(400);
    expect(response.body).toHaveProperty("error");
  });

});

describe("registerAdmin", () => {

  test('should register admin successfully', async () => {

    await User.insertMany(
      [
        { username: "admin0", email: "admin0@ezwallet.com", password: "password1", role: "Admin" },
      ]
    );

    const body = {
      username: "admin1",
      email: "admin1@ezwallet.com",
      password: "password1"
    }

    const response = await request(app)
      .post("/api/admin")
      .send(body);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("data.message");
  });

  test('Returns a 400 error if the email in the request body identifies an already existing user  ', async () => {

    await User.insertMany(
      [
        { username: "admin0", email: "admin0@ezwallet.com", password: "password1", role: "Admin" },
      ]
    );

    const body = {
      username: "admin1",
      email: "admin0@ezwallet.com",
      password: "password1"
    }

    const response = await request(app)
      .post("/api/admin")
      .send(body);
    console.log(response);

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("error");
  });

  test('Returns a 400 error if the username in the request body identifies an already existing user  ', async () => {

    await User.insertMany(
      [
        { username: "admin0", email: "admin0@ezwallet.com", password: "password1", role: "Admin" },
      ]
    );

    const body = {
      username: "admin0",
      email: "admin1@ezwallet.com",
      password: "password1"
    }

    const response = await request(app)
      .post("/api/admin")
      .send(body);
    console.log(response);

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("error");
  });

  test('Returns a 400 error if the email in the request body is not in a valid email format ', async () => {

    await User.insertMany(
      [
        { username: "admin0", email: "admin0@ezwallet.com", password: "password1", role: "Admin" },
      ]
    );

    const body = {
      username: "admin1",
      email: "admin1@ezwallet",
      password: "password1"
    }

    const response = await request(app)
      .post("/api/admin")
      .send(body);
    console.log(response);

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("error");
  });

  test('Returns a 400 error if at least one of the parameters in the request body is an empty string ', async () => {

    await User.insertMany(
      [
        { username: "admin0", email: "admin0@ezwallet.com", password: "password1", role: "Admin" },
      ]
    );

    const body = {
      username: "",
      email: "admin1@ezwallet",
      password: "password1"
    }

    const response = await request(app)
      .post("/api/admin")
      .send(body);
    console.log(response);

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("error");
  });


  test('Returns a 400 error if the request body does not contain all the necessary attributes', async () => {

    await User.insertMany(
      [
        { username: "admin0", email: "admin0@ezwallet.com", password: "password1", role: "Admin" },
      ]
    );

    const body = {
      username: "admin1",
      password: "password1"
    }

    const response = await request(app)
      .post("/api/admin")
      .send(body);
    console.log(response);

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("error");
  });


})

describe('login', () => {

  test('Should login successfully', async () => {

    await User.create({
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
    expect(response.body).toHaveProperty("data.accessToken");
    expect(response.body).toHaveProperty("data.refreshToken");

  });

  test('Returns a 400 error if the supplied password does not match with the one in the database', async () => {

    await User.create({
      username: "user1",
      email: "user1@ezwallet.com",
      password: await bcrypt.hash("password1", 12)
    })


    const body = {
      email: "user1@ezwallet.com",
      password: "password0"
    }

    const response = await request(app).
      post("/api/login")
      .send(body);

    console.log(response);
    expect(response.status).toEqual(400);

    expect(response.body).toHaveProperty("error");

  });

  test('Returns a 400 error if the email in the request body does not identify a user in the database', async () => {

    await User.create({
      username: "user1",
      email: "user1@ezwallet.com",
      password: await bcrypt.hash("password1", 12)
    })

    const body = {
      email: "user0@ezwallet.com",
      password: "password1"
    }

    const response = await request(app).
      post("/api/login")
      .send(body);

    console.log(response);
    expect(response.status).toEqual(400);

    expect(response.body).toHaveProperty("error");

  });


  test('Returns a 400 error if the email in the request body is not in a valid email format', async () => {

    await User.create({
      username: "user1",
      email: "user1@ezwallet.com",
      password: await bcrypt.hash("password1", 12)
    })

    const body = {
      email: "user1.@ezwallet.com",
      password: "password1"
    }

    const response = await request(app).
      post("/api/login")
      .send(body);

    console.log(response);
    expect(response.status).toEqual(400);

    expect(response.body).toHaveProperty("error");

  });

  test('Returns a 400 error if at least one of the parameters in the request body is an empty string', async () => {

    await User.create({
      username: "user1",
      email: "user1@ezwallet.com",
      password: await bcrypt.hash("password1", 12)
    })

    const body = {
      email: "user1@ezwallet.com",
      password: ""
    }

    const response = await request(app).
      post("/api/login")
      .send(body);

    console.log(response);
    expect(response.status).toEqual(400);

    expect(response.body).toHaveProperty("error");

  });

  test('Returns a 400 error if the request body does not contain all the necessary attributes', async () => {

    await User.create({
      username: "user1",
      email: "user1@ezwallet.com",
      password: await bcrypt.hash("password1", 12)
    })

    const body = {
      email: "user1@ezwallet.com",
    }

    const response = await request(app).
      post("/api/login")
      .send(body);

    console.log(response);
    expect(response.status).toEqual(400);

    expect(response.body).toHaveProperty("error");

  });

});


describe('logout', () => {
  test('Should logout successfully', async () => {

    await User.create({
      username: "user1",
      email: "user1@ezwallet.com",
      password: await bcrypt.hash("password1", 12),
      refreshToken: "validRefreshToken"
    })

    const response = await request(app)
      .get("/api/logout")
      .set('Cookie', ["accessToken=validAccessToken;refreshToken=validRefreshToken"]);

    //console.log(JSON.stringify(response, null, 2));
    expect(response.header["set-cookie"]).toEqual(
      expect.arrayContaining([
        expect.stringContaining("accessToken"),
        expect.stringContaining("refreshToken"),
      ])
    );
    expect(response.status).toEqual(200);
    expect(response.body).toHaveProperty("data.message");

  });

  test("Returns a 400 error if the refresh token in the request's cookies does not represent a user in the database", async () => {

    await User.create({
      username: "user1",
      email: "user1@ezwallet.com",
      password: await bcrypt.hash("password1", 12),
      refreshToken: "validRefreshToken"
    })

    const response = await request(app)
      .get("/api/logout")
      .set('Cookie', ["accessToken=validAccessToken;refreshToken=InvalidRefreshToken"]);
    console.log(response);

    expect(response.status).toEqual(400);
    expect(response.body).toHaveProperty("error");

  });

  test("Returns a 400 error if the request does not have a refresh token in the cookies", async () => {

    await User.create({
      username: "user1",
      email: "user1@ezwallet.com",
      password: await bcrypt.hash("password1", 12),
      refreshToken: "validRefreshToken"
    })

    const response = await request(app)
      .get("/api/logout")
      .set('Cookie', ["accessToken=validAccessToken"]);
    console.log(response);

    expect(response.status).toEqual(400);
    expect(response.body).toHaveProperty("error");

  });


});

