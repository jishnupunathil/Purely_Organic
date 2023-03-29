var express = require('express');
var router = express.Router();
var controllers=require('../controllers/userControllers')

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

//user registration
router.post('/registration',controllers.userRegistation)

module.exports = router;
