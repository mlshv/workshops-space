import { betterAuth } from 'better-auth'
import { anonymous } from 'better-auth/plugins'
import { LibsqlDialect } from 'kysely-libsql'

export const auth = betterAuth({
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
      prompt: 'select_account',
    },
  },
  plugins: [
    anonymous({
      onLinkAccount: async ({ anonymousUser, newUser }) => {
        console.log(
          `[auth] Linked anonymous user ${anonymousUser.user.id} to ${newUser.user.id}`,
        )
      },
    }),
  ],
})
