require('dotenv').config()
const mongoose = require('mongoose')
mongoose.connect(process.env.MONGODB_URL, { useNewUrlParser: true })
.then((res)=>{
    console.log('database connected successfuly')

}).catch((err)=>{
    console.log('error occured while connecting'+err);
})

const useSchema = new mongoose.Schema({
userMail:Email,
userName:String

})

const bookModel=mongoose.model('book',bookSchema)

module.exports=bookModel