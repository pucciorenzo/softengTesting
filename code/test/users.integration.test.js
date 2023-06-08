import request from 'supertest';
import { app } from '../app';
import { categories } from '../models/model';
import { transactions } from '../models/model';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import "jest-extended"
import { User, Group } from '../models/User';
import jwt from 'jsonwebtoken';



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

/**
 * Alternate way to create the necessary tokens for authentication without using the website
 */
const adminTokenValid = jwt.sign({
  email: "admin1@ezwallet.com",
  //id: existingUser.id, The id field is not required in any check, so it can be omitted
  username: "admin1",
  role: "Admin"
}, process.env.ACCESS_KEY, { expiresIn: '1y' })

const userTokenValid = jwt.sign({
  email: "user1@ezwallet.com",
  //id: existingUser.id, The id field is not required in any check, so it can be omitted
  username: "user1",
  role: "Regular"
}, process.env.ACCESS_KEY, { expiresIn: '1y' })

const testerAccessTokenValid = jwt.sign({
  email: "tester@test.com",
  username: "tester",
  role: "Regular"
}, process.env.ACCESS_KEY, { expiresIn: '1y' })

//These tokens can be used in order to test the specific authentication error scenarios inside verifyAuth (no need to have multiple authentication error tests for the same route)
const testerAccessTokenExpired = jwt.sign({
  email: "tester@test.com",
  username: "tester",
  role: "Regular"
}, process.env.ACCESS_KEY, { expiresIn: '0s' })
const testerAccessTokenEmpty = jwt.sign({}, process.env.ACCESS_KEY, { expiresIn: "1y" })



describe("getUsers", () => {
  /**
   * Database is cleared before each test case, in order to allow insertion of data tailored for each specific test case.
   */

  /*beforeEach(async () => {
    await User.deleteMany({})
  })*/

  test("should return a 401 error if called by an authenticated user who is not an admin (authType = Admin)", async () => {

    const usersArray = [
      { username: "user1", email: "user1@ezwallet.com", password: "password1", role: "Regular", refreshToken: userTokenValid },
      { username: "user2", email: "user2@ezwallet.com", password: "password2", role: "Regular" },
      { username: "user3", email: "user3@ezwallet.com", password: "password3", role: "Regular" },
      { username: "admin1", email: "admin1@ezwallet.com", password: "password1", role: "Admin", refreshToken: adminTokenValid },
      { username: "admin2", email: "admin2@ezwallet.com", password: "password2", role: "Admin" },
    ]
    await User.insertMany(usersArray);

    const response = await request(app)
      .get("/api/users")
      .set('Cookie', [`accessToken=${userTokenValid};refreshToken=${userTokenValid}`]);

    expect(response.status).toEqual(401);
    expect(response.body).toHaveProperty('error');
  });

  test("should retrieve list of all users", async () => {

    const usersArray = [
      { username: "user1", email: "user1@ezwallet.com", password: "password1", role: "Regular" },
      { username: "user2", email: "user2@ezwallet.com", password: "password2", role: "Regular" },
      { username: "user3", email: "user3@ezwallet.com", password: "password3", role: "Regular" },
      { username: "admin1", email: "admin1@ezwallet.com", password: "password1", role: "Admin", refreshToken: adminTokenValid },
      { username: "admin2", email: "admin2@ezwallet.com", password: "password2", role: "Admin" },
    ]
    await User.insertMany(usersArray);

    const response = await request(app)
      .get("/api/users")
      .set('Cookie', [`accessToken=${adminTokenValid};refreshToken=${adminTokenValid}`]);

    //console.log(JSON.stringify(await User.find({})));//console.log(JSON.stringify(response, null, 2));
    expect(response.status).toEqual(200);
    expect(response.body.data).toHaveLength(usersArray.length);

  });
})



describe("getUser", () => {
  test("should return a 400 error if the username passed as the route parameter does not represent a user in the database", async () => {

    const usersArray = [
      { username: "user1", email: "user1@ezwallet.com", password: "password1", role: "Regular" },
      { username: "user2", email: "user2@ezwallet.com", password: "password2", role: "Regular" },
      { username: "user3", email: "user3@ezwallet.com", password: "password3", role: "Regular" },
      { username: "admin1", email: "admin1@ezwallet.com", password: "password1", role: "Admin", refreshToken: adminTokenValid },
      { username: "admin2", email: "admin2@ezwallet.com", password: "password2", role: "Admin" },
    ]
    await User.insertMany(usersArray);

    const response = await request(app)
      .get("/api/users/user4")
      .set('Cookie', [`accessToken=${adminTokenValid};refreshToken=${adminTokenValid}`]);

    expect(response.status).toEqual(400);
    expect(response.body).toHaveProperty('error');
  });

  test("should retur a 401 error if called by an authenticated user who is neither the same user as the one in the route parameter (authType = User) nor an admin (authType = Admin)", async () => {

    const usersArray = [
      { username: "user1", email: "user1@ezwallet.com", password: "password1", role: "Regular", refreshToken: userTokenValid },
      { username: "user2", email: "user2@ezwallet.com", password: "password2", role: "Regular" },
      { username: "user3", email: "user3@ezwallet.com", password: "password3", role: "Regular" },
      { username: "admin1", email: "admin1@ezwallet.com", password: "password1", role: "Admin" },
      { username: "admin2", email: "admin2@ezwallet.com", password: "password2", role: "Admin" },
    ]
    await User.insertMany(usersArray);

    const response = await request(app)
      .get("/api/users/user4")
      .set('Cookie', [`accessToken=${userTokenValid};refreshToken=${userTokenValid}`]);

    expect(response.status).toEqual(401);
    expect(response.body).toHaveProperty('error');
  });

  test("should retrieve a regular user", async () => {

    const usersArray = [
      { username: "user1", email: "user1@ezwallet.com", password: "password1", role: "Regular", refreshToken: userTokenValid },
      { username: "user2", email: "user2@ezwallet.com", password: "password2", role: "Regular" },
      { username: "user3", email: "user3@ezwallet.com", password: "password3", role: "Regular" },
      { username: "admin1", email: "admin1@ezwallet.com", password: "password1", role: "Admin" },
      { username: "admin2", email: "admin2@ezwallet.com", password: "password2", role: "Admin" },
    ]
    await User.insertMany(usersArray);

    const response = await request(app)
      .get("/api/users/user1")
      .set('Cookie', [`accessToken=${userTokenValid};refreshToken=${userTokenValid}`]);

    ////console.log(JSON.stringify(await User.find({})));//console.log(JSON.stringify(response, null, 2));
    expect(response.status).toEqual(200);
    expect(response.body.data).toEqual(expect.objectContaining({
      username: "user1",
      email: "user1@ezwallet.com",
      role: "Regular"
    }))
  })

  test("should retrieve a regular user if called by an admin", async () => {

    const usersArray = [
      { username: "user1", email: "user1@ezwallet.com", password: "password1", role: "Regular" },
      { username: "user2", email: "user2@ezwallet.com", password: "password2", role: "Regular" },
      { username: "user3", email: "user3@ezwallet.com", password: "password3", role: "Regular" },
      { username: "admin1", email: "admin1@ezwallet.com", password: "password1", role: "Admin", refreshToken: adminTokenValid },
      { username: "admin2", email: "admin2@ezwallet.com", password: "password2", role: "Admin" },
    ]
    await User.insertMany(usersArray);

    const response = await request(app)
      .get("/api/users/user1")
      .set('Cookie', [`accessToken=${adminTokenValid};refreshToken=${adminTokenValid}`]);

    ////console.log(JSON.stringify(await User.find({})));//console.log(JSON.stringify(response, null, 2));
    expect(response.status).toEqual(200);
    expect(response.body.data).toEqual(expect.objectContaining({
      username: "user1",
      email: "user1@ezwallet.com",
      role: "Regular"
    }))
  })

})





