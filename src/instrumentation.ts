export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { migrateDatabase } = await import('@/lib/migrate')
    try {
      await migrateDatabase()
    } catch (err) {
      console.error('❌ Database migration failed:', err)
    }
  }
}
