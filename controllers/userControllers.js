const userModel = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { token } = require("morgan");
require("dotenv").config();
const bannerModel = require("../models/bannerModel");
const twilioFunctions = require("../config/twilio");
const categoryModel = require("../models/categoryModel");
const productModel = require("../models/productModel");
const cartModel = require("../models/addtocartModel");
const addressModel = require("../models/addressModel");
const userHelper = require("../helper/user-helper");
const adminHelper = require("../helper/admin-helper");

const { OrderItem, Order } = require("../models/orders");
const { response } = require("express");
const { default: mongoose } = require("mongoose");
const couponModel = require("../models/coupon");
const { generateInvoice } = require("../config/pdfKit");

module.exports = {
  userIndexPage: async (req, res) => {
    try{
    const userId = req.userId;
    let allCategory = await categoryModel.find();
    let allBanner = await bannerModel.find();
    let allProduct = await productModel.find().skip(3).limit(8);
    let topratedProduct = await productModel.find().limit(3);
    let latestproduct = await productModel.find().skip(6).limit(3);
    let cartCount = await userHelper.getCartCount(userId);
    let wishCount = await userHelper.countWish(userId); // count items in cart for user
    userModel
      .findById(userId)
      .then((user) => {
        if (!user) {
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
          wishCount,
        });
      })
      .catch((err) => {
        console.log("error decoding token:", err);
        return res.redirect("/login");
      });
    }catch(err){
      console.log(err)
    
    }
  },

  userLogout: (req, res) => {
    res.cookie("token", "", { expires: new Date(0) });
    res.redirect("/");
  },

  userRegistration: async (req, res) => {
    try {
      let allBanner = await bannerModel.find();
      const { firstname, lastname, email, phoneNumber, password } = req.body;
  
      // Check if user with the same email or phone number already exists
      const existingUser = await userModel.findOne({
        $or: [{ email: email }, { phoneNumber: phoneNumber }],
      });
  
      if (existingUser) {
        res.render("user/userSignup", {
          userlay: true,
          loggedIn: false,
          allBanner,
          user: false,
          message: "User exists!",
        });
      }
  
      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);
  
      // Create a new user instance
      const userMod = new userModel({
        firstname,
        lastname,
        email,
        phoneNumber,
        password: hashedPassword,
      });
  
      // Save the user to the database
      const savedUser = await userMod.save();
  
      res.redirect("/login");
    } catch (err) {
      console.log(err);
    }
  },
  userLogin: async (req, res) => {
    try{
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
            const token = jwt.sign(payload, process.env.SECRET_KEY);
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
    }catch(err){
      console.log(err)
    }
  },

  otpLoginPost: async (req, res) => {
    try {
      const mobNumber = req.body.phoneNumber;
      const allBanner = await bannerModel.find();
      const validUser = await userHelper.getMobileNumber(mobNumber);

      if (validUser !== undefined && validUser !== false) {
        twilioFunctions
          .generateOTP(mobNumber, "sms")
          .then((verification) => {
            res.render("user/submitOtp", {
              userlay: true,
              user: false,
              loggedIn: false,
              mobNumber: mobNumber,
              message: false,
              allBanner,
            });
            console.log(verification.status);
          })
          .catch((err) => {
            console.error(err);
          });
      } else if (validUser == undefined) {
        res.render("user/otpLogin", {
          userlay: true,
          user: false,
          loggedIn: false,
          mobNumber: mobNumber,
          message: "user is undefinded",
          allBanner,
        });
      } else {
        console.log("errorrrrrrrrrrrrr2222222");
      }
    } catch (err) {
      console.error(err);
    }
  },
  verifyOtp: async (req, res) => {
    try {
      const allBanner = await bannerModel.find();
      const mobNumber = req.body.mobNumber;
      const user = await userHelper.getMobileNumber(mobNumber);
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
            const token = jwt.sign(payload, process.env.SECRET_KEY);
            res.cookie("token", token, { httpOnly: true });
            if (user.isAdmin) {
              res.redirect("/admin/dashboard");
            } else {
              res.redirect("/user/index");
            }
          } else {
            res.render("user/submitOtp", {
              userlay: true,
              user: false,
              loggedIn: false,
              mobNumber: mobNumber,
              message: "enter valid Otp",
              allBanner,
            });
          }
        })
        .catch((error) => {
          console.error(error);
          res.render("user/submitOtp", {
            userlay: true,
            user: false,
            loggedIn: false,
            mobNumber: mobNumber,
            message: "enter valid Otp",
            allBanner,
          });
        });
    } catch (err) {
      console.error(err);
    }
  },

  resendOTp: async (req, res) => {
    const mobNumber = req.query.mobNumber;
    twilioFunctions
      .generateOTP(mobNumber, "sms")
      .then((verification) => {
        if (verification.status === "pending") {
          res.json({ status: "success" });
          return;
        } else {
          res.json({ status: "error" });
          return;
        }
      })
      .catch((error) => {
        console.error(error);
      });
  },

  generateOTP: async (req, res) => {
    try {
      const MobileNo = req.body.MobileNo;
      console.log(MobileNo,'ssssssssssssss');
      const allBanner = await bannerModel.find();
      const validUser = await userHelper.getUser(MobileNo);
      if (validUser) {
        twilioFunctions
          .generateOTP(MobileNo, "sms")
          .then((verification) => {
            if (verification.status)
              res.render("user/veriOtpPass", {
                userlay: true,
                user: false,
                loggedIn: false,
                MobileNo: MobileNo,
                message: false,
                allBanner,
              });
          })
          .catch((error) => {
            console.error(error, "---------------");
            res.render("user/veriOtpPass", {
              userlay: true,
              user: false,
              loggedIn: false,
              MobileNo: MobileNo,
              message: "error",
              allBanner,
            });
          });
      } else
        res.render("user/veriOtpPass", {
          userlay: true,
          user: false,
          loggedIn: false,
          MobileNo: MobileNo,
          message: false,
          allBanner,
        });
    } catch (err) {
      console.log(err);
      res.render("user/veriOtpPass", {
        userlay: true,
        user: false,
        loggedIn: false,
        MobileNo: MobileNo,
        message: false,
        allBanner,
      });
    }
  },

  verifyOtpForPassword: async (req, res) => {
    try {
      const allBanner = await bannerModel.find();
      const MobileNo = req.params.id;
      const user = await userHelper.getUser(MobileNo);
      const enteredOTP = req.body.code;
      twilioFunctions.client.verify.v2
        .services(twilioFunctions.verifySid)
        .verificationChecks.create({ to: `+91${MobileNo}`, code: enteredOTP })
        .then((verification_check) => {
          if (verification_check.status === "approved") {
            const payload = {
              userId: user._id,
              isAdmin: user.isAdmin,
            };
            const token = jwt.sign(payload, process.env.SECRET_KEY);
            res.cookie("token", token, { httpOnly: true });
            res.render("user/changePassword", {
              userlay: true,
              user: false,
              loggedIn: false,
              MobileNo: MobileNo,
              message: false,
              allBanner,
            });
          } else {
            res.render("user/veriOtpPass", {
              userlay: true,
              user: false,
              loggedIn: false,
              MobileNo: MobileNo,
              message: false,
              allBanner,
            });
          }
        })
        .catch((error) => {
          console.error(error);
          res.render("user/veriOtpPass", {
            userlay: true,
            user: false,
            loggedIn: false,
            MobileNo: MobileNo,
            message: false,
            allBanner,
          });
        });
    } catch (err) {
      console.error(err);
    }
  },

  changePassword: async (req, res) => {
    try {
      const userId = req.userId;
      await userHelper.updatePassword(userId, req.body.changedPassword);
      res.cookie("token", "", { expires: new Date(0) });
      res.redirect("/");
    } catch (err) {
      const allBanner = await bannerModel.find();
      res.render("user/changePassword", {
        userlay: true,
        user: false,
        loggedIn: false,
        MobileNo: MobileNo,
        message: "error",
        allBanner,
      });
      console.error(err);
    }
  },

  viewProfile: async (req, res) => {
    const userId = req.userId;
    const user = await userModel.findById(userId);
    const allBanner = await bannerModel.find();
    try {
      const profileData = await userHelper.getProfile(userId);
      const address = await userHelper.getAddress(userId);
      res.render("user/viewProfile", { userlay: true, profileData, address,
        user,
        loggedIn:true,
        allBanner,
        wishCount:0,
        cartCount:0,
       });
    } catch (err) {
      res.render("user/viewProfile", {
        userlay: true,
        user,
        loggedIn:true,
        allBanner,
        wishCount:0,
        cartCount:0,
        profileData,
        address: false,
      });
    }
  },

  getEditProfile: async (req, res) => {
    const userId = req.userId;
    const user = await userModel.findById(userId);
    const allBanner = await bannerModel.find();
    let profileData = await userHelper.getProfile(userId);
    try {
      let address = await userHelper.getAddress(userId);
      res.render("user/profile", { userlay: true, profileData, address,
        user,
        loggedIn:true,
        allBanner,
        wishCount:0,
        cartCount:0,
       });
    } catch (err) {
      res.render("user/profile", {
        userlay: true,
        profileData,
        address: false,
        user,
        loggedIn:true,
        allBanner,
        wishCount:0,
        cartCount:0,
      });
    }
  },

  editProfile: async (req, res) => {
    let userId = req.userId;
    let data = req.body;
    let picture = req.images || req.image;
    let user = await userHelper.editProfile(userId, data, picture);
    res.redirect("/user/index");
  },

  //shopping
  getShopping: async (req, res) => {
    let userId = req.userId;
    let allCategory = await categoryModel.find();
    let allBanner = await bannerModel.find();
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 8;
    const skip = (page - 1) * pageSize;
    const allProduct = await productModel.find().skip(skip).limit(pageSize);
    const count = await productModel.countDocuments();
    const totalPages = Math.ceil(count / pageSize);
    const currentPage = page > totalPages ? totalPages : page;
    let cartCount = await userHelper.getCartCount(userId);
    let wishCount = await userHelper.countWish(userId); // count items in cart for user
    if (userId) {
      let user = await userModel.findById(userId);
      res.render("user/shoppingPage", {
        userlay: true,
        loggedIn: true,
        allBanner,
        allCategory,
        user,
        allProduct,
        totalPages,
        currentPage,
        pageSize,
        cartCount,
        wishCount,
      });
    } else {
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
    let wishCount = await userHelper.countWish(userId); // count items in cart for user
    const couponDetails = await couponModel.findById(cartProduct?.coupon);
    const productDetails = [];
    let total = 0;
    let subTotal = 0;
    let discountVal = 0;
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
        wishCount,
      });
    } else {
      const products = cartProduct.products;
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
        if (cartProduct.coupon) {
          discountVal = parseFloat(
            total * (couponDetails?.discount / 100)
          ).toFixed(2);
          if (discountVal > couponDetails?.maxdiscount)
            discountVal = couponDetails?.maxdiscount;
          subTotal = total - discountVal;
        } else
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
        discountVal,
        coupon: couponDetails?.code || "",
        wishCount,
      });
    }
  },

  applyCoupon: async (req, res) => {
    try {
      const userId = req.userId;
      const user = await userModel.findById(userId);
      const code = req.body.code;
      if (!user) {
        return res.status(404).json({
          status: "error",
          message: "User not found",
        });
      }
      const coupon = await couponModel.findOne({ code });

      await cartModel.updateOne(
        { user: userId },
        {
          $set: {
            coupon: coupon?._id,
          },
        }
      );
      res.redirect("/user/getCart");
    } catch (error) {
      console.log(error);
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
      if (!product) {
        return res.status(404).json({
          status: "error",
          message: "Product not found",
        });
      }

      // check if there's enough stock to add to cart
      if (product.pcountInStock < 1) {
        return res.status(400).json({
          status: "error",
          message: "Product is out of stock",
        });
      }

      let price = product.pprice;
      let productName = product.pname;
      const productImage = product.pimages[0];

      const session = await mongoose.startSession();
      session.startTransaction();

      try {
        // update product countInStock and add to cart
        await productModel.findByIdAndUpdate(
          productId,
          {
            $inc: { pcountInStock: -1 },
          },
          { session }
        );
        const isProductExist = await cartModel.findOne({
          user: userId,
          "products.productId": productId,
        });

        if (isProductExist) {
          await cartModel.updateOne(
            { user: userId, "products.productId": productId },
            { $inc: { "products.$.quantity": 1, "products.$.price": price } },
            { session }
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
            { upsert: true, session }
          );
        }

        await session.commitTransaction();
        session.endSession();
        res.redirect("/user/getCart");
      } catch (error) {
        await session.abortTransaction();
        session.endSession();
        console.error(error);
        res.status(500).json({
          status: "error",
          message: "Something went wrong",
        });
      }
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

      // find the product being removed from the cart
      const productInCart = await cartModel.findOne(
        { user: userId, "products.productId": productId },
        { "products.$": 1 }
      );

      if (!productInCart) {
        throw new Error("product not found in cart");
      }

      // update the cart to remove the product
      const updatedCart = await cartModel.findOneAndUpdate(
        { user: userId },
        { $pull: { products: { productId: productId } } },
        { new: true }
      );

      if (!updatedCart) {
        throw new Error("cart not found");
      }

      // update the productModel to add the product quantity back to pcountInstock
      const product = productInCart.products[0];
      await productModel.findByIdAndUpdate(productId, {
        $inc: { pcountInStock: product.quantity },
      });

      res.status(200).json({
        status: "success",
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
      let wishCount = await userHelper.countWish(userId); // count items in cart for user
      const couponDetails = await couponModel.findById(cartProduct.coupon);
      const products = cartProduct.products;
      const productDetails = [];
      let total = 0;
      let subTotal = 0;
      let discountVal = 0;
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
        if (cartProduct.coupon) {
          discountVal = parseFloat(
            total * (couponDetails?.discount / 100)
          ).toFixed(2);
          if (discountVal > couponDetails?.maxdiscount)
            discountVal = couponDetails?.maxdiscount;
          subTotal = total - discountVal;
        } else
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
          productDetails,
          subTotal,
          total,
          cartCount,
          separateAddresses: false,
          wishCount,
          discountVal
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
          discountVal,
          wishCount,
        });
      }
    } catch (err) {
      res.redirect("/user/getCart");
    }
  },

  getAddress: async (req, res) => {
    const userId = req.userId;
    try {
      let allBanner = await bannerModel.find();
      let user = await userModel.findById(userId);
      let cartCount = await userHelper.getCartCount(userId);
      let wishCount = await userHelper.countWish(userId);
      res.render("user/newAddress", {
        userlay: true,
        loggedIn: true,
        user,
        allBanner,
        cartCount,
        wishCount,
      });
    } catch (err) {
      res.json({
        sucess: 0,
        message: "error from db",
      });
    }
  },

  getPrfAddress: async (req, res) => {
    const userId = req.userId;
    try {
      let allBanner = await bannerModel.find();
      let user = await userModel.findById(userId);
      let cartCount = await userHelper.getCartCount(userId);
      let wishCount = await userHelper.countWish(userId);
      res.render("user/newPrfAddress", {
        userlay: true,
        loggedIn: true,
        user,
        allBanner,
        cartCount,
        wishCount,
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

  addPrfAddress: async (req, res) => {
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

      res.redirect("/user/editProfile");
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
      let wishCount = await userHelper.countWish(userId);
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
        wishCount,
      });
    } catch (err) {
      res.json({
        sucess: 0,
        message: "error from db" + err,
      });
    }
  },

  placeOrder: async (req, res) => {
    const userId = req.userId;
    const subTotal = req.body.subTotal;
    const discount = req.body.discount;

    let products = await userHelper.getProduct(userId);
    let totalPrice = await userHelper.getTotalPrice(userId);
    await userHelper
      .postPlaceOrder(req.body, products, totalPrice, discount, subTotal)
      .then((response) => {
        if (req.body["paymentMethod"] === "cash_on_delivery") {
          res.json({
            codSuccess: true,
            orderId: response._id,
            addressId: response.address,
          });
        } else {
          userHelper
            .generateRazorpay(response._id, totalPrice, response.address)
            .then((response) => {
              res.json(response);
            });
        }
      });
  },
  orderInfo: async (req, res) => {
    const userId = req.userId;
    const orderId = req.params.id;
    const addressId = req.params.id1;
    let orderInfo = await userHelper.getOrderInfo(orderId);
    let addressColl = await addressModel.findOne({ user: userId });
    let selectedAddress = addressColl.addresses.find(
      (address) => address._id.toString() === addressId
    );
    const product = await productModel.findOne(orderInfo?.productId);
    res.render("user/orderList", {
      userlay: false,
      orderInfo,
      selectedAddress,
      product,
      cancel: false,
      cancelled: false,
    });
  },

  orderInfoc: async (req, res) => {
    const userId = req.userId;
    const orderId = req.params.id;
    const addressId = req.params.id1;
    const allBanner = await bannerModel.find();
    const user = await userModel.findById(userId);
    let orderInfo = await userHelper.getOrderInfo(orderId);
    let { order_status: orderStatus } = orderInfo;
    let addressColl = await addressModel.findOne({ user: userId });
    let selectedAddress = addressColl.addresses.find(
      (address) => address._id.toString() === addressId
    );
    const product = await productModel.findOne(orderInfo?.productId);
    if (orderStatus === "cancelled") {
      res.render("user/orderList", {
        userlay: true,
        user,
        loggedIn:true,
        wishCount:0,
        cartCount:0,
        allBanner,
        orderInfo,
        selectedAddress,
        product,
        cancel: true,
        cancelled: true,
      });
    } else {
      res.render("user/orderList", {
        userlay: true,
        user,
        loggedIn:true,
        wishCount:0,
        cartCount:0,
        allBanner,
        orderInfo,
        selectedAddress,
        product,
        cancel: true,
        cancelled: false,
      });
    }
  },

  verifyPayment: (req, res) => {
    userHelper.verifyPayment(req.body).then(() => {
      userHelper
        .changePaymentStatus(req.body["order[receipt]"])
        .then(() => {
          res.json({
            status: true,
            orderId: req.body["order[receipt]"],
            addresId: req.body["order[notes][address]"],
          });
        })
        .catch((err) => {
          res.json({ status: false, errMsg: "" });
        });
    });
  },

  getEditAddress: async (req, res) => {
    const userId = req.userId;
    const addressId = req.params.id;
    try {
      let allBanner = await bannerModel.find();
      let user = await userModel.findById(userId);
      let cartCount = await userHelper.getCartCount(userId);
      let wishCount = await userHelper.countWish(userId);
      let addressColl = await addressModel.findOne({ user: userId });
      let selectedAddress = addressColl.addresses.find(
        (address) => address._id.toString() === addressId
      );
      res.render("user/editAddress", {
        userlay: true,
        loggedIn: true,
        user,
        allBanner,
        cartCount,
        selectedAddress,
        wishCount,
      });
    } catch (err) {
      res.json({
        sucess: 0,
        message: "error from db",
      });
    }
  },
  getEditPrfAddress: async (req, res) => {
    const userId = req.userId;
    const addressId = req.params.id;
    try {
      let allBanner = await bannerModel.find();
      let user = await userModel.findById(userId);
      let cartCount = await userHelper.getCartCount(userId);
      let wishCount = await userHelper.countWish(userId);
      let addressColl = await addressModel.findOne({ user: userId });
      let selectedAddress = addressColl.addresses.find(
        (address) => address._id.toString() === addressId
      );
      res.render("user/editPrfAddress", {
        userlay: true,
        loggedIn: true,
        user,
        allBanner,
        cartCount,
        selectedAddress,
        wishCount,
      });
    } catch (err) {
      res.json({
        sucess: 0,
        message: "error from db",
      });
    }
  },

  editAddress: async (req, res) => {
    const userId = req.userId;
    const addressId = req.params.id;
    const data = req.body;
    await userHelper.editAddress(data, userId, addressId).then((response) => {
      res.redirect("/user/checkOut");
    });
  },

  editPrfAddress: async (req, res) => {
    const userId = req.userId;
    const addressId = req.params.id;
    const data = req.body;
    await userHelper.editAddress(data, userId, addressId).then((response) => {
      res.redirect("/user/editprofile");
    });
  },

  deleteAddress: (req, res) => {
    const userId = req.userId;
    let id = req.params.id;
    userHelper.deleteAddress(id, userId).then((response) => {
      res.redirect("/user/editProfile");
    });
  },

  getMyorders: async (req, res) => {
    const userId = req.userId;
    const user = await userModel.findById(userId);
    const allBanner = await bannerModel.find();
    const orders = await Order.find({ user_id: userId });
    res.render("user/myOrder", { userlay: true, loggedIn: true,user, orders ,allBanner,wishCount:0,cartCount:0});
  },
  cancelOrder: async (req, res) => {
    const orderId = req.params.id;
    await userHelper.cancelStatus(orderId).then((response) => {
      res.json({});
    });
  },
  changeProductQuantity: async (req, res) => {
    const userId = req.userId;
    const productId = req.body.productId;
    const count = req.body.quantityChange;
    try {
      const response = await userHelper.updateQuantity(
        userId,
        productId,
        count
      );
      if (response === false) {
        res.json({ error: "success" });
        return;
      }
      res.json({ status: "success" });
    } catch (err) {
      console.error(err);
      res.json({ status: "error" });
    }
  },

  getAllCoupons: async (req, res) => {
    const userId = req.userId;
    const coupons = await userHelper.getCoupons(userId);
    const allBanner = await bannerModel.find();
    const cartCount = await userHelper.getCartCount(userId);
    const user = await userHelper.getProfile(userId);
    const wishCount = await userHelper.countWish(userId); // count items in cart for user
    res.render("user/allCoupons", {
      userlay: true,
      allBanner,
      cartCount,
      user,
      loggedIn: true,
      coupons,
      wishCount,
    });
  },

  search: async (req, res) => {
    const userId = req.userId;
    try {
      let allBanner = await bannerModel.find();
      let allCategory = await categoryModel.find();
      let user = await userModel.findById(userId);
      const cartCount = await userHelper.getCartCount(userId);
      const search = req.query.search;
      const products = await userHelper.searchQuery(search, userId);
      const wishCount = await userHelper.countWish(userId);
      res.render("user/searchResult", {
        userlay: true,
        products,
        allBanner,
        allCategory,
        loggedIn: true,
        user,
        cartCount,
        wishCount,
      });
    } catch (err) {
      res.render("catchError", {
        message: err?.message,
        user: req.userId,
      });
    }
  },

  wishlist: async (req, res) => {
    const userId = req.userId;
    try {
      const allBanner = await bannerModel.find();
      const user = await userHelper.getProfile(userId);
      const showList = await userHelper.showWishlist(userId);
      const cartCount = await userHelper.getCartCount(userId);
      let wishCount = await userHelper.countWish(userId); // count items in cart for user
      res.render("user/wishList", {
        userlay: true,
        user,
        loggedIn: true,
        allBanner,
        cartCount,
        showList,
        wishCount,
      });
    } catch (err) {
      console.error(err);
    }
  },

  addToWishList: async (req, res) => {
    try {
      const response = await userHelper.addToWishListUpdate(
        req.userId,
        req.params.id
      );
      if (!response) {
        res.json({ error: true });
        return;
      } else if (response === "removed") {
        res.json({ removeSuccess: true });
        return;
      }
      res.json({ success: true });
    } catch (err) {
      res.render("catchError", {
        message: err?.message,
        user: req.session.user,
      });
    }
  },

  addToCartFromWish: async (req, res) => {
    try {
      const userId = req.userId;
      const prodId = req.params.id;
      const response = await userHelper.addToCartFromWish(prodId, userId);
      if (response) {
        res.json({
          status: "success",
          message: "product added to cart",
        });
      } else {
        res.json({
          error: "error",
          message: "product not added to cart",
        });
      }
    } catch (err) {
      console.error(err);
    }
  },
  removeProdctFromWishLIst: async (req, res) => {
    try {
      await userHelper.removeProdctFromWishLIst(req.userId, req.body.product);
      res.json({
        status: "success",
        message: "product added to cart",
      });
    } catch (err) {}
  },
  downloadInvoice: async (req, res) => {
    try {
      const order_id = req.params.id;
      // Generate the PDF invoice
      const order = await adminHelper.getSpecificOrder(order_id);

      const { order: invoiceData, productDetails } = order;
      const invoicePath = await generateInvoice(invoiceData, productDetails);

      // Download the generated PDF
      res.download(invoicePath, (err) => {
        if (err) {
          console.error("Failed to download invoice:", err);
        }
      });
    } catch (error) {
      console.error("Failed to download invoice:", error);
    }
  },
};
