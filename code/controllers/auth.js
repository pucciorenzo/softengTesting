import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import jwt from 'jsonwebtoken';
import { verifyAuth } from './utils.js';

/**
 * Register a new user in the system
  - Request Body Content: An object having attributes `username`, `email` and `password`
  - Response `data` Content: A message confirming successful insertion
  - Optional behavior:
    - error 400 is returned if there is already a user with the same username and/or email
 */
export const register = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const existingUser = await User.findOne({ email: req.body.email });
        if (existingUser) return res.status(400).json({ message: "you are already registered" });

        //--//
        const existingUsername = await User.findOne({ username: req.body.username });
        if (existingUsername) return res.status(400).json({ message: "username already taken" });
        // validate username and password here?
        //--//

        const hashedPassword = await bcrypt.hash(password, 12);
        const newUser = await User.create({
            username,
            email,
            password: hashedPassword,
        });
        await newUser.save();
        res.status(200).json('user added succesfully');
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};


/**
 * Register a new user in the system with an Admin role
  - Request Body Content: An object having attributes `username`, `email` and `password`
  - Response `data` Content: A message confirming successful insertion
  - Optional behavior:
    - error 400 is returned if there is already a user with the same username and/or email
 */
export const registerAdmin = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        //--//
        const hasAdminRights = 1; //await Admin.findOne({ email: req.body.email });
        if (!hasAdminRights) return res.status(400).json({ message: "you cannot register as admin" });
        //--//

        const existingUser = await User.findOne({ email: req.body.email });

        //--// if (existingUser) return res.status(400).json({ message: "you are already registered" });
        if (existingUser) {
            if (existingUser.role == "Admin") return res.status(400).json({ message: "you are already registered" });
            else {
                existingUser.role = "Admin";
                await existingUser.save();
                return res.status(200).json('admin added succesfully');
            }
        }
        const existingUsername = await User.findOne({ username: req.body.username });
        if (existingUsername) return res.status(400).json({ message: "username already taken" });
        // validate username and password here?
        //--//

        const hashedPassword = await bcrypt.hash(password, 12);
        const newUser = await User.create({
            username,
            email,
            password: hashedPassword,
            role: "Admin"
        });
        await newUser.save();
        res.status(200).json('admin added succesfully');
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

/**
 * Perform login 
  - Request Body Content: An object having attributes `email` and `password`
  - Response `data` Content: An object with the created accessToken and refreshToken
  - Optional behavior:
    - error 400 is returned if the user does not exist
    - error 400 is returned if the supplied password does not match with the one in the database
 */
export const login = async (req, res) => {
    const { email, password } = req.body;
    const cookie = req.cookies;
    const existingUser = await User.findOne({ email: email });
    if (!existingUser) return res.status(400).json('please you need to register');
    try {
        const match = await bcrypt.compare(password, existingUser.password)
        if (!match) return res.status(400).json('wrong credentials')
        //CREATE ACCESSTOKEN
        const accessToken = jwt.sign({
            email: existingUser.email,
            id: existingUser.id,
            username: existingUser.username,
            role: existingUser.role
        }, process.env.ACCESS_KEY, { expiresIn: '1h' })
        //CREATE REFRESH TOKEN
        const refreshToken = jwt.sign({
            email: existingUser.email,
            id: existingUser.id,
            username: existingUser.username,
            role: existingUser.role
        }, process.env.ACCESS_KEY, { expiresIn: '7d' })
        //SAVE REFRESH TOKEN TO DB
        existingUser.refreshToken = refreshToken
        const savedUser = await existingUser.save()
        res.cookie("accessToken", accessToken, { httpOnly: true, domain: "localhost", path: "/api", maxAge: 60 * 60 * 1000, sameSite: "none", secure: true })
        res.cookie('refreshToken', refreshToken, { httpOnly: true, domain: "localhost", path: '/api', maxAge: 7 * 24 * 60 * 60 * 1000, sameSite: 'none', secure: true })
        res.status(200).json({ data: { accessToken: accessToken, refreshToken: refreshToken } })
    } catch (error) {
        res.status(500).json({ error: err.message });
    }
}

/**
 * Perform logout
  - Auth type: Simple
  - Request Body Content: None
  - Response `data` Content: A message confirming successful logout
  - Optional behavior:
    - error 400 is returned if the user does not exist
 */
export const logout = async (req, res) => {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) return res.status(400).json("User not found. Are you logged in?");
    const user = await User.findOne({ refreshToken: refreshToken });
    if (!user) return res.status(400).json('user not found. Are you registered?')
    try {
        user.refreshToken = null;
        res.cookie("accessToken", "", { httpOnly: true, path: '/api', maxAge: 0, sameSite: 'none', secure: true });
        res.cookie('refreshToken', "", { httpOnly: true, path: '/api', maxAge: 0, sameSite: 'none', secure: true });
        const savedUser = await user.save();
        res.status(200).json('logged out successfully');
    } catch (error) {
        res.status(500).json({ error: err.message });
    }
}
