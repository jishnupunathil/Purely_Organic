const productModel = require("../models/productModel");
const categoryModel = require("../models/categoryModel");
const bannerModel = require("../models/bannerModel");
const jwt = require("jsonwebtoken");
const { default: mongoose } = require("mongoose");
const userHelper = require("../helper/user-helper");
require("dotenv").config();

module.exports = {
  indexPage: async (req, res) => {
    try {
      let allProduct = await productModel.find().skip(3).limit(8);
      let allBanner = await bannerModel.find();
      let allCategory = await categoryModel.find();
      let topratedProduct = await productModel.find().limit(3);
      let latestproduct = await productModel.find().skip(6).limit(3);
      res.render("user/userIndex", {
        userlay: true,
        loggedIn: false,
        allBanner,
        allProduct,
        allCategory,
        user: false,
        latestproduct,
        topratedProduct,
      });
    } catch (err) {
      res.json({
        success: 0,
        message: "error while listing" + err,
      });
    }
  },
  loginPage: async (req, res) => {
    try{
    let allBanner = await bannerModel.find();
    res.render("user/userLogin", {
      userlay: true,
      message: false,
      loggedIn: false,
      allBanner,
      user: false,
    });
  }catch(err){
    res.redirect("/");
  }
  },

  otpPage: async (req, res) => {
    let allBanner = await bannerModel.find();
    res.render("user/otpLogin", {
      userlay: true,
      loggedIn: false,
      message: false,
      allBanner,
      user: false,
    });
  },

  registrationPage: async (req, res) => {
    try{
    let allBanner = await bannerModel.find();
    res.render("user/userSignup", {
      userlay: true,
      loggedIn: false,
      allBanner,
      user: false,
      message: false,
    });
  }catch(err){
    res.redirect("/");
  }
  },

  shoppingPage: async (req, res) => {
    try{
    let allCategory = await categoryModel.find();
    let allBanner = await bannerModel.find();
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 8;
    const skip = (page - 1) * pageSize;
    const allProduct = await productModel.find().skip(skip).limit(pageSize);
    const count = await productModel.countDocuments();
    const totalPages = Math.ceil(count / pageSize);
    const currentPage = page > totalPages ? totalPages : page;
      res.render("user/shoppingPage", {
        userlay: true,
        loggedIn: false,
        allBanner,
        allCategory,
        user:false,
        allProduct,
        totalPages,
        currentPage,
        pageSize,
        cartCount:0,
        wishCount:0
      });
    }catch(err){
      res.redirect("/");
    }
    },
  sproductUser: async (req, res) => {
    try {
      const id = req.params.id;
      let allProduct = await productModel.find().skip(4).limit(4);
      let allBanner = await bannerModel.find();
      let allCategory = await categoryModel.find();
      let singleProduct = await productModel.findById({ _id: id });
      res.render("user/productPage", {
        userlay: true,
        singleProduct,
        allBanner,
        loggedIn: false,
        user: false,
        allCategory,
        allProduct,
        cartCount: 0,
        wishCount: 0,
      });
    } catch (err) {
      res.redirect("/user/index");
    }
  },
  forgotPassword: async (req, res) => {
    let allBanner = await bannerModel.find();
    res.render("user/frgtPass", {
      userlay: true,
      loggedIn: false,
      message: false,
      allBanner,
      user: false,
    });
  },

  guestSearch: async (req, res) => {
    try {
      let allBanner = await bannerModel.find();
      let allCategory = await categoryModel.find();
      const search = req.query.search;
      const products = await userHelper.guestSearchQuery(search);
      res.render("user/searchResult", {
        userlay: true,
        products,
        allBanner,
        allCategory,
        loggedIn: false,
        user:false,
        cartCount:0,
        wishCount:0,
      });
    } catch (err) {
    }
  },
};
