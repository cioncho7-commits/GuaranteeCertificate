import { auth } from "./auth";
import { verifyAppToken } from "./mobileAuth";

// 웹(next-auth 쿠키 세션)과 안드로이드 앱(Authorization: Bearer 토큰)
// 양쪽 모두를 지원하는 사용자 식별 함수.
export async function requireUserId(req?: Request): Promise<string | null> {
  const authHeader = req?.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    return verifyAppToken(authHeader.slice(7));
  }

  const session = await auth();
  if (!session?.user) return null;
  return (session.user as { id?: string }).id ?? session.user.email ?? null;
}
