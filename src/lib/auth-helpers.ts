import { auth } from "@/lib/auth";
import { AppError } from "@/lib/errors";
import type { Role } from "@prisma/client";

export async function getSafeSession() {
  try {
    return await auth();
  } catch (error) {
    console.error("Failed to read session:", error);
    return null;
  }
}

export async function requireAuth() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new AppError("You must be logged in", 401);
  }
  return session.user;
}

export async function requireRole(role: Role) {
  const user = await requireAuth();
  if (user.role !== role) {
    throw new AppError("You are not authorized to perform this action", 403);
  }
  return user;
}
