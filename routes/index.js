var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Purely Organic' });
});

router.get('/login',(req,res)=>{
  res.render('user/userLogin')
})

router.get('/signup',(req,res)=>{
  res.render('user/userSignup')
})

module.exports = router;
