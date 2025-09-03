const express = require("express");
const app = express();
const { open } = require("sqlite");
const jwt = require("jsonwebtoken");

const cors = require("cors");
const path = require("path");
const upload = require("./upload");
const dbPath = path.join(__dirname, "oralDb.db");
const cloudinary = require("cloudinary").v2;
const fs = require("fs");
const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("./oralDb.db", sqlite3.OPEN_READWRITE);
const PORT = process.env.PORT || 5000;
const JWT_SECRET = "your_jwt_secret";

let myDataBase;

const initializeDbAndServer = async () => {
  try {
    myDataBase = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(PORT, () => console.log(`Server running on ${PORT}`));
  } catch (e) {
    console.log(`DB Error ${e.message}`);
    process.exit(1);
  }
};

app.use(express.json());
app.use(cors());

cloudinary.config({
  cloud_name: "ddigwr0f3",
  api_key: "698344476133175",
  api_secret: "kks417iAtI1XaGCACe_b5aEdWE0",
});

// sql = `CREATE TABLE IF NOT EXISTS users (
//     id INTEGER PRIMARY KEY AUTOINCREMENT,
//     name TEXT NOT NULL,
//     email TEXT UNIQUE NOT NULL,
//     password TEXT NOT NULL,
//     role TEXT NOT NULL
//   ) `;
// db.run(sql);
// sql = `INSERT INTO users(name,email,password,role) VALUES ("anil","anil@gmail.com","123456","dent");`;
// db.run(sql);

// db.run(`
//  CREATE TABLE IF NOT EXISTS patients (
//     id INTEGER PRIMARY KEY AUTOINCREMENT,
//     patientId TEXT NOT NULL,
//     patientName TEXT NOT NULL,
//     scanType TEXT NOT NULL,
//     region TEXT NOT NULL,
//     scanImage TEXT,
//     uploadDate TEXT DEFAULT CURRENT_TIMESTAMP
// );

// `);

app.get("/users", async (req, res) => {
  try {
    const getUserQery = `SELECT * FROM users;`;
    const allUser = await myDataBase.all(getUserQery);

    res.status(200).json(allUser);
  } catch (error) {
    console.error(error.message);
    res.status(400).json({ message: e.message, status: 404 });
  }
});

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new Error("Fill all the fields");
    }

    const query = `SELECT * FROM users WHERE email = ? AND password = ?`;
    const userData = await myDataBase.get(query, [email, password]);

    if (!userData) {
      throw new Error("Invalid Email or Password");
    }

    const token = jwt.sign(
      {
        id: userData.id,
        email: userData.email,
        role: userData.role || "user",
      },
      JWT_SECRET
    );

    res.json({
      message: "Login successful",
      status: 200,
      data: userData,
      token, // token bhi send kar rahe hain
    });
  } catch (e) {
    console.log(e.message);
    res.status(400).json({ message: e.message, status: 400 });
  }
});

app.post("/patients", upload.single("scanImage"), (req, res) => {
  const { patientId, patientName, region } = req.body;

  const scanImage = req.file?.path || req.file?.secure_url || null;

  console.log("Cloudinary File:", req.file);

  const sql = `INSERT INTO patients (patientId, patientName, scanType, region, scanImage)
               VALUES (?, ?, 'RGB', ?, ?)`;

  db.run(sql, [patientId, patientName, region, scanImage], function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({
      message: "Patient added successfully",
      id: this.lastID,
      file: scanImage,
    });
  });
});

app.get("/allpatients", async (req, res) => {
  try {
    const allp = await myDataBase.all("SELECT * FROM patients");
    res.status(200).json(allp);
  } catch (e) {
    console.error(error.message);
    res.status(400).json({ message: e.message, status: 404 });
  }
});

app.delete("/deletePatients", async (req, res) => {
  console.log("hi");
  try {
    const deleteQuery = `DELETE FROM patients ;`;
    const result = await myDataBase.run(deleteQuery);

    res.status(200).json({
      message: "All patients deleted successfully",
      deletedCount: result.changes,
    });
  } catch (err) {
    console.log(err.message);
    res.status(500).json({ error: err.message });
  }
});

initializeDbAndServer();
