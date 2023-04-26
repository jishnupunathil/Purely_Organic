const productModel = require("../models/productModel");
const mongoose = require("mongoose");

module.exports = {
  addProduct: async (req, res) => {
    console.log("body", req.body);
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
    let ValidId = mongoose.Types.ObjectId.isValid(id);
    if (ValidId) {
      try {
        let singleProduct = await productModel.findById({ _id: id });
        res.render("admin/editProduct", { userlay: false, singleProduct });
      } catch (err) {
        res.render("admin/productList", { userlay: false });
      }
    } else {
      res.json({
        success: 0,
        message: "invalid id",
      });
    }
  },
  updateProduct: async (req, res) => {
    try {
    let id = req.params.id;
    console.log(id);
        await productModel.findByIdAndUpdate(id, {
          pname: req.body.pname,
          pdescription:req.body.pdescription,
          pcategory: req.body.pcategory,
          pprice: req.body.pprice,
          // pimages: req.images || req.image,
          pcountInStock: req.body.pcountInStock,
          

        });
        res.redirect("/admin/productList");
      // }
      } catch (err) {
        res.redirect("/admin/singleProduct/:id");
      }
  },
  deleteProduct: async (req, res) => {
    try {
    let id = req.params.id;
    console.log(id);
    // let validId = mongoose.Types.ObjectId.isValid(id);
    // if (validId) {
        await productModel.deleteOne({ _id: id });
        res.redirect("/admin/productList");
      } catch (err) {
        res.render("admin/productList", { userlay: false, allproduct });
      }
    // }
  },
};
