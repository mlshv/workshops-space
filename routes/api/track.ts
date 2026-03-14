import { defineHandler, readBody } from 'h3'
import { getDb, ensureAnalyticsTable } from '@/lib/db'

let tableReady = false

export default defineHandler(async (event) => {
  const body = (await readBody(event)) as { event?: string; roomId?: string }

  if (!body?.event || typeof body.event !== 'string') {
    return { ok: false, error: 'Missing event field' }
  }

  if (!tableReady) {
    await ensureAnalyticsTable()
    tableReady = true
  }

  const db = getDb()
  await db.execute({
    sql: 'INSERT INTO analytics_events (event, room_id) VALUES (?, ?)',
    args: [body.event, body.roomId ?? null],
  })

  return { ok: true }
})
