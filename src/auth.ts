import NextAuth from "next-auth";
// import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { loginSchema } from "@/validations/auth";
import { UserRole } from "@/constants/roles";
import { createAuthAdapter } from "@/features/auth/services/adapter";
import {
  authenticateWithPassword,
  findUserById,
} from "@/features/auth/services/user-service";
import { logger } from "@/utils/logger";
import type { UserRole as Role } from "@/constants/roles";

const ROLE_REFRESH_MS = 30_000;

/**
 * Auth.js configuration for NexPlast.
 *
 * - Google OAuth via Prisma Adapter (Account linking)
 * - Email/password via Credentials + bcrypt
 * - JWT sessions (edge-friendly RBAC)
 * - Role embedded in token/session (refreshed from DB periodically)
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: createAuthAdapter(),
  providers: [
    // Google login disabled for now
    // Google({
    //   clientId: process.env.AUTH_GOOGLE_ID!,
    //   clientSecret: process.env.AUTH_GOOGLE_SECRET!,
    //   allowDangerousEmailAccountLinking: true,
    // }),
    Credentials({
      name: "Email",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        try {
          const user = await authenticateWithPassword(
            parsed.data.email,
            parsed.data.password,
          );
          if (!user) return null;

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
            role: user.role as Role,
          };
        } catch (error) {
          if (error instanceof Error && error.message === "ACCOUNT_DISABLED") {
            logger.warn(
              "Disabled account login attempt",
              { email: parsed.data.email },
              "auth",
            );
          }
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  cookies: {
    sessionToken: {
      name:
        process.env.NODE_ENV === "production"
          ? "__Secure-authjs.session-token"
          : "authjs.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
    newUser: "/auth/continue",
  },
  callbacks: {
    async signIn({ user }) {
      if (!user.id) return true;
      const dbUser = await findUserById(user.id);
      if (dbUser && (!dbUser.isActive || dbUser.deletedAt)) {
        return false;
      }
      return true;
    },
    async jwt({ token, user, trigger }) {
      if (user) {
        token.id = user.id ?? token.sub ?? "";
        token.role = (user.role as Role | undefined) ?? UserRole.USER;
        token.name = user.name;
        token.email = user.email;
        token.picture = user.image;
        token.roleSyncedAt = Date.now();
        delete token.error;
      }

      const userId = (token.id as string | undefined) ?? token.sub;
      const lastSync = (token.roleSyncedAt as number | undefined) ?? 0;
      const shouldSync =
        Boolean(userId) &&
        (Boolean(user) ||
          trigger === "update" ||
          Date.now() - lastSync > ROLE_REFRESH_MS);

      if (shouldSync && userId) {
        const dbUser = await findUserById(userId);
        token.roleSyncedAt = Date.now();

        if (!dbUser || !dbUser.isActive || dbUser.deletedAt) {
          return {
            ...token,
            id: undefined,
            sub: undefined,
            role: undefined,
            error: "AccountDisabled",
          };
        }

        token.id = dbUser.id;
        token.role = dbUser.role as Role;
        token.name = dbUser.name;
        token.email = dbUser.email;
        token.picture = dbUser.image;
        delete token.error;
      }

      if (!token.role && !token.error) {
        token.role = UserRole.USER;
      }

      return token;
    },
    async session({ session, token }) {
      if (token.error === "AccountDisabled" || !token.id) {
        return {
          ...session,
          user: {
            ...session.user,
            id: "",
            email: undefined,
            role: UserRole.USER,
          },
        };
      }

      if (session.user) {
        session.user.id = (token.id as string) ?? token.sub ?? "";
        session.user.role = (token.role as Role) ?? UserRole.USER;
        if (token.name) session.user.name = token.name as string;
        if (token.email) session.user.email = token.email as string;
        if (token.picture) session.user.image = token.picture as string;
      }
      return session;
    },
  },
  events: {
    async createUser({ user }) {
      // OAuth sign-ups always start as USER (schema default); log for audit.
      logger.info(
        "OAuth user created as USER",
        { userId: user.id, email: user.email },
        "auth",
      );
    },
  },
  trustHost: true,
  secret: process.env.NEXTAUTH_SECRET,
});
