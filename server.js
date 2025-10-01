const express = require("express");
const session = require("express-session");
const db = require("./db");

const app = express();
const bodyParser = require("body-parser");
const cors = require("cors");
require("dotenv").config();

const path = require("path");

const port = process.env.PORT || 3000;

// >> Middleware
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.use(
  session({
    secret: process.env.SESSION_SECRET || "defaultsecret",
    resave: false,
    saveUninitialized: false,
  })
);

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// >> Routes

// app.get("/", (req, res) => {
//   res.render("index");
// });

// app.get("/register", (req, res) => {
//   res.render("register");
// });

// app.get("/login", (req, res) => {
//   res.render("login");
// });

// app.get("/post_blog", (req, res) => {
//   res.render("post_blog");
// });

// Route for Authentication
app.use("/", require("./routes/auth"));
app.use("/blogs", require("./routes/blogs"));

// >> Start Server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
