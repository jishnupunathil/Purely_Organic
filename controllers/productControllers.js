const bannerModel = require("../models/bannerModel");
const productModel = require("../models/productModel");
const mongoose = require("mongoose");
const userModel = require("../models/userModel");
const categoryModel = require("../models/categoryModel");
const userHelper = require("../helper/user-helper");

module.exports = {
  addProduct: async (req, res) => {
    try {
      const productMod = new productModel({
        pname: req.body.pname,
        pdescription: req.body.pdescription,
        pcategory: req.body.pcategory,
        pprice: req.body.pprice,
        pimages: req.images || req.image,
        pcountInStock: req.body.pcountInStock,
      });
      await productMod.save();
      res.redirect("/admin/productList");
    } catch (err) {
      res.render("admin/addProducts", { userlay: false });
    }
  },
  productList: async (req, res) => {
    try {
      const allproduct = await productModel.find();
      res.render("admin/productList", {
        userlay: false,
        allproduct,
      });
    } catch (err) {
      res.render("admin/dashboard", { userlay: false });
    }
  },
  singleProduct: async (req, res) => {
    let id = req.params.id;
      try {
        let allCategory = await categoryModel.find();
        let singleProduct = await productModel.findById({ _id: id });
        res.render("admin/editProduct", {
          userlay: false,
          singleProduct,
          allCategory,
        });
      } catch (err) {
        res.render("admin/productList", { userlay: false });
      }
  },
  updateProduct: async (req, res) => {
    try {
      let id = req.params.id;
      let files = req.files;
      if (files.length === 0) {
        await productModel.findByIdAndUpdate(id, {
          pname: req.body.pname,
          pdescription: req.body.pdescription,
          pcategory: req.body.pcategory,
          pprice: req.body.pprice,
          pcountInStock: req.body.pcountInStock,
        });
      } else {
        await productModel.findByIdAndUpdate(id, {
          pname: req.body.pname,
          pdescription: req.body.pdescription,
          pcategory: req.body.pcategory,
          pprice: req.body.pprice,
          pimages: req.images || req.image,
          pcountInStock: req.body.pcountInStock,
        });
      }

      res.redirect("/admin/productList");
      // }
    } catch (err) {
      res.redirect("/admin/singleProduct/:id");
    }
  },
  deleteProduct: async (req, res) => {
    try {
      let id = req.params.id;

      await productModel.deleteOne({ _id: id });
      res.redirect("/admin/productList");
    } catch (err) {
      res.render("admin/productList", { userlay: false, allproduct });
    }
    // }
  },
  sproductUser: async (req, res) => {
    let id = req.params.id;
    const userId = req.userId;
    try {
      let allProduct = await productModel.find().skip(4).limit(4);
      let allBanner = await bannerModel.find();
      let allCategory = await categoryModel.find();
      let user = await userModel.findById(userId);
      let singleProduct = await productModel.findById({ _id: id });
      let cartCount = await userHelper.getCartCount(userId);
      let wishCount = await userHelper.countWish(userId);
      res.render("user/productPage", {
        userlay: true,
        singleProduct,
        allBanner,
        loggedIn: true,
        user,
        allCategory,
        allProduct,
        cartCount,
        wishCount,
      });
    } catch (err) {
      res.redirect("/user/index");
    }
  },
};
