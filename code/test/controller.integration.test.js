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



describe("createCategory", () => {

    //router.post("/categories", createCategory)

    test('should create a category', async () => {
        await categories.insertMany(
            [
                { type: "type0", color: "color0" },
                { type: "type1", color: "color1" },
            ]
        )

        const response = await request(app)
            .post("/api/categories")
            .set('Cookie', [`accessToken=${adminTokenValid};refreshToken=${adminTokenValid}`])
            .send({ type: "type3", color: "color3" });
        //console.log(JSON.stringify(response, null, 2));

        expect(response.status).toEqual(200);
        expect(response.body.data).toEqual(
            {
                type: "type3",
                color: "color3"
            }
        )
    })

    test('Returns a 400 error if the type of category passed in the request body represents an already existing category in the database', async () => {
        await categories.insertMany(
            [
                { type: "type0", color: "color0" },
                { type: "type1", color: "color1" },
            ]
        )

        const response = await request(app)
            .post("/api/categories")
            .set('Cookie', [`accessToken=${adminTokenValid};refreshToken=${adminTokenValid}`])
            .send({ type: "type1", color: "color3" });
        //console.log(response);

        const mockErrorMessage = expect.any(String);
        expect(response.status).toEqual(400);
        expect(response.body).toEqual({ error: mockErrorMessage });
    })

    test('Returns a 400 error if at least one of the parameters in the request body is an empty string', async () => {

        await categories.insertMany(
            [
                { type: "type0", color: "color0" },
                { type: "type1", color: "color1" },
            ]
        )

        const response = await request(app)
            .post("/api/categories")
            .set('Cookie', [`accessToken=${adminTokenValid};refreshToken=${adminTokenValid}`])
            .send({ type: "", color: "color3" });
        //console.log(response);

        const mockErrorMessage = expect.any(String);
        expect(response.status).toEqual(400);
        expect(response.body).toEqual({ error: mockErrorMessage });
    })

    test('Returns a 400 error if the request body does not contain all the necessary attributes', async () => {

        await categories.insertMany(
            [
                { type: "type0", color: "color0" },
                { type: "type1", color: "color1" },
            ]
        )

        const response = await request(app)
            .post("/api/categories")
            .set('Cookie', [`accessToken=${adminTokenValid};refreshToken=${adminTokenValid}`])
            .send({ type: "type3" });
        //console.log(response);

        const mockErrorMessage = expect.any(String);
        expect(response.status).toEqual(400);
        expect(response.body).toEqual({ error: mockErrorMessage });
    })

    test('Returns a 401 error if called by an authenticated user who is not an admin (authType = Admin)', async () => {

        await categories.insertMany(
            [
                { type: "type0", color: "color0" },
                { type: "type1", color: "color1" },
            ]
        )

        const response = await request(app)
            .post("/api/categories")
            .set('Cookie', [`accessToken=${userTokenValid};refreshToken=${adminTokenValid}`])
            .send({ type: "type3" });
        //console.log(response);

        expect(response.status).toEqual(401);
        expect(response.body).toEqual({ error: expect.any(String) });
    })

});

describe("updateCategory", () => {

    //router.patch("/categories/:type", updateCategory)

    test('should update a category with both new type and new color', async () => {
        await categories.insertMany(
            [
                { type: "type0", color: "color0" },
                { type: "type1", color: "color1" },
            ]
        )

        await transactions.insertMany(
            [
                { username: "user1", type: "type0", amount: 100, date: Date.now() },
                { username: "user1", type: "type1", amount: 200, date: Date.now() },
                { username: "user1", type: "type0", amount: 300, date: Date.now() },
                { username: "user1", type: "type1", amount: 400, date: Date.now() },
                { username: "user1", type: "type1", amount: 500, date: Date.now() },
            ]
        )

        const response = await request(app)
            .patch("/api/categories/type1")
            .set('Cookie', [`accessToken=${adminTokenValid};refreshToken=${adminTokenValid}`])
            .send({ type: "newType1", color: "newColor3" });
        //console.log(JSON.stringify(response, null, 2));

        expect(response.status).toEqual(200);
        expect(response.body.data).toEqual(
            {
                message: expect.any(String),
                count: 3
            }
        )

    });

    test('should update a category with new color', async () => {
        await categories.insertMany(
            [
                { type: "type0", color: "color0" },
                { type: "type1", color: "color1" },
            ]
        )

        await transactions.insertMany(
            [
                { username: "user1", type: "type0", amount: 100, date: Date.now() },
                { username: "user1", type: "type1", amount: 200, date: Date.now() },
                { username: "user1", type: "type0", amount: 300, date: Date.now() },
                { username: "user1", type: "type1", amount: 400, date: Date.now() },
                { username: "user1", type: "type1", amount: 500, date: Date.now() },
            ]
        )

        const response = await request(app)
            .patch("/api/categories/type1")
            .set('Cookie', [`accessToken=${adminTokenValid};refreshToken=${adminTokenValid}`])
            .send({ type: "type1", color: "newColor3" });
        //console.log(JSON.stringify(response, null, 2));

        expect(response.status).toEqual(200);
        expect(response.body.data).toEqual(
            {
                message: expect.any(String),
                count: 0 //?
            }
        )

    });

    test('Returns a 401 error if called by an authenticated user who is not an admin (authType = Admin)', async () => {
        await categories.insertMany(
            [
                { type: "type0", color: "color0" },
                { type: "type1", color: "color1" },
            ]
        )

        await transactions.insertMany(
            [
                { username: "user1", type: "type0", amount: 100, date: Date.now() },
                { username: "user1", type: "type1", amount: 200, date: Date.now() },
                { username: "user1", type: "type0", amount: 300, date: Date.now() },
                { username: "user1", type: "type1", amount: 400, date: Date.now() },
                { username: "user1", type: "type1", amount: 500, date: Date.now() },
            ]
        )

        const response = await request(app)
            .patch("/api/categories/type1")
            .set('Cookie', [`accessToken=${userTokenValid};refreshToken=${adminTokenValid}`])
            .send({ type: "newType1", color: "newColor3" });
        //console.log(JSON.stringify(response, null, 2));

        expect(response.status).toEqual(401);
        expect(response.body).toEqual({ error: expect.any(String) });

    });


    test('Returns a 400 error if the type of category passed in the request body as the new type represents an already existing category in the database and that category is not the same as the requested one', async () => {

        await categories.insertMany(
            [
                { type: "type0", color: "color0" },
                { type: "type1", color: "color1" },
            ]
        )

        await transactions.insertMany(
            [
                { username: "user1", type: "type0", amount: 100, date: Date.now() },
                { username: "user1", type: "type1", amount: 200, date: Date.now() },
                { username: "user1", type: "type0", amount: 300, date: Date.now() },
                { username: "user1", type: "type1", amount: 400, date: Date.now() },
                { username: "user1", type: "type1", amount: 500, date: Date.now() },
            ]
        )

        const response = await request(app)
            .patch("/api/categories/type1")
            .set('Cookie', [`accessToken=${adminTokenValid};refreshToken=${adminTokenValid}`])
            .send({ type: "type0", color: "newColor3" });
        //console.log(JSON.stringify(response, null, 2));

        expect(response.status).toEqual(400);
        expect(response.body).toEqual({ error: expect.any(String) });

    });

    test('Returns a 400 error if the type of category passed as a route parameter does not represent a category in the database', async () => {

        await categories.insertMany(
            [
                { type: "type0", color: "color0" },
                { type: "type1", color: "color1" },
            ]
        )

        await transactions.insertMany(
            [
                { username: "user1", type: "type0", amount: 100, date: Date.now() },
                { username: "user1", type: "type1", amount: 200, date: Date.now() },
                { username: "user1", type: "type0", amount: 300, date: Date.now() },
                { username: "user1", type: "type1", amount: 400, date: Date.now() },
                { username: "user1", type: "type1", amount: 500, date: Date.now() },
            ]
        )

        const response = await request(app)
            .patch("/api/categories/type3")
            .set('Cookie', [`accessToken=${adminTokenValid};refreshToken=${adminTokenValid}`])
            .send({ type: "type0", color: "newColor3" });
        //console.log(JSON.stringify(response, null, 2));

        expect(response.status).toEqual(400);
        expect(response.body).toEqual({ error: expect.any(String) });

    });

    test('Returns a 400 error if at least one of the parameters in the request body is an empty string', async () => {

        await categories.insertMany(
            [
                { type: "type0", color: "color0" },
                { type: "type1", color: "color1" },
            ]
        )

        await transactions.insertMany(
            [
                { username: "user1", type: "type0", amount: 100, date: Date.now() },
                { username: "user1", type: "type1", amount: 200, date: Date.now() },
                { username: "user1", type: "type0", amount: 300, date: Date.now() },
                { username: "user1", type: "type1", amount: 400, date: Date.now() },
                { username: "user1", type: "type1", amount: 500, date: Date.now() },
            ]
        )

        const response = await request(app)
            .patch("/api/categories/type3")
            .set('Cookie', [`accessToken=${adminTokenValid};refreshToken=${adminTokenValid}`])
            .send({ type: "type0", color: "" });
        //console.log(JSON.stringify(response, null, 2));

        expect(response.status).toEqual(400);
        expect(response.body).toEqual({ error: expect.any(String) });

    });

    test('Returns a 400 error if the request body does not contain all the necessary attributes', async () => {

        await categories.insertMany(
            [
                { type: "type0", color: "color0" },
                { type: "type1", color: "color1" },
            ]
        )

        await transactions.insertMany(
            [
                { username: "user1", type: "type0", amount: 100, date: Date.now() },
                { username: "user1", type: "type1", amount: 200, date: Date.now() },
                { username: "user1", type: "type0", amount: 300, date: Date.now() },
                { username: "user1", type: "type1", amount: 400, date: Date.now() },
                { username: "user1", type: "type1", amount: 500, date: Date.now() },
            ]
        )

        const response = await request(app)
            .patch("/api/categories/type3")
            .set('Cookie', [`accessToken=${adminTokenValid};refreshToken=${adminTokenValid}`])
            .send({ type: "type0" });
        //console.log(JSON.stringify(response, null, 2));

        expect(response.status).toEqual(400);
        expect(response.body).toEqual({ error: expect.any(String) });

    });
})

