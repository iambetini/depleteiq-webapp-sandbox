import type { DefaultSession } from "next-auth";
import type { User as AppUser } from "./user";

declare module "next-auth" {
  interface Session {
    user: AppUser & DefaultSession["user"];
    accessToken: string;
  }

  interface User extends AppUser {
    accessToken: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    user: AppUser;
    accessToken: string;
  }
}
