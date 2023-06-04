import { categories } from '../models/model';
import { transactions } from '../models/model';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import "jest-extended"
import { User, Group } from '../models/User';
import jwt from 'jsonwebtoken';
import { verifyAuth, handleDateFilterParams, handleAmountFilterParams } from '../controllers/utils';


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
    await categories.deleteMany({})
    await transactions.deleteMany({})
    await User.deleteMany({})
    await Group.deleteMany({})
})


/**
 * Alternate way to create the necessary tokens for authentication without using the website
 */
const adminTokenValid = jwt.sign({
    email: "admin@email.com",
    //id: existingUser.id, The id field is not required in any check, so it can be omitted
    username: "admin",
    role: "Admin"
}, process.env.ACCESS_KEY, { expiresIn: '1y' })

const userTokenValid = jwt.sign({
    email: "tester@test.com",
    username: "tester",
    role: "Regular"
}, process.env.ACCESS_KEY, { expiresIn: '1y' })

//These tokens can be used in order to test the specific authentication error scenarios inside verifyAuth (no need to have multiple authentication error tests for the same route)
const userTokenExpired = jwt.sign({
    email: "tester@test.com",
    username: "tester",
    role: "Regular"
}, process.env.ACCESS_KEY, { expiresIn: '0s' })

const userTokenEmpty = jwt.sign({}, process.env.ACCESS_KEY, { expiresIn: "1y" })


describe("handleDateFilterParams", () => {
    test('should return correct filter using from and upto parameters', () => {
        const req = {
            query: {
                from: "2023-01-01",
                upTo: "2033-05-31",
                //date: "2023-01-01",
            }
        }

        /* for all error thrown
        const filter = () =>handleDateFilterParams(req);
         expect(filter).toThrow(expect.any(String))
        */
        const filter = handleDateFilterParams(req);
        //console.log(JSON.stringify(filter, null, 2));

        expect(filter).toEqual({
            date: {
                $gte: new Date(req.query.from + "T00:00:00.000Z"),
                $lte: new Date(req.query.upTo + "T23:59:59.999Z")
            }
        })
    });
})



describe("verifyAuth", () => {

    test("should authorize user and refreshToken where authType==Group ", () => {

        const req = {
            cookies: {
                accessToken: userTokenExpired,
                refreshToken: userTokenValid
            }
        }

        //The inner working of the cookie function is as follows: the response object's cookieArgs object values are set
        const cookieMock = (name, value, options) => {
            res.cookieArgs = { name, value, options };
        }
        //In this case the response object must have a "cookie" function that sets the needed values, as well as a "locals" object where the message must be set 
        const res = {
            cookie: cookieMock,
            locals: {},
        }

        const response = verifyAuth(req, res, { authType: "User", username: "tester" });

        //The response must have a true value (valid refresh token and expired access token)
        expect(Object.values(response).includes(true)).toBe(true);
        expect(res.cookieArgs).toEqual({
            name: 'accessToken', //The cookie arguments must have the name set to "accessToken" (value updated)
            value: expect.any(String), //The actual value is unpredictable (jwt string), so it must exist
            options: { //The same options as during creation
                httpOnly: true,
                path: '/api',
                maxAge: 60 * 60 * 1000,
                sameSite: 'none',
                secure: true,
            },
        })
        //The response object must have a field that contains the message, with the name being either "message" or "refreshedTokenMessage"
        const message = res.locals.refreshedTokenMessage ? true : (res.locals.message ? true : false);
        expect(message).toBe(true)

    })

})

describe("handleAmountFilterParams", () => {
    test('should return correct filter using min and max queries', () => {
        const req = {
            query: {
                min: "100.234",
                max: "500.678"
            }
        }

        /* for all error thrown
        const filter = () =>handleDateFilterParams(req);
         expect(filter).toThrow(expect.any(String))
        */
        const filter = handleAmountFilterParams(req);
        //console.log(JSON.stringify(filter, null, 2));

        expect(filter).toEqual({
            amount: {
                $gte: 100.234,
                $lte: 500.678
            }
        })
    });
})
