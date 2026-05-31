const userModel = require('../models/user.model');
const userModule = require('../models/user.model');
const blacklistModel = require('../models/blacklist.model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
/**
 * @name registerUserController
 * @description Register a new user ,expects username, email and password in the request body
 * @access Public
 */
async function registerUserController(req, res) {
    const {username, email, password} = req.body;

    if(!username || !email || !password) {
        return res.status(400).json({
            message: 'please provide username, email and password'
        });
    }

    const isUserAlreadyExists = await userModule.findOne({
        $or: [
            {username},
            {email}
        ]
    });

    if(isUserAlreadyExists) {

        /*isUserAlreadyExists.username == username*/
        return res.status(400).json({
            message: 'Account with this username or email already exists'
        });
    }

    const hash = await bcrypt.hash(password, 10);
    
    const User = await userModel.create({
        username,
        email,
        password: hash
    });

    const token = jwt.sign(
        { id: User._id, username: User.username },
        process.env.JWT_SECRET,
        { expiresIn: '1d' }
    )

    res.cookie('token', token)

    return res.status(201).json({
        message: 'User registered successfully',
        user: {
            id: User._id,
            username: User.username,
            email: User.email,
        }
    })
}

/**
 * @route GET /api/auth/logout
 * @description clear token from user cookies and add the token to blacklist
 * @access Public
 */
async function logoutUserController(req, res) {
    const token = req.cookies.token;

    console.log("Token received for logout:", token);

    if (token) {
        try {
            await blacklistModel.create({ token });
            console.log("Token added to blacklist database!");
        } catch (err) {
            console.log("Error adding to blacklist:", err.message);
        }
    } else {
        console.log("No token found in cookies.");
    }

    res.clearCookie('token');

    return res.status(200).json({
        message: 'User logged out successfully'
    });
}

/**
 * @route POST /api/auth/login
 * @description Login a user ,expects email and password in the request body
 * @access Public
 */

async function loginUserController(req, res) {
    const {email, password} = req.body;
    const user = await userModel.findOne({email});
    
    if(!user) {
        return res.status(400).json({
            message: 'Invalid email or password'
        });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if(!isPasswordValid) {
        return res.status(400).json({
            message: 'Invalid email or password'
        });
    }

    const token = jwt.sign(
        { id: user._id, username: user.username },
        process.env.JWT_SECRET,
        { expiresIn: '1d' }
    )

    res.cookie('token', token)

    return res.status(200).json({
        message: 'User logged in successfully',
        user: {
            id: user._id,
            username: user.username,
            email: user.email,
        }
    })
}

/**
 *@name getMeController
 *@description Get the current logged in user details.
 *@access Private
 */
async function getMeController(req, res) {
    const user = await userModel.findById(req.user.id);

    res.status(200).json({
        message: 'User details fetched successfully',
        user: {
            id: user._id,
            username: user.username,
            email: user.email,
        }
    })
}

module.exports = {
    registerUserController,
    loginUserController,
    logoutUserController,
    getMeController
}
