const categoryModel=require('../models/categoryModel')


module.exports={
    categoryList: async (req, res) => {
        try {
          let allCategory = await categoryModel.find();
          res.json({
            success:1,
            message:"category added succesfully",
            item:allCategory
          })
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
          });
    
          await categoryMod.save();
    
          res.json({
            success:1,
            message:"category added succesfully"
          })}
           catch (err) {
            res.json({
              success:0,
              message:'error while listing'+err
            })
        }
      }
}