import { createAuthClient } from "better-auth/react";
export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000",
  fetchOptions: { credentials: "include" },
});

export const { signIn, signUp, useSession } = authClient;

export function getUserRole(user: unknown): string | undefined {
  if (!user || typeof user !== "object") return undefined;
  const role = (user as { role?: unknown }).role;
  return typeof role === "string" ? role : undefined;
}