describe("createGroup", () => {

  test("should return a 400 error if the request body does not contain all the necessary attributes", async () => {
    const usersArray = [
      { username: "user1", email: "user1@ezwallet.com", password: "password1", role: "Regular", refreshToken: userTokenValid },
      { username: "user2", email: "user2@ezwallet.com", password: "password2", role: "Regular" },
      { username: "user3", email: "user3@ezwallet.com", password: "password3", role: "Regular" },
      { username: "admin1", email: "admin1@ezwallet.com", password: "password1", role: "Admin", refreshToken: adminTokenValid },
      { username: "admin2", email: "admin2@ezwallet.com", password: "password2", role: "Admin" },
    ]
    await User.insertMany(usersArray);


    const response = await request(app)
      .post("/api/groups")
      .set('Cookie', [`accessToken=${userTokenValid};refreshToken=${userTokenValid}`])
      .send({
        memberEmails: [
          "user1@ezwallet.com",
          "user2@ezwallet.com",
          "user3@ezwallet.com",
          "user7@ezwallet.com"
        ]
      });

    expect(response.status).toEqual(400);
    expect(response.body).toHaveProperty('error');
  })

  test("should return a 400 error if the group name passed in the request body is an empty string", async () => {
    const usersArray = [
      { username: "user1", email: "user1@ezwallet.com", password: "password1", role: "Regular", refreshToken: userTokenValid },
      { username: "user2", email: "user2@ezwallet.com", password: "password2", role: "Regular" },
      { username: "user3", email: "user3@ezwallet.com", password: "password3", role: "Regular" },
      { username: "admin1", email: "admin1@ezwallet.com", password: "password1", role: "Admin", refreshToken: adminTokenValid },
      { username: "admin2", email: "admin2@ezwallet.com", password: "password2", role: "Admin" },
    ]
    await User.insertMany(usersArray);


    const response = await request(app)
      .post("/api/groups")
      .set('Cookie', [`accessToken=${userTokenValid};refreshToken=${userTokenValid}`])
      .send({
        name: ' ',
        memberEmails: [
          "user1@ezwallet.com",
          "user2@ezwallet.com",
          "user3@ezwallet.com",
          "user7@ezwallet.com"
        ]
      });

    expect(response.status).toEqual(400);
    expect(response.body).toHaveProperty('error');
  })

  test("should create a group", async () => {
    const usersArray = [
      { username: "user1", email: "user1@ezwallet.com", password: "password1", role: "Regular", refreshToken: userTokenValid },
      { username: "user2", email: "user2@ezwallet.com", password: "password2", role: "Regular" },
      { username: "user3", email: "user3@ezwallet.com", password: "password3", role: "Regular" },
      { username: "admin1", email: "admin1@ezwallet.com", password: "password1", role: "Admin", refreshToken: adminTokenValid },
      { username: "admin2", email: "admin2@ezwallet.com", password: "password2", role: "Admin" },
    ]
    await User.insertMany(usersArray);

    await Group.create({
      name: "group0",
      members: [
        await User.findOne({ username: "user3" }).then(u => { return { email: u.email, user: u.id } }),
        await User.findOne({ username: "admin1" }).then(u => { return { email: u.email, user: u.id } }),
      ]
    })


    const response = await request(app)
      .post("/api/groups")
      .set('Cookie', [`accessToken=${userTokenValid};refreshToken=${userTokenValid}`])
      .send({
        name: "group1",
        memberEmails: [
          "user1@ezwallet.com",
          "user2@ezwallet.com",
          "user3@ezwallet.com",
          "user7@ezwallet.com"
        ]
      });


    //console.log(JSON.stringify(response, null, 2));
    expect(response.status).toEqual(200);
    expect(response.body.data).toEqual({
      group: {
        name: "group1",
        members: [{ email: "user1@ezwallet.com" }, { email: "user2@ezwallet.com" }]
      },
      /*
      membersNotFound: [{ email: "user7@ezwallet.com" }],
      alreadyInGroup:  [{ email: "user3@ezwallet.com" }]
      */
      membersNotFound: ["user7@ezwallet.com"],
      alreadyInGroup: ["user3@ezwallet.com"]
    })
  })

  test("Returns a 401 error if called by a user who is not authenticated (authType = Simple)", async () => {
    const usersArray = [
      { username: "user1", email: "user1@ezwallet.com", password: "password1", role: "Regular", refreshToken: userTokenValid },
      { username: "user2", email: "user2@ezwallet.com", password: "password2", role: "Regular" },
      { username: "user3", email: "user3@ezwallet.com", password: "password3", role: "Regular" },
      { username: "admin1", email: "admin1@ezwallet.com", password: "password1", role: "Admin", refreshToken: adminTokenValid },
      { username: "admin2", email: "admin2@ezwallet.com", password: "password2", role: "Admin" },
    ]
    await User.insertMany(usersArray);

    await Group.create({
      name: "group0",
      members: [
        await User.findOne({ username: "user3" }).then(u => { return { email: u.email, user: u.id } }),
        await User.findOne({ username: "admin1" }).then(u => { return { email: u.email, user: u.id } }),
      ]
    })


    const response = await request(app)
      .post("/api/groups")
      .set('Cookie', [`accessToken=${userTokenValid};refreshToken=${adminTokenValid}`])
      .send({
        name: "group1",
        memberEmails: [
          "user1@ezwallet.com",
          "user2@ezwallet.com",
          "user3@ezwallet.com",
          "user7@ezwallet.com"
        ]
      });


    console.log(JSON.stringify(response, null, 2));
    expect(response.status).toEqual(401);
    expect(response.body).toHaveProperty("error");

  })

  test("Returns a 400 error if at least one of the member emails is an empty string", async () => {
    const usersArray = [
      { username: "user1", email: "user1@ezwallet.com", password: "password1", role: "Regular", refreshToken: userTokenValid },
      { username: "user2", email: "user2@ezwallet.com", password: "password2", role: "Regular" },
      { username: "user3", email: "user3@ezwallet.com", password: "password3", role: "Regular" },
      { username: "admin1", email: "admin1@ezwallet.com", password: "password1", role: "Admin", refreshToken: adminTokenValid },
      { username: "admin2", email: "admin2@ezwallet.com", password: "password2", role: "Admin" },
    ]
    await User.insertMany(usersArray);

    await Group.create({
      name: "group0",
      members: [
        await User.findOne({ username: "user3" }).then(u => { return { email: u.email, user: u.id } }),
        await User.findOne({ username: "admin1" }).then(u => { return { email: u.email, user: u.id } }),
      ]
    })


    const response = await request(app)
      .post("/api/groups")
      .set('Cookie', [`accessToken=${userTokenValid};refreshToken=${userTokenValid}`])
      .send({
        name: "group1",
        memberEmails: [
          "",
          "user2@ezwallet.com",
          "user3@ezwallet.com",
          "user7@ezwallet.com"
        ]
      });


    console.log(JSON.stringify(response, null, 2));
    expect(response.status).toEqual(400);
    expect(response.body).toHaveProperty("error");
  })

  test("Returns a 400 error if at least one of the member emails is not in a valid email format  ", async () => {
    const usersArray = [
      { username: "user1", email: "user1@ezwallet.com", password: "password1", role: "Regular", refreshToken: userTokenValid },
      { username: "user2", email: "user2@ezwallet.com", password: "password2", role: "Regular" },
      { username: "user3", email: "user3@ezwallet.com", password: "password3", role: "Regular" },
      { username: "admin1", email: "admin1@ezwallet.com", password: "password1", role: "Admin", refreshToken: adminTokenValid },
      { username: "admin2", email: "admin2@ezwallet.com", password: "password2", role: "Admin" },
    ]
    await User.insertMany(usersArray);

    await Group.create({
      name: "group0",
      members: [
        await User.findOne({ username: "user3" }).then(u => { return { email: u.email, user: u.id } }),
        await User.findOne({ username: "admin1" }).then(u => { return { email: u.email, user: u.id } }),
      ]
    })


    const response = await request(app)
      .post("/api/groups")
      .set('Cookie', [`accessToken=${userTokenValid};refreshToken=${userTokenValid}`])
      .send({
        name: "group1",
        memberEmails: [
          "user1@ezwallet.com",
          "user2@ezwallet.com",
          "user3@.ezwallet.com",
          "user7@ezwallet.com"
        ]
      });


    console.log(JSON.stringify(response, null, 2));
    expect(response.status).toEqual(400);
    expect(response.body).toHaveProperty("error");
  })

  test("Returns a 400 error if the user who calls the API is already in a group  ", async () => {
    const usersArray = [
      { username: "user1", email: "user1@ezwallet.com", password: "password1", role: "Regular", refreshToken: userTokenValid },
      { username: "user2", email: "user2@ezwallet.com", password: "password2", role: "Regular" },
      { username: "user3", email: "user3@ezwallet.com", password: "password3", role: "Regular" },
      { username: "admin1", email: "admin1@ezwallet.com", password: "password1", role: "Admin", refreshToken: adminTokenValid },
      { username: "admin2", email: "admin2@ezwallet.com", password: "password2", role: "Admin" },
    ]
    await User.insertMany(usersArray);

    await Group.create({
      name: "group0",
      members: [
        await User.findOne({ username: "user1" }).then(u => { return { email: u.email, user: u.id } }),
        await User.findOne({ username: "admin1" }).then(u => { return { email: u.email, user: u.id } }),
      ]
    })


    const response = await request(app)
      .post("/api/groups")
      .set('Cookie', [`accessToken=${userTokenValid};refreshToken=${userTokenValid}`])
      .send({
        name: "group1",
        memberEmails: [
          "user1@ezwallet.com",
          "user2@ezwallet.com",
          "user3@ezwallet.com",
          "user7@ezwallet.com"
        ]
      });


    console.log(JSON.stringify(response, null, 2));
    expect(response.status).toEqual(400);
    expect(response.body).toHaveProperty("error");
  })

  test("Returns a 400 error if all the provided emails (the ones in the array, the email of the user calling the function does not have to be considered in this case) represent users that are already in a group or do not exist in the database", async () => {
    const usersArray = [
      { username: "user1", email: "user1@ezwallet.com", password: "password1", role: "Regular", refreshToken: userTokenValid },
      { username: "user2", email: "user2@ezwallet.com", password: "password2", role: "Regular" },
      { username: "user3", email: "user3@ezwallet.com", password: "password3", role: "Regular" },
      { username: "admin1", email: "admin1@ezwallet.com", password: "password1", role: "Admin", refreshToken: adminTokenValid },
      { username: "admin2", email: "admin2@ezwallet.com", password: "password2", role: "Admin" },
    ]
    await User.insertMany(usersArray);

    await Group.create({
      name: "group0",
      members: [
        await User.findOne({ username: "user3" }).then(u => { return { email: u.email, user: u.id } }),
        await User.findOne({ username: "admin1" }).then(u => { return { email: u.email, user: u.id } }),
      ]
    })


    const response = await request(app)
      .post("/api/groups")
      .set('Cookie', [`accessToken=${userTokenValid};refreshToken=${userTokenValid}`])
      .send({
        name: "group1",
        memberEmails: [
          "user1@ezwallet.com",
          //"user2@ezwallet.com",
          "user3@ezwallet.com",
          "user7@ezwallet.com"
        ]
      });


    console.log(JSON.stringify(response, null, 2));
    expect(response.status).toEqual(400);
    expect(response.body).toHaveProperty("error");
  })

  test("Returns a 400 error if all the provided emails (the ones in the array, the email of the user calling the function does not have to be considered in this case) represent users that are already in a group or do not exist in the database", async () => {
    const usersArray = [
      //{ username: "user1", email: "user1@ezwallet.com", password: "password1", role: "Regular", refreshToken: userTokenValid },
      { username: "user2", email: "user2@ezwallet.com", password: "password2", role: "Regular" },
      { username: "user3", email: "user3@ezwallet.com", password: "password3", role: "Regular" },
      { username: "admin1", email: "admin1@ezwallet.com", password: "password1", role: "Admin", refreshToken: adminTokenValid },
      { username: "admin2", email: "admin2@ezwallet.com", password: "password2", role: "Admin" },
    ]
    await User.insertMany(usersArray);

    await Group.create({
      name: "group0",
      members: [
        await User.findOne({ username: "user3" }).then(u => { return { email: u.email, user: u.id } }),
        await User.findOne({ username: "admin1" }).then(u => { return { email: u.email, user: u.id } }),
      ]
    })


    const response = await request(app)
      .post("/api/groups")
      .set('Cookie', [`accessToken=${userTokenValid};refreshToken=${userTokenValid}`])
      .send({
        name: "group1",
        memberEmails: [
          "user1@ezwallet.com",
          "user2@ezwallet.com",
          "user3@ezwallet.com",
          "user7@ezwallet.com"
        ]
      });


    console.log(JSON.stringify(response, null, 2));
    expect(response.status).toEqual(400);
    expect(response.body).toHaveProperty("error");
  })

  test("Returns a 400 error if the group name passed in the request body represents an already existing group in the database", async () => {
    const usersArray = [
      //{ username: "user1", email: "user1@ezwallet.com", password: "password1", role: "Regular", refreshToken: userTokenValid },
      { username: "user2", email: "user2@ezwallet.com", password: "password2", role: "Regular" },
      { username: "user3", email: "user3@ezwallet.com", password: "password3", role: "Regular" },
      { username: "admin1", email: "admin1@ezwallet.com", password: "password1", role: "Admin", refreshToken: adminTokenValid },
      { username: "admin2", email: "admin2@ezwallet.com", password: "password2", role: "Admin" },
    ]
    await User.insertMany(usersArray);

    await Group.create({
      name: "group1",
      members: [
        await User.findOne({ username: "user3" }).then(u => { return { email: u.email, user: u.id } }),
        await User.findOne({ username: "admin1" }).then(u => { return { email: u.email, user: u.id } }),
      ]
    })


    const response = await request(app)
      .post("/api/groups")
      .set('Cookie', [`accessToken=${userTokenValid};refreshToken=${userTokenValid}`])
      .send({
        name: "group1",
        memberEmails: [
          "user1@ezwallet.com",
          "user2@ezwallet.com",
          "user3@ezwallet.com",
          "user7@ezwallet.com"
        ]
      });


    console.log(JSON.stringify(response, null, 2));
    expect(response.status).toEqual(400);
    expect(response.body).toHaveProperty("error");
  })



});



