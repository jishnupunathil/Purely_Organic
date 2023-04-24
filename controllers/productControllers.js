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
      res.redirect('/admin/productList')
      // res.json({
      //   success:1,
      //   message:'added suceesfully'
      // })
    } catch (err) {
      res.render('admin/addProducts',{userlay:false})
      // res.json({
      //   success:0,
      //   message:'err'+err
      // })
    }
  },
  productList: async (req, res) => {
    try {
          
            const allproduct = await productModel.find()
            // const count = await productModel.countDocuments();

      res.render('admin/productList', {
        userlay: false,
        allproduct
    });
      
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
        res.render('admin/editProduct',{userlay:false,singleProduct})
      } catch (err) {
        res.render('admin/productList',{userlay:false})
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
    console.log(id);
    validId=mongoose.Types.ObjectId.isValid(id)
    if(validId){
      try{

        await productModel.findByIdAndUpdate(id,{
          pname:req.body.pname,
          pdescription:req.body.pdescription,
          pcategory:req.body.pcategory,
          pprice:req.body.pprice,
          // pimage:req.body.image,
          pcountInStock:req.body.pcountInStock,
          
        })
        res.redirect('/admin/productList')
      }
      catch(err){
          res.render('admin/editProduct',{userlay:false,singleProduct})
        }
          // res.json({
          //   success:1,
          //   message:'error'+err
          // })
  }
        // res.json({
        //   success:1,
        //   message:"data updated"
        
        // })
},
deleteProduct:async (req,res)=>{
    let id=req.params.id
    console.log(id);

    let validId=mongoose.Types.ObjectId.isValid(id)
    if (validId){
        try{
            await productModel.deleteOne({_id:id})
            res.redirect('/admin/productList')
        }
        catch(err){

            res.render('admin/productList',{userlay:false,allproduct})

        }
    }
}
}
