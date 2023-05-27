import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import jwt from 'jsonwebtoken';
import { verifyAuth } from './utils.js';

/**
 * register
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

        const username = req.body.username;
        const email = req.body.email;
        const password = req.body.password;

        if (!username || !email || !password) return res.status(400).json({ error: "incomplete attributes" });

        if (username == "" || email == "" || password == "") return res.status(400).json({ error: "empty strings" });

        //Returns a 400 error if the email in the request body is not in a valid email format

        //**optional? check if logged out */
        const simpleAuth = verifyAuth(req, res, { authType: 'Simple' });
        if (simpleAuth.authorized) {
            return res.status(400).json({ error: "please logout first" });
        }

        let existingUser = await User.findOne({ email: req.body.email });
        if (existingUser) return res.status(400).json({ error: "email already registered" });

        existingUser = await User.findOne({ username: req.body.username });
        if (existingUser) return res.status(400).json({ error: "username already taken" });

        const hashedPassword = await bcrypt.hash(password, 12);
        const newUser = await User.create({
            username,
            email,
            password: hashedPassword,
            //default role Regular
        });

        await newUser.save();
        return res.status(200).json({ data: { message: "User added successfully" } });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};


/**
 * registerAdmin
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

        const simpleAuth = verifyAuth(req, res, { authType: 'Simple' });
        if (simpleAuth.authorized) {
            return res.status(400).json({ error: "please logout first" }); // unauthorized
        }

        const { username, email, password } = req.body;

        if (!username || !email || !password) return res.status(400).json({ error: "incomplete attributes" });

        if (username == "" || email == "" || password == "") return res.status(400).json({ error: "empty strings" });

        const hasAdminRights = 1; //await Admin.findOne({ email: email });
        if (!hasAdminRights) return res.status(400).json({ error: "you cannot register as admin" });

        let existingUser = await User.findOne({ email: email });
        if (existingUser) {
            if (existingUser.role == "Admin") return res.status(400).json({ error: "email already registered as admin" });
            else {
                existingUser.role = "Admin";
                await existingUser.save();
                return res.status(200).json({ data: 'you are now admin. Username unchanged' });
            }
        }

        existingUser = await User.findOne({ username: username });
        if (existingUser) return res.status(400).json({ error: "username already taken" });

        const hashedPassword = await bcrypt.hash(password, 12);
        const newUser = await User.create({
            username,
            email,
            password: hashedPassword,
            role: "Admin"
        });
        await newUser.save();
        return res.status(200).json({ data: { message: "User added successfully" } });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

/**
 * login
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

    /**optional ? */
    const simpleAuth = verifyAuth(req, res, { authType: 'Simple' });
    if (simpleAuth.authorized) {
        return res.status(200).json({ data: 'You are already logged in. Not you? Logout first' }); // unauthorized
    }

    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: "incomplete attributes" });
    if (email == "" || password == "") return res.status(400).json({ error: "empty strings" });

    //validate email format

    const existingUser = await User.findOne({ email: email });
    if (!existingUser) return res.status(400).json({ error: 'user not found. register first' });

    try {

        const match = await bcrypt.compare(password, existingUser.password)
        if (!match) return res.status(400).json({ error: 'wrong credentials' });

        //CREATE ACCESSTOKEN
        const accessToken = jwt.sign({
            email: existingUser.email,
            id: existingUser.id,
            username: existingUser.username,
            role: existingUser.role
        }, process.env.ACCESS_KEY, { expiresIn: '1h' });

        //CREATE REFRESH TOKEN
        const refreshToken = jwt.sign({
            email: existingUser.email,
            id: existingUser.id,
            username: existingUser.username,
            role: existingUser.role
        }, process.env.ACCESS_KEY, { expiresIn: '7d' });

        //SAVE REFRESH TOKEN TO DB
        existingUser.refreshToken = refreshToken;
        await existingUser.save();

        res.cookie("accessToken", accessToken, { httpOnly: true, domain: "localhost", path: "/api", maxAge: 60 * 60 * 1000, sameSite: "none", secure: true })
        res.cookie('refreshToken', refreshToken, { httpOnly: true, domain: "localhost", path: '/api', maxAge: 7 * 24 * 60 * 60 * 1000, sameSite: 'none', secure: true })
        return res.status(200).json({ data: { accessToken: accessToken, refreshToken: refreshToken } });

    } catch (error) {
        res.status(500).json({ error: err.message });
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

    /**optional */
    const simpleAuth = verifyAuth(req, res, { authType: 'Simple' });
    if (!simpleAuth.authorized) {
        return res.status(401).json({ error: simpleAuth.cause + ": Are you logged in?" }) // unauthorized
    }

    const refreshToken = req.cookies.refreshToken;
    console.log(refreshToken)
    if (!refreshToken || refreshToken.length == 0) return res.status(400).json({ error: "no refresh token found" });

    const user = await User.findOne({ refreshToken: refreshToken });
    if (!user) return res.status(400).json({ error: 'user not found. Are you registered or logged in?' })
    try {
        user.refreshToken = null;
        res.cookie("accessToken", "", { httpOnly: true, path: '/api', maxAge: 0, sameSite: 'none', secure: true });
        res.cookie('refreshToken', "", { httpOnly: true, path: '/api', maxAge: 0, sameSite: 'none', secure: true });
        await user.save();
        return res.status(200).json({ data: { message: "User logged out" } });
    } catch (error) {
        res.status(500).json({ error: err.message });
    }
}