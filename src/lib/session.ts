import { auth } from "./auth";

export async function requireUserId(): Promise<string | null> {
  const session = await auth();
  if (!session?.user) return null;
  return (session.user as { id?: string }).id ?? session.user.email ?? null;
}
