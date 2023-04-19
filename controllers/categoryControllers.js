const categoryModel=require('../models/categoryModel')
const mongoose=require('mongoose')


module.exports={
    categoryList: async (req, res) => {
        try {
          let allCategory = await categoryModel.find();
          res.render('admin/categories',{allCategory,userlay:false})
        } catch (err) {
          res.json({
            success:0,
            message:'error while listing'+err
          })
        }
      },
    addCategory: async (req, res) => {
        console.log("body", req.body);
        try {
          const categoryMod = new categoryModel({
            cname: req.body.cname,
            cdescription:req.body.cdescription
          });
    
          await categoryMod.save();
    
          res.redirect('/admin/category')
        }
           catch (err) {
            res.json({
              success:0,
              message:'error while listing'+err
            })
        }
      },
      singleCategory:async (req,res)=>{
        let id = req.params.id;
          let ValidId = mongoose.Types.ObjectId.isValid(id);
          if (ValidId) {
            try {
              let singleCategory = await categoryModel.findById({ _id: id });
              res.render('admin/updateCategory',{userlay:false,singleCategory})
            } catch (err) {
              res.render('admin/categories',{userlay:false})
            }
          } else {
            res.json({
              success: 0,
              message: "invalid id",
            });
          }
      }
}