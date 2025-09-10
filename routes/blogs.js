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

router.get("/post_blog", isLoggedIn, async (req, res) => {
  const [categories] = await db.promise().query(`SELECT * FROM category`);
  //   console.log(categories);

  res.render("post_blog", { user: req.session.user, categories });
});

router.post("/post_blog", isLoggedIn, async (req, res) => {
  //   const posts = req.body;
  const {
    title,
    subtitle,
    category,
    tags,
    imageInput,
    content,
    allowComments,
    publishDate,
    metaDescription,
    slug,
  } = req.body;
  //   console.log(posts);

  // db.promise().query returns [rows, fields].
  const [rows] = await db
    .promise()
    .query(
      `SELECT iduser, first_name, last_name FROM username WHERE email = ?`,
      [req.session.user]
    );

  if (!rows || rows.length === 0) {
    console.error("User not found for email:", req.session.user);
    return res.status(400).send("User not found");
  }

  const userRow = rows[0];
  const user_id = userRow.iduser;
  const username = `${userRow.first_name} ${userRow.last_name}`;
  console.log("user_id:", user_id, "username:", username);

  db.query(
    `INSERT INTO blog (blog_title, blog_detail, blog_image, blog_author, blog_datetime, idcategory, blog_tag, iduser) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      title,
      content,
      imageInput,
      username,
      publishDate,
      category,
      tags,
      user_id,
    ],
    (err, result) => {
      if (err) {
        console.error("Error adding post :", err);
        return res.status(404).send("Error adding post");
      }

      console.log("Post added successfully");
      res.redirect("/blogs");
    }
  );
});

module.exports = router;
