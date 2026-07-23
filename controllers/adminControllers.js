const mongoose = require("mongoose");
const userModel = require("../models/userModel");
const categoryModel = require("../models/categoryModel");
const { Order } = require("../models/orders");
const adminHelper = require("../helper/admin-helper");

module.exports = {
  getDashboard: async (req, res) => {
    try {
      const totalRevenue = await adminHelper.findTotalRevenue();
      const orders = (await adminHelper.getOrderDetails()) || [];
      const orderCount = orders.length;
      const products = (await adminHelper.getAllProducts()) || [];
      const productsCount = products.length;
      const users = (await adminHelper.getAllUsers()) || [];
      const usersCount = users.length;
      const orderData = (await adminHelper.orderStatusData()) || {};
      const paymentStatitics = (await adminHelper.paymentStatitics()) || {};
      const recentOrders = (await adminHelper.getRecentOrders(5)) || [];

      res.render("admin/dashboard", {
        userlay: false,
        totalRevenue,
        orderCount,
        productsCount,
        usersCount,
        orderData,
        paymentStatitics,
        recentOrders,
      });
    } catch (err) {
      console.error(err);
      res.render("admin/dashboard", {
        userlay: false,
        totalRevenue: 0,
        orderCount: 0,
        productsCount: 0,
        usersCount: 0,
        orderData: {},
        paymentStatitics: {},
        recentOrders: [],
      });
    }
  },
  getAddProductPage: async (req, res) => {
    try {
      let allCategory = await categoryModel.find();
      res.render("admin/addProducts", { userlay: false, allCategory });
    } catch (err) {
      console.error(err);
      res.redirect("/admin/dashboard");
    }
  },
  logout: (req, res) => {
    res.cookie("token", "", { expires: new Date(0) });
    res.redirect("/");
  },
  userList: async (req, res) => {
    try {
      const allUser = await userModel.find();
      res.render("admin/userList", {
        userlay: false,
        allUser,
      });
    } catch (err) {
      res.render("admin/dashboard", { userlay: false });
    }
  },

  singleUser: async (req, res) => {
    let id = req.params.id;
    let validId = mongoose.Types.ObjectId.isValid(id);
    if (validId) {
      try {
        let singleUser = await userModel.findById(id);
        res.json({
          success: 1,
          message: "single user listed",
          item: singleUser,
        });
      } catch (err) {
        res.json({
          success: 0,
          message: "error while listing single user: " + err,
        });
      }
    } else {
      res.json({
        success: 0,
        message: "invalid Id",
      });
    }
  },
  blockUser: async (req, res) => {
    let id = req.params.id;
    let validId = mongoose.Types.ObjectId.isValid(id);
    if (validId) {
      try {
        await userModel.findByIdAndUpdate(id, {
          isblocked: true,
        });
        res.redirect("/admin/userList");
      } catch (err) {
        res.redirect("/admin/userList");
      }
    } else {
      res.redirect("/admin/userList");
    }
  },
  unBlockUser: async (req, res) => {
    let id = req.params.id;
    let validId = mongoose.Types.ObjectId.isValid(id);
    if (validId) {
      try {
        await userModel.findByIdAndUpdate(
          id,
          {
            isblocked: false,
          }
        );
        res.redirect("/admin/userList");
      } catch (err) {
        res.redirect("/admin/userList");
      }
    } else {
      res.redirect("/admin/userList");
    }
  },

  orderDetails: async (req, res) => {
    try {
      let orders = await adminHelper.orderPage();
      res.render("admin/orderMangement", { userlay: false, orders: orders || [] });
    } catch (err) {
      console.error(err);
      res.render("admin/orderMangement", { userlay: false, orders: [] });
    }
  },

  viewOrder: async (req, res) => {
    const orderId = req.params.id;
    try {
      const SpecificOrder = await adminHelper.getSpecificOrder(orderId);
      if (SpecificOrder) {
        const { order, productDetails } = SpecificOrder;
        res.render("admin/orderList", {
          userlay: false,
          order,
          productDetails,
        });
      } else {
        res.redirect("/admin/orders");
      }
    } catch (err) {
      console.error(err);
      res.redirect("/admin/orders");
    }
  },

  updateOrderStatus: async (req, res) => {
    try {
      const valid = await adminHelper.updateOrderStatus(
        req.body.orderId,
        req.body.status
      );
      if (!valid) {
        return res.json({ error: "error" });
      }
      res.json({ status: "success" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: err.message || "Failed to update order status" });
    }
  },

  viewCoupon: async (req, res) => {
    try {
      const coupons = (await adminHelper.getCoupons()) || [];
      res.render("admin/allCoupons", { userlay: false, coupons });
    } catch (err) {
      console.error(err);
      res.render("admin/allCoupons", { userlay: false, coupons: [] });
    }
  },

  getAddCoupon: (req, res) => {
    res.render("admin/addCoupon", { userlay: false });
  },

  addCouponPost: async (req, res) => {
    try {
      await adminHelper.generateCoupon(req.body);
      res.json({ status: "success" });
    } catch (err) {
      console.error(err);
      res.json({ status: "error" });
    }
  },

  removeCoupon: async (req, res) => {
    try {
      await adminHelper.removeCoupon(req.body.id);
      res.json({ status: "success" });
    } catch (err) {
      console.error(err);
      res.json({ status: "error" });
    }
  },

  viewReport: async (req, res) => {
    try {
      const orders = (await adminHelper.getReportDetails()) || [];
      res.render("admin/viewSalesReport", { userlay: false, orders });
    } catch (err) {
      console.error(err);
      res.render("admin/viewSalesReport", { userlay: false, orders: [] });
    }
  },
  viewReportByDate: async (req, res) => {
    try {
      const { startDate, endDate } = req.body;
      const orders = (await adminHelper.getReport(startDate, endDate)) || [];
      res.render("admin/viewSalesReport", { userlay: false, orders });
    } catch (err) {
      console.error(err);
      res.render("admin/viewSalesReport", { userlay: false, orders: [] });
    }
  },
};
