import express from "express";
import { query } from "./db.js";

const router = express.Router();
// แปลง flat rows -> tree
function buildTree(rows) {
  const byId = new Map();
  const roots = [];
  rows.forEach(r => byId.set(String(r.id), { id: String(r.id), name: r.name, children: [] }));
  rows.forEach(r => {
    const node = byId.get(String(r.id));
    if (r.parent_id) {
      const p = byId.get(String(r.parent_id));
      if (p) p.children.push(node);
      else roots.push(node); // เผื่อ parent หาย
    } else {
      roots.push(node);
    }
  });
  return roots;
}

// GET /groups -> tree
router.get("/groups", async (req, res) => {
  const rows = (await query(
    `SELECT id, name, parent_id FROM groups ORDER BY parent_id NULLS FIRST, name ASC`
  )).rows;
  res.json(buildTree(rows));
});

// POST /groups { name, parent_id }
router.post("/groups", async (req, res) => {
  const { name, parent_id } = req.body ?? {};
  if (!name) return res.status(400).json({ message: "กรอกชื่อกลุ่ม" });
  const row = (await query(
    `INSERT INTO groups (name, parent_id) VALUES ($1, $2) RETURNING id, name, parent_id`,
    [String(name).trim(), parent_id ?? null]
  )).rows[0];
  // ส่ง node เดียวกลับ (ไม่ต้องทั้ง tree)
  res.json({ id: String(row.id), name: row.name, children: [] });
});

// PATCH /groups/:id { name? }
router.patch("/groups/:id", async (req, res) => {
  const { id } = req.params;
  const { name, parent_id } = req.body ?? {};
  if (!name && parent_id === undefined) {
    return res.status(400).json({ message: "ไม่มีฟิลด์สำหรับอัปเดต" });
  }
  const row = (await query(
    `UPDATE groups
     SET name = COALESCE($2, name),
         parent_id = CASE WHEN $3::text IS NULL THEN parent_id ELSE $3::bigint END
     WHERE id = $1
     RETURNING id, name, parent_id`,
    [id, name ?? null, parent_id ?? null]
  )).rows[0];
  if (!row) return res.status(404).json({ message: "ไม่พบกลุ่ม" });
  res.json({ id: String(row.id), name: row.name });
});

// DELETE /groups/:id  (ลบทั้ง subtree ถ้ามี ON DELETE CASCADE)
router.delete("/groups/:id", async (req, res) => {
  const { id } = req.params;
  await query(`DELETE FROM groups WHERE id = $1`, [id]);
  res.json({ ok: true });
});

// Member
router.get("/:id/members", async (req, res) => {
  try {
    const { id } = req.params;
    const includeDesc = req.query.desc === "1";

    let sql;
    let params = [id];

    if (includeDesc) {
      // รวมกลุ่มลูกทั้งหมดด้วย (ต้องมีคอลัมน์ parent_id)
      sql = `
        WITH RECURSIVE tree AS (
          SELECT id FROM groups WHERE id = $1
          UNION ALL
          SELECT g.id FROM groups g
          JOIN tree t ON g.parent_id = t.id
        )
        SELECT gm.id,
               gm.group_id,
               u.id   AS user_id,
               u.username,
               u.email,
               u.role
        FROM groupmember gm
        JOIN users u ON u.id = gm.user_id
        WHERE gm.group_id IN (SELECT id FROM tree)
        ORDER BY LOWER(u.username);
      `;
    } else {
      // เฉพาะกลุ่มที่ระบุ
      sql = `
        SELECT gm.id,
               gm.group_id,
               u.id   AS user_id,
               u.username,
               u.email,
               u.role
        FROM groupmember gm
        JOIN users u ON u.id = gm.user_id
        WHERE gm.group_id = $1
        ORDER BY LOWER(u.username);
      `;
    }

    const result = await query(sql, params);
    res.json(result.rows);
  } catch (err) {
    console.error("[GET /api/groups/:id/members] error", err);
    res.status(500).json({ message: "เกิดข้อผิดพลาดที่เซิร์ฟเวอร์" });
  }
});

export default router;
