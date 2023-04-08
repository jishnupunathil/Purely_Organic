const userModel = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { token } = require("morgan");

module.exports = {
  userIndexPage: (req, res) => {
    res.render("user/userIndex",{userlay:true,user:false,loggedIn:false});
  },

  userLoginPage: (req, res) => {
      res.render("user/userLogin",{userlay:true,message:false,user:false,loggedIn:false});
    
  },
  userLogout:(req,res)=>{

    res.redirect('/')

  },
  userRegistrationPage: (req, res) => {
    res.render("user/userSignup",{userlay:true,user:false,loggedIn:false});
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
          return res.render('user/userLogin', {user:false, message: "Account does not exist",userlay:true,loggedIn:false});
        }
        bcrypt.compare(password, user.password, (err, result) => {
          if (err) {
            return res.render('user/userLogin', {user:false, message: "Authentication failed" });
          }
          if (result) {
            const payload = {
              userId: user._id,
              isAdmin: user.isAdmin,
            };
            if(user.isAdmin===true){
            const token = jwt.sign(payload, "secretAdmin");
            res.render('admin/adminIndex',{userlay:false})
          }else if(user.isAdmin===false){
            const userToken = jwt.sign(payload, "secretUser");
            res.render('user/userIndex',{user,userlay:true,loggedIn:true})
          }
          } else {
            return res.render('user/userLogin', { user:false,message: "Invalid password",loggedIn:false,userlay:true });
          }
        });
      })
      .catch((error) => {
        return res.render('user/userLogin', { user:false,message: "Authentication failed" });
      });
  },
}
