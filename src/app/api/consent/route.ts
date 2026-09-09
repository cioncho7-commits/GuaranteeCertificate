import { NextResponse } from "next/server";
import { requireUserId } from "@/lib/session";
import { getConsent, saveConsent } from "@/lib/consent";

export async function GET(req: Request) {
  const userId = await requireUserId(req);
  if (!userId) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const consent = await getConsent(userId);
  return NextResponse.json({ consent });
}

export async function POST(req: Request) {
  const userId = await requireUserId(req);
  if (!userId) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const body = await req.json().catch(() => null);
  const requiredAgreed = body?.requiredAgreed === true;
  const marketingAgreed = body?.marketingAgreed === true;

  if (!requiredAgreed) {
    return NextResponse.json(
      { error: "필수 항목에 동의해야 서비스를 이용할 수 있습니다." },
      { status: 400 }
    );
  }

  const consent = await saveConsent(userId, requiredAgreed, marketingAgreed);
  return NextResponse.json({ consent });
}