describe("getGroups", () => {

  test("should get all groups", async () => {
    const usersArray = [
      { username: "user1", email: "user1@ezwallet.com", password: "password1", role: "Regular", refreshToken: userTokenValid },
      { username: "user2", email: "user2@ezwallet.com", password: "password2", role: "Regular" },
      { username: "user3", email: "user3@ezwallet.com", password: "password3", role: "Regular" },
      { username: "admin1", email: "admin1@ezwallet.com", password: "password1", role: "Admin", refreshToken: adminTokenValid },
      { username: "admin2", email: "admin2@ezwallet.com", password: "password2", role: "Admin" },
    ]
    await User.insertMany(usersArray);

    await Group.insertMany([
      {
        name: "group1",
        members: [
          await User.findOne({ username: "user1" }).then(u => { return { email: u.email, user: u.id } }),
          await User.findOne({ username: "user2" }).then(u => { return { email: u.email, user: u.id } }),
        ]
      },
      {
        name: "group2",
        members: [
          await User.findOne({ username: "user3" }).then(u => { return { email: u.email, user: u.id } }),
          await User.findOne({ username: "admin2" }).then(u => { return { email: u.email, user: u.id } }),
        ]
      },
    ])


    const response = await request(app)
      .get("/api/groups")
      .set('Cookie', [`accessToken=${adminTokenValid};refreshToken=${adminTokenValid}`]);



    //console.log(JSON.stringify(response, null, 2));
    expect(response.status).toEqual(200);
    expect(response.body.data).toEqual(
      [
        {
          name: "group1",
          members: [{ email: "user1@ezwallet.com" }, { email: "user2@ezwallet.com" }]
        },
        {
          name: "group2",
          members: [{ email: "user3@ezwallet.com" }, { email: "admin2@ezwallet.com" }]
        },
      ]
    )
  })

  test("Returns a 401 error if called by an authenticated user who is not an admin (authType = Admin)", async () => {
    const usersArray = [
      { username: "user1", email: "user1@ezwallet.com", password: "password1", role: "Regular", refreshToken: userTokenValid },
      { username: "user2", email: "user2@ezwallet.com", password: "password2", role: "Regular" },
      { username: "user3", email: "user3@ezwallet.com", password: "password3", role: "Regular" },
      { username: "admin1", email: "admin1@ezwallet.com", password: "password1", role: "Admin", refreshToken: adminTokenValid },
      { username: "admin2", email: "admin2@ezwallet.com", password: "password2", role: "Admin" },
    ]
    await User.insertMany(usersArray);

    await Group.insertMany([
      {
        name: "group1",
        members: [
          await User.findOne({ username: "user1" }).then(u => { return { email: u.email, user: u.id } }),
          await User.findOne({ username: "user2" }).then(u => { return { email: u.email, user: u.id } }),
        ]
      },
      {
        name: "group2",
        members: [
          await User.findOne({ username: "user3" }).then(u => { return { email: u.email, user: u.id } }),
          await User.findOne({ username: "admin2" }).then(u => { return { email: u.email, user: u.id } }),
        ]
      },
    ])


    const response = await request(app)
      .get("/api/groups")
      .set('Cookie', [`accessToken=${userTokenValid};refreshToken=${userTokenValid}`]);



    console.log(JSON.stringify(response, null, 2));
    expect(response.status).toEqual(401);
    expect(response.body).toHaveProperty("error");
  });



});




