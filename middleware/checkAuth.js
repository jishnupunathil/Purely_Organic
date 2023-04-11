const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    return res.redirect("/user/login");
  }

  try {
    const decodedToken = jwt.verify(token, "secretAdmin");
    if (decodedToken.isAdmin) {
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