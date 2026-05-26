import mysql, { Pool, PoolConnection, RowDataPacket, ResultSetHeader } from 'mysql2/promise';
import { config } from './config';

export const pool: Pool = mysql.createPool({
  host: config.db.host,
  port: config.db.port,
  user: config.db.user,
  password: config.db.password,
  database: config.db.database,
  connectionLimit: config.db.connectionLimit,
  waitForConnections: true,
  namedPlaceholders: true,
  dateStrings: false,
  timezone: 'Z',
});

export async function query<T extends RowDataPacket[]>(sql: string, params?: any): Promise<T> {
  const [rows] = await pool.query<T>(sql, params);
  return rows;
}

export async function exec(sql: string, params?: any): Promise<ResultSetHeader> {
  const [result] = await pool.query<ResultSetHeader>(sql, params);
  return result;
}

export async function tx<T>(fn: (conn: PoolConnection) => Promise<T>): Promise<T> {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const out = await fn(conn);
    await conn.commit();
    return out;
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
}

export async function pingDb(): Promise<void> {
  const conn = await pool.getConnection();
  try { await conn.ping(); } finally { conn.release(); }
}
