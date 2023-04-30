const mongoose = require('mongoose')

const addtocartSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true,
      },
      products: [
        {
          productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "product",
            required: true,
          },
          quantity: {
            type: Number,
            required: true,
            default: 1,
          },
        },
      ],

    
},{
    timestamps:true
})

const addtocartModel = mongoose.model('addtocart', addtocartSchema)

module.exports = addtocartModel