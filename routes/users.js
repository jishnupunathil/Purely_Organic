var express = require('express');
var router = express.Router();
var controllers=require('../controllers/userControllers')

/* GET users listing. */
router.get('/',controllers.userIndexPage);

router.get('/user/login',controllers.userLoginPage)

router.get('/user/registration',controllers.userRegistrationPage)

//user registration
router.post('/user/registration',controllers.userRegistation)

module.exports = router;




