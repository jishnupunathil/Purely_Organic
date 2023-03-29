const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    firstname: { type: String },
    lastname: { type: String },
    email: { type: String, unique:true },
    phoneNumber: { type: Number, unique: true },
    password: { type: String }
})

const studentModel = mongoose.model('user', userSchema)

module.exports = studentModel