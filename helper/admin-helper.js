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
              discount:1,
              subTotal:1,
              total_amount: 1,
              payment_status: 1,
              payment_method: 1,
              order_status: 1,
              return_status: 1,
              order_date: 1,
              fname: { $arrayElemAt: ["$addressDetails.addresses.fname", 0] },
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
            discount:1,
            subTotal:1,
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

      return { order, productDetails };
    } catch (err) {
      console.error(err);
    }
  },

  updateOrderStatus: async (orderId, orderStatus) => {
    try {
      let order = await Order.findById(orderId);
      if (!order) {
        throw new Error("Order not found");
      }

      if (orderStatus === "delivered") {
        order.order_status = "delivered";
        if (order.payment_method === "cash_on_delivery") {
          order.payment_status = "paid";
        }
        const updatedOrder = await order.save();
        return updatedOrder;
      } else if (orderStatus === "cancelled") {
        if (order.order_status !== "cancelled") {
          // Restock items
          if (order.items && order.items.length > 0) {
            await Promise.all(
              order.items.map(async (item) => {
                const product = await productModel.findById(item.product_id);
                if (product) {
                  product.pcountInStock += item.quantity;
                  await product.save();
                }
              })
            );
          }

          // Refund to wallet if order was pre-paid or paid
          if (
            order.payment_status === "paid" ||
            order.payment_method === "online_payment" ||
            order.payment_method === "wallet"
          ) {
            const user = await userModel.findById(order.user_id);
            if (user) {
              user.wallet = (user.wallet || 0) + order.total_amount;
              await user.save();
            }
            order.refund = "success";
          }

          order.order_status = "cancelled";
          order.payment_status = "cancelled";
          const updatedOrder = await order.save();
          return updatedOrder;
        }
        return order;
      } else if (orderStatus === "approved" || orderStatus === "rejected") {
        if (orderStatus === "approved") {
          order.return_status = "approved";
          order.order_status = "Returned";
          order.refund = "success";

          const user = await userModel.findById(order.user_id);
          if (user) {
            user.wallet = (user.wallet || 0) + order.total_amount;
            await user.save();
          }

          if (order.items && order.items.length > 0) {
            await Promise.all(
              order.items.map(async (item) => {
                const product = await productModel.findById(item.product_id);
                if (product) {
                  product.pcountInStock += item.quantity;
                  await product.save();
                }
              })
            );
          }
          const updatedOrder = await order.save();
          return updatedOrder;
        } else {
          order.return_status = "rejected";
          order.refund = "failure";
          const updatedOrder = await order.save();
          return updatedOrder;
        }
      } else {
        order.order_status = orderStatus;
        const updatedOrder = await order.save();
        return updatedOrder;
      }
    } catch (err) {
      console.error(err);
      throw err;
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
      return result && result.length > 0 ? result[0].totalRevenue : 0;
    } catch (err) {
      console.error(err);
      return 0;
    }
  },
  getOrderDetails: async () => {
    try {
      const order = await Order.find({})
        .populate("address")
        .populate("items.product_id")
        .exec();
      return order || [];
    } catch (err) {
      console.error(err);
      return [];
    }
  },
  getAllProducts: async () => {
    try {
      const products = await productModel.find({});
      return products || [];
    } catch (err) {
      console.error(err);
      return [];
    }
  },
  getAllUsers: () => {
    return new Promise(async (resolve, reject) => {
        try {
          let users = await userModel.find({ isblocked: false });
          resolve(users || []);
        } catch (err) {
          console.error(err);
          resolve([]);
        }
    });
  },
  paymentStatitics: async () => {
    try {
      const paymentData = await Order.aggregate([
        {
          $group: {
            _id: "$payment_method",
            count: { $sum: 1 },
            totalAmount: { $sum: "$total_amount" },
          },
        },
      ]);

      const methodStats = {
        cash_on_delivery: { count: 0, amount: 0 },
        online_payment: { count: 0, amount: 0 },
        wallet: { count: 0, amount: 0 },
      };

      let grandTotalCount = 0;
      let grandTotalAmount = 0;

      for (const item of paymentData) {
        if (item._id && methodStats[item._id] !== undefined) {
          methodStats[item._id].count = item.count || 0;
          methodStats[item._id].amount = item.totalAmount || 0;
        }
        grandTotalCount += item.count || 0;
        grandTotalAmount += item.totalAmount || 0;
      }

      const codCount = methodStats.cash_on_delivery.count;
      const onlineCount = methodStats.online_payment.count;
      const walletCount = methodStats.wallet.count;

      return {
        cash_on_delivery: codCount,
        online_payment: onlineCount,
        wallet: walletCount,
        cod: {
          count: codCount,
          amount: methodStats.cash_on_delivery.amount,
          percent: grandTotalCount > 0 ? Math.round((codCount / grandTotalCount) * 100) : 0,
        },
        online: {
          count: onlineCount,
          amount: methodStats.online_payment.amount,
          percent: grandTotalCount > 0 ? Math.round((onlineCount / grandTotalCount) * 100) : 0,
        },
        wallet: {
          count: walletCount,
          amount: methodStats.wallet.amount,
          percent: grandTotalCount > 0 ? Math.round((walletCount / grandTotalCount) * 100) : 0,
        },
        grandTotalCount,
        grandTotalAmount,
      };
    } catch (err) {
      console.error(err);
      return {
        cash_on_delivery: 0,
        online_payment: 0,
        wallet: 0,
        cod: { count: 0, amount: 0, percent: 0 },
        online: { count: 0, amount: 0, percent: 0 },
        wallet: { count: 0, amount: 0, percent: 0 },
        grandTotalCount: 0,
        grandTotalAmount: 0,
      };
    }
  },
  orderStatusData: async () => {
    try {
      const orderData = await Order.aggregate([
        {
          $group: {
            _id: "$order_status",
            count: { $sum: 1 },
          },
        },
      ]);
      const counts = {
        placed: 0,
        processing: 0,
        Shipped: 0,
        delivered: 0,
        cancelled: 0,
        Returned: 0,
      };
      for (const order of orderData) {
        if (order._id) {
          counts[order._id] = order.count;
        }
      }

      return counts;
    } catch (err) {
      console.error(err);
      return {
        placed: 0,
        processing: 0,
        Shipped: 0,
        delivered: 0,
        cancelled: 0,
        Returned: 0,
      };
    }
  },

  getRecentOrders: async (limit = 5) => {
    try {
      const orders = await Order.find({})
        .sort({ order_date: -1 })
        .limit(limit)
        .populate("user_id", "name email phone")
        .exec();
      return orders || [];
    } catch (err) {
      console.error(err);
      return [];
    }
  },

  getReportDetails: async () => {
    try {
      const query = { order_status: "delivered" };
      const orders = await Order.find(query).populate("address");
      return orders || [];
    } catch (err) {
      console.error(err);
      return [];
    }
  },

  getReport: async (startDate, endDate) => {
    try {
      const query = [
        {
          $match: {
            order_status: "delivered",
          },
        },
        {
          $match: {
            $and: [
              { order_date: { $gte: new Date(startDate) } },
              { order_date: { $lte: new Date(endDate) } },
            ],
          },
        },
        {
          $sort: {
            order_date: -1,
          },
        },
      ];

      const orders = await Order.aggregate(query);
      return orders || [];
    } catch (err) {
      console.error(err);
      return [];
    }
  }
};