describe("getGroup", () => {

  test("should get user's group (admin auth)", async () => {
    const usersArray = [
      { username: "user1", email: "user1@ezwallet.com", password: "password1", role: "Regular", refreshToken: userTokenValid },
      { username: "user2", email: "user2@ezwallet.com", password: "password2", role: "Regular" },
      { username: "user3", email: "user3@ezwallet.com", password: "password3", role: "Regular" },
      { username: "admin1", email: "admin1@ezwallet.com", password: "password1", role: "Admin", refreshToken: adminTokenValid },
      { username: "admin2", email: "admin2@ezwallet.com", password: "password2", role: "Admin" },
    ]
    await User.insertMany(usersArray);

    await Group.insertMany([
      {
        name: "group1",
        members: [
          await User.findOne({ username: "user1" }).then(u => { return { email: u.email, user: u.id } }),
          await User.findOne({ username: "user2" }).then(u => { return { email: u.email, user: u.id } }),
        ]
      },
      {
        name: "group2",
        members: [
          await User.findOne({ username: "user3" }).then(u => { return { email: u.email, user: u.id } }),
          await User.findOne({ username: "admin2" }).then(u => { return { email: u.email, user: u.id } }),
        ]
      },
    ])


    const response = await request(app)
      .get("/api/groups/group1")
      .set('Cookie', [`accessToken=${adminTokenValid};refreshToken=${adminTokenValid}`]);


    //console.log(JSON.stringify(response, null, 2));
    expect(response.status).toEqual(200);
    expect(response.body.data).toEqual(
      {
        group:
        {
          name: "group1",
          members: [{ email: "user1@ezwallet.com" }, { email: "user2@ezwallet.com" }]
        },
      }
    )
  })

  test("should get user's group (user auth)", async () => {
    const usersArray = [
      { username: "user1", email: "user1@ezwallet.com", password: "password1", role: "Regular", refreshToken: userTokenValid },
      { username: "user2", email: "user2@ezwallet.com", password: "password2", role: "Regular" },
      { username: "user3", email: "user3@ezwallet.com", password: "password3", role: "Regular" },
      { username: "admin1", email: "admin1@ezwallet.com", password: "password1", role: "Admin", refreshToken: adminTokenValid },
      { username: "admin2", email: "admin2@ezwallet.com", password: "password2", role: "Admin" },
    ]
    await User.insertMany(usersArray);

    await Group.insertMany([
      {
        name: "group1",
        members: [
          await User.findOne({ username: "user1" }).then(u => { return { email: u.email, user: u.id } }),
          await User.findOne({ username: "user2" }).then(u => { return { email: u.email, user: u.id } }),
        ]
      },
      {
        name: "group2",
        members: [
          await User.findOne({ username: "user3" }).then(u => { return { email: u.email, user: u.id } }),
          await User.findOne({ username: "admin2" }).then(u => { return { email: u.email, user: u.id } }),
        ]
      },
    ])


    const response = await request(app)
      .get("/api/groups/group1")
      .set('Cookie', [`accessToken=${userTokenValid};refreshToken=${userTokenValid}`]);


    console.log(JSON.stringify(response, null, 2));
    expect(response.status).toEqual(200);
    expect(response.body.data).toEqual(
      {
        group:
        {
          name: "group1",
          members: [{ email: "user1@ezwallet.com" }, { email: "user2@ezwallet.com" }]
        },
      }
    )
  })

  test("Returns a 401 error if called by an authenticated user who is neither part of the group (authType = Group) nor an admin (authType = Admin)", async () => {
    const usersArray = [
      { username: "user1", email: "user1@ezwallet.com", password: "password1", role: "Regular", refreshToken: userTokenValid },
      { username: "user2", email: "user2@ezwallet.com", password: "password2", role: "Regular" },
      { username: "user3", email: "user3@ezwallet.com", password: "password3", role: "Regular" },
      { username: "admin1", email: "admin1@ezwallet.com", password: "password1", role: "Admin", refreshToken: adminTokenValid },
      { username: "admin2", email: "admin2@ezwallet.com", password: "password2", role: "Admin" },
    ]
    await User.insertMany(usersArray);

    await Group.insertMany([
      {
        name: "group1",
        members: [
          await User.findOne({ username: "user3" }).then(u => { return { email: u.email, user: u.id } }),
          await User.findOne({ username: "user2" }).then(u => { return { email: u.email, user: u.id } }),
        ]
      },
      {
        name: "group2",
        members: [
          await User.findOne({ username: "user3" }).then(u => { return { email: u.email, user: u.id } }),
          await User.findOne({ username: "admin2" }).then(u => { return { email: u.email, user: u.id } }),
        ]
      },
    ])


    const response = await request(app)
      .get("/api/groups/group1")
      .set('Cookie', [`accessToken=${userTokenValid};refreshToken=${userTokenValid}`]);


    console.log(JSON.stringify(response, null, 2));
    expect(response.status).toEqual(401);
    expect(response.body).toHaveProperty("error");
  })

  test("Returns a 400 error if the group name passed as a route parameter does not represent a group in the database (admin auth)", async () => {
    const usersArray = [
      { username: "user1", email: "user1@ezwallet.com", password: "password1", role: "Regular", refreshToken: userTokenValid },
      { username: "user2", email: "user2@ezwallet.com", password: "password2", role: "Regular" },
      { username: "user3", email: "user3@ezwallet.com", password: "password3", role: "Regular" },
      { username: "admin1", email: "admin1@ezwallet.com", password: "password1", role: "Admin", refreshToken: adminTokenValid },
      { username: "admin2", email: "admin2@ezwallet.com", password: "password2", role: "Admin" },
    ]
    await User.insertMany(usersArray);

    await Group.insertMany([
      {
        name: "group1",
        members: [
          await User.findOne({ username: "user1" }).then(u => { return { email: u.email, user: u.id } }),
          await User.findOne({ username: "user2" }).then(u => { return { email: u.email, user: u.id } }),
        ]
      },
      {
        name: "group2",
        members: [
          await User.findOne({ username: "user3" }).then(u => { return { email: u.email, user: u.id } }),
          await User.findOne({ username: "admin2" }).then(u => { return { email: u.email, user: u.id } }),
        ]
      },
    ])


    const response = await request(app)
      .get("/api/groups/group3")
      .set('Cookie', [`accessToken=${userTokenValid};refreshToken=${userTokenValid}`]);


    console.log(JSON.stringify(response, null, 2));
    expect(response.status).toEqual(400);
    expect(response.body).toHaveProperty("error");
  })

  test("Returns a 400 error if the group name passed as a route parameter does not represent a group in the database (user auth)", async () => {
    const usersArray = [
      { username: "user1", email: "user1@ezwallet.com", password: "password1", role: "Regular", refreshToken: userTokenValid },
      { username: "user2", email: "user2@ezwallet.com", password: "password2", role: "Regular" },
      { username: "user3", email: "user3@ezwallet.com", password: "password3", role: "Regular" },
      { username: "admin1", email: "admin1@ezwallet.com", password: "password1", role: "Admin", refreshToken: adminTokenValid },
      { username: "admin2", email: "admin2@ezwallet.com", password: "password2", role: "Admin" },
    ]
    await User.insertMany(usersArray);

    await Group.insertMany([
      {
        name: "group1",
        members: [
          await User.findOne({ username: "user1" }).then(u => { return { email: u.email, user: u.id } }),
          await User.findOne({ username: "user2" }).then(u => { return { email: u.email, user: u.id } }),
        ]
      },
      {
        name: "group2",
        members: [
          await User.findOne({ username: "user3" }).then(u => { return { email: u.email, user: u.id } }),
          await User.findOne({ username: "admin2" }).then(u => { return { email: u.email, user: u.id } }),
        ]
      },
    ])


    const response = await request(app)
      .get("/api/groups/group3")
      .set('Cookie', [`accessToken=${adminTokenValid};refreshToken=${adminTokenValid}`]);


    console.log(JSON.stringify(response, null, 2));
    expect(response.status).toEqual(400);
    expect(response.body).toHaveProperty("error");
  })


})




