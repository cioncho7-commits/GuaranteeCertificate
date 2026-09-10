import { SignJWT, jwtVerify } from "jose";

const APP_TOKEN_ISSUER = "guarantee-certificate-mobile";

function getSecret() {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error("AUTH_SECRET이 설정되지 않았습니다.");
  }
  return new TextEncoder().encode(secret);
}

export type MobileUser = {
  id: string; // 이메일 기준 (웹 로그인과 동일한 식별자)
  email: string;
  name: string | null;
  provider: "google" | "kakao" | "naver";
};

export async function issueAppToken(user: MobileUser): Promise<string> {
  return new SignJWT({ email: user.email, name: user.name, provider: user.provider })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuer(APP_TOKEN_ISSUER)
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime("60d")
    .sign(getSecret());
}

export async function verifyAppToken(token: string): Promise<string | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret(), {
      issuer: APP_TOKEN_ISSUER,
    });
    return typeof payload.sub === "string" ? payload.sub : null;
  } catch {
    return null;
  }
}

// 각 제공자의 네이티브 SDK가 발급한 토큰을 서버에서 다시 검증하고
// 프로필(이메일 등)을 조회합니다. 웹 로그인(next-auth)과 동일한 신뢰 경로입니다.

async function verifyGoogleIdToken(idToken: string): Promise<MobileUser> {
  const res = await fetch(
    `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`
  );
  if (!res.ok) throw new Error("구글 토큰 검증에 실패했습니다.");
  const data = (await res.json()) as {
    aud?: string;
    email?: string;
    email_verified?: string;
    name?: string;
    error_description?: string;
  };
  if (data.error_description) throw new Error(data.error_description);

  const expectedAud = process.env.AUTH_GOOGLE_ID;
  if (expectedAud && data.aud !== expectedAud) {
    throw new Error("구글 토큰의 클라이언트 ID가 일치하지 않습니다.");
  }
  if (!data.email) throw new Error("구글 계정에서 이메일 정보를 가져올 수 없습니다.");

  return { id: data.email, email: data.email, name: data.name ?? null, provider: "google" };
}

async function verifyKakaoAccessToken(accessToken: string): Promise<MobileUser> {
  const res = await fetch("https://kapi.kakao.com/v2/user/me", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error("카카오 토큰 검증에 실패했습니다.");
  const data = (await res.json()) as {
    id?: number;
    kakao_account?: { email?: string; profile?: { nickname?: string } };
  };
  if (!data.id) throw new Error("카카오 계정 정보를 가져올 수 없습니다.");

  // 카카오는 이메일 제공에 별도 심사(추가 기능 신청)가 필요해 기본적으로는
  // 이메일을 받을 수 없습니다. 이메일 대신 카카오 고유 사용자 ID로 식별합니다
  // (next-auth 웹 로그인도 이메일이 없으면 동일하게 카카오 ID를 사용합니다).
  return {
    id: String(data.id),
    email: data.kakao_account?.email ?? "",
    name: data.kakao_account?.profile?.nickname ?? null,
    provider: "kakao",
  };
}

async function verifyNaverAccessToken(accessToken: string): Promise<MobileUser> {
  const res = await fetch("https://openapi.naver.com/v1/nid/me", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error("네이버 토큰 검증에 실패했습니다.");
  const data = (await res.json()) as {
    response?: { email?: string; name?: string };
  };
  const email = data.response?.email;
  if (!email) {
    throw new Error("네이버 계정에서 이메일 정보를 가져올 수 없습니다.");
  }
  return { id: email, email, name: data.response?.name ?? null, provider: "naver" };
}

export async function verifyProviderToken(
  provider: string,
  token: string
): Promise<MobileUser> {
  switch (provider) {
    case "google":
      return verifyGoogleIdToken(token);
    case "kakao":
      return verifyKakaoAccessToken(token);
    case "naver":
      return verifyNaverAccessToken(token);
    default:
      throw new Error(`지원하지 않는 로그인 제공자입니다: ${provider}`);
  }
}
