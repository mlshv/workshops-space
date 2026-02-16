import { defineHandler, getRequestURL, getMethod, getHeaders, getBodyStream } from 'h3'

let authModule: typeof import('@/lib/auth') | null = null
let authLoadError: string | null = null

try {
  authModule = await import('@/lib/auth')
} catch (error) {
  authLoadError = error instanceof Error ? `${error.message}\n${error.stack}` : String(error)
  console.error('[auth module load error]', error)
}

export default defineHandler(async (event) => {
  if (!authModule || authLoadError) {
    return Response.json(
      { error: true, message: `Auth module failed to load: ${authLoadError}` },
      { status: 500 },
    )
  }

  try {
    const { auth } = authModule
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
  } catch (error) {
    console.error('[auth route error]', error)
    return Response.json(
      { error: true, message: error instanceof Error ? `${error.message}\n${error.stack}` : String(error) },
      { status: 500 },
    )
  }
})
