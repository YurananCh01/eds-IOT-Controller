// routes/devices.js (ESM)
import express from "express";
import { query } from "./db.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const { group_id, desc, q } = req.query;
    const limit = Math.min(Math.max(parseInt(req.query.limit ?? "100", 10), 1), 1000);
    const offset = Math.max(parseInt(req.query.offset ?? "0", 10), 0);

    const params = [];
    const add = (v) => {
      params.push(v);
      return `$${params.length}`;
    };

    let withCTE = "";
    const wh = [];

    if (group_id) {
      if (desc === "1") {
        // รวมกลุ่มย่อยทั้งหมดของ group_id ด้วย
        const p = add(group_id);
        withCTE = `
          WITH RECURSIVE tree AS (
            SELECT id FROM groups WHERE id = ${p}
            UNION ALL
            SELECT g.id FROM groups g
            JOIN tree t ON g.parent_id = t.id
          )
        `;
        wh.push(`d.group_id IN (SELECT id FROM tree)`);
      } else {
        const p = add(group_id);
        wh.push(`d.group_id = ${p}`);
      }
    }

    if (q && String(q).trim()) {
      const p = add(`%${String(q).trim()}%`);
      // ipaddress เป็น inet → แปลงเป็น text เพื่อค้นหา
      wh.push(`(d.name ILIKE ${p} OR d.ipaddress::text ILIKE ${p})`);
    }

    const whereSQL = wh.length ? `WHERE ${wh.join(" AND ")}` : "";
    const limitP = add(limit);
    const offsetP = add(offset);

    const sql = `
      ${withCTE}
      SELECT d.id, d.name, d.group_id, d.ipaddress
      FROM devices d
      ${whereSQL}
      ORDER BY LOWER(d.name)
      LIMIT ${limitP} OFFSET ${offsetP};
    `;

    const result = await query(sql, params);
    res.json(result.rows);
  } catch (err) {
    console.error("[GET /api/devices] error", err);
    res.status(500).json({ message: "เกิดข้อผิดพลาดที่เซิร์ฟเวอร์" });
  }
});

/**
 * GET /api/devices/:id
 * ดึงอุปกรณ์ 1 ตัวตาม id
 */
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const r = await query(
      `SELECT id, name, group_id, ipaddress
       FROM devices
       WHERE id = $1`,
      [id]
    );
    if (r.rowCount === 0) return res.status(404).json({ message: "ไม่พบอุปกรณ์" });
    res.json(r.rows[0]);
  } catch (err) {
    console.error("[GET /api/devices/:id] error", err);
    res.status(500).json({ message: "เกิดข้อผิดพลาดที่เซิร์ฟเวอร์" });
  }
});

router.post("/", async (req, res) => {
  try {
    const { name, group_id, ipaddress } = req.body || {};
    if (!name || !group_id || !ipaddress) {
      return res.status(400).json({ message: "กรอก name, group_id และ ipaddress ให้ครบ" });
    }

    // (optional) validate group exists
    const g = await query(`SELECT 1 FROM groups WHERE id = $1`, [group_id]);
    if (g.rowCount === 0) {
      return res.status(400).json({ message: "group_id ไม่ถูกต้อง" });
    }

    // แนะนำ: หากคอลัมน์ ipaddress ใช้ type inet ใน Postgres จะช่วย validate อัตโนมัติได้
    const result = await query(
      `INSERT INTO devices (name, group_id, ipaddress)
       VALUES ($1, $2, $3)
       RETURNING id, name, group_id, ipaddress`,
      [String(name).trim(), group_id, String(ipaddress).trim()]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("[POST /api/devices] error", err);
    res.status(500).json({ message: "เกิดข้อผิดพลาดที่เซิร์ฟเวอร์" });
  }
});

export default router;
