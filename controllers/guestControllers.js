const productModel=require('../models/productModel')
const categoryModel=require('../models/categoryModel')
const bannerModel = require("../models/bannerModel");
const jwt=require('jsonwebtoken')


module.exports={
    indexPage: async(req, res) => {
    try {
      let allProduct=await productModel.find().skip(3).limit(8)
      let allBanner = await bannerModel.find();
      let allCategory=await categoryModel.find()
      // res.render('admin/banners',{allBanner,userlay:false})
      res.render("user/userIndex",{userlay:true,loggedIn:false,allBanner,allProduct,allCategory,user:false});
      // console.log(allBanner);
    } catch (err) {
      res.json({
        success:0,
        message:'error while listing'+err
      })
    }
  },
  loginPage: async(req, res) => {
    let allBanner = await bannerModel.find();
    const token = req.cookies.token;
  
    if (!token) {
      // If there is no token, render the user login page
      res.render("user/userLogin", {
        userlay: true,
        message: false,
        loggedIn: false,
        allBanner
      });
    } else {
      // If there is a token, verify it and redirect to the appropriate page
      jwt.verify(token, "secretOgani", (err, decodedToken) => {
        if (err) {
          // If the token is invalid, clear the cookie and render the user login page
          res.clearCookie("token");
          res.render("user/userLogin", {
            userlay: true,
            message: false,
            loggedIn: false,
            allBanner
          });
        } else if (decodedToken.isAdmin) {
          // If the token belongs to an admin, redirect to the admin dashboard
          res.redirect('/admin/dashboard');
        } else {
          // If the token belongs to a regular user, redirect to the user index page
          res.redirect('/user/index');
        }
      });
    }
  },

  otpPage:async(req,res)=>{
    let allBanner = await bannerModel.find();
    res.render('user/otpLogin',{userlay:true,loggedIn:false,message:false,allBanner})
  },

  registrationPage: async(req, res) => {
    let allBanner = await bannerModel.find();
    res.render("user/userSignup",{userlay:true,loggedIn:false,allBanner});
  },

  shoppingPage:async(req,res)=>{
    let allCategory=await categoryModel.find()
    let allBanner = await bannerModel.find();
    res.render('user/shoppingPage',{userlay:true,loggedIn:false,allBanner,allCategory,user:false})
  },
  // productPage:async(req,res)=>{
  //   let allProduct=await productModel.find().skip(1).limit(8)
  //   let allBanner = await bannerModel.find();
  //   let allCategory=await categoryModel.find()
  //   res.render('user/productPage',{userlay:true,loggedIn:false,allBanner,user:false,allProduct,allCategory})
  // },
}