describe("addToGroup", () => {

  test("should add to group (user route)", async () => {

    const usersArray = [
      { username: "user1", email: "user1@ezwallet.com", password: "password1", role: "Regular", refreshToken: userTokenValid },
      { username: "user2", email: "user2@ezwallet.com", password: "password2", role: "Regular" },
      { username: "user3", email: "user3@ezwallet.com", password: "password3", role: "Regular" },
      { username: "user4", email: "user4@ezwallet.com", password: "password4", role: "Regular" },
      { username: "admin1", email: "admin1@ezwallet.com", password: "password1", role: "Admin", refreshToken: adminTokenValid },
      { username: "admin2", email: "admin2@ezwallet.com", password: "password2", role: "Admin" },
    ]

    await User.insertMany(usersArray);

    await Group.insertMany([
      {
        name: "group1",
        members: [
          await User.findOne({ username: "user1" }).then(u => { return { email: u.email, user: u.id } }),
          await User.findOne({ username: "user2" }).then(u => { return { email: u.email, user: u.id } }),
        ]
      },
      {
        name: "group2",
        members: [
          await User.findOne({ username: "user3" }).then(u => { return { email: u.email, user: u.id } }),
          await User.findOne({ username: "admin2" }).then(u => { return { email: u.email, user: u.id } }),
        ]
      },
    ])

    const response = await request(app)
      .patch("/api/groups/group1/add")
      .set('Cookie', [`accessToken=${userTokenValid};refreshToken=${userTokenValid}`])
      .send({
        emails: [
          "user1@ezwallet.com", //caller, already in group
          "user2@ezwallet.com", //already in group
          "user3@ezwallet.com", //already in different group
          "user4@ezwallet.com", //can add
          "admin1@ezwallet.com", //can add
          "admin2@ezwallet.com", //already in different group
          "user5@ezwallet.com", //inexistent
          "admin3@ezwallet.com", //inexistent
        ]
      })

    //console.log(JSON.stringify(response, null, 2));

    expect(response.status).toEqual(200);
    expect(response.body.data).toEqual({
      group: {
        name: "group1",
        members: [
          { email: "user1@ezwallet.com" },
          { email: "user2@ezwallet.com" },
          { email: "user4@ezwallet.com" },
          { email: "admin1@ezwallet.com" },
        ]
      },
      membersNotFound: [
        /*
        { email: "user5@ezwallet.com" },
        { email: "admin3@ezwallet.com" },
        */
        "user5@ezwallet.com",
        "admin3@ezwallet.com",
      ],
      alreadyInGroup: [
        /*
        { email: "user1@ezwallet.com" },
        { email: "user2@ezwallet.com" },
        { email: "user3@ezwallet.com" },
        { email: "admin2@ezwallet.com" },
        */
        "user1@ezwallet.com",
        "user2@ezwallet.com",
        "user3@ezwallet.com",
        "admin2@ezwallet.com",
      ]
    })

  })


  test("Returns a 401 error if called by an authenticated user who is not part of the group (authType = Group) if the route is api/groups/:name/add", async () => {

    const usersArray = [
      { username: "user1", email: "user1@ezwallet.com", password: "password1", role: "Regular", refreshToken: userTokenValid },
      { username: "user2", email: "user2@ezwallet.com", password: "password2", role: "Regular" },
      { username: "user3", email: "user3@ezwallet.com", password: "password3", role: "Regular" },
      { username: "user4", email: "user4@ezwallet.com", password: "password4", role: "Regular" },
      { username: "admin1", email: "admin1@ezwallet.com", password: "password1", role: "Admin", refreshToken: adminTokenValid },
      { username: "admin2", email: "admin2@ezwallet.com", password: "password2", role: "Admin" },
    ]

    await User.insertMany(usersArray);

    await Group.insertMany([
      {
        name: "group1",
        members: [
          await User.findOne({ username: "user1" }).then(u => { return { email: u.email, user: u.id } }),
          await User.findOne({ username: "user2" }).then(u => { return { email: u.email, user: u.id } }),
        ]
      },
      {
        name: "group2",
        members: [
          await User.findOne({ username: "user3" }).then(u => { return { email: u.email, user: u.id } }),
          await User.findOne({ username: "admin2" }).then(u => { return { email: u.email, user: u.id } }),
        ]
      },
    ])

    const response = await request(app)
      .patch("/api/groups/group1/add")
      .set('Cookie', [`accessToken=${adminTokenValid};refreshToken=${adminTokenValid}`])
      .send({
        emails: [
          "user1@ezwallet.com", //caller, already in group
          "user2@ezwallet.com", //already in group
          "user3@ezwallet.com", //already in different group
          "user4@ezwallet.com", //can add
          "admin1@ezwallet.com", //can add
          "admin2@ezwallet.com", //already in different group
          "user5@ezwallet.com", //inexistent
          "admin3@ezwallet.com", //inexistent
        ]
      })

    //console.log(JSON.stringify(response, null, 2));

    expect(response.status).toEqual(401);
    expect(response.body).toHaveProperty("error")

  })

  test("should add to group (admin route)", async () => {

    const usersArray = [
      { username: "user1", email: "user1@ezwallet.com", password: "password1", role: "Regular", refreshToken: userTokenValid },
      { username: "user2", email: "user2@ezwallet.com", password: "password2", role: "Regular" },
      { username: "user3", email: "user3@ezwallet.com", password: "password3", role: "Regular" },
      { username: "user4", email: "user4@ezwallet.com", password: "password4", role: "Regular" },
      { username: "admin1", email: "admin1@ezwallet.com", password: "password1", role: "Admin", refreshToken: adminTokenValid },
      { username: "admin2", email: "admin2@ezwallet.com", password: "password2", role: "Admin" },
    ]

    await User.insertMany(usersArray);

    await Group.insertMany([
      {
        name: "group1",
        members: [
          await User.findOne({ username: "user1" }).then(u => { return { email: u.email, user: u.id } }),
          await User.findOne({ username: "user2" }).then(u => { return { email: u.email, user: u.id } }),
        ]
      },
      {
        name: "group2",
        members: [
          await User.findOne({ username: "user3" }).then(u => { return { email: u.email, user: u.id } }),
          await User.findOne({ username: "admin2" }).then(u => { return { email: u.email, user: u.id } }),
        ]
      },
    ])

    const response = await request(app)
      .patch("/api/groups/group1/insert")
      .set('Cookie', [`accessToken=${adminTokenValid};refreshToken=${adminTokenValid}`])
      .send({
        emails: [
          "user1@ezwallet.com", //caller, already in group
          "user2@ezwallet.com", //already in group
          "user3@ezwallet.com", //already in different group
          "user4@ezwallet.com", //can add
          "admin1@ezwallet.com", //can add
          "admin2@ezwallet.com", //already in different group
          "user5@ezwallet.com", //inexistent
          "admin3@ezwallet.com", //inexistent
        ]
      })

    console.log(JSON.stringify(response, null, 2));

    expect(response.status).toEqual(200);
    expect(response.body.data).toEqual({
      group: {
        name: "group1",
        members: [
          { email: "user1@ezwallet.com" },
          { email: "user2@ezwallet.com" },
          { email: "user4@ezwallet.com" },
          { email: "admin1@ezwallet.com" },
        ]
      },
      membersNotFound: [
        /*
        { email: "user5@ezwallet.com" },
        { email: "admin3@ezwallet.com" },
        */
        "user5@ezwallet.com",
        "admin3@ezwallet.com",
      ],
      alreadyInGroup: [
        /*
        { email: "user1@ezwallet.com" },
        { email: "user2@ezwallet.com" },
        { email: "user3@ezwallet.com" },
        { email: "admin2@ezwallet.com" },
        */
        "user1@ezwallet.com",
        "user2@ezwallet.com",
        "user3@ezwallet.com",
        "admin2@ezwallet.com",
      ]
    })

  })

  test("Returns a 401 error if called by an authenticated user who is not an admin (authType = Admin) if the route is api/groups/:name/insert", async () => {

    const usersArray = [
      { username: "user1", email: "user1@ezwallet.com", password: "password1", role: "Regular", refreshToken: userTokenValid },
      { username: "user2", email: "user2@ezwallet.com", password: "password2", role: "Regular" },
      { username: "user3", email: "user3@ezwallet.com", password: "password3", role: "Regular" },
      { username: "user4", email: "user4@ezwallet.com", password: "password4", role: "Regular" },
      { username: "admin1", email: "admin1@ezwallet.com", password: "password1", role: "Admin", refreshToken: adminTokenValid },
      { username: "admin2", email: "admin2@ezwallet.com", password: "password2", role: "Admin" },
    ]

    await User.insertMany(usersArray);

    await Group.insertMany([
      {
        name: "group1",
        members: [
          await User.findOne({ username: "user1" }).then(u => { return { email: u.email, user: u.id } }),
          await User.findOne({ username: "user2" }).then(u => { return { email: u.email, user: u.id } }),
        ]
      },
      {
        name: "group2",
        members: [
          await User.findOne({ username: "user3" }).then(u => { return { email: u.email, user: u.id } }),
          await User.findOne({ username: "admin2" }).then(u => { return { email: u.email, user: u.id } }),
        ]
      },
    ])

    const response = await request(app)
      .patch("/api/groups/group1/insert")
      .set('Cookie', [`accessToken=${userTokenValid};refreshToken=${userTokenValid}`])
      .send({
        emails: [
          "user1@ezwallet.com", //caller, already in group
          "user2@ezwallet.com", //already in group
          "user3@ezwallet.com", //already in different group
          "user4@ezwallet.com", //can add
          "admin1@ezwallet.com", //can add
          "admin2@ezwallet.com", //already in different group
          "user5@ezwallet.com", //inexistent
          "admin3@ezwallet.com", //inexistent
        ]
      })

    console.log(JSON.stringify(response, null, 2));

    expect(response.status).toEqual(401);
    expect(response.body).toHaveProperty("error");

  })

  test("Returns a 400 error if at least one of the member emails is not in a valid email format  ", async () => {

    const usersArray = [
      { username: "user1", email: "user1@ezwallet.com", password: "password1", role: "Regular", refreshToken: userTokenValid },
      { username: "user2", email: "user2@ezwallet.com", password: "password2", role: "Regular" },
      { username: "user3", email: "user3@ezwallet.com", password: "password3", role: "Regular" },
      { username: "user4", email: "user4@ezwallet.com", password: "password4", role: "Regular" },
      { username: "admin1", email: "admin1@ezwallet.com", password: "password1", role: "Admin", refreshToken: adminTokenValid },
      { username: "admin2", email: "admin2@ezwallet.com", password: "password2", role: "Admin" },
    ]

    await User.insertMany(usersArray);

    await Group.insertMany([
      {
        name: "group1",
        members: [
          await User.findOne({ username: "user1" }).then(u => { return { email: u.email, user: u.id } }),
          await User.findOne({ username: "user2" }).then(u => { return { email: u.email, user: u.id } }),
        ]
      },
      {
        name: "group2",
        members: [
          await User.findOne({ username: "user3" }).then(u => { return { email: u.email, user: u.id } }),
          await User.findOne({ username: "admin2" }).then(u => { return { email: u.email, user: u.id } }),
        ]
      },
    ])

    const response = await request(app)
      .patch("/api/groups/group1/add")
      .set('Cookie', [`accessToken=${userTokenValid};refreshToken=${userTokenValid}`])
      .send({
        emails: [
          "user1@ezwallet.com", //caller, already in group
          "user2@ezwallet.com", //already in group
          "user3@ezwallet.com", //already in different group
          "user4@ezwallet..com", //can add
          "admin1@ezwallet.com", //can add
          "admin2@ezwallet.com", //already in different group
          "user5@ezwallet.com", //inexistent
          "admin3@ezwallet.com", //inexistent
        ]
      })

    console.log(JSON.stringify(response, null, 2));

    expect(response.status).toEqual(400);
    expect(response.body).toHaveProperty("error")

  })

  test("Returns a 400 error if at least one of the member emails is an empty string  ", async () => {

    const usersArray = [
      { username: "user1", email: "user1@ezwallet.com", password: "password1", role: "Regular", refreshToken: userTokenValid },
      { username: "user2", email: "user2@ezwallet.com", password: "password2", role: "Regular" },
      { username: "user3", email: "user3@ezwallet.com", password: "password3", role: "Regular" },
      { username: "user4", email: "user4@ezwallet.com", password: "password4", role: "Regular" },
      { username: "admin1", email: "admin1@ezwallet.com", password: "password1", role: "Admin", refreshToken: adminTokenValid },
      { username: "admin2", email: "admin2@ezwallet.com", password: "password2", role: "Admin" },
    ]

    await User.insertMany(usersArray);

    await Group.insertMany([
      {
        name: "group1",
        members: [
          await User.findOne({ username: "user1" }).then(u => { return { email: u.email, user: u.id } }),
          await User.findOne({ username: "user2" }).then(u => { return { email: u.email, user: u.id } }),
        ]
      },
      {
        name: "group2",
        members: [
          await User.findOne({ username: "user3" }).then(u => { return { email: u.email, user: u.id } }),
          await User.findOne({ username: "admin2" }).then(u => { return { email: u.email, user: u.id } }),
        ]
      },
    ])

    const response = await request(app)
      .patch("/api/groups/group1/add")
      .set('Cookie', [`accessToken=${userTokenValid};refreshToken=${userTokenValid}`])
      .send({
        emails: [
          "user1@ezwallet.com", //caller, already in group
          "user2@ezwallet.com", //already in group
          "user3@ezwallet.com", //already in different group
          "", //can add
          "admin1@ezwallet.com", //can add
          "admin2@ezwallet.com", //already in different group
          "user5@ezwallet.com", //inexistent
          "admin3@ezwallet.com", //inexistent
        ]
      })

    console.log(JSON.stringify(response, null, 2));

    expect(response.status).toEqual(400);
    expect(response.body).toHaveProperty("error")

  })

  test("Returns a 400 error if all the provided emails represent users that are already in a group or do not exist in the database  ", async () => {

    const usersArray = [
      { username: "user1", email: "user1@ezwallet.com", password: "password1", role: "Regular", refreshToken: userTokenValid },
      { username: "user2", email: "user2@ezwallet.com", password: "password2", role: "Regular" },
      { username: "user3", email: "user3@ezwallet.com", password: "password3", role: "Regular" },
      //{ username: "user4", email: "user4@ezwallet.com", password: "password4", role: "Regular" },
      { username: "admin1", email: "admin1@ezwallet.com", password: "password1", role: "Admin", refreshToken: adminTokenValid },
      { username: "admin2", email: "admin2@ezwallet.com", password: "password2", role: "Admin" },
    ]

    await User.insertMany(usersArray);

    await Group.insertMany([
      {
        name: "group1",
        members: [
          await User.findOne({ username: "user1" }).then(u => { return { email: u.email, user: u.id } }),
          await User.findOne({ username: "user2" }).then(u => { return { email: u.email, user: u.id } }),
        ]
      },
      {
        name: "group2",
        members: [
          await User.findOne({ username: "user3" }).then(u => { return { email: u.email, user: u.id } }),
          await User.findOne({ username: "admin2" }).then(u => { return { email: u.email, user: u.id } }),
          await User.findOne({ username: "admin1" }).then(u => { return { email: u.email, user: u.id } }),
        ]
      },
    ])

    const response = await request(app)
      .patch("/api/groups/group1/add")
      .set('Cookie', [`accessToken=${userTokenValid};refreshToken=${userTokenValid}`])
      .send({
        emails: [
          "user1@ezwallet.com", //caller, already in group
          "user2@ezwallet.com", //already in group
          "user3@ezwallet.com", //already in different group
          "user4@ezwallet.com", //can add
          "admin1@ezwallet.com", //can add
          "admin2@ezwallet.com", //already in different group
          "user5@ezwallet.com", //inexistent
          "admin3@ezwallet.com", //inexistent
        ]
      })

    console.log(JSON.stringify(response, null, 2));

    expect(response.status).toEqual(400);
    expect(response.body).toHaveProperty("error")

  })

  test("Returns a 400 error if the group name passed as a route parameter does not represent a group in the database ", async () => {

    const usersArray = [
      { username: "user1", email: "user1@ezwallet.com", password: "password1", role: "Regular", refreshToken: userTokenValid },
      { username: "user2", email: "user2@ezwallet.com", password: "password2", role: "Regular" },
      { username: "user3", email: "user3@ezwallet.com", password: "password3", role: "Regular" },
      //{ username: "user4", email: "user4@ezwallet.com", password: "password4", role: "Regular" },
      { username: "admin1", email: "admin1@ezwallet.com", password: "password1", role: "Admin", refreshToken: adminTokenValid },
      { username: "admin2", email: "admin2@ezwallet.com", password: "password2", role: "Admin" },
    ]

    await User.insertMany(usersArray);

    await Group.insertMany([
      {
        name: "group1",
        members: [
          await User.findOne({ username: "user1" }).then(u => { return { email: u.email, user: u.id } }),
          await User.findOne({ username: "user2" }).then(u => { return { email: u.email, user: u.id } }),
        ]
      },
      {
        name: "group2",
        members: [
          await User.findOne({ username: "user3" }).then(u => { return { email: u.email, user: u.id } }),
          await User.findOne({ username: "admin2" }).then(u => { return { email: u.email, user: u.id } }),
          await User.findOne({ username: "admin1" }).then(u => { return { email: u.email, user: u.id } }),
        ]
      },
    ])

    const response = await request(app)
      .patch("/api/groups/group3/add")
      .set('Cookie', [`accessToken=${userTokenValid};refreshToken=${userTokenValid}`])
      .send({
        emails: [
          "user1@ezwallet.com", //caller, already in group
          "user2@ezwallet.com", //already in group
          "user3@ezwallet.com", //already in different group
          "user4@ezwallet.com", //can add
          "admin1@ezwallet.com", //can add
          "admin2@ezwallet.com", //already in different group
          "user5@ezwallet.com", //inexistent
          "admin3@ezwallet.com", //inexistent
        ]
      })

    console.log(JSON.stringify(response, null, 2));

    expect(response.status).toEqual(400);
    expect(response.body).toHaveProperty("error")

  })

  test("Returns a 400 error if the group name passed as a route parameter does not represent a group in the database ", async () => {

    const usersArray = [
      { username: "user1", email: "user1@ezwallet.com", password: "password1", role: "Regular", refreshToken: userTokenValid },
      { username: "user2", email: "user2@ezwallet.com", password: "password2", role: "Regular" },
      { username: "user3", email: "user3@ezwallet.com", password: "password3", role: "Regular" },
      //{ username: "user4", email: "user4@ezwallet.com", password: "password4", role: "Regular" },
      { username: "admin1", email: "admin1@ezwallet.com", password: "password1", role: "Admin", refreshToken: adminTokenValid },
      { username: "admin2", email: "admin2@ezwallet.com", password: "password2", role: "Admin" },
    ]

    await User.insertMany(usersArray);

    await Group.insertMany([
      {
        name: "group1",
        members: [
          await User.findOne({ username: "user1" }).then(u => { return { email: u.email, user: u.id } }),
          await User.findOne({ username: "user2" }).then(u => { return { email: u.email, user: u.id } }),
        ]
      },
      {
        name: "group2",
        members: [
          await User.findOne({ username: "user3" }).then(u => { return { email: u.email, user: u.id } }),
          await User.findOne({ username: "admin2" }).then(u => { return { email: u.email, user: u.id } }),
          await User.findOne({ username: "admin1" }).then(u => { return { email: u.email, user: u.id } }),
        ]
      },
    ])

    const response = await request(app)
      .patch("/api/groups/group3/insert")
      .set('Cookie', [`accessToken=${adminTokenValid};refreshToken=${adminTokenValid}`])
      .send({
        emails: [
          "user1@ezwallet.com", //caller, already in group
          "user2@ezwallet.com", //already in group
          "user3@ezwallet.com", //already in different group
          "user4@ezwallet.com", //can add
          "admin1@ezwallet.com", //can add
          "admin2@ezwallet.com", //already in different group
          "user5@ezwallet.com", //inexistent
          "admin3@ezwallet.com", //inexistent
        ]
      })

    console.log(JSON.stringify(response, null, 2));

    expect(response.status).toEqual(400);
    expect(response.body).toHaveProperty("error")

  })

});




