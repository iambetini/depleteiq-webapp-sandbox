import { User } from "@/types/user";
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { apiClient } from "./api-client";

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
            item: { user: User; token: string };
          }>("/auth/login", {
            email: credentials.email,
            password: credentials.password,
          });

          const { user, token } = data.item;
          if (!token) {
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
              Authorization: `Bearer ${token}`,
            },
          });

          if (!fullUser) {
            throw new Error("Failed to retrieve user details");
          }

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
            role: {
              ...fullUser.role,
              permissions: fullUser?.role?.permissions?.map(
                (permission: any) => {
                  const { uuid, ...permissionWithoutUuid } = permission;
                  return permissionWithoutUuid;
                },
              ),
            },
            accessToken: token,
          } as User & { accessToken: string };
        } catch (error: any) {
          throw new Error(error?.message || "Authentication failed");
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        // Remove UUID from permissions items
        if (user.role?.permissions) {
          user.role.permissions = user.role.permissions.map(
            (permission: any) => {
              const { uuid, ...permissionWithoutUuid } = permission;
              return permissionWithoutUuid;
            },
          );
        }

        const { accessToken, ...userWithoutToken } = user as any;
        Object.assign(token, { user: userWithoutToken, accessToken });
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        Object.assign(session, {
          user: token.user,
          accessToken: token.accessToken,
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
