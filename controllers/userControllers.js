const userModel = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { token } = require("morgan");
const bannerModel = require("../models/bannerModel");
const twilioFunctions=require('../config/twilio')
const categoryModel=require('../models/categoryModel')

module.exports = {
  
  userIndexPage:async (req, res) => {
    let allCategory=await categoryModel.find()
    let allBanner = await bannerModel.find();
      const userId = req.userId;
      console.log("userId",userId)
      userModel.findById(userId)
      .then((user) => {
        if (!user) {
          console.log('user not found');
          return res.redirect('/user/login');
        }
        
        
        res.render('user/userIndex', { userlay: true, loggedIn: true, user,allBanner,allCategory });
      }) 
      .catch ((err)=> {
        console.log('error decoding token:', err);
        return res.redirect('/user/login');
      })
  },

  userLogout:(req,res)=>{
    res.cookie('token', '', { expires: new Date(0) });
    res.redirect('/')
  },

  userRegistation: (req, res) => {
    bcrypt.hash(req.body.password, 10, (err, hash) => {
      if (err) {
        return res.json({
          success: 0,
          message: "Hashing issue",
        });
      } else {
        const userMod = new userModel({
          firstname: req.body.firstname,
          lastname: req.body.lastname,
          email: req.body.email,
          phoneNumber: req.body.phoneNumber,
          password: hash,
        });
        userMod
          .save()
          .then((data) => {
            res.redirect("/user/login");
            console.log(data);
          })
          .catch((err) => {
            res.json({
              success: 0,
              message: "error occuured while saving" + err,
            });
          });
      }
    });
  },
  userLogin: (req, res) => {
    const email = req.body.email;
    const password = req.body.password;
    userModel.findOne({ email })
      .then((user) => {
        if (!user) {
          return res.render('user/userLogin', { message: "Account does not exist", userlay: true, loggedIn: false });
        }
        bcrypt.compare(password, user.password, (err, result) => {
          if (err) {
            return res.render('user/userLogin', { message: "Authentication failed", loggedIn: false, userlay: true });
          }
          if (result) {
            const payload = {
              userId: user._id,
              isAdmin: user.isAdmin,
            };
            const token = jwt.sign(payload, "secretOgani");
            res.cookie('token', token, { httpOnly: true });
            if (user.isAdmin) {
              res.redirect('/admin/dashboard');
            } else {
              res.redirect('/user/index');
            }
          } else {
            return res.render('user/userLogin', { message: "Invalid password", loggedIn: false, userlay: true });
          }
        });
      })
      .catch((error) => {
        return res.render('user/userLogin', { message: "Authentication failed", loggedIn: false, userlay: true });
      });
  },

 
  otpLogin:async (req,res)=>{

    // res.render('user/submitOtp',{userlay:true,loggedIn:false,message:false})
    let allBanner = await bannerModel.find();

    console.log(req.body);
        const mobNumber = req.body.phoneNumber;
        try {
            console.log("++++++++++++");
            const validUser = await userModel.findOne({phoneNumber:mobNumber})
            if (validUser !== undefined && validUser !== false) {
                console.log(validUser);
                twilioFunctions
                    .generateOTP(mobNumber, "sms")
                    .then((verification) => {
                        console.log(req.body);
                        console.log("=============");
                        res.render("user/submitOtp", {
                            loggedIn: false,
                            userlay:true,
                            user: false,
                            phoneNumber: mobNumber,
                            message: false,
                            allBanner
                        });
                        console.log(verification.status);
                    })
                    .catch((err) => {
                        console.log(err);
                        res.render("user/otpLogin", {userlay:true,loggedIn:false,user:false,allBanner,message:"hello"});
                    });
            } else if (validUser == undefined) {
                res.render("user/otpLogin", {userlay:true,loggedIn:false,user:false,allBanner,message:"hello hiiii"});
            } else {
                res.render("user/otpLogin", {userlay:true,loggedIn:false,user:false,allBanner,message:'hii'});
            }
        } catch (err) {
            console.error(err);
        }

  },
  submitOtp:async(req,res)=>{
    let mobNumber = req.body.phoneNumber;
        console.log(req.body);
        console.log("$$$$$$$$$$$$$", mobNumber);
        try {
            const user = await userModel.findOne({phoneNumber:mobNumber})
            const enteredOTP = req.body.code;
            twilioFunctions.client.verify.v2
                .services(twilioFunctions.verifySid)
                .verificationChecks.create({ to: `+91${mobNumber}`, code: enteredOTP })
                .then((verification_check) => {
                    if (verification_check.status === "approved") {
                        const payload = {
                          userId: user._id,
                          isAdmin: user.isAdmin,
                        };
                        const token = jwt.sign(payload, "secretOgani");
                        res.cookie('token', token, { httpOnly: true });
                        if (user.isAdmin) {
                          res.redirect('/admin/dashboard');
                        } else {
                          res.redirect('/user/index');
                        }
                    } else {
                        res.render("../views/user/verify-mobile", {
                            loginErr: true,
                            user: false,
                            mobile: mobNumber,
                            message: false,
                        });
                    }
                })
                .catch((error) => {
                    console.error(error);
                    res.status(500).send("internal server error");
                });
        } catch (err) {
            console.error(err);
        }
  },

  //shopping
  getShopping:async(req,res)=>{
    let userId=req.userId
    if(userId){
      let user=await userModel.findById(userId)
    let allCategory=await categoryModel.find()
    let allBanner = await bannerModel.find();
    res.render('user/shoppingPage',{userlay:true,loggedIn:true,allBanner,allCategory,user})
    }else{
    //   let allCategory=await categoryModel.find()
    // let allBanner = await bannerModel.find();
    res.render('user/shoppingPage',{userlay:true,loggedIn:false,allBanner,allCategory,user:false})
    }
  },
  
}