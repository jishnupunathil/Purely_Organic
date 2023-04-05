const jwt = require('jsonwebtoken')
module.exports= (req, res, next) => {
    const token = req.headers.authorization.split(" ")[1];
    const decodedToken = jwt.verify(token, "secretAdmin");
    if (decodedToken.isAdmin===true) {
      next();
    } else {
      return res.json({
        success: 0,
        message: "Unauthorized access",
      });
    }
  }