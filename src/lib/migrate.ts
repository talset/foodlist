import mysql from 'mysql2/promise'
import fs from 'fs'
import path from 'path'

export async function migrateDatabase() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT ?? '3306', 10),
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    multipleStatements: true,
  })

  try {
    // Check if the core table exists
    const [rows] = await conn.query<any[]>(
      "SELECT COUNT(*) AS n FROM information_schema.tables WHERE table_schema = ? AND table_name = 'users'",
      [process.env.DB_NAME]
    )

    if (rows[0].n > 0) {
      // Tables exist — run schema anyway for idempotent additions (new tables, INSERT IGNORE)
      const schema = fs.readFileSync(path.join(process.cwd(), 'sql/schema.sql'), 'utf8')
      await conn.query(schema)
      console.log('✅ Database schema verified')
      return
    }

    // Fresh database — apply full schema
    const schema = fs.readFileSync(path.join(process.cwd(), 'sql/schema.sql'), 'utf8')
    await conn.query(schema)
    console.log('✅ Database schema created')
  } finally {
    await conn.end()
  }
}