describe("deleteCategory", () => {

    //router.delete("/categories", deleteCategory)

    test('should delete all categories except oldest (N==T)', async () => {
        await categories.insertMany(
            [
                { type: "type0", color: "color0" },
                { type: "type1", color: "color1" },
                { type: "type2", color: "color1" },
                { type: "type3", color: "color1" },
                { type: "type4", color: "color1" },
            ]
        )

        await transactions.insertMany(
            [
                { username: "user1", type: "type0", amount: 100, date: Date.now() },
                { username: "user1", type: "type1", amount: 200, date: Date.now() },
                { username: "user1", type: "type2", amount: 300, date: Date.now() },
                { username: "user1", type: "type3", amount: 400, date: Date.now() },
                { username: "user1", type: "type4", amount: 500, date: Date.now() },
            ]
        )

        const response = await request(app)
            .delete("/api/categories")
            .set('Cookie', [`accessToken=${adminTokenValid};refreshToken=${adminTokenValid}`])
            .send({ types: ["type4", "type4", "type0", "type2", "type3", "type1",] });
        //console.log(JSON.stringify(response, null, 2));

        expect(response.status).toEqual(200);
        expect(response.body.data).toEqual(
            {
                message: expect.any(String),
                count: 4
            }
        )

    });

    test('should delete all categories provided (N>T)', async () => {
        await categories.insertMany(
            [
                { type: "type0", color: "color0" },
                { type: "type1", color: "color1" },
                { type: "type2", color: "color1" },
                { type: "type3", color: "color1" },
                { type: "type4", color: "color1" },
            ]
        )

        await transactions.insertMany(
            [
                { username: "user1", type: "type0", amount: 100, date: Date.now() },
                { username: "user1", type: "type1", amount: 200, date: Date.now() },
                { username: "user1", type: "type2", amount: 300, date: Date.now() },
                { username: "user1", type: "type3", amount: 400, date: Date.now() },
                { username: "user1", type: "type4", amount: 500, date: Date.now() },
            ]
        )

        const response = await request(app)
            .delete("/api/categories")
            .set('Cookie', [`accessToken=${adminTokenValid};refreshToken=${adminTokenValid}`])
            .send({ types: ["type4", "type4", "type2", "type3",] });
        //console.log(JSON.stringify(response, null, 3));

        expect(response.status).toEqual(200);
        expect(response.body.data).toEqual(
            {
                message: expect.any(String),
                count: 3
            }
        )

    });

    test('Returns a 401 error if called by an authenticated user who is not an admin (authType = Admin)', async () => {
        await categories.insertMany(
            [
                { type: "type0", color: "color0" },
                { type: "type1", color: "color1" },
                { type: "type2", color: "color1" },
                { type: "type3", color: "color1" },
                { type: "type4", color: "color1" },
            ]
        )

        await transactions.insertMany(
            [
                { username: "user1", type: "type0", amount: 100, date: Date.now() },
                { username: "user1", type: "type1", amount: 200, date: Date.now() },
                { username: "user1", type: "type2", amount: 300, date: Date.now() },
                { username: "user1", type: "type3", amount: 400, date: Date.now() },
                { username: "user1", type: "type4", amount: 500, date: Date.now() },
            ]
        )

        const response = await request(app)
            .delete("/api/categories")
            .set('Cookie', [`accessToken=${userTokenValid};refreshToken=${adminTokenValid}`])
            .send({ types: ["type4", "type4", "type0", "type2", "type3", "type1",] });
        //console.log(JSON.stringify(response, null, 2));

        expect(response.status).toEqual(401);
        expect(response.body).toEqual({ error: expect.any(String) });

    });

    test('Returns a 400 error if at least one of the types in the array does not represent a category in the database', async () => {
        await categories.insertMany(
            [
                { type: "type0", color: "color0" },
                { type: "type1", color: "color1" },
                { type: "type2", color: "color1" },
                { type: "type3", color: "color1" },
                { type: "type4", color: "color1" },
            ]
        )

        await transactions.insertMany(
            [
                { username: "user1", type: "type0", amount: 100, date: Date.now() },
                { username: "user1", type: "type1", amount: 200, date: Date.now() },
                { username: "user1", type: "type2", amount: 300, date: Date.now() },
                { username: "user1", type: "type3", amount: 400, date: Date.now() },
                { username: "user1", type: "type4", amount: 500, date: Date.now() },
            ]
        )

        const response = await request(app)
            .delete("/api/categories")
            .set('Cookie', [`accessToken=${adminTokenValid};refreshToken=${adminTokenValid}`])
            .send({ types: ["type4", "type4", "type5", "type2", "type3", "type1",] });
        //console.log(JSON.stringify(response, null, 2));

        expect(response.status).toEqual(400);
        expect(response.body).toEqual({ error: expect.any(String) });

    });

    test('Returns a 400 error if the array passed in the request body is empty    ', async () => {
        await categories.insertMany(
            [
                { type: "type0", color: "color0" },
                { type: "type1", color: "color1" },
                { type: "type2", color: "color1" },
                { type: "type3", color: "color1" },
                { type: "type4", color: "color1" },
            ]
        )

        await transactions.insertMany(
            [
                { username: "user1", type: "type0", amount: 100, date: Date.now() },
                { username: "user1", type: "type1", amount: 200, date: Date.now() },
                { username: "user1", type: "type2", amount: 300, date: Date.now() },
                { username: "user1", type: "type3", amount: 400, date: Date.now() },
                { username: "user1", type: "type4", amount: 500, date: Date.now() },
            ]
        )

        const response = await request(app)
            .delete("/api/categories")
            .set('Cookie', [`accessToken=${adminTokenValid};refreshToken=${adminTokenValid}`])
            .send({ types: [] });
        //console.log(JSON.stringify(response, null, 2));

        expect(response.status).toEqual(400);
        expect(response.body).toEqual({ error: expect.any(String) });

    });

    test('Returns a 400 error if at least one of the types in the array is an empty string    ', async () => {
        await categories.insertMany(
            [
                { type: "type0", color: "color0" },
                { type: "type1", color: "color1" },
                { type: "type2", color: "color1" },
                { type: "type3", color: "color1" },
                { type: "type4", color: "color1" },
            ]
        )

        await transactions.insertMany(
            [
                { username: "user1", type: "type0", amount: 100, date: Date.now() },
                { username: "user1", type: "type1", amount: 200, date: Date.now() },
                { username: "user1", type: "type2", amount: 300, date: Date.now() },
                { username: "user1", type: "type3", amount: 400, date: Date.now() },
                { username: "user1", type: "type4", amount: 500, date: Date.now() },
            ]
        )

        const response = await request(app)
            .delete("/api/categories")
            .set('Cookie', [`accessToken=${adminTokenValid};refreshToken=${adminTokenValid}`])
            .send({ types: ["type4", "type4", "", "type2", "type3", "type1"] });
        //console.log(JSON.stringify(response, null, 2));

        expect(response.status).toEqual(400);
        expect(response.body).toEqual({ error: expect.any(String) });

    });

    test('Returns a 400 error if called when there is only one category in the database    ', async () => {
        await categories.insertMany(
            [
                { type: "type0", color: "color0" },
            ]
        )

        await transactions.insertMany(
            [
                { username: "user1", type: "type0", amount: 100, date: Date.now() },
                { username: "user1", type: "type1", amount: 200, date: Date.now() },
                { username: "user1", type: "type2", amount: 300, date: Date.now() },
                { username: "user1", type: "type3", amount: 400, date: Date.now() },
                { username: "user1", type: "type4", amount: 500, date: Date.now() },
            ]
        )

        const response = await request(app)
            .delete("/api/categories")
            .set('Cookie', [`accessToken=${adminTokenValid};refreshToken=${adminTokenValid}`])
            .send({ types: ["type4", "type4", "type0", "type2", "type3", "type1"] });
        //console.log(JSON.stringify(response, null, 2));

        expect(response.status).toEqual(400);
        expect(response.body).toEqual({ error: expect.any(String) });

    });

    test('Returns a 400 error if the request body does not contain all the necessary attributes    ', async () => {
        await categories.insertMany(
            [
                { type: "type0", color: "color0" },
                { type: "type1", color: "color1" },
                { type: "type2", color: "color1" },
                { type: "type3", color: "color1" },
                { type: "type4", color: "color1" },
            ]
        )

        await transactions.insertMany(
            [
                { username: "user1", type: "type0", amount: 100, date: Date.now() },
                { username: "user1", type: "type1", amount: 200, date: Date.now() },
                { username: "user1", type: "type2", amount: 300, date: Date.now() },
                { username: "user1", type: "type3", amount: 400, date: Date.now() },
                { username: "user1", type: "type4", amount: 500, date: Date.now() },
            ]
        )

        const response = await request(app)
            .delete("/api/categories")
            .set('Cookie', [`accessToken=${adminTokenValid};refreshToken=${adminTokenValid}`])
            .send({});
        //console.log(JSON.stringify(response, null, 2));

        expect(response.status).toEqual(400);
        expect(response.body).toEqual({ error: expect.any(String) });

    });


})

describe("getCategories", () => {

    //router.get("/categories", getCategories)

    test('should get all categories (user)', async () => {
        await categories.insertMany(
            [
                { type: "type0", color: "color0" },
                { type: "type1", color: "color1" },
                { type: "type2", color: "color1" },
                { type: "type3", color: "color1" },
                { type: "type4", color: "color1" },
            ]
        )

        const response = await request(app)
            .get("/api/categories")
            .set('Cookie', [`accessToken=${userTokenValid};refreshToken=${userTokenValid}`]);
        //console.log(JSON.stringify(response, null, 2));

        expect(response.status).toEqual(200);
        expect(response.body.data).toEqual(
            [
                { type: "type0", color: "color0" },
                { type: "type1", color: "color1" },
                { type: "type2", color: "color1" },
                { type: "type3", color: "color1" },
                { type: "type4", color: "color1" },
            ]
        )

    });

    test('Returns a 401 error if called by a user who is not authenticated (authType = Simple)    ', async () => {
        await categories.insertMany(
            [
                { type: "type0", color: "color0" },
                { type: "type1", color: "color1" },
                { type: "type2", color: "color1" },
                { type: "type3", color: "color1" },
                { type: "type4", color: "color1" },
            ]
        )

        const response = await request(app)
            .get("/api/categories")
            .set('Cookie', [`accessToken=${adminTokenValid};refreshToken=${userTokenValid}`]);
        //console.log(JSON.stringify(response, null, 2));

        expect(response.status).toEqual(401);
        expect(response.body).toEqual({ error: expect.any(String) })

    });
})

