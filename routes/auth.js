const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const db = require("../db");

router.get("/", (req, res) => {
  res.render("index");
});

router.get("/register", (req, res) => {
  res.render("register");
});

router.post("/register", async (req, res) => {
  const { fullName, email, password, confirmPassword } = req.body;
  const [first_name, last_name] = fullName.split(" ");

  // console.log("first_name:", first_name);
  // console.log("last_name:", last_name);
  // console.log("email:", email);
  // console.log("password:", password);
  // console.log("confirmPassword:", confirmPassword);

  if (!fullName || !email || !password || !confirmPassword) {
    return res.status(400).send("All fields are required");
  }

  if (password !== confirmPassword) {
    return res.status(400).send("Passwords do not match");
  }

  //   console.log("Registering user email:", email);

  // >> Note: 10 is saltRound, can be string/number and change it for security >> eg. "IDontKnow"
  const hashedPassword = await bcrypt.hash(password, 10);

  db.query(
    "INSERT INTO username (first_name, last_name, email, password, authen) VALUES (?, ?, ?, ?, ?)",
    [first_name, last_name, email, hashedPassword, 1],
    (err, result) => {
      if (err) {
        console.error("Error registering user:", err);
        return res.status(500).send("Error registering user");
      }

      console.log("User registered successfully");
      res.redirect("/login");
    }
  );
});

router.get("/login", (req, res) => {
  res.render("login");
});

router.get("/blogs", (req, res) => {
  res.render("read_blog");
});

module.exports = router;
