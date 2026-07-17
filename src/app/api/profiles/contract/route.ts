import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { readDb, updateDb } from "@/lib/db";
import { requireUserId } from "@/lib/session";
import type { ContractProfile } from "@/lib/types";

export async function GET() {
  const userId = await requireUserId();
  if (!userId) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const db = await readDb();
  const profiles = db.contractProfiles.filter((p) => p.ownerId === userId);
  return NextResponse.json({ profiles });
}

export async function POST(req: Request) {
  const userId = await requireUserId();
  if (!userId) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const body = await req.json();

  const required = ["periodStart", "periodEnd", "unitPrice", "paymentDueTerms"] as const;
  for (const key of required) {
    if (!body[key] || typeof body[key] !== "string") {
      return NextResponse.json(
        { error: `${key} 값이 필요합니다.` },
        { status: 400 }
      );
    }
  }

  const profile: ContractProfile = {
    id: randomUUID(),
    ownerId: userId,
    periodStart: body.periodStart,
    periodEnd: body.periodEnd,
    unitPrice: body.unitPrice,
    paymentDueTerms: body.paymentDueTerms,
    createdAt: new Date().toISOString(),
  };

  await updateDb((db) => {
    db.contractProfiles.push(profile);
  });

  return NextResponse.json({ profile }, { status: 201 });
}
