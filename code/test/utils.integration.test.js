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

const adminTokenExpired = jwt.sign({
    email: "admin@email.com",
    //id: existingUser.id, The id field is not required in any check, so it can be omitted
    username: "admin",
    role: "Admin"
}, process.env.ACCESS_KEY, { expiresIn: '0s' })


const userTokenEmpty = jwt.sign({}, process.env.ACCESS_KEY, { expiresIn: "1y" })


describe("I4.1: handleDateFilterParams", () => {
    test('I4.1.1: should return correct filter using from and upto parameters', () => {
        const req = {
            query: {
                from: "2023-01-01",
                upTo: "2033-05-31",
                //date: "2023-01-01",
            }
        }
        const filter = handleDateFilterParams(req);
        expect(filter).toEqual({
            date: {
                $gte: new Date(req.query.from + "T00:00:00.000Z"),
                $lte: new Date(req.query.upTo + "T23:59:59.999Z")
            }
        })
    });

    test('I4.1.2: should return correct filter using from parameters', () => {
        const req = {
            query: {
                from: "2023-01-01",
                //upTo: "2033-05-31",
                //date: "2023-01-01",
            }
        }
        const filter = handleDateFilterParams(req);
        expect(filter).toEqual({
            date: {
                $gte: new Date(req.query.from + "T00:00:00.000Z"),
                //$lte: new Date(req.query.upTo + "T23:59:59.999Z")
            }
        })
    });
    test('I4.1.3: should return correct filter using upTo parameters', () => {
        const req = {
            query: {
                //from: "2023-01-01",
                upTo: "2033-05-31",
                //date: "2023-01-01",
            }
        }
        const filter = handleDateFilterParams(req);
        expect(filter).toEqual({
            date: {
                //$gte: new Date(req.query.from + "T00:00:00.000Z"),
                $lte: new Date(req.query.upTo + "T23:59:59.999Z")
            }
        })
    });


    test('I4.1.4: should return correct filter using date parameters', () => {
        const req = {
            query: {
                //from: "2023-01-01",
                //upTo: "2033-05-31",
                date: "2023-01-01",
            }
        }
        const filter = handleDateFilterParams(req);
        expect(filter).toEqual({
            date: {
                $gte: new Date(req.query.date + "T00:00:00.000Z"),
                $lte: new Date(req.query.date + "T23:59:59.999Z")
            }
        })
    });

    test('I4.1.5: should return nothing since no query defined', () => {
        const req = {
            query: {
            }
        }
        const filter = handleDateFilterParams(req);
        expect(filter).toEqual({})
    });

    test('I4.1.6: should throw error if data is present with the two other parameters (from)', () => {
        const req = {
            query: {
                from: "2023-01-01",
                //upTo: "2033-05-31",
                date: "2023-01-01"
            }
        }
        const filter = () => handleDateFilterParams(req);
        expect(filter).toThrow("Cannot include date parameter with from or upTo parameters.")
    });

    test('I4.1.7: should throw error if data is present with the two other parameters (upTo)', () => {
        const req = {
            query: {
                //from: "2023-01-01",
                upTo: "2033-05-31",
                date: "2023-01-01"
            }
        }

        /* for all error thrown
        const filter = () =>handleDateFilterParams(req);
         expect(filter).toThrow(expect.any(String))
        */
        const filter = () => handleDateFilterParams(req);
        //console.log(JSON.stringify(filter, null, 2));

        expect(filter).toThrow("Cannot include date parameter with from or upTo parameters.")
    });

    test('I4.1.8: should throw error invalid data parameter format', () => {
        const req = {
            query: {
                //from: "2023-01-01",
                //upTo: "2033-05-31",
                date: "2023/01/01"
            }
        }
        const filter = () => handleDateFilterParams(req);
        expect(filter).toThrow("date : Invalid date format. YYYY-MM-DD format expected.")
    });

    test('I4.1.9: should throw error invalid from parameter format', () => {
        const req = {
            query: {
                from: "2023/01/01",
                upTo: "2033-05-31",
                //date: "2023/01/01"
            }
        }
        const filter = () => handleDateFilterParams(req);
        expect(filter).toThrow("from : Invalid date format. YYYY-MM-DD format expected.")
    });

    test('I4.1.10: should throw error invalid upTo parameter format', () => {
        const req = {
            query: {
                from: "2023-01-01",
                upTo: "2033/05/31",
                //date: "2023/01/01"
            }
        }
        const filter = () => handleDateFilterParams(req);
        expect(filter).toThrow("upTo : Invalid date format. YYYY-MM-DD format expected.")
    });

})



