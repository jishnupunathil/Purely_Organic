var express = require('express');
var router = express.Router();
var controllers=require('../controllers/userControllers')
var productControllers=require('../controllers/productControllers');
const checkUserAuth = require('../middleware/checkUserAuth');
const userControllers = require('../controllers/userControllers');
// const userControllers = require('../controllers/userControllers');

/* GET users listing. */


router.get('/index',checkUserAuth,controllers.userIndexPage);

router.get('/logout',controllers.userLogout)



//user registration
router.post('/registration',controllers.userRegistation)

//user login

router.post('/otpLogin',controllers.otpLogin)

router.post('/submitOtp',controllers.submitOtp)

router.post('/login',controllers.userLogin)

//product section

// router.get('/productList',productControllers.productList)

router.get('/singleProductView/:id',checkUserAuth,productControllers.sproductUser)

//shopping

router.get('/shopping',checkUserAuth,controllers.getShopping)

router.get('/getCart',checkUserAuth,controllers.getCart)

router.post('/addtocart/:id',checkUserAuth,controllers.addtocart)

router.post('/removeFromCart/:id',checkUserAuth,controllers.removeProductFromCart)

router.get('/checkOut',checkUserAuth,controllers.getCheckOut)

module.exports = router;




