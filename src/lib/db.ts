import mysql from 'mysql2/promise'

declare global {
  // eslint-disable-next-line no-var
  var _mysqlPool: mysql.Pool | undefined
}

function createPool(): mysql.Pool {
  return mysql.createPool({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT ?? '3306', 10),
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    timezone: '+00:00',
  })
}

// Reuse pool across HMR cycles in dev to avoid connection exhaustion
const pool: mysql.Pool = global._mysqlPool ?? createPool()
if (process.env.NODE_ENV !== 'production') {
  global._mysqlPool = pool
}

export default pool