describe("createTransaction", () => {

    //router.post("/users/:username/transactions", createTransaction)

    test('should create a transaction', async () => {

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

        await categories.insertMany(
            [
                { type: "type0", color: "color0" },
                { type: "type1", color: "color1" },
                { type: "type2", color: "color2" },
                { type: "type3", color: "color3" },
                { type: "type4", color: "color4" },
            ]
        )

        await transactions.insertMany(
            [
                { username: "user1", type: "type0", amount: 100, date: Date.now() },
                { username: "user1", type: "type1", amount: 200, date: Date.now() },
                { username: "user1", type: "type2", amount: 300, date: Date.now() },
                { username: "user1", type: "type3", amount: 400, date: Date.now() },
                { username: "user1", type: "type4", amount: 500, date: Date.now() },
            ]
        )

        const response = await request(app)
            .post("/api/users/user1/transactions")
            .set('Cookie', [`accessToken=${userTokenValid};refreshToken=${userTokenValid}`])
            .send({ username: "user1", amount: "500.678", type: "type0" });
        //console.log(JSON.stringify(response, null, 2));

        expect(response.status).toEqual(200);
        expect(response.body.data).toEqual(
            { username: "user1", type: "type0", amount: 500.678, date: expect.any(String) },//?
        )

    });

    test('Returns a 401 error if called by an authenticated user who is not the same user as the one in the route parameter (authType = User)', async () => {

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

        await categories.insertMany(
            [
                { type: "type0", color: "color0" },
                { type: "type1", color: "color1" },
                { type: "type2", color: "color2" },
                { type: "type3", color: "color3" },
                { type: "type4", color: "color4" },
            ]
        )

        await transactions.insertMany(
            [
                { username: "user1", type: "type0", amount: 100, date: Date.now() },
                { username: "user1", type: "type1", amount: 200, date: Date.now() },
                { username: "user1", type: "type2", amount: 300, date: Date.now() },
                { username: "user1", type: "type3", amount: 400, date: Date.now() },
                { username: "user1", type: "type4", amount: 500, date: Date.now() },
            ]
        )

        const response = await request(app)
            .post("/api/users/user2/transactions")
            .set('Cookie', [`accessToken=${userTokenValid};refreshToken=${userTokenValid}`])
            .send({ username: "user1", amount: "500.678", type: "type0" });
        //console.log(JSON.stringify(response, null, 2));

        expect(response.status).toEqual(401);
        expect(response.body).toEqual({ error: expect.any(String) })

    });

    test('Returns a 400 error if the amount passed in the request body cannot be parsed as a floating value (negative numbers are accepted)', async () => {

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

        await categories.insertMany(
            [
                { type: "type0", color: "color0" },
                { type: "type1", color: "color1" },
                { type: "type2", color: "color2" },
                { type: "type3", color: "color3" },
                { type: "type4", color: "color4" },
            ]
        )

        await transactions.insertMany(
            [
                { username: "user1", type: "type0", amount: 100, date: Date.now() },
                { username: "user1", type: "type1", amount: 200, date: Date.now() },
                { username: "user1", type: "type2", amount: 300, date: Date.now() },
                { username: "user1", type: "type3", amount: 400, date: Date.now() },
                { username: "user1", type: "type4", amount: 500, date: Date.now() },
            ]
        )

        const response = await request(app)
            .post("/api/users/user1/transactions")
            .set('Cookie', [`accessToken=${userTokenValid};refreshToken=${userTokenValid}`])
            .send({ username: "user1", amount: "-a500.678", type: "type0" });
        //console.log(JSON.stringify(response, null, 2));

        expect(response.status).toEqual(400);
        expect(response.body).toEqual({ error: expect.any(String) });

    });

    test('Returns a 400 error if the username passed as a route parameter does not represent a user in the database', async () => {

        await User.insertMany(
            [
                { username: "user0", email: "user0@ezwallet.com", password: "password0", role: "Regular" },
                //{ username: "user1", email: "user1@ezwallet.com", password: "password1", role: "Regular", refreshToken: userTokenValid },
                { username: "user2", email: "user2@ezwallet.com", password: "password2", role: "Regular" },
                { username: "user3", email: "user3@ezwallet.com", password: "password3", role: "Regular" },
                { username: "user4", email: "user4@ezwallet.com", password: "password4", role: "Regular" },
                { username: "admin1", email: "admin1@ezwallet.com", password: "password1", role: "Admin", refreshToken: adminTokenValid },
                { username: "admin2", email: "admin2@ezwallet.com", password: "password2", role: "Admin" },
            ]
        );

        await categories.insertMany(
            [
                { type: "type0", color: "color0" },
                { type: "type1", color: "color1" },
                { type: "type2", color: "color2" },
                { type: "type3", color: "color3" },
                { type: "type4", color: "color4" },
            ]
        )

        await transactions.insertMany(
            [
                { username: "user1", type: "type0", amount: 100, date: Date.now() },
                { username: "user1", type: "type1", amount: 200, date: Date.now() },
                { username: "user1", type: "type2", amount: 300, date: Date.now() },
                { username: "user1", type: "type3", amount: 400, date: Date.now() },
                { username: "user1", type: "type4", amount: 500, date: Date.now() },
            ]
        )

        const response = await request(app)
            .post("/api/users/user1/transactions")
            .set('Cookie', [`accessToken=${userTokenValid};refreshToken=${userTokenValid}`])
            .send({ username: "user1", amount: "500.678", type: "type0" });
        //console.log(JSON.stringify(response, null, 2));

        expect(response.status).toEqual(400);
        expect(response.body).toEqual({ error: expect.any(String) });

    });

    test('Returns a 400 error if the username passed in the request body does not represent a user in the database', async () => {

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

        await categories.insertMany(
            [
                { type: "type0", color: "color0" },
                { type: "type1", color: "color1" },
                { type: "type2", color: "color2" },
                { type: "type3", color: "color3" },
                { type: "type4", color: "color4" },
            ]
        )

        await transactions.insertMany(
            [
                { username: "user1", type: "type0", amount: 100, date: Date.now() },
                { username: "user1", type: "type1", amount: 200, date: Date.now() },
                { username: "user1", type: "type2", amount: 300, date: Date.now() },
                { username: "user1", type: "type3", amount: 400, date: Date.now() },
                { username: "user1", type: "type4", amount: 500, date: Date.now() },
            ]
        )

        const response = await request(app)
            .post("/api/users/user1/transactions")
            .set('Cookie', [`accessToken=${userTokenValid};refreshToken=${userTokenValid}`])
            .send({ username: "user5", amount: "500.678", type: "type0" });
        //console.log(JSON.stringify(response, null, 2));

        expect(response.status).toEqual(400);
        expect(response.body).toEqual({ error: expect.any(String) });

    });

    test('Returns a 400 error if the username passed in the request body is not equal to the one passed as a route parameter', async () => {

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

        await categories.insertMany(
            [
                { type: "type0", color: "color0" },
                { type: "type1", color: "color1" },
                { type: "type2", color: "color2" },
                { type: "type3", color: "color3" },
                { type: "type4", color: "color4" },
            ]
        )

        await transactions.insertMany(
            [
                { username: "user1", type: "type0", amount: 100, date: Date.now() },
                { username: "user1", type: "type1", amount: 200, date: Date.now() },
                { username: "user1", type: "type2", amount: 300, date: Date.now() },
                { username: "user1", type: "type3", amount: 400, date: Date.now() },
                { username: "user1", type: "type4", amount: 500, date: Date.now() },
            ]
        )

        const response = await request(app)
            .post("/api/users/user1/transactions")
            .set('Cookie', [`accessToken=${userTokenValid};refreshToken=${userTokenValid}`])
            .send({ username: "user2", amount: "500.678", type: "type0" });
        //console.log(JSON.stringify(response, null, 2));

        expect(response.status).toEqual(400);
        expect(response.body).toEqual({ error: expect.any(String) });

    });

    test('Returns a 400 error if the type of category passed in the request body does not represent a category in the database', async () => {

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

        await categories.insertMany(
            [
                { type: "type0", color: "color0" },
                { type: "type1", color: "color1" },
                { type: "type2", color: "color2" },
                { type: "type3", color: "color3" },
                { type: "type4", color: "color4" },
            ]
        )

        await transactions.insertMany(
            [
                { username: "user1", type: "type0", amount: 100, date: Date.now() },
                { username: "user1", type: "type1", amount: 200, date: Date.now() },
                { username: "user1", type: "type2", amount: 300, date: Date.now() },
                { username: "user1", type: "type3", amount: 400, date: Date.now() },
                { username: "user1", type: "type4", amount: 500, date: Date.now() },
            ]
        )

        const response = await request(app)
            .post("/api/users/user1/transactions")
            .set('Cookie', [`accessToken=${userTokenValid};refreshToken=${userTokenValid}`])
            .send({ username: "user1", amount: "500.678", type: "type5" });
        //console.log(JSON.stringify(response, null, 2));

        expect(response.status).toEqual(400);
        expect(response.body).toEqual({ error: expect.any(String) });

    });

    test('Returns a 400 error if at least one of the parameters in the request body is an empty string', async () => {

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

        await categories.insertMany(
            [
                { type: "type0", color: "color0" },
                { type: "type1", color: "color1" },
                { type: "type2", color: "color2" },
                { type: "type3", color: "color3" },
                { type: "type4", color: "color4" },
            ]
        )

        await transactions.insertMany(
            [
                { username: "user1", type: "type0", amount: 100, date: Date.now() },
                { username: "user1", type: "type1", amount: 200, date: Date.now() },
                { username: "user1", type: "type2", amount: 300, date: Date.now() },
                { username: "user1", type: "type3", amount: 400, date: Date.now() },
                { username: "user1", type: "type4", amount: 500, date: Date.now() },
            ]
        )

        const response = await request(app)
            .post("/api/users/user1/transactions")
            .set('Cookie', [`accessToken=${userTokenValid};refreshToken=${userTokenValid}`])
            .send({ username: "user1", amount: "500.678", type: "" });
        //console.log(JSON.stringify(response, null, 2));

        expect(response.status).toEqual(400);
        expect(response.body).toEqual({ error: expect.any(String) });

    });

    test('Returns a 400 error if the request body does not contain all the necessary attributes', async () => {

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

        await categories.insertMany(
            [
                { type: "type0", color: "color0" },
                { type: "type1", color: "color1" },
                { type: "type2", color: "color2" },
                { type: "type3", color: "color3" },
                { type: "type4", color: "color4" },
            ]
        )

        await transactions.insertMany(
            [
                { username: "user1", type: "type0", amount: 100, date: Date.now() },
                { username: "user1", type: "type1", amount: 200, date: Date.now() },
                { username: "user1", type: "type2", amount: 300, date: Date.now() },
                { username: "user1", type: "type3", amount: 400, date: Date.now() },
                { username: "user1", type: "type4", amount: 500, date: Date.now() },
            ]
        )

        const response = await request(app)
            .post("/api/users/user1/transactions")
            .set('Cookie', [`accessToken=${userTokenValid};refreshToken=${userTokenValid}`])
            .send({ username: "user1", type: "type1" });
        //console.log(JSON.stringify(response, null, 2));

        expect(response.status).toEqual(400);
        expect(response.body).toEqual({ error: expect.any(String) });

    });
})

describe("getAllTransactions", () => {

    //router.get("/transactions", getAllTransactions)

    test("should retreive all user's transactions", async () => {

        await categories.insertMany(
            [
                { type: "type0", color: "color0" },
                { type: "type1", color: "color1" },
                { type: "type2", color: "color2" },
                { type: "type3", color: "color3" },
                { type: "type4", color: "color4" },
            ]
        )

        await transactions.insertMany(
            [
                { username: "user1", type: "type0", amount: 100, date: Date.now() },
                { username: "user2", type: "type1", amount: 200, date: Date.now() },
                { username: "user3", type: "type2", amount: 300, date: Date.now() },
                { username: "user4", type: "type3", amount: 400, date: Date.now() },
                { username: "user5", type: "type4", amount: 500, date: Date.now() },
            ]
        )

        const response = await request(app)
            .get("/api/transactions")
            .set('Cookie', [`accessToken=${adminTokenValid};refreshToken=${adminTokenValid}`]);
        //console.log(JSON.stringify(response, null, 2));

        expect(response.status).toEqual(200);
        expect(response.body.data).toEqual(
            [
                { username: "user1", type: "type0", amount: 100, date: expect.any(String), color: "color0" },//?
                { username: "user2", type: "type1", amount: 200, date: expect.any(String), color: "color1" },//?
                { username: "user3", type: "type2", amount: 300, date: expect.any(String), color: "color2" },//?
                { username: "user4", type: "type3", amount: 400, date: expect.any(String), color: "color3" },//?
                { username: "user5", type: "type4", amount: 500, date: expect.any(String), color: "color4" },//?
            ]
        )
    })

    test("Returns a 401 error if called by an authenticated user who is not an admin (authType = Admin)", async () => {

        await categories.insertMany(
            [
                { type: "type0", color: "color0" },
                { type: "type1", color: "color1" },
                { type: "type2", color: "color2" },
                { type: "type3", color: "color3" },
                { type: "type4", color: "color4" },
            ]
        )

        await transactions.insertMany(
            [
                { username: "user1", type: "type0", amount: 100, date: Date.now() },
                { username: "user2", type: "type1", amount: 200, date: Date.now() },
                { username: "user3", type: "type2", amount: 300, date: Date.now() },
                { username: "user4", type: "type3", amount: 400, date: Date.now() },
                { username: "user5", type: "type4", amount: 500, date: Date.now() },
            ]
        )

        const response = await request(app)
            .get("/api/transactions")
            .set('Cookie', [`accessToken=${userTokenValid};refreshToken=${userTokenValid}`]);
        //console.log(JSON.stringify(response, null, 2));

        expect(response.status).toEqual(401);
        expect(response.body).toEqual({ error: expect.any(String) })
    })

});

