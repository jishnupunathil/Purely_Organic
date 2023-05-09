const { resolve } = require("path")
const addressModel = require("../models/addressModel")
const cartModel = require("../models/addtocartModel")
const { Order } = require("../models/orders")
const productModel = require("../models/productModel")
const userModel = require("../models/userModel")
const Razorpay = require("razorpay");
const { ObjectId } = require("mongodb")

var instance = new Razorpay({
  key_id: "rzp_test_LlUB5deQFFVcRd",
  key_secret: "mAJMBqsQKKjiYEALwXlN6hsr",
});


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
                productName:product.productName,
                productImage:product.productImage
              })),
            };
        
            const newOrder = new Order(orderObj);
            await newOrder.save();
            await cartModel.findOneAndRemove({user:order.userId})
            resolve(newOrder);
          } catch (error) {
            reject(error);
          }
        })
        
      },
      getOrderInfo:(orderId)=>{

        return new Promise(async(resolve,reject)=>{
          try{
          let orderInfo=await Order.findById(orderId)
          if(orderInfo){
            resolve(orderInfo)
          }else{
            reject(new Error("error finding order info"))
          }
        }catch(err){
          reject(err)
        }
        })
      },

      generateRazorpay: (orderId, total,addressId) => {
        console.log(total,'dsf');
        console.log(orderId,"heyy");
       
        return new Promise((resolve, reject) => {
          var options = {
            amount: total * 100,
            currency: "INR",
            receipt: ""+ orderId,
            notes:{
              address:""+addressId
            }
            
       

          };
          instance.orders.create(options, function (err, order) {
            if (err) {
              console.log(err);
            } else {
              console.log("new order",order);
              resolve(order);
            }
          });
        });
      },

      verifyPayment: (details) => {
        return new Promise((resolve, reject) => {
          const crypto = require("crypto");
          let hmac = crypto.createHmac("sha256", "mAJMBqsQKKjiYEALwXlN6hsr");
    
          hmac.update(
            details["payment[razorpay_order_id]"] +
              "|" +
              details["payment[razorpay_payment_id]"]
          );
          hmac = hmac.digest("hex");
          if (hmac == details["payment[razorpay_signature]"]) {
            resolve();
          } else {
            reject();
          }
        });
      },

changePaymentStatus:(orderId)=>{

      return new Promise(async(resolve,reject)=>{

           Order.updateOne({_id:orderId},
            {
              $set:{
                payment_status:"placed"
              }
            }).then(()=>{
              resolve()
            })
        })
      }

}

