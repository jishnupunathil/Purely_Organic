const productModel = require("../models/productModel");
const mongoose = require("mongoose");

module.exports = {
  addProduct: async (req, res) => {
    console.log("body", req.body);
    try {
      const productMod = new productModel({
        name: req.body.name,
        description: req.body.description,
        category: req.body.category,
        price: req.body.price,
        quantity: req.body.quantity,
        unit: req.body.unit,
      });
      const images = req.files.map((file) => file.path);
      productMod.images = images;

      await productMod.save();

      res.render('admin/productList',{userlay:false})
    } catch (err) {
      res.render('admin/addProducts',{userlay:false})
    }
  },
  productList: async (req, res) => {
    try {
      let allproduct = await productModel.find();
      res.render('admin/productList',{userlay:false,allproduct})
    } catch (err) {
      res.render('admin/dashboard',{userlay:false})
    }
  },
  singleProduct: async (req, res) => {
    let id = req.params.id;
    let ValidId = mongoose.Types.ObjectId.isValid(id);
    if (ValidId) {
      try {
        let singleProduct = await productModel.findById({ _id: id });
        res.json({
          success: 1,
          message: "single product listed",
          item: singleProduct,
        });
      } catch (err) {
        res.json({
          success: 0,
          message: "error occured while listing single product" + err,
        });
      }
    } else {
      res.json({
        success: 0,
        message: "invalid id",
      });
    }
  },
  updateProduct:async(req,res)=>{
    let id=req.params.id
    validId=mongoose.Types.ObjectId.isValid(id)
    if(validId){
        try{
            await productModel.findByIdAndUpdate({_id:id},{
                $set:
            {
            name:req.body.name,
            description:req.body.description,
            category:req.body.category,
            price:req.body.price,
            image:req.body.image,
            quantity:req.body.quantity,
            unit:req.body.unit
            }
        })
        res.json({
            success:1,
            message:'product updated successfuly'
        })
        }
        catch(err){
            res.json({
                success:0,
                message:'error occured while updating'+err
            })
    }
}
},
deleteProduct:async (req,res)=>{
    let id=req.params.id

    let validId=mongoose.Types.ObjectId.isValid(id)
    if (validId){
        try{
            await productModel.deleteOne({_id:id})
            res.json({
                success:1,
                message:'product deleted successsfully'
            })
        }
        catch(err){

            res.json({
                success:0,
                message:'error occured while deleting'+err
            })

        }
    }
}
}
