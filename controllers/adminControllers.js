const { default: mongoose } = require("mongoose");
const userModel = require("../models/userModel");
const categoryModel = require("../models/categoryModel");
const { Order } = require("../models/orders");
const adminHelper = require("../helper/admin-helper");

module.exports = {
  getDashboard:async (req, res) => {
    try{
      const totalRevenue = await adminHelper.findTotalRevenue();
      const orders = await adminHelper.getOrderDetails();
      const orderCount = orders.length;
      const products = await adminHelper.getAllProducts();
      const productsCount = products.length;
      const users = await adminHelper.getAllUsers();
      const usersCount = users.length;
      
    res.render("admin/dashboard", { userlay: false,
      totalRevenue,
      orderCount,
      productsCount,
      usersCount
       });
    }catch(err){
      console.log(err);
    }
  },
  getAddProductPage: async (req, res) => {
    let allCategory = await categoryModel.find();

    res.render("admin/addProducts", { userlay: false, allCategory });
  },
  logout: (req, res) => {
    res.cookie("token", "", { expires: new Date(0) });
    res.redirect("/");
  },
  userList: async (req, res) => {
    try {
      const allUser = await userModel.find();
      // const count = await userModel.countDocuments();

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
        let singleUser = await userModel.findById({ _id: id });
        res.json({
          success: 1,
          message: "single user listed",
          item: singleUser,
        });
      } catch (err) {
        res.json({
          success: 0,
          message: "error while listing single user" + err,
        });
      }
    } else {
      res.json({
        sucess: 0,
        message: "invalid Id",
      });
    }
  },
  blockUser: async (req, res) => {
    let id = req.params.id;
    console.log(id);
    validId = mongoose.Types.ObjectId.isValid(id);
    if (validId) {
      try {
        await userModel.findByIdAndUpdate(id, {
          isblocked: true,
        });

        res.redirect("/admin/userList");
      } catch (err) {
        res.redirect("/admin/userList");
      }
    }
  },
  unBlockUser: async (req, res) => {
    let id = req.params.id;
    validId = mongoose.Types.ObjectId.isValid(id);
    if (validId) {
      try {
        await userModel.findByIdAndUpdate(
          { _id: id },
          {
            isblocked: false,
          }
        );
        res.redirect("/admin/userList");
      } catch (err) {
        res.res.redirect("/admin/userList");
      }
    }
  },

  orderDetails: async (req, res) => {
    try {
      let orders = await adminHelper.orderPage();
      if (orders) {
        // console.log(orders);
        res.render("admin/orderMangement", { userlay: false, orders });
      }
    } catch (err) {
      console.error(err);
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
      }
    } catch (err) {
      console.error(err);
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
    }
  },

  viewCoupon: async (req, res) => {
    try {
      const coupons = await adminHelper.getCoupons();
      console.log(coupons, "-----------");
      res.render("admin/allCoupons", { userlay: false, coupons });
    } catch (err) {
      console.error(err);
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
};
