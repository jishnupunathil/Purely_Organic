var express = require('express');
var router = express.Router();
var productControllers=require('../controllers/productControllers');
var adminControllers=require('../controllers/adminControllers')
const checkAuth=require('../middleware/checkAuth');
const userControllers = require('../controllers/userControllers');

/* GET home page. */

//user
router.use('*',checkAuth)

router.get('/userList',adminControllers.userList)

router.get('/singleUserList/:id',adminControllers.singleUser)

//products
router.post('/addProducts',checkAuth,productControllers.addProducts)

router.get('/productList',productControllers.productList)

router.get('/singleProduct/:id',productControllers.singleProduct)

router.put('/updateProduct/:id',productControllers.updateProduct)

router.delete('/deleteProduct/:id',productControllers.deleteProduct)

module.exports = router;
