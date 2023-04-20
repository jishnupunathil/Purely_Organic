const mongoose = require('mongoose')

const productSchema = new mongoose.Schema({
    pname: { type: String },
    pdescription: { type: String },
    pcategory: { type: String},
    pprice: { type: Number},
    pimages:[{type:String}],
    pcountInStock: { type: Number },
},{
    timestamps:true
})

const productModel = mongoose.model('product', productSchema)

module.exports = productModel