describe("getTransactionsByUser", () => {

    test("should retreive the user's transactions(admin route)", async () => {

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

        await categories.insertMany(
            [
                { type: "type0", color: "color0" },
                { type: "type1", color: "color1" },
                { type: "type2", color: "color2" },
                { type: "type3", color: "color3" },
                { type: "type4", color: "color4" },
            ]
        )

        await transactions.insertMany(
            [
                { username: "user1", type: "type0", amount: 100, date: Date.now() },
                { username: "user2", type: "type1", amount: 200, date: Date.now() },
                { username: "user1", type: "type2", amount: 300, date: Date.now() },
                { username: "user4", type: "type3", amount: 400, date: Date.now() },
                { username: "user1", type: "type4", amount: 500, date: Date.now() },
            ]
        )

        const response = await request(app)
            .get("/api/transactions/users/user1")
            .set('Cookie', [`accessToken=${adminTokenValid};refreshToken=${adminTokenValid}`]);
        //console.log(JSON.stringify(response, null, 2));

        expect(response.status).toEqual(200);
        expect(response.body.data).toEqual(
            [
                { username: "user1", type: "type0", amount: 100, date: expect.any(String), color: "color0" },//?
                { username: "user1", type: "type2", amount: 300, date: expect.any(String), color: "color2" },//?
                { username: "user1", type: "type4", amount: 500, date: expect.any(String), color: "color4" },//?
            ]
        )
    })
    test("Returns a 401 error if called by an authenticated user who is not an admin (authType = Admin) if the route is /api/transactions/users/:username", async () => {

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

        await categories.insertMany(
            [
                { type: "type0", color: "color0" },
                { type: "type1", color: "color1" },
                { type: "type2", color: "color2" },
                { type: "type3", color: "color3" },
                { type: "type4", color: "color4" },
            ]
        )

        await transactions.insertMany(
            [
                { username: "user1", type: "type0", amount: 100, date: Date.now() },
                { username: "user2", type: "type1", amount: 200, date: Date.now() },
                { username: "user1", type: "type2", amount: 300, date: Date.now() },
                { username: "user4", type: "type3", amount: 400, date: Date.now() },
                { username: "user1", type: "type4", amount: 500, date: Date.now() },
            ]
        )

        const response = await request(app)
            .get("/api/transactions/users/user1")
            .set('Cookie', [`accessToken=${userTokenValid};refreshToken=${userTokenValid}`]);
        //console.log(JSON.stringify(response, null, 2));

        expect(response.status).toEqual(401);
        expect(response.body).toEqual({ error: expect.any(String) });
    })

    test("should retreive the user's transactions(user route) with from and upto", async () => {

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

        await categories.insertMany(
            [
                { type: "type0", color: "color0" },
                { type: "type1", color: "color1" },
                { type: "type2", color: "color2" },
                { type: "type3", color: "color3" },
                { type: "type4", color: "color4" },
            ]
        )

        await transactions.insertMany(
            [
                { username: "user1", type: "type0", amount: 100, date: new Date("2023-04-01") },
                { username: "user2", type: "type1", amount: 200, date: new Date("2023-04-02") },
                { username: "user1", type: "type2", amount: 300, date: new Date("2023-04-03") },
                { username: "user4", type: "type3", amount: 400, date: new Date("2023-04-04") },
                { username: "user1", type: "type4", amount: 500, date: new Date("2023-04-05") },
            ]
        )

        const response = await request(app)
            .get("/api/users/user1/transactions/?from=2023-04-02&upTo=2023-04-05")
            .set('Cookie', [`accessToken=${userTokenValid};refreshToken=${userTokenValid}`]);
        //console.log(JSON.stringify(response, null, 2));

        expect(response.status).toEqual(200);
        expect(response.body.data).toEqual(
            [
                { username: "user1", type: "type2", amount: 300, date: expect.any(String), color: "color2" },//?
                { username: "user1", type: "type4", amount: 500, date: expect.any(String), color: "color4" },//?
            ]
        )
    })

    test("Returns a 401 error if called by an authenticated user who is not the same user as the one in the route (authType = User) if the route is /api/users/:username/transactions", async () => {

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

        await categories.insertMany(
            [
                { type: "type0", color: "color0" },
                { type: "type1", color: "color1" },
                { type: "type2", color: "color2" },
                { type: "type3", color: "color3" },
                { type: "type4", color: "color4" },
            ]
        )

        await transactions.insertMany(
            [
                { username: "user1", type: "type0", amount: 100, date: new Date("2023-04-01") },
                { username: "user2", type: "type1", amount: 200, date: new Date("2023-04-02") },
                { username: "user1", type: "type2", amount: 300, date: new Date("2023-04-03") },
                { username: "user4", type: "type3", amount: 400, date: new Date("2023-04-04") },
                { username: "user1", type: "type4", amount: 500, date: new Date("2023-04-05") },
            ]
        )

        const response = await request(app)
            .get("/api/users/user2/transactions/?from=2023-04-02&upTo=2023-04-05")
            .set('Cookie', [`accessToken=${userTokenValid};refreshToken=${userTokenValid}`]);
        //console.log(JSON.stringify(response, null, 2));

        expect(response.status).toEqual(401);
        expect(response.body).toEqual({ error: expect.any(String) })
    })

    test("Returns a 401 error if called by an authenticated user who is not the same user as the one in the route (authType = User) if the route is /api/users/:username/transactions", async () => {

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

        await categories.insertMany(
            [
                { type: "type0", color: "color0" },
                { type: "type1", color: "color1" },
                { type: "type2", color: "color2" },
                { type: "type3", color: "color3" },
                { type: "type4", color: "color4" },
            ]
        )

        await transactions.insertMany(
            [
                { username: "user1", type: "type0", amount: 100, date: Date.now() },
                { username: "user2", type: "type1", amount: 200, date: Date.now() },
                { username: "user1", type: "type2", amount: 300, date: Date.now() },
                { username: "user4", type: "type3", amount: 400, date: Date.now() },
                { username: "user1", type: "type4", amount: 500, date: Date.now() },
            ]
        )

        const response = await request(app)
            .get("/api/transactions/users/user5")
            .set('Cookie', [`accessToken=${adminTokenValid};refreshToken=${adminTokenValid}`]);
        //console.log(JSON.stringify(response, null, 2));

        expect(response.status).toEqual(400);
        expect(response.body).toEqual({ error: expect.any(String) })
    })


})



describe("getTransactionsByUserByCategory", () => {
    test("should retreive the user's transactions belonging to a category(user route)", async () => {

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

        await categories.insertMany(
            [
                { type: "type0", color: "color0" },
                { type: "type1", color: "color1" },
                { type: "type2", color: "color2" },
                { type: "type3", color: "color3" },
                { type: "type4", color: "color4" },
            ]
        )

        await transactions.insertMany(
            [
                { username: "user1", type: "type0", amount: 100, date: Date.now() },
                { username: "user2", type: "type1", amount: 200, date: Date.now() },
                { username: "user1", type: "type2", amount: 300, date: Date.now() },
                { username: "user4", type: "type3", amount: 400, date: Date.now() },
                { username: "user1", type: "type4", amount: 500, date: Date.now() },
                { username: "user1", type: "type2", amount: 200, date: Date.now() },
            ]
        )

        const response = await request(app)
            .get("/api/users/user1/transactions/category/type2")
            .set('Cookie', [`accessToken=${userTokenValid};refreshToken=${userTokenValid}`]);
        //console.log(JSON.stringify(response, null, 2));

        expect(response.status).toEqual(200);
        expect(response.body.data).toEqual(
            [
                { username: "user1", type: "type2", amount: 300, date: expect.any(String), color: "color2" },//?
                { username: "user1", type: "type2", amount: 200, date: expect.any(String), color: "color2" },//?
            ]
        )
    })

    test("Returns a 401 error if called by an authenticated user who is not an admin (authType = Admin) if the route is /api/transactions/users/:username/category/:category", async () => {

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

        await categories.insertMany(
            [
                { type: "type0", color: "color0" },
                { type: "type1", color: "color1" },
                { type: "type2", color: "color2" },
                { type: "type3", color: "color3" },
                { type: "type4", color: "color4" },
            ]
        )

        await transactions.insertMany(
            [
                { username: "user1", type: "type0", amount: 100, date: Date.now() },
                { username: "user2", type: "type1", amount: 200, date: Date.now() },
                { username: "user1", type: "type2", amount: 300, date: Date.now() },
                { username: "user4", type: "type3", amount: 400, date: Date.now() },
                { username: "user1", type: "type4", amount: 500, date: Date.now() },
                { username: "user1", type: "type2", amount: 200, date: Date.now() },
            ]
        )

        const response = await request(app)
            .get("/api/transactions/users/user1/category/type2")
            .set('Cookie', [`accessToken=${userTokenValid};refreshToken=${userTokenValid}`]);
        console.log(JSON.stringify(response, null, 2));

        expect(response.status).toEqual(401);
        expect(response.body).toEqual({ error: expect.any(String) });
    })

    test("should retreive the user's transactions belonging to a category(admin route)", async () => {

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

        await categories.insertMany(
            [
                { type: "type0", color: "color0" },
                { type: "type1", color: "color1" },
                { type: "type2", color: "color2" },
                { type: "type3", color: "color3" },
                { type: "type4", color: "color4" },
            ]
        )

        await transactions.insertMany(
            [
                { username: "user1", type: "type0", amount: 100, date: Date.now() },
                { username: "user2", type: "type1", amount: 200, date: Date.now() },
                { username: "user1", type: "type2", amount: 300, date: Date.now() },
                { username: "user4", type: "type3", amount: 400, date: Date.now() },
                { username: "user1", type: "type4", amount: 500, date: Date.now() },
                { username: "user1", type: "type2", amount: 200, date: Date.now() },
            ]
        )

        const response = await request(app)
            .get("/api/transactions/users/user1/category/type2")
            .set('Cookie', [`accessToken=${adminTokenValid};refreshToken=${adminTokenValid}`]);
        //console.log(JSON.stringify(response, null, 2));

        expect(response.status).toEqual(200);
        expect(response.body.data).toEqual(
            [
                { username: "user1", type: "type2", amount: 300, date: expect.any(String), color: "color2" },//?
                { username: "user1", type: "type2", amount: 200, date: expect.any(String), color: "color2" },//?
            ]
        )
    })

    test("Returns a 401 error if called by an authenticated user who is not the same user as the one in the route (authType = User) if the route is /api/users/:username/transactions/category/:category", async () => {

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

        await categories.insertMany(
            [
                { type: "type0", color: "color0" },
                { type: "type1", color: "color1" },
                { type: "type2", color: "color2" },
                { type: "type3", color: "color3" },
                { type: "type4", color: "color4" },
            ]
        )

        await transactions.insertMany(
            [
                { username: "user1", type: "type0", amount: 100, date: Date.now() },
                { username: "user2", type: "type1", amount: 200, date: Date.now() },
                { username: "user1", type: "type2", amount: 300, date: Date.now() },
                { username: "user4", type: "type3", amount: 400, date: Date.now() },
                { username: "user1", type: "type4", amount: 500, date: Date.now() },
                { username: "user1", type: "type2", amount: 200, date: Date.now() },
            ]
        )

        const response = await request(app)
            .get("/api/users/user1/transactions/category/type2")
            .set('Cookie', [`accessToken=${adminTokenValid};refreshToken=${adminTokenValid}`]);
        console.log(JSON.stringify(response, null, 2));

        expect(response.status).toEqual(401);
        expect(response.body).toEqual({ error: expect.any(String) });
    })

    test("Returns a 400 error if the category passed as a route parameter does not represent a category in the database", async () => {

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

        await categories.insertMany(
            [
                { type: "type0", color: "color0" },
                { type: "type1", color: "color1" },
                { type: "type2", color: "color2" },
                { type: "type3", color: "color3" },
                { type: "type4", color: "color4" },
            ]
        )

        await transactions.insertMany(
            [
                { username: "user1", type: "type0", amount: 100, date: Date.now() },
                { username: "user2", type: "type1", amount: 200, date: Date.now() },
                { username: "user1", type: "type2", amount: 300, date: Date.now() },
                { username: "user4", type: "type3", amount: 400, date: Date.now() },
                { username: "user1", type: "type4", amount: 500, date: Date.now() },
                { username: "user1", type: "type2", amount: 200, date: Date.now() },
            ]
        )

        const response = await request(app)
            .get("/api/users/user1/transactions/category/type5")
            .set('Cookie', [`accessToken=${userTokenValid};refreshToken=${userTokenValid}`]);
        //console.log(JSON.stringify(response, null, 2));

        expect(response.status).toEqual(400);
        expect(response.body).toEqual({ error: expect.any(String) });

    })

    test("Returns a 400 error if the username passed as a route parameter does not represent a user in the database", async () => {

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

        await categories.insertMany(
            [
                { type: "type0", color: "color0" },
                { type: "type1", color: "color1" },
                { type: "type2", color: "color2" },
                { type: "type3", color: "color3" },
                { type: "type4", color: "color4" },
            ]
        )

        await transactions.insertMany(
            [
                { username: "user1", type: "type0", amount: 100, date: Date.now() },
                { username: "user2", type: "type1", amount: 200, date: Date.now() },
                { username: "user1", type: "type2", amount: 300, date: Date.now() },
                { username: "user4", type: "type3", amount: 400, date: Date.now() },
                { username: "user1", type: "type4", amount: 500, date: Date.now() },
                { username: "user1", type: "type2", amount: 200, date: Date.now() },
            ]
        )

        const response = await request(app)
            .get("/api/transactions/users/user5/category/type1")
            .set('Cookie', [`accessToken=${adminTokenValid};refreshToken=${adminTokenValid}`]);
        //console.log(JSON.stringify(response, null, 2));

        expect(response.status).toEqual(400);
        expect(response.body).toEqual({ error: expect.any(String) });

    })

})




