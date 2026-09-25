import { User } from "@/types/user";
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { apiClient } from "./api-client";
import { isWeakPassword } from "./weak-passwords";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required");
        }

        try {
          const { data } = await apiClient.post<{
            item: {
              user: User;
              token?: string;
              access_token?: string;
              refresh_token?: string;
              expires_in?: number;
            };
          }>("/auth/login", {
            email: credentials.email,
            password: credentials.password,
          });

          const { user, token, access_token, refresh_token, expires_in } =
            data.item;
          const accessToken = access_token || token;
          if (!accessToken) {
            throw new Error("Invalid credentials");
          }

          if (user.role?.name === "distributor") {
            throw new Error("You're not allowed to login");
          }

          // Get full user details from /me endpoint
          const { data: { item: fullUser } = {} } = await apiClient.get<{
            item: User;
          }>("/auth/me", {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          });

          if (!fullUser) {
            throw new Error("Failed to retrieve user details");
          }

          // Strip permissions from the JWT/session cookie — they are fetched
          // client-side via PermissionProvider from /auth/me instead.
          return {
            uuid: fullUser.uuid,
            first_name: fullUser.first_name,
            last_name: fullUser.last_name,
            full_name:
              fullUser.full_name ||
              `${fullUser.first_name} ${fullUser.last_name}`,
            email: fullUser.email,
            phone: fullUser.phone,
            status: fullUser.status,
            is_active: fullUser.is_active,
            role: fullUser.role
              ? { ...fullUser.role, permissions: [] as any[] }
              : undefined,
            accessToken,
            refresh_token,
            token_obtained_at: Date.now(),
            expires_in,
            mustChangePassword: isWeakPassword(credentials.password),
          } as User & {
            accessToken: string;
            refresh_token?: string;
            token_obtained_at: number;
            expires_in?: number;
          };
        } catch (error: any) {
          throw new Error(error?.message || "Authentication failed");
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        const { accessToken, refresh_token, token_obtained_at, expires_in, ...userWithoutToken } = user as any;
        Object.assign(token, {
          user: userWithoutToken,
          accessToken,
          refresh_token,
          token_obtained_at,
          expires_in,
        });
      }
      if (trigger === "update" && session) {
        if ((session as any).accessToken) token.accessToken = (session as any).accessToken;
        if ((session as any).refresh_token) token.refresh_token = (session as any).refresh_token;
        if ((session as any).token_obtained_at) token.token_obtained_at = (session as any).token_obtained_at;
        if ((session as any).expires_in) token.expires_in = (session as any).expires_in;
      }
      if (trigger === "update" && (session as any)?.mustChangePassword === false) {
        token.user = { ...token.user, mustChangePassword: false };
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        Object.assign(session, {
          user: token.user,
          accessToken: token.accessToken,
          refresh_token: token.refresh_token,
          token_obtained_at: token.token_obtained_at,
          expires_in: token.expires_in,
        });
      }
      return session;
    },
    async signIn({ user, account, profile }) {
      // Allow sign in for all users - role checking will be done in components
      return true;
    },
  },
  pages: {
    signIn: "/auth/login",
    error: "/auth/error",
  },
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 hours
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
};
