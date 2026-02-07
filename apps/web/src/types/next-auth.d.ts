import 'next-auth'
import { type DefaultSession } from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      firstName?: string | null
      lastName?: string | null
      phone?: string | null
      companyName?: string | null
      vatNumber?: string | null
      username?: string | null
    } & DefaultSession['user']
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id?: string
  }
}
