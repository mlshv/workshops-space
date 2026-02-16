import { auth } from '@/lib/auth'
import { defineHandler, getRequestURL, getMethod, getHeaders, getBodyStream } from 'h3'

export default defineHandler(async (event) => {
  // Convert h3 event to standard Web Request for better-auth
  const method = getMethod(event)
  const url = getRequestURL(event)
  const headers = getHeaders(event)
  const hasBody = method !== 'GET' && method !== 'HEAD'
  const request = new Request(url.toString(), {
    method,
    headers,
    body: hasBody ? getBodyStream(event) : undefined,
    // @ts-expect-error duplex is needed for streaming body but not in all TS defs
    duplex: hasBody ? 'half' : undefined,
  })
  return auth.handler(request)
})
