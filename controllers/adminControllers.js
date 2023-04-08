const { default: mongoose } = require("mongoose");
const userModel = require("../models/userModel");

module.exports={
    getDashboard:(req,res)=>{
        res.render('admin/dashboard',{userlay:false})
    },
    getAddProduct:(req,res)=>{

        res.render('admin/addProducts',{userlay:false})

    },
    logout:(req,res)=>{
        res.redirect('/')
    },
    userList:async(req,res)=>{
        try{
            let allUser=await userModel.find()
            res.render('admin/userList',{userlay:false,allUser})
    } catch (err) {
      res.render('admin/dashboard',{userlay:false})
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
    },
    blockUser:async(req,res)=>{
        let id=req.params.id
        validId=mongoose.Types.ObjectId.isValid(id)
        if(validId){
            try{
                await userModel.findByIdAndUpdate({_id:id},{
                    $set:
                {
                isblocked:true
                }
            })
            res.json({
                success:1,
                message:'user blocked'
            })
            }
            catch(err){
                res.json({
                    success:0,
                    message:'error occured while updating'+err
                })
        }
    }
    },
    unblockUser:async(req,res)=>{
        let id=req.params.id
        validId=mongoose.Types.ObjectId.isValid(id)
        if(validId){
            try{
                await userModel.findByIdAndUpdate({_id:id},{
                    $set:
                {
                isblocked:false
                }
            })
            res.json({
                success:1,
                message:'user unblocked'
            })
            }
            catch(err){
                res.json({
                    success:0,
                    message:'error occured while updating'+err
                })
        }
    }
    }
}