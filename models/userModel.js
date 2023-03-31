const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    firstname: { type: String },
    lastname: { type: String },
    email: { type: String, unique:true },
    phoneNumber: { type: String, unique: true },
    password: { type: String },
    isAdmin:{type:Boolean,default:false}
})

const userModel = mongoose.model('user', userSchema)

module.exports = userModel