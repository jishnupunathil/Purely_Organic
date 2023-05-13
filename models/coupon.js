const mongoose = require('mongoose')

const couponSchema = new mongoose.Schema({

code: { type: String, required: true },
discount: { type: Number, required: true },
maxdiscount: { type: Number, required: true },
  expirationDate: { type: Date, required: true },
  usedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'user' }]
},
{timestamps:true}
)

const couponModel = mongoose.model('coupon', couponSchema)

module.exports = couponModel