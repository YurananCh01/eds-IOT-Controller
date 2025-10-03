// db-test.mjs
import { query, shutdown } from "./routes/db.js";

function safe(val) {
  if (val == null) return val;
  return String(val);
}

try {
  console.log("== DB quick test ==");
  // เช็คเวอร์ชัน + ใครเชื่อม + DB ไหน + IP/Port ปลายทาง
  const r = await query(
    "select version(), current_user, current_database(), inet_server_addr() as host, inet_server_port() as port"
  );
  const row = r.rows[0];
  console.log({
    version: safe(row.version?.split("\n")[0]),
    current_user: row.current_user,
    current_database: row.current_database,
    server: `${row.host}:${row.port}`,
  });

  // ping ง่าย ๆ
  const ping = await query("select 1 as ok");
  console.log("select 1 =>", ping.rows[0]);

  console.log("OK ✅ database reachable.");
} catch (e) {
  console.error("DB TEST FAIL ❌:", e.message);
  // ถ้าเป็น 28P01 = รหัสผู้ใช้ฐานข้อมูลผิด
  if (e.code) console.error("PG CODE:", e.code);
} finally {
  await shutdown();
}