describe("removeFromGroup", () => {

  test("should remove from group keeping the oldest(user route)", async () => {

    const usersArray = [
      { username: "user0", email: "user0@ezwallet.com", password: "password0", role: "Regular" },
      { username: "user1", email: "user1@ezwallet.com", password: "password1", role: "Regular", refreshToken: userTokenValid },
      { username: "user2", email: "user2@ezwallet.com", password: "password2", role: "Regular" },
      { username: "user3", email: "user3@ezwallet.com", password: "password3", role: "Regular" },
      { username: "user4", email: "user4@ezwallet.com", password: "password4", role: "Regular" },
      { username: "admin1", email: "admin1@ezwallet.com", password: "password1", role: "Admin", refreshToken: adminTokenValid },
      { username: "admin2", email: "admin2@ezwallet.com", password: "password2", role: "Admin" },
    ]

    await User.insertMany(usersArray);

    await Group.insertMany([
      {
        name: "group1",
        members: [
          await User.findOne({ username: "user0" }).then(u => { return { email: u.email, user: u.id } }),
          await User.findOne({ username: "user1" }).then(u => { return { email: u.email, user: u.id } }),
          await User.findOne({ username: "user2" }).then(u => { return { email: u.email, user: u.id } }),
          await User.findOne({ username: "user4" }).then(u => { return { email: u.email, user: u.id } }),
        ]
      },
      {
        name: "group2",
        members: [
          await User.findOne({ username: "user3" }).then(u => { return { email: u.email, user: u.id } }),
          await User.findOne({ username: "admin2" }).then(u => { return { email: u.email, user: u.id } }),
        ]
      },
    ])

    const response = await request(app)
      .patch("/api/groups/group1/remove")
      .set('Cookie', [`accessToken=${userTokenValid};refreshToken=${userTokenValid}`])
      .send({
        emails: [
          "user0@ezwallet.com", //oldest member
          "user1@ezwallet.com", //caller can remove
          "user2@ezwallet.com", //can remove
          "user3@ezwallet.com", //not in group
          "user4@ezwallet.com", //can remove
          "admin1@ezwallet.com", //not in group
          "admin2@ezwallet.com", //not in group
          "user5@ezwallet.com", //inexistent
          "admin3@ezwallet.com", //inexistent
        ]
      })

    //console.log(JSON.stringify(response, null, 2));

    expect(response.status).toEqual(200);
    expect(response.body.data).toEqual({
      group: {
        name: "group1",
        members: [
          { email: "user0@ezwallet.com" }, //only oldest member left
        ]
      },
      membersNotFound: [
        /*
        { email: "user5@ezwallet.com" },
        { email: "admin3@ezwallet.com" },
        */
        "user5@ezwallet.com",
        "admin3@ezwallet.com",
      ],
      notInGroup: [
        /*
        { email: "user3@ezwallet.com" },
        { email: "admin1@ezwallet.com" },
        { email: "admin2@ezwallet.com" },
        */
        "user3@ezwallet.com",
        "admin1@ezwallet.com",
        "admin2@ezwallet.com",
      ]
    })

  })

})




