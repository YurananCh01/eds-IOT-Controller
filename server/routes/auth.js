// routes/auth.js (ESM)
import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { query } from "./db.js";   // ต้อง export pool จาก db.js (mysql2/promise)
import "dotenv/config";

const router = express.Router();

router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body || {};
    if (!username || !password) {
      return res.status(400).json({ ok: false, error: "username & password required" });
    }

    // ใช้ placeholder แบบ Postgres: $1
    const result = await query(
      `SELECT id, username, password
       FROM users
       WHERE username = $1
       LIMIT 1`,
      [username]
    );

    if (result.rowCount === 0) {
      return res.status(401).json({ ok: false, error: "ชื่อผู้ใช้ไม่ถูกต้อง" });
    }

    const u = result.rows[0];
    const match = await bcrypt.compare(password, u.password);
    if (!match) {
      return res.status(401).json({ ok: false, error: "รหัสผ่านไม่ถูกต้อง" });
    }

    const payload = { uid: u.id, username: u.username };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "7d" });

    return res.json({ ok: true, token, user: payload });
  } catch (e) {
    console.error("[LOGIN ERROR]", e);
    return res.status(500).json({ ok: false, error: "server error" });
  }
});

export default router;
