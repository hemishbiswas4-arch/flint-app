// Location: src/auth.ts

import NextAuth from "next-auth"
import { Pool } from "pg"
import PostgresAdapter from "@auth/pg-adapter"
import { authConfig } from "@/auth.config"

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
})

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig, // Spread the base config
  adapter: PostgresAdapter(pool),
  // ✅ ADD the session strategy HERE
  session: { strategy: "jwt" }, 
})