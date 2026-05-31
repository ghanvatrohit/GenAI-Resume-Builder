const mongoose = require('mongoose');


const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: [true, 'Username must be unique'],
    },

    email: {
        type: String,
        required: true,
        unique: [true, 'Account with this email already exists'],
    },

    password: {
        type: String,
        required: true,

    }
})

const userModel = mongoose.model('users',userSchema);

module.exports = userModel;