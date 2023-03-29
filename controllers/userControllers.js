const userModel=require('../models/userModel')
const mongoose=require('mongoose')

module.exports={
 userRegistation:(async(req,res)=>{
   
    console.log('body',req.body);
        try{  
            const userMod=new userModel({
              firstname: req.body.firstname,
              lastname: req.body.lastname,
              email: req.body.email,
              phoneNumber:req.body.phoneNumber,
              password: req.body.password
            })
            await userMod.save()
    
            res.json({
    
                success:1,
                message:'user added successfuly'
    
            })
    
        }
        catch(err){
            res.json({
                success:0,
                message:'error occuured while saving'+err
            })
        }
    })
}