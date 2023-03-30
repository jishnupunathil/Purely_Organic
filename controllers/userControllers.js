const userModel=require('../models/userModel')
const mongoose=require('mongoose')
const bcrypt=require('bcrypt')

module.exports={

userIndexPage:((req,res)=>{
    res.render("user/userIndex")
}),

userLoginPage:((req,res)=>{
    res.render("user/userLogin")
}),
userRegistrationPage:((req,res)=>{
    res.render("user/userSignup")
}),
userRegistation:((req,res)=>{
   
    // console.log('body',req.body);
    bcrypt.hash(req.body.password, 10,(err, hash) => {
    if (err) {
        return res.json({
            success: 0,
            message: 'Hashing issue'
        })
    }
    else{
            const userMod=new userModel({
              firstname: req.body.firstname,
              lastname: req.body.lastname,
              email: req.body.email,
              phoneNumber:req.body.phoneNumber,
              password: hash
            })
            userMod.save()
            .then((data)=>{
            // res.json({
    
            //     success:1,
            //     message:'user added successfuly'
    
            // })
            res.redirect('/user/login')
            console.log(data);
        })
        .catch((err)=>{
            res.json({
                success:0,
                message:'error occuured while saving'+err
            })
        })
    }
})
 }),

 userLogin:((req,res)=>{
    userModel.find({email:req.body.email})
    .exec()
    .then((result)=>{
        if(result.length<1){
            return res.json({
                success:0,
                message:'Account doesnt exist'
            })
        }
        const user=result[0]
        bcrypt.compare(req.body.password,user.password)
        .then((result)=>{
            if(result){
                res.redirect('/')
            }else{
                return res.json({
                    success: 0,
                    message: ' wrong password '
                })
            }
        }).catch((error)=>{
           console.log(error.message)
        })
    })
 })
}