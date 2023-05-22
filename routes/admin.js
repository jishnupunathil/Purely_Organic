const express = require("express");
const router = express.Router();
const productControllers = require("../controllers/productControllers");
const adminControllers = require("../controllers/adminControllers");
const checkAuth = require("../middleware/checkAuth");
const categoryControllers = require("../controllers/categoryControllers");
const {
  singleImageUpload,
  multipleImageUpload,
} = require("../middleware/fileUpload");
const bannerController = require("../controllers/bannerController");

/* GET home page. */

//user
router.use("*", checkAuth);

router.get("/dashboard", adminControllers.getDashboard);

router.get("/userList", adminControllers.userList);

router.get("/singleUserList/:id", adminControllers.singleUser);

router.get("/logout", adminControllers.logout);

router.post("/blockUser/:id", adminControllers.blockUser);

router.post("/unBlockUser/:id", adminControllers.unBlockUser);

//products

router.get("/productList", productControllers.productList);

router.get("/addProductPage", adminControllers.getAddProductPage);

router.post("/addProduct", multipleImageUpload, productControllers.addProduct);

router.get("/singleProduct/:id", productControllers.singleProduct);

router.post(
  "/updateProduct/:id",
  multipleImageUpload,
  productControllers.updateProduct
);

router.post("/deleteProduct/:id", productControllers.deleteProduct);

//category

router.get("/category", categoryControllers.categoryList);

router.post(
  "/addCategory",
  multipleImageUpload,
  categoryControllers.addCategory
);

router.get("/singleCategory/:id", categoryControllers.singleCategory);

router.post("/updateCategory/:id", categoryControllers.updateCategory);

router.post("/deleteCategory/:id", categoryControllers.deleteCategory);

//banner

router.get("/banners", bannerController.bannerList);

router.post("/addBanner", multipleImageUpload, bannerController.addBanner);

router.get("/updateBanner/:id", bannerController.singleBanner);

router.post(
  "/updateBanner/:id",
  multipleImageUpload,
  bannerController.updateBanner
);

router.post("/deleteBanner/:id", bannerController.deleteBanner);

//coupons

router.get("/coupons", adminControllers.viewCoupon);

router.get("/addCoupons", adminControllers.getAddCoupon);

router.post("/add-coupon", adminControllers.addCouponPost);

router.post("/remove-coupon", adminControllers.removeCoupon);

//orders

router.get("/orders", adminControllers.orderDetails);

router.get("/viewOrders/:id", adminControllers.viewOrder);

router.post("/update-order-status", adminControllers.updateOrderStatus);

//sales Report

router.get("/sales-report", adminControllers.viewReport);

router.post("/sales-report", adminControllers.viewReportByDate);

module.exports = router;
