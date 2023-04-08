const express = require('express');
const router = express.Router();
const multer = require('multer');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/images/')
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname )
  }
});

const imageUpload = multer({ storage: storage });

// Middleware to handle single image upload
const singleImageUpload = (req, res, next) => {
  const upload = imageUpload.single('image');
  upload(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      return res.json({
        success: 0,
        message: "Error occurred while uploading image" + err,
      });
    } else if (err) {
      return res.json({
        success: 0,
        message: "Error occurred while uploading image" + err,
      });
    }
    next();
  });
}

// Middleware to handle multiple image upload
const multipleImageUpload = (req, res, next) => {
  const upload = imageUpload.array('images', 10);
  upload(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      return res.json({
        success: 0,
        message: "Error occurred while uploading images" + err,
      });
    } else if (err) {
      return res.json({
        success: 0,
        message: "Error occurred while uploading images" + err,
      });
    }
    next();
  });
}

module.exports = {
    singleImageUpload,
    multipleImageUpload,
  };