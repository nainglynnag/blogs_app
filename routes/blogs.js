const express = require("express");
const router = express.Router();
const db = require("../db");

function isLoggedIn(req, res, next) {
  if (req.session.user) {
    console.log("Request session user:", req.session.user);
    return next();
  } else {
    res.redirect("/login");
  }
}

router.get("/", isLoggedIn, (req, res) => {
  res.render("read_blog", { user: req.session.user });
});

router.get("/post_blog", isLoggedIn, (req, res) => {
  res.render("post_blog", { user: req.session.user });
});

module.exports = router;
