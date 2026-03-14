export function trackEvent(event: string, roomId?: string) {
  console.log(`[analytics] ${event}`, roomId ? `room=${roomId}` : '')

  fetch('/api/track', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ event, roomId }),
  }).catch(() => {
    // Fire and forget — don't block UI on tracking failures
  })
}
