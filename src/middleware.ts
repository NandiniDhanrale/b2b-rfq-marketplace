import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";

// Edge middleware must NOT import auth.ts (Prisma, bcrypt, etc.).
// Route protection logic lives in auth.config.ts authorized callback.
export const { auth: middleware } = NextAuth(authConfig);

export default middleware;

export const config = {
  matcher: ["/buyer/:path*", "/supplier/:path*", "/login", "/signup"],
};