describe("deleteUser", () => {

  test("should delete user", async () => {

    await User.insertMany(
      [
        { username: "user0", email: "user0@ezwallet.com", password: "password0", role: "Regular" },
        { username: "user1", email: "user1@ezwallet.com", password: "password1", role: "Regular", refreshToken: userTokenValid },
        { username: "user2", email: "user2@ezwallet.com", password: "password2", role: "Regular" },
        { username: "user3", email: "user3@ezwallet.com", password: "password3", role: "Regular" },
        { username: "user4", email: "user4@ezwallet.com", password: "password4", role: "Regular" },
        { username: "admin1", email: "admin1@ezwallet.com", password: "password1", role: "Admin", refreshToken: adminTokenValid },
        { username: "admin2", email: "admin2@ezwallet.com", password: "password2", role: "Admin" },
      ]
    );

    await Group.insertMany(
      [
        {
          name: "group1",
          members: [
            await User.findOne({ username: "user0" }).then(u => { return { email: u.email, user: u.id } }),
          ]
        },
      ]
    );

    await transactions.insertMany([
      { username: "user0", type: "type1", amount: 100, date: Date.now() },
      { username: "user1", type: "type2", amount: 200, date: Date.now() },
      { username: "user0", type: "type3", amount: 300, date: Date.now() },
      { username: "user0", type: "type4", amount: 400, date: Date.now() },
      { username: "user2", type: "type5", amount: 500, date: Date.now() },
    ])

    const response = await request(app)
      .delete("/api/users")
      .set('Cookie', [`accessToken=${adminTokenValid};refreshToken=${adminTokenValid}`])
      .send({ email: "user0@ezwallet.com" });

    //console.log(JSON.stringify(response, null, 2));

    expect(response.status).toEqual(200);
    expect(response.body.data).toEqual(
      {
        deletedTransactions: 3,
        deletedFromGroup: true
      }
    )

  })
})