describe("getTransactionsByGroup", () => {

    //router.get("/groups/:name/transactions", getTransactionsByGroup) user
    //router.get("/transactions/groups/:name", getTransactionsByGroup) admin


    test("should retreive the all group members transactions (user route)", async () => {

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
                        await User.findOne({ username: "user2" }).then(u => { return { email: u.email, user: u.id } }),
                    ]
                },
                {
                    name: "group2",
                    members: [
                        await User.findOne({ username: "user1" }).then(u => { return { email: u.email, user: u.id } }),
                        await User.findOne({ username: "user3" }).then(u => { return { email: u.email, user: u.id } }),
                    ]
                },
            ]
        );

        await categories.insertMany(
            [
                { type: "type0", color: "color0" },
                { type: "type1", color: "color1" },
                { type: "type2", color: "color2" },
                { type: "type3", color: "color3" },
                { type: "type4", color: "color4" },
            ]
        )

        await transactions.insertMany(
            [
                { username: "user1", type: "type0", amount: 100, date: Date.now() },
                { username: "user2", type: "type1", amount: 200, date: Date.now() },
                { username: "user3", type: "type2", amount: 300, date: Date.now() },
                { username: "user2", type: "type3", amount: 400, date: Date.now() },
                { username: "user1", type: "type4", amount: 500, date: Date.now() },
                { username: "user4", type: "type2", amount: 200, date: Date.now() },
            ]
        )

        const response = await request(app)
            .get("/api/groups/group2/transactions")
            .set('Cookie', [`accessToken=${userTokenValid};refreshToken=${userTokenValid}`]);
        //console.log(JSON.stringify(response, null, 2));

        expect(response.status).toEqual(200);
        expect(response.body.data).toEqual(
            [
                { username: "user1", type: "type0", amount: 100, date: expect.any(String), color: "color0" },//?
                { username: "user3", type: "type2", amount: 300, date: expect.any(String), color: "color2" },//?
                { username: "user1", type: "type4", amount: 500, date: expect.any(String), color: "color4" },//?
            ]
        )
    })

    test("Returns a 401 error if called by an authenticated user who is not part of the group (authType = Group) if the route is /api/groups/:name/transactions", async () => {

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
                        await User.findOne({ username: "user2" }).then(u => { return { email: u.email, user: u.id } }),
                    ]
                },
                {
                    name: "group2",
                    members: [
                        await User.findOne({ username: "user1" }).then(u => { return { email: u.email, user: u.id } }),
                        await User.findOne({ username: "user3" }).then(u => { return { email: u.email, user: u.id } }),
                    ]
                },
            ]
        );

        await categories.insertMany(
            [
                { type: "type0", color: "color0" },
                { type: "type1", color: "color1" },
                { type: "type2", color: "color2" },
                { type: "type3", color: "color3" },
                { type: "type4", color: "color4" },
            ]
        )

        await transactions.insertMany(
            [
                { username: "user1", type: "type0", amount: 100, date: Date.now() },
                { username: "user2", type: "type1", amount: 200, date: Date.now() },
                { username: "user3", type: "type2", amount: 300, date: Date.now() },
                { username: "user2", type: "type3", amount: 400, date: Date.now() },
                { username: "user1", type: "type4", amount: 500, date: Date.now() },
                { username: "user4", type: "type2", amount: 200, date: Date.now() },
            ]
        )

        const response = await request(app)
            .get("/api/groups/group2/transactions")
            .set('Cookie', [`accessToken=${adminTokenValid};refreshToken=${adminTokenValid}`]);
        console.log(JSON.stringify(response, null, 2));

        expect(response.status).toEqual(401);
        expect(response.body).toEqual({ error: expect.any(String) });
    })


    test("should retreive the all group members transactions (admin route)", async () => {

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
                        await User.findOne({ username: "user2" }).then(u => { return { email: u.email, user: u.id } }),
                    ]
                },
                {
                    name: "group2",
                    members: [
                        await User.findOne({ username: "user1" }).then(u => { return { email: u.email, user: u.id } }),
                        await User.findOne({ username: "user3" }).then(u => { return { email: u.email, user: u.id } }),
                    ]
                },
            ]
        );

        await categories.insertMany(
            [
                { type: "type0", color: "color0" },
                { type: "type1", color: "color1" },
                { type: "type2", color: "color2" },
                { type: "type3", color: "color3" },
                { type: "type4", color: "color4" },
            ]
        )

        await transactions.insertMany(
            [
                { username: "user1", type: "type0", amount: 100, date: Date.now() },
                { username: "user2", type: "type1", amount: 200, date: Date.now() },
                { username: "user3", type: "type2", amount: 300, date: Date.now() },
                { username: "user2", type: "type3", amount: 400, date: Date.now() },
                { username: "user1", type: "type4", amount: 500, date: Date.now() },
                { username: "user4", type: "type2", amount: 200, date: Date.now() },
            ]
        )

        const response = await request(app)
            .get("/api/transactions/groups/group2")
            .set('Cookie', [`accessToken=${adminTokenValid};refreshToken=${adminTokenValid}`]);
        console.log(JSON.stringify(response, null, 2));

        expect(response.status).toEqual(200);
        expect(response.body.data).toEqual(
            [
                { username: "user1", type: "type0", amount: 100, date: expect.any(String), color: "color0" },//?
                { username: "user3", type: "type2", amount: 300, date: expect.any(String), color: "color2" },//?
                { username: "user1", type: "type4", amount: 500, date: expect.any(String), color: "color4" },//?
            ]
        )
    })

    test("Returns a 401 error if called by an authenticated user who is not an admin (authType = Admin) if the route is /api/transactions/groups/:name", async () => {

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
                        await User.findOne({ username: "user2" }).then(u => { return { email: u.email, user: u.id } }),
                    ]
                },
                {
                    name: "group2",
                    members: [
                        await User.findOne({ username: "user1" }).then(u => { return { email: u.email, user: u.id } }),
                        await User.findOne({ username: "user3" }).then(u => { return { email: u.email, user: u.id } }),
                    ]
                },
            ]
        );

        await categories.insertMany(
            [
                { type: "type0", color: "color0" },
                { type: "type1", color: "color1" },
                { type: "type2", color: "color2" },
                { type: "type3", color: "color3" },
                { type: "type4", color: "color4" },
            ]
        )

        await transactions.insertMany(
            [
                { username: "user1", type: "type0", amount: 100, date: Date.now() },
                { username: "user2", type: "type1", amount: 200, date: Date.now() },
                { username: "user3", type: "type2", amount: 300, date: Date.now() },
                { username: "user2", type: "type3", amount: 400, date: Date.now() },
                { username: "user1", type: "type4", amount: 500, date: Date.now() },
                { username: "user4", type: "type2", amount: 200, date: Date.now() },
            ]
        )

        const response = await request(app)
            .get("/api/transactions/groups/group2")
            .set('Cookie', [`accessToken=${userTokenValid};refreshToken=${userTokenValid}`]);
        console.log(JSON.stringify(response, null, 2));

        expect(response.status).toEqual(401);
        expect(response.body).toEqual({ error: expect.any(String) });
    })

    test("Returns a 400 error if the group name passed as a route parameter does not represent a group in the database     (admin route, auth first)   ", async () => {

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
                        await User.findOne({ username: "user2" }).then(u => { return { email: u.email, user: u.id } }),
                    ]
                },
                {
                    name: "group2",
                    members: [
                        await User.findOne({ username: "user1" }).then(u => { return { email: u.email, user: u.id } }),
                        await User.findOne({ username: "user3" }).then(u => { return { email: u.email, user: u.id } }),
                    ]
                },
            ]
        );

        await categories.insertMany(
            [
                { type: "type0", color: "color0" },
                { type: "type1", color: "color1" },
                { type: "type2", color: "color2" },
                { type: "type3", color: "color3" },
                { type: "type4", color: "color4" },
            ]
        )

        await transactions.insertMany(
            [
                { username: "user1", type: "type0", amount: 100, date: Date.now() },
                { username: "user2", type: "type1", amount: 200, date: Date.now() },
                { username: "user3", type: "type2", amount: 300, date: Date.now() },
                { username: "user2", type: "type3", amount: 400, date: Date.now() },
                { username: "user1", type: "type4", amount: 500, date: Date.now() },
                { username: "user4", type: "type2", amount: 200, date: Date.now() },
            ]
        )

        const response = await request(app)
            .get("/api/transactions/groups/group3")
            .set('Cookie', [`accessToken=${adminTokenValid};refreshToken=${adminTokenValid}`]);
        //console.log(JSON.stringify(response, null, 2));

        expect(response.status).toEqual(400);
        expect(response.body).toEqual({ error: "group does not exist" })
    })

    test("Returns a 400 error if the group name passed as a route parameter does not represent a group in the database (user route, group check first) ", async () => {

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
                        await User.findOne({ username: "user2" }).then(u => { return { email: u.email, user: u.id } }),
                    ]
                },
                {
                    name: "group2",
                    members: [
                        await User.findOne({ username: "user1" }).then(u => { return { email: u.email, user: u.id } }),
                        await User.findOne({ username: "user3" }).then(u => { return { email: u.email, user: u.id } }),
                    ]
                },
            ]
        );

        await categories.insertMany(
            [
                { type: "type0", color: "color0" },
                { type: "type1", color: "color1" },
                { type: "type2", color: "color2" },
                { type: "type3", color: "color3" },
                { type: "type4", color: "color4" },
            ]
        )

        await transactions.insertMany(
            [
                { username: "user1", type: "type0", amount: 100, date: Date.now() },
                { username: "user2", type: "type1", amount: 200, date: Date.now() },
                { username: "user3", type: "type2", amount: 300, date: Date.now() },
                { username: "user2", type: "type3", amount: 400, date: Date.now() },
                { username: "user1", type: "type4", amount: 500, date: Date.now() },
                { username: "user4", type: "type2", amount: 200, date: Date.now() },
            ]
        )

        const response = await request(app)
            .get("/api/groups/group3/transactions")
            .set('Cookie', [`accessToken=${userTokenValid};refreshToken=${userTokenValid}`]);
        console.log(JSON.stringify(response, null, 2));

        expect(response.status).toEqual(400);
        expect(response.body).toEqual({ error: expect.any(String) })
    })

})




