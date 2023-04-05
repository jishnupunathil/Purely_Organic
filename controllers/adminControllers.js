const { default: mongoose } = require("mongoose");
const userModel = require("../models/userModel");

module.exports={
    userList:async(req,res)=>{
        try{
            let allUser=await userModel.find()
            res.json({
                success: 1,
                message: "user listed succesfuly",
                item: allUser,
            })
        }catch(err){
            res.json({
                success:0,
                message:'error while listing user'+err
            })

        }
    },

    singleUser:async(req,res)=>{
        let id=req.params.id
        let validId=mongoose.Types.ObjectId.isValid(id)
        if(validId){
            try{
                let singleUser=await userModel.findById({_id:id})
                res.json({
                    success: 1,
                    message: "single user listed",
                    item: singleUser
                  })
            }catch(err){
                res.json({
                    success:0,
                    message:"error while listing single user"+err
                })
            }
        }else{
            res.json({
                sucess:0,
                message:"invalid Id"
            })
        }
    }
}