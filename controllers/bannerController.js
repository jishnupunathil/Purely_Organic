const mongoose = require("mongoose");
const bannerModel = require("../models/bannerModel");
const categoryModel = require("../models/categoryModel");

module.exports = {
  addBanner: async (req, res) => {
    console.log("body", req.body);
    try {
      const bannerMod = new bannerModel({
        bname: req.body.bname,
        bimages: req.images || req.image,
      });
      await bannerMod.save();
      res.redirect("/admin/banners");
    } catch (err) {
      res.redirect("/admin/banners");
    }
  },
  bannerList: async (req, res) => {
    try {
      let allBanner = await bannerModel.find();
      res.render("admin/banners", { allBanner, userlay: false });
    } catch (err) {
      res.json({
        success: 0,
        message: "error while listing" + err,
      });
    }
  },
  deleteBanner: async (req, res) => {
    try {
      let id = req.params.id;
      console.log(id);
      await bannerModel.deleteOne({ _id: id });
      res.redirect("/admin/banners");
    } catch (err) {
      res.render("admin/banners");
    }
  },
  singleBanner: async (req, res) => {
    let id = req.params.id;
    console.log(id);
    let ValidId = mongoose.Types.ObjectId.isValid(id);
    if (ValidId) {
      try {
        let singleBanner = await bannerModel.findById({ _id: id });
        console.log(singleBanner);
        res.render("admin/editBanner", { userlay: false, singleBanner });
      } catch (err) {
        res.render("admin/banners", { userlay: false });
      }
    } else {
      res.json({
        success: 0,
        message: "invalid id",
      });
    }
  },
  updateBanner: async (req, res) => {
    try {
      let id = req.params.id;
      if (req.files.length === 0) {
        await bannerModel.findByIdAndUpdate(id, {
          bname: req.body.bname,
        });
      } else {
        await bannerModel.findByIdAndUpdate(id, {
          bname: req.body.bname,
          bimages: req.images || req.image,
        });
      }

      res.redirect("/admin/banners");
      // }
    } catch (err) {
      res.redirect("/admin/updateBanner/:id");
    }
  },
};
