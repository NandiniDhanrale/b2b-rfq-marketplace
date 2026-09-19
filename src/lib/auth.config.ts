import type { NextAuthConfig } from "next-auth";

export const authConfig: NextAuthConfig = {
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 24 * 7,
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const pathname = nextUrl.pathname;

      const isAuthPage = pathname === "/login" || pathname === "/signup";
      const isProtected =
        pathname.startsWith("/buyer") || pathname.startsWith("/supplier");

      if (isAuthPage && isLoggedIn) {
        const role = auth.user.role;
        return Response.redirect(
          new URL(role === "BUYER" ? "/buyer/rfqs" : "/supplier/rfqs", nextUrl),
        );
      }

      if (isProtected && !isLoggedIn) {
        return false;
      }

      if (pathname.startsWith("/buyer") && auth?.user?.role !== "BUYER") {
        return Response.redirect(new URL("/login", nextUrl));
      }

      if (pathname.startsWith("/supplier") && auth?.user?.role !== "SUPPLIER") {
        return Response.redirect(new URL("/login", nextUrl));
      }

      return true;
    },
    jwt({ token, user }) {
      if (user) {
        token.id = user.id!;
        token.role = user.role;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as typeof session.user.role;
      }
      return session;
    },
  },
  providers: [],
};
