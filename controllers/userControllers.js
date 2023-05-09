const userModel = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { token } = require("morgan");
const bannerModel = require("../models/bannerModel");
const twilioFunctions = require("../config/twilio");
const categoryModel = require("../models/categoryModel");
const productModel = require("../models/productModel");
const cartModel = require("../models/addtocartModel");
const addressModel = require("../models/addressModel");
const userHelper = require("../helper/user-helper");

const { OrderItem } = require("../models/orders");
const { response } = require("express");

module.exports = {
  userIndexPage: async (req, res) => {
    const userId = req.userId;
    let allCategory = await categoryModel.find();
    let allBanner = await bannerModel.find();
    let allProduct = await productModel.find().skip(3).limit(8);
    let topratedProduct = await productModel.find().limit(3);
    let latestproduct = await productModel.find().skip(6).limit(3);
    let cartCount = await userHelper.getCartCount(userId);

    console.log("userId", userId);
    userModel
      .findById(userId)
      .then((user) => {
        if (!user) {
          console.log("user not found");
          return res.redirect("/login");
        }

        res.render("user/userIndex", {
          userlay: true,
          loggedIn: true,
          user,
          allBanner,
          allCategory,
          allProduct,
          topratedProduct,
          latestproduct,
          cartCount,
        });
      })
      .catch((err) => {
        console.log("error decoding token:", err);
        return res.redirect("/login");
      });
  },

  userLogout: (req, res) => {
    res.cookie("token", "", { expires: new Date(0) });
    res.redirect("/");
  },

  userRegistation: (req, res) => {
    bcrypt.hash(req.body.password, 10, (err, hash) => {
      if (err) {
        return res.json({
          success: 0,
          message: "Hashing issue",
        });
      } else {
        const userMod = new userModel({
          firstname: req.body.firstname,
          lastname: req.body.lastname,
          email: req.body.email,
          phoneNumber: req.body.phoneNumber,
          password: hash,
        });
        userMod
          .save()
          .then((data) => {
            res.redirect("/login");
            console.log(data);
          })
          .catch((err) => {
            res.json({
              success: 0,
              message: "error occuured while saving" + err,
            });
          });
      }
    });
  },
  userLogin: async (req, res) => {
    let allBanner = await bannerModel.find();
    const email = req.body.email;
    const password = req.body.password;
    userModel
      .findOne({ email })
      .then((user) => {
        if (!user) {
          return res.render("user/userLogin", {
            message: "Account does not exist",
            userlay: true,
            loggedIn: false,
            allBanner,
            user: false,
          });
        }
        if (user.isblocked) {
          return res.render("user/userLogin", {
            message: "Account blocked ! Contact Admin!!!",
            userlay: true,
            loggedIn: false,
            allBanner,
            user: false,
          });
        }
        bcrypt.compare(password, user.password, (err, result) => {
          if (err) {
            return res.render("user/userLogin", {
              message: "Authentication failed",
              loggedIn: false,
              userlay: true,
              allBanner,
              user: false,
            });
          }
          if (result) {
            const payload = {
              userId: user._id,
              isAdmin: user.isAdmin,
            };
            const token = jwt.sign(payload, "secretOgani");
            res.cookie("token", token, { httpOnly: true });
            if (user.isAdmin) {
              res.redirect("/admin/dashboard");
            } else {
              res.redirect("/user/index");
            }
          } else {
            return res.render("user/userLogin", {
              message: "Invalid password",
              loggedIn: false,
              userlay: true,
              allBanner,
              user: false,
            });
          }
        });
      })
      .catch((error) => {
        return res.render("user/userLogin", {
          message: "Authentication failed",
          loggedIn: false,
          userlay: true,
          allBanner,
          user: false,
        });
      });
  },

  otpLogin: async (req, res) => {
    // res.render('user/submitOtp',{userlay:true,loggedIn:false,message:false})
    let allBanner = await bannerModel.find();

    console.log(req.body);
    const mobNumber = req.body.phoneNumber;
    try {
      console.log("++++++++++++");
      const validUser = await userModel.findOne({ phoneNumber: mobNumber });
      if (validUser.isblocked) {
        return res.render("user/otpLogin", {
          userlay: true,
          loggedIn: false,
          user: false,
          allBanner,
          message: "Account blocked ! Contact Admin!!!",
        });
      }
      if (validUser !== undefined && validUser !== false) {
        console.log(validUser);
        twilioFunctions
          .generateOTP(mobNumber, "sms")
          .then((verification) => {
            console.log(req.body);
            console.log("=============");
            res.render("user/submitOtp", {
              loggedIn: false,
              userlay: true,
              user: false,
              phoneNumber: mobNumber,
              message: false,
              allBanner,
            });
            console.log(verification.status);
          })
          .catch((err) => {
            console.log(err);
            res.render("user/otpLogin", {
              userlay: true,
              loggedIn: false,
              user: false,
              allBanner,
              message: "error occured while sending otp",
            });
          });
      } else if (validUser == undefined) {
        res.render("user/otpLogin", {
          userlay: true,
          loggedIn: false,
          user: false,
          allBanner,
          message: "hello hiiii",
        });
      } else {
        res.render("user/otpLogin", {
          userlay: true,
          loggedIn: false,
          user: false,
          allBanner,
          message: "hii",
        });
      }
    } catch (err) {
      console.error(err);
    }
  },
  submitOtp: async (req, res) => {
    let mobNumber = req.body.phoneNumber;
    console.log(req.body);
    console.log("$$$$$$$$$$$$$", mobNumber);
    try {
      const user = await userModel.findOne({ phoneNumber: mobNumber });
      const enteredOTP = req.body.code;
      twilioFunctions.client.verify.v2
        .services(twilioFunctions.verifySid)
        .verificationChecks.create({ to: `+91${mobNumber}`, code: enteredOTP })
        .then((verification_check) => {
          if (verification_check.status === "approved") {
            const payload = {
              userId: user._id,
              isAdmin: user.isAdmin,
            };
            const token = jwt.sign(payload, "secretOgani");
            res.cookie("token", token, { httpOnly: true });
            if (user.isAdmin) {
              res.redirect("/admin/dashboard");
            } else {
              res.redirect("/user/index");
            }
          } else {
            res.render("../views/user/verify-mobile", {
              loginErr: true,
              user: false,
              mobile: mobNumber,
              message: false,
            });
          }
        })
        .catch((error) => {
          console.error(error);
          res.status(500).send("internal server error");
        });
    } catch (err) {
      console.error(err);
    }
  },

  viewProfile: async (req, res) => {
    const userId = req.userId;
    const profileData = await userHelper.getProfile(userId);
    try {
      const address = await userHelper.getAddress(userId);
      res.render("user/viewProfile", { userlay: false, profileData, address });
    } catch (err) {
      res.render("user/viewProfile", {
        userlay: false,
        profileData,
        address: false,
      });
    }
  },

  getEditProfile: async (req, res) => {
    let userId = req.userId;
    let profileData = await userHelper.getProfile(userId);
    console.log(profileData);
    try {
      let address = await userHelper.getAddress(userId);
      res.render("user/profile", { userlay: false, profileData, address });
    } catch (err) {
      res.render("user/profile", {
        userlay: false,
        profileData,
        address: false,
      });
    }
  },

  editProfile: async (req, res) => {
    let userId = req.userId;
    let data = req.body;
    let picture = req.images || req.image;
    // console.log(images);
    let user = await userHelper.editProfile(userId, data, picture);
    console.log(user);
    res.redirect("/user/index");
  },

  //shopping
  getShopping: async (req, res) => {
    let userId = req.userId;
    let allCategory = await categoryModel.find();
    let allBanner = await bannerModel.find();
    let allProduct = await productModel.find();
    let cartCount = await userHelper.getCartCount(userId);
    if (userId) {
      let user = await userModel.findById(userId);
      res.render("user/shoppingPage", {
        userlay: true,
        loggedIn: true,
        allBanner,
        allCategory,
        user,
        allProduct,
        cartCount,
      });
    } else {
      //   let allCategory=await categoryModel.find()
      // let allBanner = await bannerModel.find();
      res.render("user/shoppingPage", {
        userlay: true,
        loggedIn: false,
        allBanner,
        allCategory,
        user: false,
      });
    }
  },

  getCart: async (req, res) => {
    let userId = req.userId;
    let user = await userModel.findById(userId);
    let allBanner = await bannerModel.find();
    let cartProduct = await cartModel.findOne({ user: userId });
    let cartCount = await userHelper.getCartCount(userId);
    const productDetails = [];
    let total = 0;
    let subTotal = 0;
    if (!cartProduct) {
      // create a new address document if the user doesn't have one
      let cart = new cartModel({
        user: userId,
        products: [],
      });
      await cart.save();
      res.render("user/addtocart", {
        userlay: true,
        allBanner,
        loggedIn: true,
        user,
        productDetails,
        subTotal,
        total,
        cartCount,
      });
    } else {
      const products = cartProduct.products;
      for (let i = 0; i < products.length; i++) {
        const product = await productModel.findById(products[i].productId);
        console.log(product);
        productDetails.push({
          id: product._id,
          name: product.pname,
          description: product.pdescription,
          category: product.pcategory,
          price: product.pprice,
          image: product.pimages,
          countInStock: product.pcountInStock,
          quantity: products[i].quantity,
          totalPrice: parseInt(product.pprice) * parseInt(products[i].quantity),
        });
        total += parseInt(product.pprice) * parseInt(products[i].quantity);
        subTotal += parseInt(product.pprice) * parseInt(products[i].quantity);
      }

      res.render("user/addtocart", {
        userlay: true,
        allBanner,
        loggedIn: true,
        user,
        productDetails,
        subTotal,
        total,
        cartCount,
      });
    }
  },

  addtocart: async (req, res) => {
    const productId = req.params.id;
    const userId = req.userId;
    try {
      const user = await userModel.findById(userId);
      if (!user) {
        return res.status(404).json({
          status: "error",
          message: "User not found",
        });
      }

      const product = await productModel.findById(productId);
      let price = product.pprice;
      let productName = product.pname;
      const productImage = product.pimages[0];
      console.log("p", productName);
      console.log("p", price);
      console.log("heeeeeeee", productImage);

      if (!product) {
        return res.status(404).json({
          status: "error",
          message: "Product not found",
        });
      }
      const isProductExist = await cartModel.findOne({
        user: userId,
        "products.productId": productId,
      });

      if (isProductExist) {
        await cartModel.updateOne(
          { user: userId, "products.productId": productId },
          { $inc: { "products.$.quantity": 1 } }
        );
        await cartModel.updateOne(
          { user: userId, "products.productId": productId },
          { $inc: { "products.$.price": price } }
        );
      } else {
        await cartModel.updateOne(
          { user: userId },
          {
            $push: {
              products: {
                productId,
                quantity: 1,
                price,
                productName,
                productImage,
              },
            },
          },
          { upsert: true }
        );
      }

      res.redirect("/user/getCart");
    } catch (error) {
      console.error(error);
      res.status(500).json({
        status: "error",
        message: "Something went wrong",
      });
    }
  },
  removeProductFromCart: async (req, res) => {
    try {
      const userId = req.userId;
      const productId = req.params.id;
      const updatedCart = await cartModel.findOneAndUpdate(
        { user: userId },
        { $pull: { products: { productId: productId } } },
        { new: true }
      );

      if (!updatedCart) {
        throw new Error("cart not found");
      }
      res.status(200).json({
        status: "succees",
        message: "Product removed from cart",
      });
    } catch (error) {
      console.error(error.message);
      res.status(500).json({
        status: "error",
        message: "Something went wrong",
      });
    }
  },

  getCheckOut: async (req, res) => {
    try {
      const userId = req.userId;

      let user = await userModel.findById(userId);

      let allBanner = await bannerModel.find();

      let cartProduct = await cartModel.findOne({ user: userId });

      const products = cartProduct.products;
      const productDetails = [];
      let total = 0;
      let subTotal = 0;
      for (let i = 0; i < products.length; i++) {
        const product = await productModel.findById(products[i].productId);
        productDetails.push({
          id: product._id,
          name: product.pname,
          description: product.pdescription,
          category: product.pcategory,
          price: product.pprice,
          image: product.pimages,
          countInStock: product.pcountInStock,
          quantity: products[i].quantity,
          totalPrice: parseInt(product.pprice) * parseInt(products[i].quantity),
        });
        total += parseInt(product.pprice) * parseInt(products[i].quantity);
        subTotal += parseInt(product.pprice) * parseInt(products[i].quantity);
      }

      let cartCount = await userHelper.getCartCount(userId);
      let addressColl = await addressModel.findOne({ user: userId });
      if (!addressColl) {
        res.render("user/checkoutPage", {
          userlay: true,
          loggedIn: true,
          user,
          allBanner,
          separateAddresses: false,
          productDetails,
          subTotal,
          total,
          cartCount,
        });
      } else {
        let separateAddresses = addressColl.addresses.map((address) => {
          return address;
        });

        res.render("user/checkoutPage", {
          userlay: true,
          loggedIn: true,
          user,
          allBanner,
          separateAddresses,
          productDetails,
          subTotal,
          total,
          cartCount,
        });
      }
    } catch (err) {
      res.json({
        sucess: 0,
        message: "error from db" + err,
      });
    }
  },

  getAddress: async (req, res) => {
    const userId = req.userId;
    try {
      let allBanner = await bannerModel.find();
      let user = await userModel.findById(userId);
      let cartCount = await userHelper.getCartCount(userId);
        res.render("user/newAddress", {
          userlay: true,
          loggedIn: true,
          user,
          allBanner,
          cartCount
        });
    } catch (err) {
      res.json({
        sucess: 0,
        message: "error from db",
      });
    }
  },
  addAddress: async (req, res) => {
    const userId = req.userId;
    const addressInfo = req.body;

    try {
      let user = await userModel.findById(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // check if the user already has an address document
      let address = await addressModel.findOne({ user: userId });
      if (!address) {
        // create a new address document if the user doesn't have one
        address = new addressModel({
          user: userId,
          addresses: [],
        });
      }

      // create a new address object
      const newAddress = {
        id: addressInfo._id,
        fname: addressInfo.fname,
        lname: addressInfo.lname,
        address: addressInfo.address,
        city: addressInfo.city,
        state: addressInfo.state,
        pincode: addressInfo.pincode,
        phone: addressInfo.phone,
        email: addressInfo.email,
      };

      // add the new address to the addresses array
      address.addresses.push(newAddress);

      // save the updated address document
      await address.save();

      res.redirect("/user/checkOut");
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Internal server error" });
    }
  },

  getAddressChange: async (req, res) => {
    try {
      const userId = req.userId;

      let user = await userModel.findById(userId);

      let allBanner = await bannerModel.find();

      let cartProduct = await cartModel.findOne({ user: userId });

      const products = cartProduct.products;
      const productDetails = [];
      let total = 0;
      let subTotal = 0;
      for (let i = 0; i < products.length; i++) {
        const product = await productModel.findById(products[i].productId);
        productDetails.push({
          id: product._id,
          name: product.pname,
          description: product.pdescription,
          category: product.pcategory,
          price: product.pprice,
          image: product.pimages,
          countInStock: product.pcountInStock,
          quantity: products[i].quantity,
          totalPrice: parseInt(product.pprice) * parseInt(products[i].quantity),
        });
        total += parseInt(product.pprice) * parseInt(products[i].quantity);
        subTotal += parseInt(product.pprice) * parseInt(products[i].quantity);
      }

      let cartCount = await userHelper.getCartCount(userId);
      let addressColl = await addressModel.findOne({ user: userId });
      let separateAddresses = addressColl.addresses.map((address) => {
        return address;
      });

      res.render("user/checkoutPage", {
        userlay: true,
        loggedIn: true,
        user,
        allBanner,
        separateAddresses,
        productDetails,
        subTotal,
        total,
        cartCount,
      });
    } catch (err) {
      res.json({
        sucess: 0,
        message: "error from db" + err,
      });
    }
  },

  placeOrder: async (req, res) => {
    console.log("+++++", req.body);
    const userId = req.userId;
    let products = await userHelper.getProduct(userId);
    console.log(products);
    let totalPrice = await userHelper.getTotalPrice(userId);
    await userHelper
      .postPlaceOrder(req.body, products, totalPrice)
      .then((response) => {
        if (req.body["paymentMethod"] === "cash_on_delivery") {
          res.json({
            codSuccess: true,
            orderId: response._id,
            addressId:response.address
          });
        } else {
          userHelper
            .generateRazorpay(response._id, totalPrice,response.address)
            .then((response) => {
              res.json(response);
            });
        }
      });
  },
  orderInfo: async (req, res) => {
    console.log("testinggggggggggggggg");
    const userId=req.userId
    const orderId = req.params.id;
    const addressId=req.params.id1
    let orderInfo = await userHelper.getOrderInfo(orderId);
    let addressColl = await addressModel.findOne({ user: userId });
    let selectedAddress = addressColl.addresses.find(address => address._id.toString() === addressId);
    console.log(selectedAddress);
    // console.log(product);
    const product = await productModel.findOne(orderInfo?.productId);
    // console.log(address,'000000000000000');
    console.log(orderInfo, "=========1");
    res.render("user/orderList", {
      userlay: false,
      orderInfo,
      selectedAddress,
      product,
    });
  },

  verifyPayment: (req, res) => {
    userHelper.verifyPayment(req.body).then(() => {
      console.log(req.body["order[receipt]"]);
      console.log(req.body["order[notes][address]"]);
      userHelper.changePaymentStatus(req.body["order[receipt]"]).then(() => {
        
        console.log("payment success");
        res.json({ status: true,
        orderId:req.body["order[receipt]"],
         addresId:req.body["order[notes][address]"]});
      })
      .catch((err) => {
        res.json({ status: false, errMsg: "" });
        console.log("payment failed");
      });

    });
  },

  getEditAddress:async(req,res)=>{

    const userId = req.userId;
    const addressId=req.params.id
    try {
      let allBanner = await bannerModel.find();
      let user = await userModel.findById(userId);
      let cartCount = await userHelper.getCartCount(userId);
      let addressColl = await addressModel.findOne({ user: userId });
      let selectedAddress = addressColl.addresses.find(address => address._id.toString() === addressId);
        res.render("user/editAddress", {
          userlay: true,
          loggedIn: true,
          user,
          allBanner,
          cartCount,
          selectedAddress
        });
    } catch (err) {
      res.json({
        sucess: 0,
        message: "error from db",
      });
    }

  },

  editAddress:async(req,res)=>{
    console.log('testingggg');
    const userId=req.userId
    const addressId=req.params.id
    const data=req.body
    await userHelper.editAddress(data,userId,addressId).then((response)=>{
      res.redirect('/user/checkOut')
    })

  },

  deleteAddress:(req,res)=>{
    const userId=req.userId
    let id=req.parms.id

    userHelper.deleteAddress(id,userId).then((response)=>{

      res.redirect('/user/checkOut')

    })
  }

};



  
  