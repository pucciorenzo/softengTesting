import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import jwt from 'jsonwebtoken';

export const register = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const existingUser = await User.findOne({ email: req.body.email });
        if (existingUser) return res.status(400).json({ message: "you are already registered" });
        const hashedPassword = await bcrypt.hash(password, 12);
        const newUser = await User.create({
            username,
            email,
            password: hashedPassword,
        });
        res.status(200).json('user added succesfully');
    } catch (err) {
        res.status(500).json(err);
    }
};


//login

export const login = async (req, res) => {
    const { email, password } = req.body
    const cookie = req.cookies
    const existingUser = await User.findOne({ email: email })
    if (cookie.accessToken) return res.status(200).json("you are already logged in")
    if (!existingUser) return res.status(400).json('please you need to register')
    try {
        const match = await bcrypt.compare(password, existingUser.password)
        if (!match) return res.status(400).json('wrong credentials')

        //CREATE ACCESSTOKEN

        // jwt.sign is a method that accepts three arguments (payload, secret, options)
        const accessToken = jwt.sign({
            email: existingUser.email,
            id: existingUser._id,
            username: existingUser.username,
        },
            //ACCESS_KEY
            process.env.ACCESS_KEY,
            //options
            { expiresIn: '1h' }
        )

        //CREATE REFRESH TOKEN
        const refreshToken = jwt.sign({
            email: existingUser.email,
            username: existingUser.username,
        },
            //REFRESH_KEY
            process.env.ACCESS_KEY,

            //options
            { expiresIn: '7d' }

        )
        //SAVE REFRESH TOKEN TO DB
        existingUser.refreshToken = refreshToken
        // save the refeshtoken to the database
        const savedUser = await existingUser.save()

        //SEND REFRESH TOKEN TO CLIENT
        res.cookie("accessToken", accessToken, { httpOnly: true, domain: "localhost", path: "/api", maxAge: 60 * 60 * 1000, sameSite: "none", secure: true })
        res.cookie('refreshToken', refreshToken, { httpOnly: true, domain: "localhost", path: '/api', maxAge: 7 * 24 * 60 * 60 * 1000, sameSite: 'none', secure: true })
        res.status(200).json(accessToken)

    } catch (error) {
        res.status(500).json(error)
    }
}

export const refreshToken = async (req, res) => {
    const cookie = req.cookies
    const refreshToken = cookie.refreshToken
    if (!refreshToken) {
        return res.status(401).json({ message: "Unauthorized" }) // unauthorized
    } else {
        const user = await User.findOne({ refreshToken: refreshToken })
        if (!user) {
            res.status(400).json('user not found')
        } else {
            //verify jwt
            const accessToken = jwt.verify(
                refreshToken,
                process.env.ACCESS_KEY,
                (err, decoded) => {
                    if (err) return { error: err.message }
                    if (user.username !== decoded.username || !decoded) return { error: "wrong user" }
                    // create new accesstoken
                    const accesstoken = jwt.sign({
                        username: decoded.username,
                        email: decoded.email,
                        id: decoded._id
                    },
                        process.env.ACCESS_KEY,
                        { expiresIn: '1h' }
                    )
                    return accesstoken
                }
            )
            if (accessToken.error) {
                res.status(403).json(accessToken.error)
            } else {
                res.cookie('accessToken', accessToken, { httpOnly: true, path: '/api', maxAge: 60 * 60 * 1000, sameSite: 'none', secure: true })
                res.status(200).json({ accessToken: accessToken })
            }
        }
    }
}


//logout

export const logout = async (req, res) => {
    const cookie = req.cookies

    if (!cookie?.accessToken || cookie.accessToken === "" || !cookie.refreshToken) return res.status(200).json("you are already logged out")

    const refreshToken = cookie.refreshToken

    const user = await User.findOne({ refreshToken: refreshToken })
    if (!user) return res.status(400).json('user not found')
    try {
        user.refreshToken = null
        res.cookie("accessToken", "", { httpOnly: true, path: '/api', maxAge: 0, sameSite: 'none', secure: true })
        res.cookie('refreshToken', "", { httpOnly: true, path: '/api', maxAge: 0, sameSite: 'none', secure: true })
        const savedUser = await user.save()
        res.status(200).json('logged out')
    } catch (error) {
        res.status(500).json(error)
    }
}