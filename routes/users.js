const express = require('express');
const router = express.Router();
const controllers=require('../controllers/userControllers')
const productControllers=require('../controllers/productControllers');
const checkUserAuth = require('../middleware/checkUserAuth');
const {singleImageUpload,multipleImageUpload}=require('../middleware/fileUpload');

/* GET users listing. */


router.get('/index',checkUserAuth,controllers.userIndexPage);

router.get('/logout',controllers.userLogout)



//user registration
router.post('/registration',controllers.userRegistation)

//user login

router.post('/otpLogin',controllers.otpLogin)

router.post('/submitOtp',controllers.submitOtp)

router.post('/login',controllers.userLogin)

router.get('/editProfile',checkUserAuth,controllers.getEditProfile)

router.get('/addressChange/:id',checkUserAuth,controllers.getAddressChange)

router.get('/viewProfile',checkUserAuth,controllers.viewProfile)

router.post('/editProfile',multipleImageUpload,checkUserAuth,controllers.editProfile)

//product section

// router.get('/productList',productControllers.productList)

router.get('/singleProductView/:id',checkUserAuth,productControllers.sproductUser)

//shopping

router.get('/shopping',checkUserAuth,controllers.getShopping)

router.get('/getCart',checkUserAuth,controllers.getCart)

router.post('/addtocart/:id',checkUserAuth,controllers.addtocart)

router.post('/removeFromCart/:id',checkUserAuth,controllers.removeProductFromCart)

router.get('/checkOut',checkUserAuth,controllers.getCheckOut)

router.get('/newAddress',checkUserAuth,controllers.getAddress)


router.post('/addAddress',checkUserAuth,controllers.addAddress)

//payment

router.post('/place-order',checkUserAuth,controllers.placeOrder)



module.exports = router;