describe("getTransactionsByGroupByCategory", () => {

    //router.get("/groups/:name/transactions/category/:category", getTransactionsByGroupByCategory) user
    //router.get("/transactions/groups/:name/category/:category", getTransactionsByGroupByCategory) admin

    test("should retreive all group members transactions belonging to a category(user route)", async () => {

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
                        await User.findOne({ username: "user2" }).then(u => { return { email: u.email, user: u.id } }),
                    ]
                },
                {
                    name: "group2",
                    members: [
                        await User.findOne({ username: "user1" }).then(u => { return { email: u.email, user: u.id } }),
                        await User.findOne({ username: "user3" }).then(u => { return { email: u.email, user: u.id } }),
                    ]
                },
            ]
        );

        await categories.insertMany(
            [
                { type: "type0", color: "color0" },
                { type: "type1", color: "color1" },
                { type: "type2", color: "color2" },
                { type: "type3", color: "color3" },
                { type: "type4", color: "color4" },
            ]
        )

        await transactions.insertMany(
            [
                { username: "user1", type: "type0", amount: 100, date: Date.now() },
                { username: "user2", type: "type1", amount: 100, date: Date.now() },
                { username: "user3", type: "type2", amount: 200, date: Date.now() },
                { username: "user2", type: "type3", amount: 300, date: Date.now() },
                { username: "user1", type: "type4", amount: 400, date: Date.now() },
                { username: "user4", type: "type2", amount: 200, date: Date.now() },
                { username: "user3", type: "type4", amount: 400, date: Date.now() },
            ]
        )

        const response = await request(app)
            .get("/api/groups/group2/transactions/category/type4")
            .set('Cookie', [`accessToken=${userTokenValid};refreshToken=${userTokenValid}`]);
        ////console.log(JSON.stringify(response, null, 2));

        expect(response.status).toEqual(200);
        expect(response.body.data).toEqual(
            [
                { username: "user1", type: "type4", amount: 400, date: expect.any(String), color: "color4" },//?
                { username: "user3", type: "type4", amount: 400, date: expect.any(String), color: "color4" },//?
            ]
        )
    })

    test("Returns a 401 error if called by an authenticated user who is not part of the group (authType = Group) if the route is /api/groups/:name/transactions/category/:category", async () => {

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
                        await User.findOne({ username: "user2" }).then(u => { return { email: u.email, user: u.id } }),
                    ]
                },
                {
                    name: "group2",
                    members: [
                        await User.findOne({ username: "user1" }).then(u => { return { email: u.email, user: u.id } }),
                        await User.findOne({ username: "user3" }).then(u => { return { email: u.email, user: u.id } }),
                    ]
                },
            ]
        );

        await categories.insertMany(
            [
                { type: "type0", color: "color0" },
                { type: "type1", color: "color1" },
                { type: "type2", color: "color2" },
                { type: "type3", color: "color3" },
                { type: "type4", color: "color4" },
            ]
        )

        await transactions.insertMany(
            [
                { username: "user1", type: "type0", amount: 100, date: Date.now() },
                { username: "user2", type: "type1", amount: 100, date: Date.now() },
                { username: "user3", type: "type2", amount: 200, date: Date.now() },
                { username: "user2", type: "type3", amount: 300, date: Date.now() },
                { username: "user1", type: "type4", amount: 400, date: Date.now() },
                { username: "user4", type: "type2", amount: 200, date: Date.now() },
                { username: "user3", type: "type4", amount: 400, date: Date.now() },
            ]
        )

        const response = await request(app)
            .get("/api/groups/group2/transactions/category/type4")
            .set('Cookie', [`accessToken=${adminTokenValid};refreshToken=${adminTokenValid}`]);
        console.log(JSON.stringify(response, null, 2));

        expect(response.status).toEqual(401);
        expect(response.body).toEqual({ error: expect.any(String) })
    })

    test("should retreive all group members transactions belonging to a category(admin route)", async () => {

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
                        await User.findOne({ username: "user2" }).then(u => { return { email: u.email, user: u.id } }),
                    ]
                },
                {
                    name: "group2",
                    members: [
                        await User.findOne({ username: "user1" }).then(u => { return { email: u.email, user: u.id } }),
                        await User.findOne({ username: "user3" }).then(u => { return { email: u.email, user: u.id } }),
                    ]
                },
            ]
        );

        await categories.insertMany(
            [
                { type: "type0", color: "color0" },
                { type: "type1", color: "color1" },
                { type: "type2", color: "color2" },
                { type: "type3", color: "color3" },
                { type: "type4", color: "color4" },
            ]
        )

        await transactions.insertMany(
            [
                { username: "user1", type: "type0", amount: 100, date: Date.now() },
                { username: "user2", type: "type1", amount: 100, date: Date.now() },
                { username: "user3", type: "type2", amount: 200, date: Date.now() },
                { username: "user2", type: "type3", amount: 300, date: Date.now() },
                { username: "user1", type: "type4", amount: 400, date: Date.now() },
                { username: "user4", type: "type2", amount: 200, date: Date.now() },
                { username: "user3", type: "type4", amount: 400, date: Date.now() },
            ]
        )

        const response = await request(app)
            .get("/api/transactions/groups/group2/category/type4")
            .set('Cookie', [`accessToken=${adminTokenValid};refreshToken=${adminTokenValid}`]);
        ////console.log(JSON.stringify(response, null, 2));

        expect(response.status).toEqual(200);
        expect(response.body.data).toEqual(
            [
                { username: "user1", type: "type4", amount: 400, date: expect.any(String), color: "color4" },//?
                { username: "user3", type: "type4", amount: 400, date: expect.any(String), color: "color4" },//?
            ]
        )
    })


    test("Returns a 401 error if called by an authenticated user who is not an admin (authType = Admin) if the route is /api/transactions/groups/:name/category/:category", async () => {

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
                        await User.findOne({ username: "user2" }).then(u => { return { email: u.email, user: u.id } }),
                    ]
                },
                {
                    name: "group2",
                    members: [
                        await User.findOne({ username: "user1" }).then(u => { return { email: u.email, user: u.id } }),
                        await User.findOne({ username: "user3" }).then(u => { return { email: u.email, user: u.id } }),
                    ]
                },
            ]
        );

        await categories.insertMany(
            [
                { type: "type0", color: "color0" },
                { type: "type1", color: "color1" },
                { type: "type2", color: "color2" },
                { type: "type3", color: "color3" },
                { type: "type4", color: "color4" },
            ]
        )

        await transactions.insertMany(
            [
                { username: "user1", type: "type0", amount: 100, date: Date.now() },
                { username: "user2", type: "type1", amount: 100, date: Date.now() },
                { username: "user3", type: "type2", amount: 200, date: Date.now() },
                { username: "user2", type: "type3", amount: 300, date: Date.now() },
                { username: "user1", type: "type4", amount: 400, date: Date.now() },
                { username: "user4", type: "type2", amount: 200, date: Date.now() },
                { username: "user3", type: "type4", amount: 400, date: Date.now() },
            ]
        )

        const response = await request(app)
            .get("/api/transactions/groups/group2/category/type4")
            .set('Cookie', [`accessToken=${userTokenValid};refreshToken=${userTokenValid}`]);
        ////console.log(JSON.stringify(response, null, 2));

        expect(response.status).toEqual(401);
        expect(response.body).toEqual({ error: expect.any(String) })
    })


    test("Returns a 400 error if the group name passed as a route parameter does not represent a group in the database(user route, group check first)", async () => {

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
                        await User.findOne({ username: "user2" }).then(u => { return { email: u.email, user: u.id } }),
                    ]
                },
                {
                    name: "group2",
                    members: [
                        await User.findOne({ username: "user1" }).then(u => { return { email: u.email, user: u.id } }),
                        await User.findOne({ username: "user3" }).then(u => { return { email: u.email, user: u.id } }),
                    ]
                },
            ]
        );

        await categories.insertMany(
            [
                { type: "type0", color: "color0" },
                { type: "type1", color: "color1" },
                { type: "type2", color: "color2" },
                { type: "type3", color: "color3" },
                { type: "type4", color: "color4" },
            ]
        )

        await transactions.insertMany(
            [
                { username: "user1", type: "type0", amount: 100, date: Date.now() },
                { username: "user2", type: "type1", amount: 100, date: Date.now() },
                { username: "user3", type: "type2", amount: 200, date: Date.now() },
                { username: "user2", type: "type3", amount: 300, date: Date.now() },
                { username: "user1", type: "type4", amount: 400, date: Date.now() },
                { username: "user4", type: "type2", amount: 200, date: Date.now() },
                { username: "user3", type: "type4", amount: 400, date: Date.now() },
            ]
        )

        const response = await request(app)
            .get("/api/groups/group3/transactions/category/type4")
            .set('Cookie', [`accessToken=${adminTokenValid};refreshToken=${adminTokenValid}`]);
        console.log(JSON.stringify(response, null, 2));

        expect(response.status).toEqual(400);
        expect(response.body).toEqual({ error: expect.any(String) })
    })

    test("Returns a 400 error if the group name passed as a route parameter does not represent a group in the database(admin route)", async () => {

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
                        await User.findOne({ username: "user2" }).then(u => { return { email: u.email, user: u.id } }),
                    ]
                },
                {
                    name: "group2",
                    members: [
                        await User.findOne({ username: "user1" }).then(u => { return { email: u.email, user: u.id } }),
                        await User.findOne({ username: "user3" }).then(u => { return { email: u.email, user: u.id } }),
                    ]
                },
            ]
        );

        await categories.insertMany(
            [
                { type: "type0", color: "color0" },
                { type: "type1", color: "color1" },
                { type: "type2", color: "color2" },
                { type: "type3", color: "color3" },
                { type: "type4", color: "color4" },
            ]
        )

        await transactions.insertMany(
            [
                { username: "user1", type: "type0", amount: 100, date: Date.now() },
                { username: "user2", type: "type1", amount: 100, date: Date.now() },
                { username: "user3", type: "type2", amount: 200, date: Date.now() },
                { username: "user2", type: "type3", amount: 300, date: Date.now() },
                { username: "user1", type: "type4", amount: 400, date: Date.now() },
                { username: "user4", type: "type2", amount: 200, date: Date.now() },
                { username: "user3", type: "type4", amount: 400, date: Date.now() },
            ]
        )

        const response = await request(app)
            .get("/api/transactions/groups/group3/category/type4")
            .set('Cookie', [`accessToken=${adminTokenValid};refreshToken=${adminTokenValid}`]);
        console.log(JSON.stringify(response, null, 2));

        expect(response.status).toEqual(400);
        expect(response.body).toEqual({ error: expect.any(String) })
    })

    test("Returns a 400 error if the category passed as a route parameter does not represent a category in the database", async () => {

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
                        await User.findOne({ username: "user2" }).then(u => { return { email: u.email, user: u.id } }),
                    ]
                },
                {
                    name: "group2",
                    members: [
                        await User.findOne({ username: "user1" }).then(u => { return { email: u.email, user: u.id } }),
                        await User.findOne({ username: "user3" }).then(u => { return { email: u.email, user: u.id } }),
                    ]
                },
            ]
        );

        await categories.insertMany(
            [
                { type: "type0", color: "color0" },
                { type: "type1", color: "color1" },
                { type: "type2", color: "color2" },
                { type: "type3", color: "color3" },
                { type: "type4", color: "color4" },
            ]
        )

        await transactions.insertMany(
            [
                { username: "user1", type: "type0", amount: 100, date: Date.now() },
                { username: "user2", type: "type1", amount: 100, date: Date.now() },
                { username: "user3", type: "type2", amount: 200, date: Date.now() },
                { username: "user2", type: "type3", amount: 300, date: Date.now() },
                { username: "user1", type: "type4", amount: 400, date: Date.now() },
                { username: "user4", type: "type2", amount: 200, date: Date.now() },
                { username: "user3", type: "type4", amount: 400, date: Date.now() },
            ]
        )

        const response = await request(app)
            .get("/api/transactions/groups/group1/category/type5")
            .set('Cookie', [`accessToken=${adminTokenValid};refreshToken=${adminTokenValid}`]);
        console.log(JSON.stringify(response, null, 2));

        expect(response.status).toEqual(400);
        expect(response.body).toEqual({ error: expect.any(String) })
    })

})



