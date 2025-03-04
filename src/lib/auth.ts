import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { type DefaultSession } from "next-auth"

// Extensão de tipos
declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role: string
      accessToken: string
    } & DefaultSession["user"]
  }

  interface User {
    id?: string
    name?: string | null | undefined
    email?: string | null | undefined
    role: string
    token: string
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
      
        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: credentials.email, password: credentials.password }),
          });
      
          const data = await response.json();
      
          if (!response.ok) {
            throw new Error(data.message || "Authentication failed");
          }
      
          return {
            id: data.user._id,
            name: data.user.name,
            email: data.user.email,
            role: data.user.role,
            token: data.token, 
          };
        } catch (error) {
          console.error("Erro na autenticação:", error);
          return null;
        }
      }
      
      
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {

    
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.accessToken = user.token; 
      }
    

      return token;
    },
    async session({ session, token }) {
   
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.accessToken = token.accessToken as string;
      }
    
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.AUTH_SECRET,
})