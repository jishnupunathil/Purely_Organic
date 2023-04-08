var express = require('express');
var router = express.Router();
var productControllers=require('../controllers/productControllers');
var adminControllers=require('../controllers/adminControllers')
const checkAuth=require('../middleware/checkAuth');
// const userControllers = require('../controllers/userControllers');
const {singleImageUpload,multipleImageUpload}=require('../middleware/fileUpload')

/* GET home page. */

//user
// router.use('*',checkAuth)

router.get('/index',adminControllers.getIndex)

router.get('/userList',adminControllers.userList)

router.get('/singleUserList/:id',adminControllers.singleUser)

router.get('/logout',adminControllers.logout)

router.post('/blockUser/:id',adminControllers.blockUser)

//products

router.post('/addProducts',multipleImageUpload,productControllers.addProducts)

router.get('/productLists',productControllers.productList)

router.get('/singleProduct/:id',productControllers.singleProduct)

router.put('/updateProduct/:id',multipleImageUpload,productControllers.updateProduct)

router.delete('/deleteProduct/:id',productControllers.deleteProduct)

module.exports = router;
