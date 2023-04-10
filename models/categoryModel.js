const mongoose = require('mongoose')

const categorySchema = new mongoose.Schema({
    cname: { type: String },
},{
    timestamps:true
})

const categoryModel = mongoose.model('category', categorySchema)

module.exports = categoryModel