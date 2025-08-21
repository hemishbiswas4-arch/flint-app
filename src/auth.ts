// Location: src/auth.ts
import NextAuth from "next-auth";
import { Pool } from "pg";
import PostgresAdapter from "@auth/pg-adapter";
import { authConfig } from "./auth.config";
import Google from "next-auth/providers/google";

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PostgresAdapter(pool),
  session: { strategy: "jwt" },

  // ✅ ADD THIS CALLBACKS OBJECT
  callbacks: {
    // This callback adds the user's ID from the database to the JWT
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    // This callback adds the user's ID from the JWT to the session object
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },

  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      allowDangerousEmailAccountLinking: true,
    }),
  ],
});