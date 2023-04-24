const userModel = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { token } = require("morgan");
const bannerModel = require("../models/bannerModel");

module.exports = {
  indexPage: async(req, res) => {
    try {
      let allBanner = await bannerModel.find();
      // res.render('admin/banners',{allBanner,userlay:false})
      res.render("user/userIndex",{userlay:true,loggedIn:false,allBanner});
      console.log(allBanner);
    } catch (err) {
      res.json({
        success:0,
        message:'error while listing'+err
      })
    }
  },
  userIndexPage:async (req, res) => {
    const token = req.cookies.token;
  
    if (!token) {
      // user is not authenticated
      return res.redirect('/user/login');
    }
    let allBanner = await bannerModel.find();
    try {
      const decodedToken = jwt.verify(token, 'secretOgani');
      const userId = decodedToken.userId;
      console.log('userId:', userId);
  
      userModel.findById(userId)
      .then((user) => {
        if (!user) {
          console.log('user not found');
          return res.redirect('/user/login');
        }
        console.log('user:', user);
        
        res.render('user/userIndex', { userlay: true, loggedIn: true, user,allBanner });
      }) 
      .catch ((err)=> {
        console.log('error decoding token:', err);
        return res.redirect('/user/login');
      })
  }catch (err) {
      console.log('error decoding token:', err);
      return res.redirect('/user/login');
    }
  },
  
  
  userLoginPage: async(req, res) => {
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
  userLogout:(req,res)=>{
    res.cookie('token', '', { expires: new Date(0) });
    res.redirect('/')
  },
  userRegistrationPage: async(req, res) => {
    let allBanner = await bannerModel.find();
    res.render("user/userSignup",{userlay:true,loggedIn:false,allBanner});
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

  otp:async(req,res)=>{
    let allBanner = await bannerModel.find();
    res.render('user/otpLogin',{userlay:true,loggedIn:false,message:false,allBanner})
  },
  otpLogin:(req,res)=>{

    res.render('user/submitOtp',{userlay:true,loggedIn:false,message:false})

  },

  //shopping
  getShopping:async(req,res)=>{
    let allBanner = await bannerModel.find();
    res.render('user/shoppingPage',{userlay:true,loggedIn:true,allBanner,user:false})
  }
}
