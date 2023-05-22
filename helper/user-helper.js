const { resolve } = require("path");
const addressModel = require("../models/addressModel");
const cartModel = require("../models/addtocartModel");
const { Order } = require("../models/orders");
const productModel = require("../models/productModel");
const userModel = require("../models/userModel");
const Razorpay = require("razorpay");
const { ObjectId } = require("mongodb");
const couponModel = require("../models/coupon");
const moment = require("moment");
const wishModel = require("../models/wishListModel");
const bcrypt = require("bcrypt");

var instance = new Razorpay({
  key_id: "rzp_test_LlUB5deQFFVcRd",
  key_secret: "mAJMBqsQKKjiYEALwXlN6hsr",
});

module.exports = {

  getUser: async (mob) => {
    try {
      const user = await userModel.findOne({ phoneNumber: mob });
      if (user && !user.isblocked) {
        return user;
      }
      return false;
    } catch (err) {
      console.log(err);
    }
  },

  getMobileNumber: async (mobNumber) => {
    try {
      const user = await userModel.findOne({ phoneNumber: mobNumber });
      if (!user.isblocked) {
        return user;
      } else {
        return user.isblocked;
      }
    } catch (err) {
      console.log(err);
    }
  },
  getCartCount: (userId) => {
    return new Promise(async (resolve, reject) => {
      let count = 0;
      let cart = await cartModel.findOne({ user: userId });
      if (cart) {
        count = cart?.products?.length || 0;
      }
      resolve(count);
    });
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

  updatePassword: async (id, newPassword) => {
    try {
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await userModel.findByIdAndUpdate(id, { password: hashedPassword }, { new: true });
    } catch (err) {
      console.error(err);
    }
  },

  editProfile: (userId, data, picture) => {
    return new Promise(async (resolve, reject) => {
      try {
        let updatedUser = await userModel.findByIdAndUpdate(
          userId,
          {
            firstname: data.firstname,
            lasttname: data.lastname,
            email: data.email,
            phoneNumber: data.phoneNumber,
            image: picture.image,
          },
          { new: true }
        );
        if (updatedUser) {
          resolve(updatedUser);
        } else {
          reject(new Error(" profile cannot updated"));
        }
      } catch (err) {
        reject(err);
      }
    });
  },
  getAddress: (userId) => {
    return new Promise(async (resolve, reject) => {
      try {
        let addressColl = await addressModel.findOne({ user: userId });

        if (!addressColl) {
          reject(new Error(" address collection not found"));
        } else {
          let separateAddresses = addressColl.addresses.map((address) => {
            return address;
          });

          resolve(separateAddresses);
        }
      } catch (err) {}
    });
  },

  editAddress: (data, userId, addressId) => {
    return new Promise(async (resolve, reject) => {
      try {
        await addressModel.findOneAndUpdate(
          { user: userId, "addresses._id": addressId },
          {
            $set: {
              "addresses.$.fname": data.fname,
              "addresses.$.lname": data.lname,
              "addresses.$.address": data.address,
              "addresses.$.city": data.city,
              "addresses.$.state": data.state,
              "addresses.$.pincode": data.pincode,
              "addresses.$.phone": data.phone,
              "addresses.$.email": data.email,
            },
          },
          { new: true }
        );

        resolve();
      } catch (err) {
        console.log(err);
        reject();
      }
    });
  },

  getProduct: (userId) => {
    return new Promise(async (resolve, reject) => {
      try {
        let cartProduct = await cartModel.findOne({ user: userId });
        const products = cartProduct.products;
        if (products) {
          resolve(products);
        } else {
          reject(new Error("products not found"));
        }
      } catch (err) {}
    });
  },
  getTotalPrice: (userId) => {
    return new Promise(async (resolve, reject) => {
      try {
        let cartProduct = await cartModel.findOne({ user: userId });
        const couponDetails = await couponModel.findById(cartProduct.coupon);
        const products = cartProduct.products;
        const productDetails = [];
        let total = 0;
        let subTotal = 0;
        for (let i = 0; i < products.length; i++) {
          const product = await productModel.findById(products[i].productId);
          productDetails.push({
            quantity: products[i].quantity,
            totalPrice:
              parseInt(product.pprice) * parseInt(products[i].quantity),
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
            subTotal +=
              parseInt(product.pprice) * parseInt(products[i].quantity);
        }
        resolve(subTotal);
      } catch (err) {
        reject(err);
      }
    });
  },
  

  postPlaceOrder: (order, products, total,discount,subTotal) => {
    return new Promise(async (resolve, reject) => {
      try {
        let status =
          order.paymentMethod === "cash_on_delivery" ? "pending" : "paid";
        let orderObj = {
          user_id: order.userId,
          payment_method: order.paymentMethod,
          total_amount: total,
          subTotal:subTotal,
          discount:discount,
          payment_status: status,
          order_status: status,
          address: order.address, // ensure this is a valid ObjectId
          items: products.map((product) => ({
            product_id: product.productId,
            quantity: product.quantity,
            price: product.price,
            productName: product.productName,
            productImage: product.productImage,
          })),
        };

        const newOrder = new Order(orderObj);
        await newOrder.save();
        await cartModel.findOneAndRemove({ user: order.userId });
        resolve(newOrder);
      } catch (error) {
        reject(error);
      }
    });
  },
  getOrderInfo: (orderId) => {
    return new Promise(async (resolve, reject) => {
      try {
        let orderInfo = await Order.findById(orderId);
        if (orderInfo) {
          resolve(orderInfo);
        } else {
          reject(new Error("error finding order info"));
        }
      } catch (err) {
        reject(err);
      }
    });
  },

  generateRazorpay: (orderId, total, addressId) => {

    return new Promise((resolve, reject) => {
      var options = {
        amount: total * 100,
        currency: "INR",
        receipt: "" + orderId,
        notes: {
          address: "" + addressId,
        },
      };
      instance.orders.create(options, function (err, order) {
        if (err) {
          console.log(err);
        } else {
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

  changePaymentStatus: (orderId) => {
    return new Promise(async (resolve, reject) => {
      Order.updateOne(
        { _id: orderId },
        {
          $set: {
            payment_status: "paid",
            order_status: "placed",
          },
        }
      ).then(() => {
        resolve();
      });
    });
  },

  deleteAddress: (addressId, userId) => {
    return new Promise(async (resolve, reject) => {
      try {
        const result = await addressModel.findOneAndUpdate(
          { user: userId },
          { $pull: { addresses: { _id: addressId } } },
          { new: true }
        );

        if (result) {
          resolve(result);
        } else {
          reject(new Error("cannot delete "));
        }
      } catch (err) {
        console.log(err);
      }
    });
  },

  cancelStatus: (orderId) => {
    return new Promise(async (resolve, reject) => {
      Order.updateOne(
        { _id: orderId },
        {
          $set: {
            order_status: "cancelled",
          },
        }
      ).then(() => {
        resolve();
      });
    });
  },

  updateQuantity: async (userId, productId, count) => {
    try {
      const cart = await cartModel.findOne({ user: userId });
      const product = cart.products.find(
        (p) => p.productId.toString() === productId
      );
      if (!product) {
        throw new Error("Product not found in cart");
      }
      // Calculate new quantity
      const newQuantity = product.quantity + parseInt(count);

      if (newQuantity < 0) {
        return false;
      }

      // Update product quantity in the database
      const productToUpdate = await productModel.findById(productId);
      const updatedProductQuantity =
        count === "1"
          ? productToUpdate.pcountInStock - 1
          : productToUpdate.pcountInStock + 1;

      if (updatedProductQuantity < 0) {
        return false;
      }

      if (newQuantity === 0) {
        // If new quantity is 0, remove product from cart
        await cartModel.findOneAndUpdate(
          { user: userId },
          { $pull: { products: { productId} } },
          { new: true }
        );
      } else {
        // Otherwise, update product quantity in cart and save cart
        cart.products.id(product._id).quantity = newQuantity;
        await cart.save();
      }

      await productModel.findByIdAndUpdate(productId, {
        $set: { pcountInStock: updatedProductQuantity },
      });

      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  },

  getCoupons: async (userId) => {
    try {
      const coupons = await couponModel.find();
      const unusedCouponsWithDaysRemaining = coupons
        .filter((coupon) => !coupon.usedBy.includes(userId)) // Filter out coupons with usedBy field
        .map((coupon) => {
          const current_date = moment();
          const expiration_date = moment(coupon.expirationDate);
          coupon.days_remaining = expiration_date.diff(current_date, "days");
          return coupon;
        });
      return unusedCouponsWithDaysRemaining;
    } catch (err) {
      console.error(err);
    }
  },

  searchQuery: async (query, userId) => {
    try {
      const products = await productModel
        .find({
          $or: [
            { pname: { $regex: query, $options: "i" } },
            { pdescription: { $regex: query, $options: "i" } },
          ],
        })
        .populate("pcategory");

      if (products.length > 0) {
        const cart = await cartModel.findOne({ user: userId });

        if (cart) {
          for (const product of products) {
            const isProductInCart = cart.products.some((prod) =>
              prod.productId.equals(product._id)
            );
            product.isInCart = isProductInCart;
          }
        }
        return products;
      }
      return [];
    } catch (err) {
      console.error(err);
    }
  },

  addToWishListUpdate: async (userId, productId) => {
    try {
      const wishlistDoc = await wishModel.findOne({ userId: userId });
      if (!wishlistDoc) {
        // If wishlist doesn't exist for user, create a new one
        const newWishlist = new wishModel({
          userId: userId,
          items: [
            {
              productId: productId,
              addedAt: new Date(),
            },
          ],
        });
        await newWishlist.save();
      } else {
        // Check if the product is already present in the wishlist
        const productIndex = wishlistDoc.items.findIndex(
          (item) => item.productId.toString() === productId
        );

        if (productIndex !== -1) {
          // If the product is already present, remove it and return 'removed' status
          await wishModel.findOneAndUpdate(
            { userId: userId },
            { $pull: { items: { productId: productId } } },
            { new: true }
          );
          return "removed";
        }

        // If the product is not already present, add it to the wishlist
        wishlistDoc.items.push({
          productId: productId,
          addedAt: new Date(),
        });
        await wishlistDoc.save();
      }
    } catch (err) {
      console.error(err);
    }
  },

  showWishlist: async (userId) => {
    try {
      const wishlistDoc = await wishModel.findOne({ userId: userId }).populate({
        path: "items.productId",
        select:
          "pname  pprice pcountInStock pimages _id",
        populate: {
          path: "pcategory",
          select: "cname _id",
        },

      });

      if (!wishlistDoc) {
        // If wishlist doesn't exist for user, return an empty array
        return [];
      } else {
        // If wishlist exists, return the items array with product details
        return wishlistDoc.items;
      }
    } catch (err) {
      console.error(err);
      return [];
    }
  },

  addToCartFromWish: async (productId, userId) => {
    // Find product
    const product = await productModel.findById(productId);

    if (!product) {
      throw new Error("Product not found");
    }

    const quantity = product.pcountInStock;

    if (quantity <= 0) {
      return false;
    }

    await cartModel.updateOne(
      { user: userId },
      { $push: { products: { productId, quantity: 1 } } },
      { upsert: true }
    ).then(() => {
      return wishModel.findOneAndUpdate(
        { userId: userId },
        { $pull: { items: { productId: productId } } },
        { new: true }
      );
    });
    return true;
  },

  removeProdctFromWishLIst: async (userId, productId) => {
    try {
      const response = await wishModel.findOneAndUpdate(
        { userId: userId },
        { $pull: { items: { productId: productId } } },
        { new: true }
      );

      return;
    } catch (err) {
      console.error(err);
    }
  },

  countWish: async (userId) => {
    try {
      const wishCount = await wishModel.findOne({ userId: userId });
      const productCount = wishCount?.items.length;
      if (!productCount) return 0;
      return productCount;
    } catch (err) {
      console.error(err);
    }
  },
};