describe("deleteTransaction", () => {

    //router.delete("/users/:username/transactions", deleteTransaction)

    test("should delete a transaction", async () => {

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
                        await User.findOne({ username: "user2" }).then(u => { return { email: u.email, user: u.id } }),
                    ]
                },
                {
                    name: "group2",
                    members: [
                        await User.findOne({ username: "user1" }).then(u => { return { email: u.email, user: u.id } }),
                        await User.findOne({ username: "user3" }).then(u => { return { email: u.email, user: u.id } }),
                    ]
                },
            ]
        );

        await categories.insertMany(
            [
                { type: "type0", color: "color0" },
                { type: "type1", color: "color1" },
                { type: "type2", color: "color2" },
                { type: "type3", color: "color3" },
                { type: "type4", color: "color4" },
            ]
        )

        await transactions.insertMany(
            [
                { username: "user1", type: "type0", amount: 100, date: Date.now() },
                { username: "user2", type: "type1", amount: 100, date: Date.now() },
                { username: "user3", type: "type2", amount: 200, date: Date.now() },
                { username: "user2", type: "type3", amount: 300, date: Date.now() },
                { username: "user1", type: "type4", amount: 400, date: Date.now() },
                { username: "user4", type: "type2", amount: 200, date: Date.now() },
                { username: "user3", type: "type4", amount: 400, date: Date.now() },
            ]
        )

        const response = await request(app)
            .delete("/api/users/user1/transactions/")
            .set('Cookie', [`accessToken=${userTokenValid};refreshToken=${userTokenValid}`])
            .send({ _id: (await transactions.find({}))[4]._id });
        //console.log(JSON.stringify(response, null, 2));

        expect(response.status).toEqual(200);
        expect(response.body.data).toHaveProperty("message");
    })

    test("Returns a 401 error if called by an authenticated user who is not the same user as the one in the route (authType = User)", async () => {

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
                        await User.findOne({ username: "user2" }).then(u => { return { email: u.email, user: u.id } }),
                    ]
                },
                {
                    name: "group2",
                    members: [
                        await User.findOne({ username: "user1" }).then(u => { return { email: u.email, user: u.id } }),
                        await User.findOne({ username: "user3" }).then(u => { return { email: u.email, user: u.id } }),
                    ]
                },
            ]
        );

        await categories.insertMany(
            [
                { type: "type0", color: "color0" },
                { type: "type1", color: "color1" },
                { type: "type2", color: "color2" },
                { type: "type3", color: "color3" },
                { type: "type4", color: "color4" },
            ]
        )

        await transactions.insertMany(
            [
                { username: "user1", type: "type0", amount: 100, date: Date.now() },
                { username: "user2", type: "type1", amount: 100, date: Date.now() },
                { username: "user3", type: "type2", amount: 200, date: Date.now() },
                { username: "user2", type: "type3", amount: 300, date: Date.now() },
                { username: "user1", type: "type4", amount: 400, date: Date.now() },
                { username: "user4", type: "type2", amount: 200, date: Date.now() },
                { username: "user3", type: "type4", amount: 400, date: Date.now() },
            ]
        )

        const response = await request(app)
            .delete("/api/users/user1/transactions/")
            .set('Cookie', [`accessToken=${adminTokenValid};refreshToken=${adminTokenValid}`])
            .send({ _id: (await transactions.find({}))[4]._id });
        console.log(JSON.stringify(response, null, 2));

        expect(response.status).toEqual(401);
        expect(response.body).toHaveProperty("error");
    })

    test("Returns a 400 error if the _id in the request body represents a transaction made by a different user than the one in the route", async () => {

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
                        await User.findOne({ username: "user2" }).then(u => { return { email: u.email, user: u.id } }),
                    ]
                },
                {
                    name: "group2",
                    members: [
                        await User.findOne({ username: "user1" }).then(u => { return { email: u.email, user: u.id } }),
                        await User.findOne({ username: "user3" }).then(u => { return { email: u.email, user: u.id } }),
                    ]
                },
            ]
        );

        await categories.insertMany(
            [
                { type: "type0", color: "color0" },
                { type: "type1", color: "color1" },
                { type: "type2", color: "color2" },
                { type: "type3", color: "color3" },
                { type: "type4", color: "color4" },
            ]
        )

        await transactions.insertMany(
            [
                { username: "user1", type: "type0", amount: 100, date: Date.now() },
                { username: "user2", type: "type1", amount: 100, date: Date.now() },
                { username: "user3", type: "type2", amount: 200, date: Date.now() },
                { username: "user2", type: "type3", amount: 300, date: Date.now() },
                { username: "user1", type: "type4", amount: 400, date: Date.now() },
                { username: "user4", type: "type2", amount: 200, date: Date.now() },
                { username: "user3", type: "type4", amount: 400, date: Date.now() },
            ]
        )

        const response = await request(app)
            .delete("/api/users/user1/transactions/")
            .set('Cookie', [`accessToken=${userTokenValid};refreshToken=${userTokenValid}`])
            .send({ _id: (await transactions.find({}))[3]._id });
        console.log(JSON.stringify(response, null, 2));

        expect(response.status).toEqual(400);
        expect(response.body).toHaveProperty("error");
    })

    test("Returns a 400 error if the _id in the request body does not represent a transaction in the database", async () => {

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
                        await User.findOne({ username: "user2" }).then(u => { return { email: u.email, user: u.id } }),
                    ]
                },
                {
                    name: "group2",
                    members: [
                        await User.findOne({ username: "user1" }).then(u => { return { email: u.email, user: u.id } }),
                        await User.findOne({ username: "user3" }).then(u => { return { email: u.email, user: u.id } }),
                    ]
                },
            ]
        );

        await categories.insertMany(
            [
                { type: "type0", color: "color0" },
                { type: "type1", color: "color1" },
                { type: "type2", color: "color2" },
                { type: "type3", color: "color3" },
                { type: "type4", color: "color4" },
            ]
        )

        await transactions.insertMany(
            [
                { username: "user1", type: "type0", amount: 100, date: Date.now() },
                { username: "user2", type: "type1", amount: 100, date: Date.now() },
                { username: "user3", type: "type2", amount: 200, date: Date.now() },
                { username: "user2", type: "type3", amount: 300, date: Date.now() },
                { username: "user1", type: "type4", amount: 400, date: Date.now() },
                { username: "user4", type: "type2", amount: 200, date: Date.now() },
                { username: "user3", type: "type4", amount: 400, date: Date.now() },
            ]
        )

        const response = await request(app)
            .delete("/api/users/user1/transactions/")
            .set('Cookie', [`accessToken=${userTokenValid};refreshToken=${userTokenValid}`])
            .send({ _id: (await mongoose.Types.ObjectId()) });
        console.log(JSON.stringify(response, null, 2));

        expect(response.status).toEqual(400);
        expect(response.body).toHaveProperty("error");
    })

    test("Returns a 400 error if the username passed as a route parameter does not represent a user in the database", async () => {

        await User.insertMany(
            [
                { username: "user0", email: "user0@ezwallet.com", password: "password0", role: "Regular" },
                //{ username: "user1", email: "user1@ezwallet.com", password: "password1", role: "Regular", refreshToken: userTokenValid },
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
                        await User.findOne({ username: "user2" }).then(u => { return { email: u.email, user: u.id } }),
                    ]
                },
                {
                    name: "group2",
                    members: [
                        //await User.findOne({ username: "user1" }).then(u => { return { email: u.email, user: u.id } }),
                        await User.findOne({ username: "user3" }).then(u => { return { email: u.email, user: u.id } }),
                    ]
                },
            ]
        );

        await categories.insertMany(
            [
                { type: "type0", color: "color0" },
                { type: "type1", color: "color1" },
                { type: "type2", color: "color2" },
                { type: "type3", color: "color3" },
                { type: "type4", color: "color4" },
            ]
        )

        await transactions.insertMany(
            [
                // { username: "user1", type: "type0", amount: 100, date: Date.now() },
                { username: "user2", type: "type1", amount: 100, date: Date.now() },
                { username: "user3", type: "type2", amount: 200, date: Date.now() },
                { username: "user2", type: "type3", amount: 300, date: Date.now() },
                // { username: "user1", type: "type4", amount: 400, date: Date.now() },
                { username: "user4", type: "type2", amount: 200, date: Date.now() },
                { username: "user3", type: "type4", amount: 400, date: Date.now() },
            ]
        )

        const response = await request(app)
            .delete("/api/users/user1/transactions/")
            .set('Cookie', [`accessToken=${userTokenValid};refreshToken=${userTokenValid}`])
            .send({ _id: (await transactions.find({}))[4]._id });
        console.log(JSON.stringify(response, null, 2));

        expect(response.status).toEqual(400);
        expect(response.body).toHaveProperty("error");
    })

    test("Returns a 400 error if the _id in the request body is an empty string    ", async () => {

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
                        await User.findOne({ username: "user2" }).then(u => { return { email: u.email, user: u.id } }),
                    ]
                },
                {
                    name: "group2",
                    members: [
                        await User.findOne({ username: "user1" }).then(u => { return { email: u.email, user: u.id } }),
                        await User.findOne({ username: "user3" }).then(u => { return { email: u.email, user: u.id } }),
                    ]
                },
            ]
        );

        await categories.insertMany(
            [
                { type: "type0", color: "color0" },
                { type: "type1", color: "color1" },
                { type: "type2", color: "color2" },
                { type: "type3", color: "color3" },
                { type: "type4", color: "color4" },
            ]
        )

        await transactions.insertMany(
            [
                { username: "user1", type: "type0", amount: 100, date: Date.now() },
                { username: "user2", type: "type1", amount: 100, date: Date.now() },
                { username: "user3", type: "type2", amount: 200, date: Date.now() },
                { username: "user2", type: "type3", amount: 300, date: Date.now() },
                { username: "user1", type: "type4", amount: 400, date: Date.now() },
                { username: "user4", type: "type2", amount: 200, date: Date.now() },
                { username: "user3", type: "type4", amount: 400, date: Date.now() },
            ]
        )

        const response = await request(app)
            .delete("/api/users/user1/transactions/")
            .set('Cookie', [`accessToken=${userTokenValid};refreshToken=${userTokenValid}`])
            .send({ _id: "" });
        console.log(JSON.stringify(response, null, 2));

        expect(response.status).toEqual(400);
        expect(response.body).toHaveProperty("error");
    })

    test("Returns a 400 error if the request body does not contain all the necessary attributes ", async () => {

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
                        await User.findOne({ username: "user2" }).then(u => { return { email: u.email, user: u.id } }),
                    ]
                },
                {
                    name: "group2",
                    members: [
                        await User.findOne({ username: "user1" }).then(u => { return { email: u.email, user: u.id } }),
                        await User.findOne({ username: "user3" }).then(u => { return { email: u.email, user: u.id } }),
                    ]
                },
            ]
        );

        await categories.insertMany(
            [
                { type: "type0", color: "color0" },
                { type: "type1", color: "color1" },
                { type: "type2", color: "color2" },
                { type: "type3", color: "color3" },
                { type: "type4", color: "color4" },
            ]
        )

        await transactions.insertMany(
            [
                { username: "user1", type: "type0", amount: 100, date: Date.now() },
                { username: "user2", type: "type1", amount: 100, date: Date.now() },
                { username: "user3", type: "type2", amount: 200, date: Date.now() },
                { username: "user2", type: "type3", amount: 300, date: Date.now() },
                { username: "user1", type: "type4", amount: 400, date: Date.now() },
                { username: "user4", type: "type2", amount: 200, date: Date.now() },
                { username: "user3", type: "type4", amount: 400, date: Date.now() },
            ]
        )

        const response = await request(app)
            .delete("/api/users/user1/transactions/")
            .set('Cookie', [`accessToken=${userTokenValid};refreshToken=${userTokenValid}`])
            .send({});
        console.log(JSON.stringify(response, null, 2));

        expect(response.status).toEqual(400);
        expect(response.body).toHaveProperty("error");
    })


    test("Returns a 500 error if the id is not valid db id", async () => {

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
                        await User.findOne({ username: "user2" }).then(u => { return { email: u.email, user: u.id } }),
                    ]
                },
                {
                    name: "group2",
                    members: [
                        await User.findOne({ username: "user1" }).then(u => { return { email: u.email, user: u.id } }),
                        await User.findOne({ username: "user3" }).then(u => { return { email: u.email, user: u.id } }),
                    ]
                },
            ]
        );

        await categories.insertMany(
            [
                { type: "type0", color: "color0" },
                { type: "type1", color: "color1" },
                { type: "type2", color: "color2" },
                { type: "type3", color: "color3" },
                { type: "type4", color: "color4" },
            ]
        )

        await transactions.insertMany(
            [
                { username: "user1", type: "type0", amount: 100, date: Date.now() },
                { username: "user2", type: "type1", amount: 100, date: Date.now() },
                { username: "user3", type: "type2", amount: 200, date: Date.now() },
                { username: "user2", type: "type3", amount: 300, date: Date.now() },
                { username: "user1", type: "type4", amount: 400, date: Date.now() },
                { username: "user4", type: "type2", amount: 200, date: Date.now() },
                { username: "user3", type: "type4", amount: 400, date: Date.now() },
            ]
        )

        const response = await request(app)
            .delete("/api/users/user1/transactions/")
            .set('Cookie', [`accessToken=${userTokenValid};refreshToken=${userTokenValid}`])
            .send({ _id: "someid" });
        console.log(JSON.stringify(response, null, 2));

        expect(response.status).toEqual(500);
        expect(response.body).toHaveProperty("error");
    })


})



