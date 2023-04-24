var express = require('express');
var router = express.Router();
var controllers=require('../controllers/userControllers')
var productControllers=require('../controllers/productControllers');
const checkUserAuth = require('../middleware/checkUserAuth');
const userControllers = require('../controllers/userControllers');
// const userControllers = require('../controllers/userControllers');

/* GET users listing. */
router.get('/',controllers.indexPage);

router.get('/user/index',checkUserAuth,controllers.userIndexPage);

router.get('/user/login',controllers.userLoginPage)

router.get('/user/logout',controllers.userLogout)

router.get('/user/registration',controllers.userRegistrationPage)

//user registration
router.post('/user/registration',controllers.userRegistation)

//user login
router.get('/user/otp',controllers.otp)

router.post('/user/otpLogin',controllers.otpLogin)

router.post('/user/submitOtp',controllers.submitOtp)

router.post('/user/login',controllers.userLogin)

//product section
router.get('/productList',productControllers.productList)

router.get('/singleProduct/:id',productControllers.singleProduct)

//shopping

router.get('/user/shopping',controllers.getShopping)

module.exports = router;




