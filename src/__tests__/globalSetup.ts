import mysql from 'mysql2/promise'
import fs from 'fs'
import path from 'path'

export default async function globalSetup() {
  const dbName = process.env.DB_NAME || 'foodlist_test'

  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || '127.0.0.1',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'test',
    multipleStatements: true,
  })

  await conn.query(
    `CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
  )
  await conn.query(`USE \`${dbName}\``)

  const schema = fs.readFileSync(path.join(process.cwd(), 'sql/schema.sql'), 'utf8')
  await conn.query(schema)

  // Seed a fixed test user + household reused across all test files
  await conn.query(`
    INSERT IGNORE INTO users (id, email, name)
    VALUES (9999, 'test@foodlist.test', 'Test User')
  `)
  await conn.query(`
    INSERT IGNORE INTO households (id, name, created_by, invite_token)
    VALUES (9999, 'Test Household', 9999, 'test-invite-token-9999')
  `)
  await conn.query(`
    INSERT IGNORE INTO household_members (household_id, user_id, role)
    VALUES (9999, 9999, 'admin')
  `)

  await conn.end()
}
