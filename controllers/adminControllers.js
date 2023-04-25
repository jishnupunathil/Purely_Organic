const { default: mongoose } = require("mongoose");
const userModel = require("../models/userModel");

module.exports={
    getDashboard:(req,res)=>{
        
        res.render('admin/dashboard',{userlay:false})
    },
    getAddProductPage:(req,res)=>{

        res.render('admin/addProducts',{userlay:false})

    },
    logout:(req,res)=>{
        res.cookie('token', '', { expires: new Date(0) });
    res.redirect('/')
    },
    userList:async(req,res)=>{
        try{
            
    
            const allUser = await userModel.find()
            // const count = await userModel.countDocuments();
    
            res.render('admin/userList', {
                userlay: false,
                allUser
            });
        } catch (err) {
            res.render('admin/dashboard', {userlay:false});
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
        console.log(id);
        validId=mongoose.Types.ObjectId.isValid(id)
        if(validId){
            try{
                await userModel.findByIdAndUpdate(id,{
                isblocked:true
            })
        
            res.redirect('/admin/userList')
            }
            catch(err){
                res.redirect('/admin/userList')
        }
    }
    },
    unBlockUser:async(req,res)=>{
        let id=req.params.id
        validId=mongoose.Types.ObjectId.isValid(id)
        if(validId){
            try{
                await userModel.findByIdAndUpdate({_id:id},{

                
                isblocked:false
                
            })
            res.redirect('/admin/userList')
            }
            catch(err){
                res.res.redirect('/admin/userList')
        }
    }
    }
}