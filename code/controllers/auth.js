import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import jwt from 'jsonwebtoken';
import { createAttribute, resData, resError, validateAttributes } from './extraUtils.js';

/**
register
Request Parameters: None
Request Body Content: An object having attributes username, email and password
Example: {username: "Mario", email: "mario.red@email.com", password: "securePass"}
Response data Content: A message confirming successful insertion
Example: res.status(200).json({data: {message: "User added successfully"}})
Returns a 400 error if the request body does not contain all the necessary attributes
Returns a 400 error if at least one of the parameters in the request body is an empty string
Returns a 400 error if the email in the request body is not in a valid email format
Returns a 400 error if the username in the request body identifies an already existing user
Returns a 400 error if the email in the request body identifies an already existing user
 */
export const register = async (req, res) => {
    try {

        //get attributes
        const username = req.body.username;
        const email = req.body.email;
        const password = req.body.password;

        //validate attributes
        const validation = validateAttributes([
            createAttribute(username, 'string'),
            createAttribute(email, 'email'),
            createAttribute(password, 'string'),
        ])
        if (!validation.flag) return resError(res, 400, validation.cause);

        //check user not registered
        if (await User.findOne({ email: email })) return resError(res, 400, "email already registered");

        //check username does not exist
        if (await User.findOne({ username: username })) return resError(res, 400, "username already taken");

        //hash the password
        const hashedPassword = await bcrypt.hash(password, 12);

        //save new user in database
        await User.create({
            username: username,
            email: email,
            password: hashedPassword,
            //default role Regular
        });

        //send successful message
        return resData(res, { message: "User added successfully" });

    } catch (error) {
        resError(res, 500, error.message);
    }
}


/**
registerAdmin
Request Parameters: None
Request Body Content: An object having attributes username, email and password
Example: {username: "admin", email: "admin@email.com", password: "securePass"}
Response data Content: A message confirming successful insertion
Example: res.status(200).json({data: {message: "User added successfully"}})
Returns a 400 error if the request body does not contain all the necessary attributes
Returns a 400 error if at least one of the parameters in the request body is an empty string
Returns a 400 error if the email in the request body is not in a valid email format
Returns a 400 error if the username in the request body identifies an already existing user
Returns a 400 error if the email in the request body identifies an already existing user
 */
export const registerAdmin = async (req, res) => {
    try {

        //get attributes
        const username = req.body.username;
        const email = req.body.email;
        const password = req.body.password;

        //validate attributes
        const validation = validateAttributes([
            createAttribute(username, 'string'),
            createAttribute(email, 'email'),
            createAttribute(password, 'string'),
        ])
        if (!validation.flag) return resError(res, 400, validation.cause);

        //check user not registered
        if (await User.findOne({ email: email })) return resError(res, 400, "email already registered");

        //check username does not exist
        if (await User.findOne({ username: username })) return resError(res, 400, "username already taken");

        //hash the password
        const hashedPassword = await bcrypt.hash(password, 12);

        //save new user in database
        await User.create({
            username: username,
            email: email,
            password: hashedPassword,
            role: "Admin"
        });

        //send successful message
        return resData(res, { message: "Admin added successfully" });

    } catch (error) {
        resError(res, 500, error.message);
    }
}


/**
login
Request Parameters: None
Request Body Content: An object having attributes email and password
Example: {email: "mario.red@email.com", password: "securePass"}
Response data Content: An object with the created accessToken and refreshToken
Example: res.status(200).json({data: {accessToken: accessToken, refreshToken: refreshToken}})
Returns a 400 error if the request body does not contain all the necessary attributes
Returns a 400 error if at least one of the parameters in the request body is an empty string
Returns a 400 error if the email in the request body is not in a valid email format
Returns a 400 error if the email in the request body does not identify a user in the database
Returns a 400 error if the supplied password does not match with the one in the database
 */
export const login = async (req, res) => {
    try {
        //get attributes
        const email = req.body.email;
        const password = req.body.password;

        //validate attributes
        const validation = validateAttributes([
            createAttribute(email, 'email'),
            createAttribute(password, 'string'),
        ])
        if (!validation.flag) return resError(res, 400, validation.cause);

        //user exists
        const user = await User.findOne({ email: email });
        if (!user) return resError(res, 400, 'user not found. register first');

        //password correct
        const match = await bcrypt.compare(password, user.password)
        if (!match) return resError(res, 400, 'wrong credentials');

        //CREATE ACCESSTOKEN
        const accessToken = jwt.sign({
            email: user.email,
            id: user.id,
            username: user.username,
            role: user.role
        }, process.env.ACCESS_KEY, { expiresIn: '1h' });

        //CREATE REFRESH TOKEN
        const refreshToken = jwt.sign({
            email: user.email,
            id: user.id,
            username: user.username,
            role: user.role
        }, process.env.ACCESS_KEY, { expiresIn: '7d' });

        //SAVE REFRESH TOKEN TO DB
        user.refreshToken = refreshToken;
        await user.save();

        //set tokens in cookies
        res.cookie("accessToken", accessToken, { httpOnly: true, domain: "localhost", path: "/api", maxAge: 60 * 60 * 1000, sameSite: "none", secure: true })
        res.cookie('refreshToken', refreshToken, { httpOnly: true, domain: "localhost", path: '/api', maxAge: 7 * 24 * 60 * 60 * 1000, sameSite: 'none', secure: true })

        //send tokens as data
        return resData(res, { accessToken: accessToken, refreshToken: refreshToken });

    } catch (error) {
        resError(res, 500, error.message);
    }
}

/**
 * logout
Request Parameters: None
Request Body Content: None
Response data Content: A message confirming successful logout
Example: res.status(200).json({data: {message: "User logged out"}})
Returns a 400 error if the request does not have a refresh token in the cookies
Returns a 400 error if the refresh token in the request's cookies does not represent a user in the database
 */
export const logout = async (req, res) => {
    try {

        /**optional */
        //        const simpleAuth = verifyAuth(req, res, { authType: 'Simple' });
        //        if (!simpleAuth.flag) {
        //            return res.status(401).json({ error: simpleAuth.cause + ": Are you logged in?" }) // unauthorized
        //        }

        const refreshToken = req.cookies.refreshToken;
        //console.log(refreshToken)
        if (!refreshToken || refreshToken == "" || refreshToken.length == 0) return resError(res, 400, "no refresh token found");

        const user = await User.findOne({ refreshToken: refreshToken });
        if (!user) return resError(res, 400, 'user not found. Are you registered or logged in?');


        user.refreshToken = null;
        await user.save();

        res.cookie("accessToken", "", { httpOnly: true, path: '/api', maxAge: 0, sameSite: 'none', secure: true });
        res.cookie('refreshToken', "", { httpOnly: true, path: '/api', maxAge: 0, sameSite: 'none', secure: true });

        return resData(res, { message: "User logged out" });

    } catch (error) {
        resError(res, 500, error.message);
    }
}