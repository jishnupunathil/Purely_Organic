require('dotenv').config()
const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const expressLayout = require('express-ejs-layouts');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');

const guestRouter = require('./routes/guest');
const usersRouter = require('./routes/users');
const adminRouter = require('./routes/admin');

const app = express();
const mongoose = require('mongoose');

// Environmental secret validation
if (!process.env.SECRET_KEY) {
  console.warn('⚠️ WARNING: SECRET_KEY is not defined in .env file! Using fallback for development.');
  process.env.SECRET_KEY = process.env.SECRET_KEY || 'purely_organic_default_secret_key_2026';
}

// 1. Security Headers (Helmet)
app.use(
  helmet({
    contentSecurityPolicy: false, // Disabled to allow external CDN fonts/scripts (Google Fonts, FontAwesome, SweetAlert2)
    crossOriginEmbedderPolicy: false,
  })
);

// 2. NoSQL Query Injection Protection
app.use(mongoSanitize());

// 3. Rate Limiting
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // Limit each IP to 300 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many requests from this IP, please try again after 15 minutes',
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 15, // Limit each IP to 15 login/auth attempts per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 'error',
    message: 'Too many authentication attempts. Please try again after 15 minutes.',
  },
});

app.use(globalLimiter);

// view engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(expressLayout);

app.use(logger('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false, limit: '10mb' }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Apply rate limiting on authentication routes
app.use('/login', authLimiter);
app.use('/user/otpLogin', authLimiter);
app.use('/user/submitOtp', authLimiter);
app.use('/admin/login', authLimiter);

app.use('/', guestRouter);
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
