const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    console.log("no token")
    return res.redirect("/user/login");
  }
  try {
    const decodedToken = jwt.verify(token, "secretOgani");
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