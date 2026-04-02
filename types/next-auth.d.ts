// types/next-auth.d.ts
import "next-auth"

declare module "next-auth" {
  interface User {
    nama: string
    role: string
  }
  interface Session {
    user: {
      id: string
      email: string
      nama: string
      role: string
    }
  }
}