const categoryModel = require("../models/categoryModel");
const mongoose = require("mongoose");

module.exports = {
  categoryList: async (req, res) => {
    try {
      let allCategory = await categoryModel.find();
      res.render("admin/categories", {
        allCategory,
        userlay: false,
        message: false,
      });
    } catch (err) {
      res.json({
        success: 0,
        message: "error while listing" + err,
      });
    }
  },
  addCategory: async (req, res) => {
    console.log("body", req.body);
    try {
      const categoryMod = new categoryModel({
        cname: req.body.cname,
        cdescription: req.body.cdescription,
        cimages: req.images || req.image,
      });

      await categoryMod.save();

      res.redirect("/admin/category");
    } catch (err) {
      let allCategory = await categoryModel.find();
      res.render("admin/categories", {
        allCategory,
        userlay: false,
        message: "Same Category Exists",
      });
    }
  },
  singleCategory: async (req, res) => {
    let id = req.params.id;
    let ValidId = mongoose.Types.ObjectId.isValid(id);
    if (ValidId) {
      try {
        let singleCategory = await categoryModel.findById({ _id: id });
        res.render("admin/updateCategory", { userlay: false, singleCategory });
      } catch (err) {
        res.render("admin/categories", { userlay: false });
      }
    } else {
      res.json({
        success: 0,
        message: "invalid id",
      });
    }
  },
  updateCategory: async (req, res) => {
    let id = req.params.id;
    console.log(id);
    validId = mongoose.Types.ObjectId.isValid(id);
    if (validId) {
      try {
        await categoryModel.findByIdAndUpdate(id, {
          cname: req.body.cname,
          cdescription: req.body.cdescription,
        });
        res.redirect("/admin/category");
      } catch (err) {
        res.redirect("/admin/singleCategory/:id");
      }
    }
  },
  deleteCategory: async (req, res) => {
    let id = req.params.id;
    try {
      await categoryModel.deleteOne({ _id: id });
      res.redirect("/admin/category");
    } catch (err) {
      res.render("admin/productList", { userlay: false, allproduct });
    }
  },
};
