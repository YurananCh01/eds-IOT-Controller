const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
require("dotenv").config();
const router = express.Router();

// Dummy user
const user = {
  id:1,
  email: "admin",
  passwordHash: bcrypt.hashSync("123456", 10), // ตั้งรหัสผ่านไว้ล่วงหน้า
  role: "Admin"
};

const JWT_SECRET = process.env.JWT_SECRET;



router.post("/login", (req, res) => {
  const { email, password } = req.body;

  if (email !== user.email || !bcrypt.compareSync(password, user.passwordHash)) {
    return res.status(401).json({ message: "Email หรือรหัสผ่านไม่ถูกต้อง" });
  }

  // สร้าง JWT
  const token = jwt.sign({ email: user.email }, JWT_SECRET, { expiresIn: "1h" });

  res.json({ token });
});

module.exports = router;
