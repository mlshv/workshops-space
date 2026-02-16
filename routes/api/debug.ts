import { defineHandler } from 'h3'

export default defineHandler(async () => {
  const diagnostics: Record<string, string> = {}

  // Check env vars (existence only, not values)
  const envVars = [
    'TURSO_DATABASE_URL',
    'TURSO_AUTH_TOKEN',
    'BETTER_AUTH_SECRET',
    'BETTER_AUTH_URL',
    'VITE_BETTER_AUTH_URL',
    'GOOGLE_CLIENT_ID',
    'GOOGLE_CLIENT_SECRET',
  ]
  for (const key of envVars) {
    diagnostics[key] = process.env[key] ? 'set' : 'MISSING'
  }

  // Try importing modules one by one
  try {
    await import('kysely-libsql')
    diagnostics['kysely-libsql'] = 'ok'
  } catch (e) {
    diagnostics['kysely-libsql'] = e instanceof Error ? e.message : String(e)
  }

  try {
    await import('better-auth')
    diagnostics['better-auth'] = 'ok'
  } catch (e) {
    diagnostics['better-auth'] = e instanceof Error ? e.message : String(e)
  }

  try {
    await import('better-auth/plugins')
    diagnostics['better-auth/plugins'] = 'ok'
  } catch (e) {
    diagnostics['better-auth/plugins'] = e instanceof Error ? e.message : String(e)
  }

  // Try creating the dialect
  try {
    const { LibsqlDialect } = await import('kysely-libsql')
    new LibsqlDialect({
      url: process.env.TURSO_DATABASE_URL as string,
      authToken: process.env.TURSO_AUTH_TOKEN as string,
    })
    diagnostics['LibsqlDialect'] = 'ok'
  } catch (e) {
    diagnostics['LibsqlDialect'] = e instanceof Error ? `${e.message}\n${e.stack}` : String(e)
  }

  // Try creating betterAuth
  try {
    const { betterAuth } = await import('better-auth')
    const { anonymous } = await import('better-auth/plugins')
    const { LibsqlDialect } = await import('kysely-libsql')

    betterAuth({
      database: {
        dialect: new LibsqlDialect({
          url: process.env.TURSO_DATABASE_URL as string,
          authToken: process.env.TURSO_AUTH_TOKEN as string,
        }),
        type: 'sqlite',
      },
      secret: process.env.BETTER_AUTH_SECRET,
      baseURL: process.env.BETTER_AUTH_URL,
      socialProviders: {
        google: {
          clientId: process.env.GOOGLE_CLIENT_ID as string,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
        },
      },
      plugins: [anonymous()],
    })
    diagnostics['betterAuth()'] = 'ok'
  } catch (e) {
    diagnostics['betterAuth()'] = e instanceof Error ? `${e.message}\n${e.stack}` : String(e)
  }

  return Response.json(diagnostics, { status: 200 })
})
