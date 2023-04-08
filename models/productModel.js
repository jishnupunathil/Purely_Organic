const mongoose = require('mongoose')

const productSchema = new mongoose.Schema({
    name: { type: String },
    description: { type: String },
    category: { type: String},
    price: { type: Number},
    images:[{type:String}],
    quantity: { type: Number },
    unit:{type:Number}
})

const productModel = mongoose.model('product', productSchema)

module.exports = productModel