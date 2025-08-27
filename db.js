const mysql = require("mysql2");

require("dotenv").config();

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306, // optional for default port and Required if it is not default
});

db.connect((err) => {
  if (err) {
    console.error("Error connecting to the database:", err);
    return;
  } else {
    console.log("Connected to the MySQL database");
  }
});

module.exports = db;
