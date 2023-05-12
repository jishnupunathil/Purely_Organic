const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const expressLayout=require('express-ejs-layouts')

const guestRouter=require('./routes/guest')
const usersRouter = require('./routes/users');
const adminRouter = require('./routes/admin');


const app = express();

require('dotenv').config()
const mongoose=require('mongoose')
// const userModel=require('./models/userModel')

// view engine setup

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(expressLayout)
// app.set('layout', 'layouts/userlayout');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// app.use('/',usersRouter)
app.use('/',guestRouter)
app.use('/admin', adminRouter);
app.use('/user', usersRouter);


  
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
