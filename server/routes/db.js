// db.js
import 'dotenv/config';
import { Pool } from 'pg';

const pool = new Pool({
  host: process.env.PGHOST,
  port: Number(process.env.PGPORT ?? 5432),
  database: process.env.PGDATABASE,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  ssl: process.env.PGSSL === 'true' ? { rejectUnauthorized: false } : undefined,
  // ปรับแต่งเพิ่มได้:
  // max: 10,
  // idleTimeoutMillis: 30000,
  // connectionTimeoutMillis: 5000,
});

// ฟังก์ชันเรียกใช้ query แบบรวมศูนย์
export async function query(text, params) {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const ms = Date.now() - start;
    // console.log('executed query', { text, duration: ms, rows: res.rowCount });
    return res;
  } catch (err) {
    // log เพิ่มเติมตามต้องการ
    throw err;
  }
}

// ตัวช่วยทำ transaction
export async function withTransaction(fn) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await fn(client);
    await client.query('COMMIT');
    return result;
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
}

// ปิด pool เวลาแอปจะหยุดทำงาน
export async function shutdown() {
  await pool.end();
}
