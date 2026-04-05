import type { Role } from '@prisma/client'

declare module 'next-auth' {
  interface Session {
    user: {
      id:     string
      email:  string
      name:   string
      rol:    Role
      gymId:  string
      image?: string | null
    }
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    rol:   Role
    gymId: string
  }
}
