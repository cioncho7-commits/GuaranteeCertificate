import { NextResponse } from "next/server";
import { issueAppToken, verifyProviderToken } from "@/lib/mobileAuth";

// 안드로이드 앱 전용 로그인 엔드포인트.
// 앱에서 각 제공자(구글/카카오/네이버)의 네이티브 SDK로 로그인한 뒤 받은
// 토큰을 이 API로 보내면, 서버가 해당 제공자에게 재검증하고
// 앱이 이후 API 호출에 쓸 자체 Bearer 토큰을 발급합니다.
export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const provider = String(body?.provider ?? "");
  const token = String(body?.token ?? "");

  if (!provider || !token) {
    return NextResponse.json(
      { error: "provider와 token이 필요합니다." },
      { status: 400 }
    );
  }

  try {
    const user = await verifyProviderToken(provider, token);
    const appToken = await issueAppToken(user);
    return NextResponse.json({
      token: appToken,
      user: { id: user.id, email: user.email, name: user.name },
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "로그인에 실패했습니다." },
      { status: 401 }
    );
  }
}
