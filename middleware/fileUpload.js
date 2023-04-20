const express = require('express');
const router = express.Router();
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
require('dotenv').config()

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret:process.env.API_SECRET
});


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
  upload(req, res, async function (err) {
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

    try {
      const result = await cloudinary.uploader.upload(req.file.path);
      req.image = result.secure_url;
      next();
    } catch (error) {
      console.log(error);
      return res.json({
        success: 0,
        message: "Error occurred while uploading image" + error,
      });
    }
  });
}

// Middleware to handle multiple image upload
const multipleImageUpload = (req, res, next) => {
  const upload = imageUpload.array('images', 10);
  upload(req, res, async function (err) {
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

    try {
      const results = await Promise.all(req.files.map((file) => {
        return cloudinary.uploader.upload(file.path);
      }));
      req.images = results.map((result) => result.secure_url);
      next();
    } catch (error) {
      console.log(error);
      return res.json({
        success: 0,
        message: "Error occurred while uploading images" + error,
      });
    }
  });
}

module.exports = {
    singleImageUpload,
    multipleImageUpload,
  };