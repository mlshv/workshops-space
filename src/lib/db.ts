import { createClient } from '@libsql/client'

let client: ReturnType<typeof createClient> | null = null

export function getDb() {
  if (!client) {
    client = createClient({
      url: process.env.TURSO_DATABASE_URL!,
      authToken: process.env.TURSO_AUTH_TOKEN!,
    })
  }
  return client
}

export async function ensureAnalyticsTable() {
  const db = getDb()
  await db.execute(`
    CREATE TABLE IF NOT EXISTS analytics_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      event TEXT NOT NULL,
      room_id TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `)
}
