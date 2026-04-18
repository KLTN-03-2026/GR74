const mongoose = require('mongoose')

const botSchema = new mongoose.Schema({
    name: string,
    publicKey: String,
    secretKey: String,
}, {
    timestamps: true
})

module.exports = mongoose.model('bot', botSchema)