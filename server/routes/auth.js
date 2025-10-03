import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { query } from "./db.js";   
import "dotenv/config";

const router = express.Router();
// Dummy user
// const user = {
//   id:1,
//   username: "admin",
//   passwordHash: bcrypt.hashSync("123456", 10), // ตั้งรหัสผ่านไว้ล่วงหน้า
//   role: "Admin"
// };

const JWT_SECRET = process.env.JWT_SECRET;



router.post("/login", async (req, res) => {
  try {
  const { username, password } = req.body || {};
  console.log(username,password);
    if (!username || !password) {
      return res.status(400).json({ message: "กรอกอีเมลและรหัสผ่าน" });
    }
     
    const result = await query(
      `SELECT id, username, password, role
       FROM users
       WHERE username = $1
       LIMIT 1`,
      [username]
    );
    
   if (result.rowCount === 0) {
      return res.status(401).json({ message: "Email หรือรหัสผ่านไม่ถูกต้อง" });
    }
     const u = result.rows[0];
     const ok = await bcrypt.compare(password, u.password);
    if (!ok) {
      return res.status(401).json({ message: "Email หรือรหัสผ่านไม่ถูกต้อง" });
    }
  // สร้าง JWT
     const token = jwt.sign(
      { sub: u.id, username: u.username, role: u.role },
      JWT_SECRET,
      { expiresIn: "12h" }
    );

     res.json({
      token,
      user: {
        id: u.id,
        username: u.username,
        role: u.role,
      },
    });
}
catch (err) {
    console.error("[LOGIN ERROR]", err);
    res.status(500).json({ message: "เกิดข้อผิดพลาดที่เซิร์ฟเวอร์" });
  }
});


export default router; 