const addressModel = require("../models/addressModel")
const cartModel = require("../models/addtocartModel")
const { Order } = require("../models/orders")
const productModel = require("../models/productModel")
const userModel = require("../models/userModel")


module.exports={

    getCartCount:(userId)=>{
        return new Promise(async (resolve, reject) => {
            let count = 0
            let cart = await cartModel.findOne({user:userId})
            if (cart) {
                count = cart?.products?.length || 0
            }
            resolve(count)
        })

      },

      getProfile: (userId) => {
        return new Promise(async (resolve, reject) => {
          try {
            let profile = await userModel.findById(userId);
            if (profile) {
              resolve(profile);
            } else {
              // Return a default value or reject with an error message
              reject(new Error("User profile not found"));
            }
          } catch (err) {
            reject(err);
          }
        });
      },
      editProfile:(userId,data,picture)=>{
        console.log(picture);
        return new Promise(async(resolve,reject)=>{
          try{
            let updatedUser=await userModel.findByIdAndUpdate(userId,{
              firstname:data.firstname,
              lasttname:data.lastname,
              email:data.email,
              phoneNumber:data.phoneNumber,
              image:picture.image
            },{new:true})
            if(updatedUser){
              resolve(updatedUser)
            }else{
              reject(new Error(" profile cannot updated"));
            }
          }catch(err){
            reject(err)
          }
        })
      },
      getAddress:(userId)=>{
          return new Promise(async(resolve,reject)=>{
            try{
              let addressColl=await addressModel.findOne({user:userId})

              if(!addressColl){
                reject(new Error(" address collection not found"));
              }else{
                let separateAddresses = addressColl.addresses.map((address) => {
                  return address;
                })
        
                resolve(separateAddresses)
          
              }
            }catch(err){
             
            }
          })
      },

      getProduct:(userId)=>{

        return new Promise(async(resolve,reject)=>{

          try{
          let cartProduct=await cartModel.findOne({user:userId})
          const products = cartProduct.products;
          if(products){
            resolve(products)
          }else{
            reject(new Error("products not found"))
          }
          }catch(err){

          }

        })
      },
      getTotalPrice:(userId)=>{
        return new Promise(async(resolve,reject)=>{
          try{
          let cartProduct=await cartModel.findOne({user:userId})
          const products = cartProduct.products;
          const productDetails = [];
          let total = 0;
          for (let i = 0; i < products.length; i++) {
            const product = await productModel.findById(products[i].productId);
            productDetails.push({
              quantity: products[i].quantity,
              totalPrice: parseInt(product.pprice) * parseInt(products[i].quantity),
            });
            total += parseInt(product.pprice) * parseInt(products[i].quantity);
          }
          resolve(total)
        }catch(err){
          reject(err)
        }
        })
      },

      postPlaceOrder:(order,products,total)=>{
        return new Promise(async(resolve,reject)=>{
          try {
            console.log(order.userId);
            let status = order.paymentMethod === "cash_on_delivery" ? "placed" : "pending";
            let orderObj = {
              user_id: order.userId,
              payment_method: order.paymentMethod,
              total_amount: total,
              payment_status: status,
              order_status: status,
              address: order.address, // ensure this is a valid ObjectId
              items: products.map(product => ({
                product_id: product.productId,
                quantity: product.quantity,
                price: product.price,
              })),
            };
            console.log(orderObj,'dsffasd');
        
            const newOrder = new Order(orderObj);
            await newOrder.save();

            let p=await cartModel.findOneAndRemove({user:order.userId})
            resolve(newOrder);
          } catch (error) {
            reject(error);
          }
        })
        
      }

}