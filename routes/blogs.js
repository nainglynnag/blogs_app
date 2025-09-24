const express = require("express");
const router = express.Router();
const db = require("../db");

// const multer = require("multer");
// const path = require("path");

// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, "uploads/");
//   },
//   filename: function (req, file, cb) {
//     cb(null, Date.now() + path.extname(file.originalname));
//   },
// });
// const upload = multer({ storage: storage });

// Step 1 - Configuration
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Step 2 - Ensure upload directory exists
const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Step 3 - Set up multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // Directory to save uploaded files
  },
  filename: function (req, file, cb) {
    // const safeName = file.originalname.replace(/\s+/g, "-").toLowerCase();
    cb(null, Date.now() + path.extname(file.originalname)); // Unique filename
    // cb(null, Date.now() + file.originalname); // Unique filename with original name
  },
});

// Step 4 - File filter to allow only images
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true); // Accept file
  } else {
    cb(new Error("Only image files are allowed!"), false); // Reject file
  }
};

// Step 5 - Initialize multer with storage and file filter
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
}); // Limit file size to 5MB

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

router.post(
  "/post_blog",
  isLoggedIn,
  upload.single("imageInput"),
  async (req, res) => {
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
    // console.log("hiddenContent:", hiddenContent);

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

    const filename = req.file.filename;
    console.log("Image filename:", filename);

    db.query(
      `INSERT INTO blog (blog_title, blog_detail, blog_image, blog_author, blog_datetime, idcategory, blog_tag, iduser) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        title,
        content,
        filename,
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
  }
);

module.exports = router;
