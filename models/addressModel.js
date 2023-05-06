const mongoose = require('mongoose')

const addressSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true,
      },
      addresses: [
        {
          _id: {
            type: mongoose.Schema.Types.ObjectId,
            default: () => new mongoose.Types.ObjectId(),
          },
          fname: {type: String,},
          lname:{type:String},
          address:{type:String},
          city:{type:String},
          state:{type:String},
          pincode:{type:Number},
          phone:{type:Number},
          email:{type:String},
          default:{type:Boolean,default:false}
        },
      ],
},{
    timestamps:true
}
)

const addressModel = mongoose.model('address', addressSchema)

module.exports = addressModel