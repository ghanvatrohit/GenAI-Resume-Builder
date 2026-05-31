const mongoose = require('mongoose');

const blacklistTokenSchema = new mongoose.Schema({
    token: {
        type: String,
        required: [true,"Token is required to be added to blacklist"],
    }
},{
    timestamps: true,
})

const blacklistTokenModel = mongoose.model('blacklistTokens',blacklistTokenSchema);

module.exports = blacklistTokenModel;