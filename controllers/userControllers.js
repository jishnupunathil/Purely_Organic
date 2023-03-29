const userModel=require('../models/userModel')
const mongoose=require('mongoose')
const bcrypt=require('bcrypt')

module.exports={

 userRegistation:((req,res)=>{
   
    console.log('body',req.body);
    bcrypt.hash(req.body.password, 10, async(err, hash) => {
    if (err) {
        return res.json({
            success: 0,
            message: 'Hashing issue'
        })
    }
    else{
        try{  
            const userMod=new userModel({
              firstname: req.body.firstname,
              lastname: req.body.lastname,
              email: req.body.email,
              phoneNumber:req.body.phoneNumber,
              password: hash
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
    }
})

console.log(req.body);
})
}