describe("deleteTransactions", () => {

    //router.delete("/transactions", deleteTransactions) admin


    test("should delete all transactions", async () => {

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
                        await User.findOne({ username: "user2" }).then(u => { return { email: u.email, user: u.id } }),
                    ]
                },
                {
                    name: "group2",
                    members: [
                        await User.findOne({ username: "user1" }).then(u => { return { email: u.email, user: u.id } }),
                        await User.findOne({ username: "user3" }).then(u => { return { email: u.email, user: u.id } }),
                    ]
                },
            ]
        );

        await categories.insertMany(
            [
                { type: "type0", color: "color0" },
                { type: "type1", color: "color1" },
                { type: "type2", color: "color2" },
                { type: "type3", color: "color3" },
                { type: "type4", color: "color4" },
            ]
        )

        await transactions.insertMany(
            [
                { username: "user1", type: "type0", amount: 100, date: Date.now() },
                { username: "user2", type: "type1", amount: 100, date: Date.now() },
                { username: "user3", type: "type2", amount: 200, date: Date.now() },
                { username: "user2", type: "type3", amount: 300, date: Date.now() },
                { username: "user1", type: "type4", amount: 400, date: Date.now() },
                { username: "user4", type: "type2", amount: 200, date: Date.now() },
                { username: "user3", type: "type4", amount: 400, date: Date.now() },
            ]
        )

        const transactionIds = (await (transactions.find({}))).map(t => t._id);

        const response = await request(app)
            .delete("/api/transactions/")
            .set('Cookie', [`accessToken=${adminTokenValid};refreshToken=${adminTokenValid}`])
            .send({ _ids: transactionIds });
        //console.log(JSON.stringify(response, null, 2));

        expect(response.status).toEqual(200);
        expect(response.body.data).toHaveProperty("message");

    })

    test("Returns a 401 error if called by an authenticated user who is not an admin (authType = Admin)", async () => {

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
                        await User.findOne({ username: "user2" }).then(u => { return { email: u.email, user: u.id } }),
                    ]
                },
                {
                    name: "group2",
                    members: [
                        await User.findOne({ username: "user1" }).then(u => { return { email: u.email, user: u.id } }),
                        await User.findOne({ username: "user3" }).then(u => { return { email: u.email, user: u.id } }),
                    ]
                },
            ]
        );

        await categories.insertMany(
            [
                { type: "type0", color: "color0" },
                { type: "type1", color: "color1" },
                { type: "type2", color: "color2" },
                { type: "type3", color: "color3" },
                { type: "type4", color: "color4" },
            ]
        )

        await transactions.insertMany(
            [
                { username: "user1", type: "type0", amount: 100, date: Date.now() },
                { username: "user2", type: "type1", amount: 100, date: Date.now() },
                { username: "user3", type: "type2", amount: 200, date: Date.now() },
                { username: "user2", type: "type3", amount: 300, date: Date.now() },
                { username: "user1", type: "type4", amount: 400, date: Date.now() },
                { username: "user4", type: "type2", amount: 200, date: Date.now() },
                { username: "user3", type: "type4", amount: 400, date: Date.now() },
            ]
        )

        const transactionIds = (await (transactions.find({}))).map(t => t._id);

        const response = await request(app)
            .delete("/api/transactions/")
            .set('Cookie', [`accessToken=${userTokenValid};refreshToken=${userTokenValid}`])
            .send({ _ids: transactionIds });
        console.log(JSON.stringify(response, null, 2));

        expect(response.status).toEqual(401);
        expect(response.body).toHaveProperty("error");

    })

    test("Returns a 400 error if at least one of the ids in the array does not represent a transaction in the database", async () => {

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
                        await User.findOne({ username: "user2" }).then(u => { return { email: u.email, user: u.id } }),
                    ]
                },
                {
                    name: "group2",
                    members: [
                        await User.findOne({ username: "user1" }).then(u => { return { email: u.email, user: u.id } }),
                        await User.findOne({ username: "user3" }).then(u => { return { email: u.email, user: u.id } }),
                    ]
                },
            ]
        );

        await categories.insertMany(
            [
                { type: "type0", color: "color0" },
                { type: "type1", color: "color1" },
                { type: "type2", color: "color2" },
                { type: "type3", color: "color3" },
                { type: "type4", color: "color4" },
            ]
        )

        await transactions.insertMany(
            [
                { username: "user1", type: "type0", amount: 100, date: Date.now() },
                { username: "user2", type: "type1", amount: 100, date: Date.now() },
                { username: "user3", type: "type2", amount: 200, date: Date.now() },
                { username: "user2", type: "type3", amount: 300, date: Date.now() },
                { username: "user1", type: "type4", amount: 400, date: Date.now() },
                { username: "user4", type: "type2", amount: 200, date: Date.now() },
                { username: "user3", type: "type4", amount: 400, date: Date.now() },
            ]
        )

        const transactionIds = (await (transactions.find({}))).map(t => t._id);
        transactionIds.push(mongoose.Types.ObjectId());

        const response = await request(app)
            .delete("/api/transactions/")
            .set('Cookie', [`accessToken=${adminTokenValid};refreshToken=${adminTokenValid}`])
            .send({ _ids: transactionIds });
        console.log(JSON.stringify(response, null, 2));

        expect(response.status).toEqual(400);
        expect(response.body).toHaveProperty("error");

    })

    test("Returns a 400 error if at least one of the ids in the array is an empty string    ", async () => {

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
                        await User.findOne({ username: "user2" }).then(u => { return { email: u.email, user: u.id } }),
                    ]
                },
                {
                    name: "group2",
                    members: [
                        await User.findOne({ username: "user1" }).then(u => { return { email: u.email, user: u.id } }),
                        await User.findOne({ username: "user3" }).then(u => { return { email: u.email, user: u.id } }),
                    ]
                },
            ]
        );

        await categories.insertMany(
            [
                { type: "type0", color: "color0" },
                { type: "type1", color: "color1" },
                { type: "type2", color: "color2" },
                { type: "type3", color: "color3" },
                { type: "type4", color: "color4" },
            ]
        )

        await transactions.insertMany(
            [
                { username: "user1", type: "type0", amount: 100, date: Date.now() },
                { username: "user2", type: "type1", amount: 100, date: Date.now() },
                { username: "user3", type: "type2", amount: 200, date: Date.now() },
                { username: "user2", type: "type3", amount: 300, date: Date.now() },
                { username: "user1", type: "type4", amount: 400, date: Date.now() },
                { username: "user4", type: "type2", amount: 200, date: Date.now() },
                { username: "user3", type: "type4", amount: 400, date: Date.now() },
            ]
        )

        const transactionIds = (await (transactions.find({}))).map(t => t._id);
        transactionIds.push("");

        const response = await request(app)
            .delete("/api/transactions/")
            .set('Cookie', [`accessToken=${adminTokenValid};refreshToken=${adminTokenValid}`])
            .send({ _ids: transactionIds });
        console.log(JSON.stringify(response, null, 2));

        expect(response.status).toEqual(400);
        expect(response.body).toHaveProperty("error");

    })

    test("Returns a 400 error if the request body does not contain all the necessary attributes ", async () => {

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
                        await User.findOne({ username: "user2" }).then(u => { return { email: u.email, user: u.id } }),
                    ]
                },
                {
                    name: "group2",
                    members: [
                        await User.findOne({ username: "user1" }).then(u => { return { email: u.email, user: u.id } }),
                        await User.findOne({ username: "user3" }).then(u => { return { email: u.email, user: u.id } }),
                    ]
                },
            ]
        );

        await categories.insertMany(
            [
                { type: "type0", color: "color0" },
                { type: "type1", color: "color1" },
                { type: "type2", color: "color2" },
                { type: "type3", color: "color3" },
                { type: "type4", color: "color4" },
            ]
        )

        await transactions.insertMany(
            [
                { username: "user1", type: "type0", amount: 100, date: Date.now() },
                { username: "user2", type: "type1", amount: 100, date: Date.now() },
                { username: "user3", type: "type2", amount: 200, date: Date.now() },
                { username: "user2", type: "type3", amount: 300, date: Date.now() },
                { username: "user1", type: "type4", amount: 400, date: Date.now() },
                { username: "user4", type: "type2", amount: 200, date: Date.now() },
                { username: "user3", type: "type4", amount: 400, date: Date.now() },
            ]
        )

        const transactionIds = (await (transactions.find({}))).map(t => t._id);

        const response = await request(app)
            .delete("/api/transactions/")
            .set('Cookie', [`accessToken=${adminTokenValid};refreshToken=${adminTokenValid}`])
            .send({});
        console.log(JSON.stringify(response, null, 2));

        expect(response.status).toEqual(400);
        expect(response.body).toHaveProperty("error");

    })

    test("Returns a 500 error if the transactions id is not valid", async () => {

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
                        await User.findOne({ username: "user2" }).then(u => { return { email: u.email, user: u.id } }),
                    ]
                },
                {
                    name: "group2",
                    members: [
                        await User.findOne({ username: "user1" }).then(u => { return { email: u.email, user: u.id } }),
                        await User.findOne({ username: "user3" }).then(u => { return { email: u.email, user: u.id } }),
                    ]
                },
            ]
        );

        await categories.insertMany(
            [
                { type: "type0", color: "color0" },
                { type: "type1", color: "color1" },
                { type: "type2", color: "color2" },
                { type: "type3", color: "color3" },
                { type: "type4", color: "color4" },
            ]
        )

        await transactions.insertMany(
            [
                { username: "user1", type: "type0", amount: 100, date: Date.now() },
                { username: "user2", type: "type1", amount: 100, date: Date.now() },
                { username: "user3", type: "type2", amount: 200, date: Date.now() },
                { username: "user2", type: "type3", amount: 300, date: Date.now() },
                { username: "user1", type: "type4", amount: 400, date: Date.now() },
                { username: "user4", type: "type2", amount: 200, date: Date.now() },
                { username: "user3", type: "type4", amount: 400, date: Date.now() },
            ]
        )

        const transactionIds = (await (transactions.find({}))).map(t => t._id);
        transactionIds.push("someinvalidid");

        const response = await request(app)
            .delete("/api/transactions/")
            .set('Cookie', [`accessToken=${adminTokenValid};refreshToken=${adminTokenValid}`])
            .send({ _ids: transactionIds });
        console.log(JSON.stringify(response, null, 2));

        expect(response.status).toEqual(500);
        expect(response.body).toHaveProperty("error");

    })
})
