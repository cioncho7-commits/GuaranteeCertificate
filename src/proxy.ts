import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// machinsure.com(www 없는 apex 도메인)으로 들어온 요청을 항상
// www.machinsure.com으로 리다이렉트한다. Vercel의 도메인 리다이렉트에만
// 의존하면 next-auth의 PKCE/CSRF 쿠키가 apex에 저장된 채 www로 콜백이
// 돌아오는 경우가 생겨 로그인이 실패할 수 있어, 앱 레벨에서도 강제한다.
export function proxy(request: NextRequest) {
  const host = request.headers.get("host") ?? "";
  if (host === "machinsure.com") {
    const url = request.nextUrl.clone();
    url.host = "www.machinsure.com";
    return NextResponse.redirect(url, 308);
  }
}

export const config = {
  matcher: "/((?!_next/static|_next/image|favicon.ico).*)",
};
