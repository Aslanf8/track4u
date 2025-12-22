import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import Apple from "next-auth/providers/apple";
import { compare } from "bcryptjs";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    Apple({
      clientId: process.env.APPLE_ID!,
      clientSecret: process.env.APPLE_SECRET!,
      client: {
        token_endpoint_auth_method: "client_secret_post",
      },
    }),
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email as string | undefined;
        const password = credentials?.password as string | undefined;

        if (!email || !password) {
          return null;
        }

        try {
          console.log("Looking up user:", email);
          const user = await db.query.users.findFirst({
            where: eq(users.email, email),
          });

          if (!user) {
            return null;
          }

          // Check if user has a password (OAuth users won't)
          if (!user.passwordHash) {
            return null;
          }

          const passwordMatch = await compare(password, user.passwordHash);

          if (!passwordMatch) {
            return null;
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
          };
        } catch (error) {
          console.error("Auth error:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      // Handle OAuth sign-ins (Google, Apple)
      if (account?.provider === "google" || account?.provider === "apple") {
        try {
          const email = user.email;
          if (!email) return false;

          // Check if user already exists
          const existingUser = await db.query.users.findFirst({
            where: eq(users.email, email),
          });

          if (!existingUser) {
            // Create new user for OAuth sign-in
            await db.insert(users).values({
              id: crypto.randomUUID(),
              email: email,
              name: user.name || email.split("@")[0],
              passwordHash: null, // OAuth users have no password
            });
          }

          return true;
        } catch (error) {
          console.error("Error in signIn callback:", error);
          return false;
        }
      }

      return true; // Allow credentials sign-in to proceed
    },
    async jwt({ token, user, account }) {
      if (user) {
        // For OAuth users, we need to get the DB user ID
        if ((account?.provider === "google" || account?.provider === "apple") && user.email) {
          const dbUser = await db.query.users.findFirst({
            where: eq(users.email, user.email),
          });
          if (dbUser) {
            token.id = dbUser.id;
          }
        } else {
          token.id = user.id;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/sign-in",
  },
  session: {
    strategy: "jwt",
  },
  trustHost: true,
});
