const express = require("express");
const guestControllers = require("../controllers/guestControllers");
const verifyToken = require("../middleware/verifyToken");
const router = express.Router();

router.get("/", verifyToken, guestControllers.indexPage);

router.get("/login", verifyToken, guestControllers.loginPage);

router.get("/otp", verifyToken, guestControllers.otpPage);

router.get("/registration", verifyToken, guestControllers.registrationPage);

router.get("/shopping", verifyToken, guestControllers.shoppingPage);

router.get(
  "/singleProductView/:id",
  verifyToken,
  guestControllers.sproductUser
);

module.exports = router;
