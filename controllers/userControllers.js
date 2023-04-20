const userModel = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { token } = require("morgan");

module.exports = {
  indexPage: (req, res) => {
    res.render("user/userIndex",{userlay:true,loggedIn:false});
  },
  userIndexPage: (req, res) => {
    const token = req.cookies.token;
  
    if (!token) {
      // user is not authenticated
      return res.redirect('/user/login');
    }
  
    try {
      const decodedToken = jwt.verify(token, 'secretUser');
      const userId = decodedToken.userId;
      console.log('userId:', userId);
  
      userModel.findById(userId)
      .then((user) => {
        if (!user) {
          console.log('user not found');
          return res.redirect('/user/login');
        }
        console.log('user:', user);
  
        res.render('user/userIndex', { userlay: true, loggedIn: true, user });
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
  
  
  userLoginPage: (req, res) => {
    const token=req.cookies.token
    if(!token){
      res.render("user/userLogin",{userlay:true,message:false,loggedIn:false});
    }else {
      jwt.verify(token, "secretAdmin", (err, decodedToken) => {
        if (err) {
          // If there's an error decoding the token, render the login page
          res.render("user/userLogin", {
            userlay: true,
            message: false,
            loggedIn: false,
          });
        } else if (decodedToken.isAdmin) {
          jwt.verify(token, "secretAdmin", (err, decodedAdminToken) => {
            if (err) {
              // If there's an error decoding the admin token, render the login page
              res.render("user/userLogin", {
                userlay: true,
                message: false,
                loggedIn: false,
              });
            } else if(decodedAdminToken){
              res.redirect('/admin/dashboard');
            }
          });
        } else {
          // If the token belongs to a user, redirect to the user index page
          res.redirect('/user/index');
        }
      });
    }
  },
  userLogout:(req,res)=>{
    res.cookie('token', '', { expires: new Date(0) });
    res.redirect('/')
  },
  userRegistrationPage: (req, res) => {
    res.render("user/userSignup",{userlay:true,loggedIn:false});
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
    userModel
      .findOne({ email })
      .then((user) => {
        if (!user) {
          return res.render('user/userLogin', { message: "Account does not exist",userlay:true,loggedIn:false});
        }
        bcrypt.compare(password, user.password, (err, result) => {
          if (err) {
            return res.render('user/userLogin', {message: "Authentication failed",loggedIn:false,userlay:true });
          }
          if (result) {
            const payload = {
              userId: user._id,
              isAdmin: user.isAdmin,
            };
            if(user.isAdmin===true){
            const token = jwt.sign(payload, "secretAdmin");
            res.cookie('token', token, { httpOnly: true });
            res.redirect('/admin/dashboard')
          }else if(user.isAdmin===false){
            const userToken = jwt.sign(payload, "secretUser");
            res.cookie('token', userToken, { httpOnly: true });
            res.redirect('/user/index')
          }
          } else {
            return res.render('user/userLogin', {message: "Invalid password",loggedIn:false,userlay:true });
          }
        });
      })
      .catch((error) => {
        return res.render('user/userLogin', {message: "Authentication failed",loggedIn:false,userlay:true });
      });
  },

  otp:(req,res)=>{
    res.render('user/otpLogin',{userlay:true,loggedIn:false,message:false})
  },
  otpLogin:(req,res)=>{
    
  }
}
