import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import type { Role } from '@prisma/client'

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: 'jwt' },
  providers: [
    Credentials({
      credentials: {
        email:    { label: 'Email',      type: 'email' },
        password: { label: 'Contraseña', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        })

        if (!user || !user.passwordHash || !user.activo) return null

        const valid = await bcrypt.compare(
          credentials.password as string,
          user.passwordHash,
        )
        if (!valid) return null

        return {
          id:     user.id,
          email:  user.email,
          name:   `${user.nombre} ${user.apellido}`,
          rol:    user.rol,
          gymId:  user.gymId,
          image:  user.avatarUrl,
        }
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.rol   = (user as any).rol   as Role
        token.gymId = (user as any).gymId as string
      }
      return token
    },
    session({ session, token }) {
      session.user.id    = token.sub!
      session.user.rol   = token.rol as Role
      session.user.gymId = token.gymId as string
      return session
    },
  },
  pages: {
    signIn: '/login',
    error:  '/login',
  },
})
