import type { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface User {
    id: string
    name: string
    email: string
    role: string
    token: string
  }

  interface Session {
    user: {
      id: string
      role: string
      accessToken: string
    } & DefaultSession["user"]
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    role: string
    accessToken: string
  }
}

