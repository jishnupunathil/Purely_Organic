const mongoose = require("mongoose");
const bannerModel = require("../models/bannerModel");


module.exports={
    addBanner: async (req, res) => {
        console.log("body", req.body);
        try {
          const bannerMod = new bannerModel({
            bname: req.body.bname,
            bimages: req.images || req.image,
          });
          await bannerMod.save();
          res.redirect('/admin/banners')
          
        } catch (err) {
          res.redirect('/admin/banners')
          
        }
      },
      bannerList: async (req, res) => {
        try {
          let allBanner = await bannerModel.find();
          res.render('admin/banners',{allBanner,userlay:false})
        } catch (err) {
          res.json({
            success:0,
            message:'error while listing'+err
          })
        }
      },

}