import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { readDb, updateDb } from "@/lib/db";
import { requireUserId } from "@/lib/session";
import type { ManagerContact } from "@/lib/types";

const PHONE_RE = /^01[0-9]-?\d{3,4}-?\d{4}$/;

export async function GET() {
  const userId = await requireUserId();
  if (!userId) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const db = await readDb();
  const contacts = db.managerContacts.filter((c) => c.ownerId === userId);
  return NextResponse.json({ contacts });
}

export async function POST(req: Request) {
  const userId = await requireUserId();
  if (!userId) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const body = await req.json();
  const name = String(body.name ?? "").trim();
  const phone = String(body.phone ?? "").trim();

  if (!name) {
    return NextResponse.json({ error: "담당자 이름을 입력하세요." }, { status: 400 });
  }
  if (!PHONE_RE.test(phone)) {
    return NextResponse.json(
      { error: "휴대폰번호 형식이 올바르지 않습니다. (예: 010-1234-5678)" },
      { status: 400 }
    );
  }

  const contact: ManagerContact = {
    id: randomUUID(),
    ownerId: userId,
    name,
    phone,
    createdAt: new Date().toISOString(),
  };

  await updateDb((db) => {
    db.managerContacts.push(contact);
  });

  return NextResponse.json({ contact }, { status: 201 });
}

export async function DELETE(req: Request) {
  const userId = await requireUserId();
  if (!userId) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const { id } = await req.json();

  await updateDb((db) => {
    db.managerContacts = db.managerContacts.filter(
      (c) => !(c.id === id && c.ownerId === userId)
    );
  });

  return NextResponse.json({ ok: true });
}
