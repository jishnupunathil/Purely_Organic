const userModel = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { token } = require("morgan");
const bannerModel = require("../models/bannerModel");
const twilioFunctions=require('../config/twilio')
const categoryModel=require('../models/categoryModel');
const productModel = require("../models/productModel");
const cartModel = require("../models/addtocartModel");

module.exports = {
  
  userIndexPage:async (req, res) => {
    let allCategory=await categoryModel.find()
    let allBanner = await bannerModel.find();
    let allProduct=await productModel.find().skip(3).limit(8)
      const userId = req.userId;
      console.log("userId",userId)
      userModel.findById(userId)
      .then((user) => {
        if (!user) {
          console.log('user not found');
          return res.redirect('/login');
        }
        
        
        res.render('user/userIndex', { userlay: true, loggedIn: true, user,allBanner,allCategory,allProduct });
      }) 
      .catch ((err)=> {
        console.log('error decoding token:', err);
        return res.redirect('/login');
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
            res.redirect("/login");
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
  userLogin: async(req, res) => {
    let allBanner = await bannerModel.find();
    const email = req.body.email;
    const password = req.body.password;
    userModel.findOne({ email })
      .then((user) => {
        if (!user) {
          return res.render('user/userLogin', { message: "Account does not exist", userlay: true, loggedIn: false,allBanner });
        }
        bcrypt.compare(password, user.password, (err, result) => {
          if (err) {
            return res.render('user/userLogin', { message: "Authentication failed", loggedIn: false, userlay: true,allBanner });
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
            return res.render('user/userLogin', { message: "Invalid password", loggedIn: false, userlay: true,allBanner });
          }
        });
      })
      .catch((error) => {
        return res.render('user/userLogin', { message: "Authentication failed", loggedIn: false, userlay: true,allBanner });
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
    let allCategory=await categoryModel.find()
    let allBanner = await bannerModel.find();
    let allProduct=await productModel.find()
    if(userId){
      let user=await userModel.findById(userId)
    res.render('user/shoppingPage',{userlay:true,loggedIn:true,allBanner,allCategory,user,allProduct})
    }else{
    //   let allCategory=await categoryModel.find()
    // let allBanner = await bannerModel.find();
    res.render('user/shoppingPage',{userlay:true,loggedIn:false,allBanner,allCategory,user:false})
    }
  },

  getCart:async(req,res)=>{
    let userId=req.userId
    let user=await userModel.findById(userId)
    let allBanner = await bannerModel.find();
    let cartProduct=await cartModel.findOne({user:userId})
    console.log("cartProduct",cartProduct)
   const products = cartProduct.products;
   const productDetails = [];
   let total = 0;
   let subTotal = 0;
for (let i = 0; i < products.length; i++) {
  const product = await productModel.findById(products[i].productId);
  productDetails.push({
    id:product._id,
    name: product.pname,
    description: product.pdescription,
    category: product.pcategory,
    price: product.pprice,
    image: product.pimages,
    countInStock: product.pcountInStock,
    quantity:products[i].quantity,
    totalPrice: parseInt(product.pprice) * parseInt(products[i].quantity)
  });
  total += parseInt(product.pprice) * parseInt(products[i].quantity);
  subTotal += parseInt(product.pprice) * parseInt(products[i].quantity);
}
    console.log("productDetails",{productDetails,subTotal,total})

    res.render('user/addtocart',{userlay:true,allBanner,loggedIn:true,user,productDetails,subTotal,total})


  },

  addtocart:async(req,res)=>{
    const productId = req.params.id;
    const userId = req.userId;
    try {
      const user = await userModel.findById(userId);
      if (!user) {
        return res.status(404).json({
          status: "error",
          message: "User not found",
        });
      }
  
      const product = await productModel.findById(productId);
      if (!product) {
        return res.status(404).json({
          status: "error",
          message: "Product not found",
        });
      }
      const isProductExist = await cartModel.findOne({
        user: userId,
        "products.productId": productId,
      });
  
      if (isProductExist) {
        await cartModel.updateOne(
          { user: userId, "products.productId": productId },
          { $inc: { "products.$.quantity": 1 } }
        );
      } else {
        await cartModel.updateOne(
          { user: userId },
          { $push: { products: { productId, quantity: 1 } } },
          { upsert: true }
        );
      }
      res.redirect('/user/getCart')
    } catch (error) {
      console.error(error);
      res.status(500).json({
        status: "error",
        message: "Something went wrong",
      });
    }
  },
  removeProductFromCart: async(req,res)=>{
    console.log("testing..")
    try{
      const userId = req.userId;
      const productId = req.params.id
      const updatedCart = await cartModel.findOneAndUpdate({user: userId},
        {$pull: {products:{productId:productId}}},
        {new:true}
        );

        if(!updatedCart){
          throw new Error('cart not found')
        }
     res.status(200).json({
      status: "sucees",
      message:"Product removed from cart"
     })
    }catch(error){
      console.error(error.message);
      res.status(500).json({
        status: "error",
        message: "Something went wrong",
      });
    }
  },

  getCheckOut:async(req,res)=>{
    
    const userId = req.userId;
    try{
    let allBanner = await bannerModel.find();
    let user=await userModel.findById(userId)
    res.render('user/checkoutPage',{userlay:true,loggedIn:true,user,allBanner})
  }catch(err){
    res.json({
      sucess:0,
      message:'error from db'

    })
  }
}
}