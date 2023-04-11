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
        pcountInStock: req.body.pcountInStock,
      });
      const images = req.files.map((file) => file.path);
      productMod.pimages = images;
      await productMod.save();
      res.redirect('/admin/productList')
    } catch (err) {
      res.render('admin/addProducts',{userlay:false})
    }
  },
  productList: async (req, res) => {
    try {
            const page = parseInt(req.query.page) || 1;
            const pageSize = parseInt(req.query.pageSize) || 4;
            const skip = (page - 1) * pageSize;
    
            const allproduct = await productModel.find().skip(skip).limit(pageSize);
            const count = await productModel.countDocuments();
    
            const totalPages = Math.ceil(count / pageSize);
            const currentPage = page > totalPages ? totalPages : page;

      // let allproduct = await productModel.find();
      res.render('admin/productList', {
        userlay: false,
        allproduct,
        totalPages,
        currentPage,
        pageSize
    });
      // res.render('admin/productList',{userlay:false,allproduct})
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
            await productModel.findByIdAndUpdate({_id:id},{
                $set:
            {
            pname:req.body.pname,
            pdescription:req.body.pdescription,
            pcategory:req.body.pcategory,
            pprice:req.body.pprice,
            // pimage:req.body.image,
            pcountInStock:req.body.pcountInStock,
            // unit:req.body.unit
            }
        })
        res.redirect('/admin/productList')
        // res.json({
        //   success:1,
        //   message:"data updated"
        // })
        }
        catch(err){
            res.render('admin/editProduct',{userlay:false,singleProduct})
            // res.json({
            //   success:1,
            //   message:'error'+err
            // })
    }
}
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
