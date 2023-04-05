var express = require('express');
var router = express.Router();
var controllers=require('../controllers/userControllers')
var productControllers=require('../controllers/productControllers')

/* GET users listing. */
router.get('/',controllers.userIndexPage);

router.get('/user/login',controllers.userLoginPage)

router.get('/user/registration',controllers.userRegistrationPage)

//user registration
router.post('/user/registration',controllers.userRegistation)

//user login

router.post('/user/login',controllers.userLogin)

//product section
router.get('/productList',productControllers.productList)

router.get('/singleProduct/:id',productControllers.singleProduct)


module.exports = router;




