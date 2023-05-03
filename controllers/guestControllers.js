const productModel=require('../models/productModel')
const categoryModel=require('../models/categoryModel')
const bannerModel = require("../models/bannerModel");
const jwt=require('jsonwebtoken');
const { default: mongoose } = require('mongoose');
require('dotenv').config()



module.exports={
    indexPage: async(req, res) => {
      
    try {
      let allProduct=await productModel.find().skip(3).limit(8)
      let allBanner = await bannerModel.find();
      let allCategory=await categoryModel.find()
      let topratedProduct=await productModel.find().limit(3)
    let latestproduct=await productModel.find().skip(6).limit(3)
      res.render("user/userIndex",{userlay:true,loggedIn:false,allBanner,allProduct,allCategory,user:false,latestproduct,topratedProduct});
    } catch (err) {
      res.json({
        success:0,
        message:'error while listing'+err
      })
    }
  },
  loginPage: async(req, res) => {
    
    let allBanner = await bannerModel.find();
      res.render("user/userLogin", {
        userlay: true,
        message: false,
        loggedIn: false,
        allBanner,
        user:false
      });
  },

  otpPage:async(req,res)=>{
    let allBanner = await bannerModel.find();
    res.render('user/otpLogin',{userlay:true,loggedIn:false,message:false,allBanner})
  },

  registrationPage: async(req, res) => {
    let allBanner = await bannerModel.find();
    res.render("user/userSignup",{userlay:true,loggedIn:false,allBanner,user:false});
  },

  shoppingPage:async(req,res)=>{
    let allProduct=await productModel.find()
    let allCategory=await categoryModel.find()
    let allBanner = await bannerModel.find();
    res.render('user/shoppingPage',{userlay:true,loggedIn:false,allBanner,allCategory,user:false,allProduct})
  },
  sproductUser: async (req, res) => {
    let id = req.params.id;
    console.log(id);
    let ValidId = mongoose.Types.ObjectId.isValid(id);
    if (ValidId) {
      try {
      let allProduct=await productModel.find().skip(4).limit(4)
      let allBanner=await bannerModel.find()
      let allCategory=await categoryModel.find()
        let singleProduct = await productModel.findById({ _id: id });
        res.render("user/productPage", { userlay: true,
           singleProduct,
           allBanner,
           loggedIn:false,
           user:false,
           allCategory,
          allProduct });
      } catch (err) {
        res.redirect("/user/index");
      }
    } else {
      res.json({
        success: 0,
        message: "invalid id",
      });
    }
  },
}