describe("deleteGroup", () => {

  test("should delete group", async () => {

    await User.insertMany(
      [
        { username: "user0", email: "user0@ezwallet.com", password: "password0", role: "Regular" },
        { username: "user1", email: "user1@ezwallet.com", password: "password1", role: "Regular", refreshToken: userTokenValid },
        { username: "user2", email: "user2@ezwallet.com", password: "password2", role: "Regular" },
        { username: "user3", email: "user3@ezwallet.com", password: "password3", role: "Regular" },
        { username: "user4", email: "user4@ezwallet.com", password: "password4", role: "Regular" },
        { username: "admin1", email: "admin1@ezwallet.com", password: "password1", role: "Admin", refreshToken: adminTokenValid },
        { username: "admin2", email: "admin2@ezwallet.com", password: "password2", role: "Admin" },
      ]
    );

    await Group.insertMany(
      [
        {
          name: "group1",
          members: [
            await User.findOne({ username: "user1" }).then(u => { return { email: u.email, user: u.id } }),
            await User.findOne({ username: "user2" }).then(u => { return { email: u.email, user: u.id } }),
          ]
        },
      ]
    );

    const response = await request(app)
      .delete("/api/groups")
      .set('Cookie', [`accessToken=${adminTokenValid};refreshToken=${adminTokenValid}`])
      .send({ name: "group1" });

    //console.log(JSON.stringify(response, null, 2));

    expect(response.status).toEqual(200);
    expect(response.body.data).toHaveProperty("message");

  })
});