describe("I4.2: verifyAuth", () => {

    test("I4.2.1: should authorize user and refresh token authType==Simple ", () => {

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

        const response = verifyAuth(req, res, { authType: "Simple" });
        //console.log(response);
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

    test("I4.2.2: should not authorize user and refresh token authType==Simple ", () => {

        const req = {
            cookies: {
                accessToken: userTokenExpired,
                refreshToken: adminTokenValid
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

        const response = verifyAuth(req, res, { authType: "Simple" });
        //console.log(response);
        //The response must have a true value (valid refresh token and expired access token)
        expect(Object.values(response).includes(false)).toBe(true);

        //The response object must have a field that contains the message, with the name being either "message" or "refreshedTokenMessage"
        const message = res.locals.refreshedTokenMessage ? true : (res.locals.message ? true : false);
        expect(message).toBe(false)

    })

    test("I4.2.3: should authorize user and refresh token authType==Admin ", () => {

        const req = {
            cookies: {
                accessToken: adminTokenExpired,
                refreshToken: adminTokenValid
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

        const response = verifyAuth(req, res, { authType: "Admin" });
        //console.log(response);
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

    test("I4.2.4: should not authorize user authType==Admin ", () => {

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

        const response = verifyAuth(req, res, { authType: "Admin" });
        //console.log(response);
        //The response must have a true value (valid refresh token and expired access token)
        expect(Object.values(response).includes(false)).toBe(true);

        const message = res.locals.refreshedTokenMessage ? true : (res.locals.message ? true : false);
        expect(message).toBe(false)
    })

    test("I4.2.5: should authorize user and refresh token authType==User ", () => {

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
        //console.log(response);
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

    test("I4.2.6: should not authorize user and refresh token authType==User ", () => {

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

        const response = verifyAuth(req, res, { authType: "User", username: "tester2" });
        //console.log(response);
        //The response must have a true value (valid refresh token and expired access token)
        expect(Object.values(response).includes(false)).toBe(true);

        const message = res.locals.refreshedTokenMessage ? true : (res.locals.message ? true : false);
        expect(message).toBe(false)
    })

    test("I4.2.7: should authorize user and refresh token where authType==Group ", () => {

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

        const response = verifyAuth(req, res, {
            authType: "Group", emails: ["tester@test.com", "tester1@test.com", "tester2@test.com"]
        });

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

    test("I4.2.8: should not authorize user and refresh token where authType==Group ", () => {

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

        const response = verifyAuth(req, res, { authType: "Group", emails: ["tester1@test.com", "tester2@test.com"] });

        //The response must have a true value (valid refresh token and expired access token)
        expect(Object.values(response).includes(false)).toBe(true);

        //The response object must have a field that contains the message, with the name being either "message" or "refreshedTokenMessage"
        const message = res.locals.refreshedTokenMessage ? true : (res.locals.message ? true : false);
        expect(message).toBe(false)
    })

    test("I4.2.9: should not authorize user and refresh token where authType==Unknown ", () => {

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

        const response = verifyAuth(req, res, { authType: "Unknow", emails: ["tester1@test.com", "tester2@test.com"] });

        //The response must have a true value (valid refresh token and expired access token)
        expect(Object.values(response).includes(false)).toBe(true);

        //The response object must have a field that contains the message, with the name being either "message" or "refreshedTokenMessage"
        const message = res.locals.refreshedTokenMessage ? true : (res.locals.message ? true : false);
        expect(message).toBe(false)
    })

    test("I4.2.10: should not authorize if access token missing information ", () => {

        const req = {
            cookies: {
                accessToken: userTokenEmpty,
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

        const response = verifyAuth(req, res, { authType: "Simple" });
        //console.log(response);
        //The response must have a true value (valid refresh token and expired access token)
        expect(Object.values(response).includes(false)).toBe(true);

        //The response object must have a field that contains the message, with the name being either "message" or "refreshedTokenMessage"
        const message = res.locals.refreshedTokenMessage ? true : (res.locals.message ? true : false);
        expect(message).toBe(false)

    })

    test("I4.2.11: should not authorize if refresh token missing information ", () => {

        const req = {
            cookies: {
                accessToken: userTokenValid,
                refreshToken: userTokenEmpty
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

        const response = verifyAuth(req, res, { authType: "Simple" });
        //console.log(response);
        //The response must have a true value (valid refresh token and expired access token)
        expect(Object.values(response).includes(false)).toBe(true);

        //The response object must have a field that contains the message, with the name being either "message" or "refreshedTokenMessage"
        const message = res.locals.refreshedTokenMessage ? true : (res.locals.message ? true : false);
        expect(message).toBe(false)

    })

    test("I4.2.12: should not authorize if access token cannot be verified ", () => {

        const req = {
            cookies: {
                accessToken: "cannot verify",
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

        const response = verifyAuth(req, res, { authType: "Simple" });
        //console.log(response);
        //The response must have a true value (valid refresh token and expired access token)
        expect(Object.values(response).includes(false)).toBe(true);

        //The response object must have a field that contains the message, with the name being either "message" or "refreshedTokenMessage"
        const message = res.locals.refreshedTokenMessage ? true : (res.locals.message ? true : false);
        expect(message).toBe(false)

    })

    test("I4.2.13: should not authorize if refresh token cannot be verified ", () => {

        const req = {
            cookies: {
                accessToken: userTokenValid,
                refreshToken: "cannot verify"
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

        const response = verifyAuth(req, res, { authType: "Simple" });
        //console.log(response);
        //The response must have a true value (valid refresh token and expired access token)
        expect(Object.values(response).includes(false)).toBe(true);

        //The response object must have a field that contains the message, with the name being either "message" or "refreshedTokenMessage"
        const message = res.locals.refreshedTokenMessage ? true : (res.locals.message ? true : false);
        expect(message).toBe(false)

    })

    test("I4.2.14: should not authorize if refresh token expired ", () => {

        const req = {
            cookies: {
                accessToken: userTokenValid,
                refreshToken: userTokenExpired
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

        const response = verifyAuth(req, res, { authType: "Simple" });
        //console.log(response);
        //The response must have a true value (valid refresh token and expired access token)
        expect(Object.values(response).includes(false)).toBe(true);

        //The response object must have a field that contains the message, with the name being either "message" or "refreshedTokenMessage"
        const message = res.locals.refreshedTokenMessage ? true : (res.locals.message ? true : false);
        expect(message).toBe(false)

    })

    test("I4.2.15: should not authorize if missing tokens ", () => {

        const req = {
            cookies: {
                accessToken: userTokenValid,
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

        const response = verifyAuth(req, res, { authType: "Simple" });
        //console.log(response);
        //The response must have a true value (valid refresh token and expired access token)
        expect(Object.values(response).includes(false)).toBe(true);

        //The response object must have a field that contains the message, with the name being either "message" or "refreshedTokenMessage"
        const message = res.locals.refreshedTokenMessage ? true : (res.locals.message ? true : false);
        expect(message).toBe(false)

    })
})



describe("I4.3: handleAmountFilterParams", () => {
    test('I4.3.1: should return correct filter using min and max queries', () => {
        const req = {
            query: {
                min: "100.234",
                max: "500.678"
            }
        }
        const filter = handleAmountFilterParams(req);
        expect(filter).toEqual({
            amount: {
                $gte: 100.234,
                $lte: 500.678
            }
        })
    });

    test('I4.3.2: should return correct filter using min queries', () => {
        const req = {
            query: {
                min: "100.234",
                //max: "500.678"
            }
        }
        const filter = handleAmountFilterParams(req);
        expect(filter).toEqual({
            amount: {
                $gte: 100.234,
                //$lte: 500.678
            }
        })
    });

    test('I4.3.3: should return correct filter using max queries', () => {
        const req = {
            query: {
                //min: "100.234",
                max: "500.678"
            }
        }
        const filter = handleAmountFilterParams(req);
        expect(filter).toEqual({
            amount: {
                //$gte: 100.234,
                $lte: 500.678
            }
        })
    });

    test('I4.3.4: should throw an error for invalid min (since not numerical)', () => {
        const req = {
            query: {
                min: "abc",
                max: "500.678"
            }
        }
        const filter = () => handleAmountFilterParams(req);
        expect(filter).toThrow("Invalid min. Expected a numerical value.")
    });

    test('I4.3.5: should throw an error for invalid max (since not numerical)', () => {
        const req = {
            query: {
                min: "100.234",
                max: "abc"
            }
        }
        const filter = () => handleAmountFilterParams(req);
        expect(filter).toThrow("Invalid max. Expected a numerical value.")
    });

    test('I4.3.6: should return nothing since min and max queries not defined', () => {
        const req = {
            query: {
            }
        }
        const filter = handleAmountFilterParams(req);
        expect(filter).toEqual({})
    });
})
