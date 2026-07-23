const jwt = require("jsonwebtoken");
require("dotenv").config();

module.exports = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    return res.redirect("/login");
  }
  try {
    const decodedToken = jwt.verify(token, process.env.SECRET_KEY);
    req.adminId = decodedToken.userId;
    if (decodedToken.isAdmin) {
      res.set("Cache-Control", "no-cache, no-store, must-revalidate");
      res.set("Pragma", "no-cache");
      res.set("Expires", "0");
      next();
    } else {
      res.clearCookie("token");
      return res.redirect("/login");
    }
  } catch (error) {
    res.clearCookie("token");
    return res.redirect("/login");
  }
};
