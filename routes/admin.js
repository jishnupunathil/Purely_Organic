var express = require('express');
var router = express.Router();
var productControllers=require('../controllers/productControllers');
var adminControllers=require('../controllers/adminControllers')
const checkAuth=require('../middleware/checkAuth');
const categoryControllers = require('../controllers/categoryControllers');
const {singleImageUpload,multipleImageUpload}=require('../middleware/fileUpload');
const bannerController = require('../controllers/bannerController');

/* GET home page. */

//user
router.use('*',checkAuth)

router.get('/dashboard',adminControllers.getDashboard)

router.get('/userList',adminControllers.userList)

router.get('/singleUserList/:id',adminControllers.singleUser)

router.get('/logout',adminControllers.logout)

router.post('/blockUser/:id',adminControllers.blockUser)

router.post('/unBlockUser/:id',adminControllers.unBlockUser)

//products

router.get('/addProduct',adminControllers.getAddProduct)

router.post('/addProduct',multipleImageUpload,productControllers.addProduct)

router.get('/productList',productControllers.productList)

router.get('/singleProduct/:id',productControllers.singleProduct)

router.post('/updateProduct/:id',productControllers.updateProduct)

router.all('/deleteProduct/:id',productControllers.deleteProduct)

//category

router.get('/category',categoryControllers.categoryList)

router.post('/category',categoryControllers.addCategory)

router.get('/singleCategory/:id',categoryControllers.singleCategory)

//banner

router.get('/banners',bannerController.bannerList)

router.post('/banner',multipleImageUpload,bannerController.addBanner)

module.exports = router;
