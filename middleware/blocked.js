const jwt = require("jsonwebtoken");
require('dotenv').config()

module.exports.checkBlocked = (req, res, next) => {
  

    try {
        const decodedToken = jwt.verify(token, process.env.SECRET_KEY);
        if (decodedToken.userId) {
          req.userId = decodedToken.userId
          res.set("Cache-Control", "no-cache, no-store, must-revalidate");
        res.set("Pragma", "no-cache");
        res.set("Expires", "0");
          next();
        } else {
          return res.json({
            success: 0,
            message: "Unauthorized access",
          });
        }
      } catch (error) {
        return res.json({
          success: 0,
          message: "Invalid token",
        });
      }

  };