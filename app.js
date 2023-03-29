var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var expressLayout=require('express-ejs-layouts')


var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

require('dotenv').config()
const mongoose=require('mongoose')
const userModel=require('./models/userModel')

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(expressLayout)
app.use('/', indexRouter);
app.use('/users', usersRouter);


app.post('/user/login',async(req,res)=>{
   
  console.log('body',req.body);
      try{  
          const userMod=new userModel({
            firstname: req.body.firstname,
            lastname: req.body.lastname,
            email: req.body.email,
            phoneNumber: req.body.phoneNumber,
            // password: hash
          })
          await userMod.save()
  
          res.json({
  
              success:1,
              message:'user added successfuly'
  
          })
  
      }
      catch(err){
          res.json({
              success:0,
              message:'error occuured while saving'+err
          })
  
      }
  })
  
//mongodb
mongoose.connect(process.env.MONGODB_URL)
    .then((res) => {
        console.log('database connected successfuly')
    }).catch((err) => {
        console.log('error occured while connecting' + err);
    })

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
