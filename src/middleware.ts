import { auth } from "@/lib/auth";

export default auth(() => {
  // Authorization logic is handled in auth.config.ts authorized callback.
});

export const config = {
  matcher: ["/buyer/:path*", "/supplier/:path*", "/login", "/signup"],
};
