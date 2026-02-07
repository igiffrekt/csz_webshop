import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { prisma } from './prisma'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/hu/auth/bejelentkezes',
    error: '/hu/auth/bejelentkezes',
  },
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials)
        if (!parsed.success) return null

        const user = await prisma.user.findUnique({
          where: { email: parsed.data.email },
        })

        if (!user || !user.passwordHash) return null

        const isValid = await bcrypt.compare(parsed.data.password, user.passwordHash)
        if (!isValid) return null

        return {
          id: user.id,
          email: user.email,
          name: user.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : user.username,
          image: user.image,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (token?.id) {
        session.user.id = token.id as string
        // Fetch additional fields from DB
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: {
            firstName: true,
            lastName: true,
            phone: true,
            companyName: true,
            vatNumber: true,
            username: true,
          },
        })
        if (dbUser) {
          session.user.firstName = dbUser.firstName
          session.user.lastName = dbUser.lastName
          session.user.phone = dbUser.phone
          session.user.companyName = dbUser.companyName
          session.user.vatNumber = dbUser.vatNumber
          session.user.username = dbUser.username
        }
      }
      return session
    },
  },
})
