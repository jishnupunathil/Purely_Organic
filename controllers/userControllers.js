const userModel = require("../models/userModel");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

module.exports = {
  userIndexPage: (req, res) => {
    res.render("user/userIndex");
  },

  userLoginPage: (req, res) => {
    res.render("user/userLogin");
  },
  userRegistrationPage: (req, res) => {
    res.render("user/userSignup");
  },
  userRegistation: (req, res) => {
    // console.log('body',req.body);
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
            // res.json({

            //     success:1,
            //     message:'user added successfuly'

            // })
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
          return res.json({
            success: 0,
            message: "Account does not exist",
          });
        }
        bcrypt.compare(password, user.password, (err, result) => {
          if (err) {
            return res.json({
              success: 0,
              message: "Authentication failed",
            });
          }
          if (result) {
            const payload = {
              userId: user._id,
              isAdmin: user.isAdmin,
            };
            if(user.isAdmin===true){
            const token = jwt.sign(payload, "secretAdmin");
            return res.json({
              success: 1,
              token,
              message: "admin Login successful",
            });
          }else{
            const userToken = jwt.sign(payload, "secretUser");
            return res.json({
              success: 1,
              userToken,
              message: "user Login successful",
            });
          }
          } else {
            return res.json({
              success: 0,
              message: "Authentication failed",
            });
          }
        });
      })
      .catch((error) => {
        return res.json({
          success: 0,
          message: "Authentication failed",
        });
      });
  },
};
