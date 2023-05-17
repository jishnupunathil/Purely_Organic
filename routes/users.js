const express = require("express");
const router = express.Router();
const controllers = require("../controllers/userControllers");
const productControllers = require("../controllers/productControllers");
const checkUserAuth = require("../middleware/checkUserAuth");
const {
  singleImageUpload,
  multipleImageUpload,
} = require("../middleware/fileUpload");
const verifyToken = require("../middleware/verifyToken");

/* GET users listing. */

router.get("/index", checkUserAuth, controllers.userIndexPage);

router.get("/logout", controllers.userLogout);

//user registration
router.post("/registration", controllers.userRegistation);

//user login

router.post("/otpLogin",verifyToken, controllers.otpLoginPost);

router.get("/resendOTP",verifyToken,controllers.resendOTp)

router.post("/submitOtp",verifyToken, controllers.verifyOtp);


router.post("/login", controllers.userLogin);

router.get("/editProfile", checkUserAuth, controllers.getEditProfile);

router.get("/addressChange/:id", checkUserAuth, controllers.getAddressChange);

router.get("/viewProfile", checkUserAuth, controllers.viewProfile);

router.post(
  "/editProfile",
  multipleImageUpload,
  checkUserAuth,
  controllers.editProfile
);

//product section

router.get(
  "/singleProductView/:id",
  checkUserAuth,
  productControllers.sproductUser
);

//shopping

router.get("/shopping", checkUserAuth, controllers.getShopping);

router.get("/getCart", checkUserAuth, controllers.getCart);

router.post("/addtocart/:id", checkUserAuth, controllers.addtocart);

router.post(
  "/removeFromCart/:id",
  checkUserAuth,
  controllers.removeProductFromCart
);

router.get("/checkOut", checkUserAuth, controllers.getCheckOut);

router.get("/newAddress", checkUserAuth, controllers.getAddress);

router.get("/newPrfAddress", checkUserAuth, controllers.getPrfAddress);

router.post("/addAddress", checkUserAuth, controllers.addAddress);

router.post("/addPrfAddress", checkUserAuth, controllers.addPrfAddress);

router.get("/editAddress/:id", checkUserAuth, controllers.getEditAddress);

router.get("/editPrfAddress/:id", checkUserAuth, controllers.getEditPrfAddress);

router.post("/editAddress/:id", checkUserAuth, controllers.editAddress);

router.post("/editPrfAddress/:id", checkUserAuth, controllers.editPrfAddress);

router.post("/deleteAddress/:id", checkUserAuth, controllers.deleteAddress);

router.get("/myOrders", checkUserAuth, controllers.getMyorders);

router.get("/download-invoice/:id",checkUserAuth, controllers.downloadInvoice);

router.post("/cancelOrder/:id", checkUserAuth, controllers.cancelOrder);

//coupons

router.get("/allCoupons", checkUserAuth, controllers.getAllCoupons);

router.post("/applyCoupon", checkUserAuth, controllers.applyCoupon);

//payment

router.post("/place-order", checkUserAuth, controllers.placeOrder);

router.get("/orderInfo/:id/:id1", checkUserAuth, controllers.orderInfo);

router.get("/orderInfoc/:id/:id1", checkUserAuth, controllers.orderInfoc);

router.post("/verify-payment", checkUserAuth, controllers.verifyPayment);

router.post(
  "/change-product-quantity",
  checkUserAuth,
  controllers.changeProductQuantity
);

router.get("/product-search", checkUserAuth, controllers.search);

router.get('/wishList',checkUserAuth,controllers.wishlist)

router.post('/wishlist/:id',checkUserAuth,controllers.addToWishList)

router.put(
  "/add-to-cartFromWishL/:id",
  checkUserAuth,
  controllers.addToCartFromWish
);

router.delete(
  "/remove-product-from-wishList",
  checkUserAuth,
  controllers.removeProdctFromWishLIst
);

module.exports = router;
