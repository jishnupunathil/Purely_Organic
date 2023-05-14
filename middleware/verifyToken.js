const jwt = require("jsonwebtoken");
require("dotenv").config();

module.exports = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    res.set("Cache-Control", "no-cache, no-store, must-revalidate");
    res.set("Pragma", "no-cache");
    res.set("Expires", "0");
    next();
    return;
  }
  try {
    const decodedToken = jwt.verify(token, process.env.SECRET_KEY);
    if (decodedToken.isAdmin) {
      res.redirect("/admin/dashboard");
    } else {
      res.redirect("/user/index");
    }
  } catch (err) {
    console.error(err);
    res.redirect("/");
  }
};
