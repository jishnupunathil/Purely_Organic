var express = require('express');
var router = express.Router();
var productControllers=require('../controllers/productControllers');
const checkAuth=require('../middleware/checkAuth')

/* GET home page. */

//products
router.post('/addProducts',checkAuth,productControllers.addProducts)

router.get('/productList',productControllers.productList)

router.get('/singleProduct/:id',productControllers.singleProduct)

router.put('/updateProduct/:id',productControllers.updateProduct)

module.exports = router;
