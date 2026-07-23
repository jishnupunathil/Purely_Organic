require('dotenv').config();
const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const expressLayout = require('express-ejs-layouts');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const compression = require('compression');

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

// 1. Enable Gzip Compression for Fast Page Loading & Reduced Payload Sizes
app.use(compression({
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  },
  level: 6
}));

// 2. Security Headers (Helmet)
app.use(
  helmet({
    contentSecurityPolicy: false, // Disabled to allow external CDN fonts/scripts (Google Fonts, FontAwesome, SweetAlert2)
    crossOriginEmbedderPolicy: false,
  })
);

// 3. NoSQL Query Injection Protection
app.use(mongoSanitize());

// 4. Static Files with 1-Day Browser HTTP Caching (before rate limiter)
app.use(
  express.static(path.join(__dirname, 'public'), {
    maxAge: '1d',
    etag: true,
  })
);

// 5. Rate Limiting for API / Dynamic Routes Only
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 600, // Increased limit per IP for smoother browsing
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many requests from this IP, please try again after 15 minutes',
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 25, // Limit each IP to 25 login/auth attempts per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 'error',
    message: 'Too many authentication attempts. Please try again after 15 minutes.',
  },
});

app.use(globalLimiter);

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(expressLayout);

app.use(logger('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false, limit: '10mb' }));
app.use(cookieParser());

// Apply rate limiting on authentication routes
app.use('/login', authLimiter);
app.use('/user/login', authLimiter);
app.use('/user/otpLogin', authLimiter);
app.use('/user/submitOtp', authLimiter);
app.use('/admin/login', authLimiter);

app.use('/', guestRouter);
app.use('/admin', adminRouter);
app.use('/user', usersRouter);

// MongoDB connection
mongoose.connect(process.env.MONGODB_URL)
  .then(() => {
    console.log('✅ Database connected successfully');
  })
  .catch((err) => {
    console.error('❌ Error occurred while connecting to database: ' + err);
  });

// Catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// Error handler
app.use(function(err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
