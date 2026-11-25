import mysql from 'mysql2/promise';
import { env } from './env.js';

export const pool = mysql.createPool({
  host: env.db.host,
  port: env.db.port,
  user: env.db.user,
  password: env.db.password,
  database: env.db.database,
  waitForConnections: true,
  connectionLimit: env.db.connectionLimit,
  queueLimit: 25,
  connectTimeout: 10000,
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000,
  namedPlaceholders: false,
  decimalNumbers: true,
  timezone: 'Z'
});

export async function withTransaction(callback) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const result = await callback(connection);
    await connection.commit();
    return result;
  } catch (error) {
    try {
      await connection.rollback();
    } catch {}
    throw error;
  } finally {
    connection.release();
  }
}
