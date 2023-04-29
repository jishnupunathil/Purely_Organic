var express = require('express');
const guestControllers = require('../controllers/guestControllers');
var router = express.Router();


router.get('/',guestControllers.indexPage);

router.get('/login',guestControllers.loginPage)

router.get('/otp',guestControllers.otpPage)

router.get('/registration',guestControllers.registrationPage)

router.get('/shopping',guestControllers.shoppingPage)

// router.get('/productPage',guestControllers.productPage)






module.exports = router;

