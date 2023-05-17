const { default: mongoose } = require("mongoose");
const { Order } = require("../models/orders");
const productModel = require("../models/productModel");
const userModel = require("../models/userModel");
const couponModel = require("../models/coupon");
const moment = require("moment");

module.exports = {
  orderPage: () => {
    return new Promise(async (resolve, reject) => {
      try {
        const orders = await Order.aggregate([
          {
            $lookup: {
              from: "addresses",
              localField: "address",
              foreignField: "addresses._id",
              as: "addressDetails",
            },
          },
          {
            $unwind: "$addressDetails",
          },
          {
            $project: {
              _id: 1,
              user_id: 1,
              total_amount: 1,
              payment_status: 1,
              payment_method: 1,
              order_status: 1,
              return_status: 1,
              order_date: 1,
              fname: { $arrayElemAt: ["$addressDetails.addresses.fname", 0] },
              // lname: "$addressDetails.addresses.lname",
              // city: "$addressDetails.addresses.city",
              // state: "$addressDetails.addresses.state",
              // pincode: "$addressDetails.addresses.pincode",
              // phone: "$addressDetails.addresses.phone",
              // email: "$addressDetails.addresses.email",
              // default: "$addressDetails.addresses.default"
              id: { $arrayElemAt: ["$addressDetails.addresses._id", 0] },
            },
          },
        ]);
        if (orders) {
          resolve(orders);
        }
      } catch (err) {
        reject(err);
      }
    });
  },
  getSpecificOrder: async (orderId) => {
    const { ObjectId } = require("mongodb");
    const orderid = new ObjectId(orderId);

    try {
      const orders = await Order.aggregate([
        {
          $match: { _id: orderid },
        },
        {
          $lookup: {
            from: "addresses",
            localField: "address",
            foreignField: "addresses._id",
            as: "addressDetails",
          },
        },
        {
          $unwind: "$addressDetails",
        },
        {
          $project: {
            _id: 1,
            user_id: 1,
            total_amount: 1,
            payment_status: 1,
            payment_method: 1,
            order_status: 1,
            return_status: 1,
            order_date: 1,
            items: 1,
            fname: { $arrayElemAt: ["$addressDetails.addresses.fname", 0] },
            lname: { $arrayElemAt: ["$addressDetails.addresses.lname", 0] },
            address: { $arrayElemAt: ["$addressDetails.addresses.address", 0] },
            city: { $arrayElemAt: ["$addressDetails.addresses.city", 0] },
            state: { $arrayElemAt: ["$addressDetails.addresses.state", 0] },
            pincode: { $arrayElemAt: ["$addressDetails.addresses.pincode", 0] },
            phone: { $arrayElemAt: ["$addressDetails.addresses.phone", 0] },
            email: { $arrayElemAt: ["$addressDetails.addresses.email", 0] },
            id: { $arrayElemAt: ["$addressDetails.addresses._id", 0] },
          },
        },
      ]);

      const order = orders[0];
      console.log(order);

      const productDetails = [];
      for (const item of order.items) {
        const productId = item.product_id;
        const product = await productModel.findOne({ _id: productId });
        productDetails.push({
          name: product.pname,
          price: item.price,
          quantity: item.quantity,
          total: item.price * item.quantity,
          image: product.pimages[0],
        });
      }
      console.log(productDetails, "--------------------");

      return { order, productDetails };
    } catch (err) {
      console.error(err);
    }
  },

  updateOrderStatus: async (orderId, orderStatus) => {
    try {
      let order;
      if (orderStatus === "delivered") {
        order = await Order.findById(orderId);
        if (!order) {
          throw new Error("Order not found");
        }

        order.order_status = "delivered";
        if (order.payment_method === "cash_on_delivery") {
          order.payment_status = "paid";
        }

        // Save the updated order in the database
        const updatedOrder = await order.save();
        return updatedOrder;
      } else if (orderStatus === "approved" || orderStatus === "rejected") {
        if (orderStatus === "approved") {
          // Retrieve updated order
          order = await Order.findOneAndUpdate(
            { _id: orderId },
            {
              return_status: orderStatus,
              refund: "success",
            },
            { new: true }
          );

          // Retrieve user
          const userId = order.user_id;
          const user = await userModel.findOne({ _id: userId });

          if (!user) {
            throw new Error("User not found");
          }

          if (user.wallet) {
            user.wallet += order.total_amount;
          } else {
            user.wallet = order.total_amount;
          }

          // Save updated user object
          await user.save();

          // Iterate over order items
          const orderItems = order?.items;
          await Promise.all(
            orderItems.map(async (item) => {
              const product = await productModel.findById(item.product_id);
              if (product) {
                // Add returned quantity to product quantity
                product.pcountInStock += item.quantity;
                await product.save();
              }
            })
          );

          return order;
        } else {
          order = await Order.findOneAndUpdate(
            { _id: orderId },
            {
              return_status: orderStatus,
              refund: "failure",
            },
            { new: true }
          );
          return order;
        }
      } else {
        order = await Order.findByIdAndUpdate(
          { _id: orderId },
          {
            order_status: orderStatus,
          },
          { new: true }
        );
        if (!order) {
          throw new Error("Order not found");
        }
        return order;
      }
    } catch (err) {
      console.error(err);
      throw err; // Rethrow the error for further handling
    }
  },

  generateCoupon: async (coupon) => {
    try {
      const { couponCode, couponDiscount, expiryDate, maxDiscount } = coupon;
      const newCoupon = new couponModel({
        code: couponCode,
        discount: couponDiscount,
        maxdiscount: maxDiscount,
        expirationDate: expiryDate,
      });
      await newCoupon.save();
      return newCoupon;
    } catch (err) {
      console.error(err);
    }
  },

  getCoupons: async () => {
    try {
      const coupons = await couponModel.find();
      const couponsWithDaysRemaining = coupons.map((coupon) => {
        const current_date = moment();
        const expiration_date = moment(coupon.expirationDate);
        coupon.days_remaining = expiration_date.diff(current_date, "days");
        return coupon;
      });
      return couponsWithDaysRemaining;
    } catch (err) {
      console.error(err);
    }
  },
  removeCoupon: async (couponId) => {
    try {
      await couponModel.findByIdAndDelete(couponId);
    } catch (err) {
      console.error(err);
    }
  },

  //dashboard

  findTotalRevenue: async () => {
    try {
      const result = await Order.aggregate([
        {
          $match: {
            order_status: "delivered", // Filter only delivered orders
          },
        },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: "$total_amount" }, // Calculate the sum of total_amount field
          },
        },
      ]);
      return result[0].totalRevenue;
    } catch (err) {
      console.error(err);
    }
  },
  getOrderDetails: async () => {
    try {
      const order = await Order.find({})
        .populate("address")
        .populate("items.product_id")
        .exec();
      if (order.length === 0) {
        console.log("No orders found for user");
      } else {
        return order;
      }
    } catch (err) {
      console.error(err);
    }
  },
  getAllProducts: async () => {
    try {
      const products = await productModel.find({});
      return products;
    } catch (err) {
      console.error(err);
    }
  },
  getAllUsers: () => {
    return new Promise(async (resolve, reject) => {
        try {
          let users = await userModel.find({ isblocked: false });
          resolve(users);
        } catch (err) {
          console.error(err);
          reject(err);
        }
    });
  }
};
