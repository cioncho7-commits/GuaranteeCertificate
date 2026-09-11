import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { updateDb } from "@/lib/db";
import { requireUserId } from "@/lib/session";
import { sendEmail } from "@/lib/email";
import type { ContractProfile, Submission, TaxInvoiceProfile } from "@/lib/types";

type TaxInvoiceInput =
  | { mode: "existing"; id: string }
  | { mode: "new"; data: Omit<TaxInvoiceProfile, "id" | "ownerId" | "createdAt"> };

type ContractInput =
  | { mode: "existing"; id: string }
  | { mode: "new"; data: Omit<ContractProfile, "id" | "ownerId" | "createdAt"> };

function buildMessage(sub: Submission) {
  const { taxInvoice: t, contract: c } = sub;
  const lines = [
    "[건설기계 대여대금 지급보증서]",
    `현장명: ${sub.siteName}`,
    `원청명: ${sub.clientName}`,
    `임차인: ${t.lesseeName}`,
    `임대인: ${t.lessorCompanyName} (대표 ${t.lessorRepName}) / 차량번호 ${t.vehicleNumber}`,
    `사업자등록번호: ${t.businessRegNumber} / 대표자 연락처: ${t.repPhone}`,
    `계약기간: ${c.periodStart} ~ ${c.periodEnd}`,
    `단가: ${c.unitPrice}`,
    `결제기한: ${c.paymentDueTerms}`,
  ];
  if (t.attachmentUrl) {
    lines.push(`세금계산서 첨부파일: ${t.attachmentUrl}`);
  }
  if (c.attachmentUrl) {
    lines.push(`계약서 첨부파일: ${c.attachmentUrl}`);
  }
  return lines.join("\n");
}

export async function POST(req: Request) {
  const userId = await requireUserId(req);
  if (!userId) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const siteName = String(body.siteName ?? "").trim();
  const clientName = String(body.clientName ?? "").trim();
  const taxInvoiceInput = body.taxInvoice as TaxInvoiceInput | undefined;
  const contractInput = body.contract as ContractInput | undefined;
  const managerContactId = String(body.managerContactId ?? "");

  if (!siteName || !clientName || !taxInvoiceInput || !contractInput || !managerContactId) {
    return NextResponse.json({ error: "필수 항목이 누락되었습니다." }, { status: 400 });
  }

  const result = await updateDb((db) => {
    const manager = db.managerContacts.find(
      (m) => m.id === managerContactId && m.ownerId === userId
    );
    if (!manager) {
      throw new Error("담당자 정보를 찾을 수 없습니다. 설정에서 먼저 등록하세요.");
    }

    let taxInvoice: TaxInvoiceProfile;
    if (taxInvoiceInput.mode === "existing") {
      const found = db.taxInvoiceProfiles.find(
        (p) => p.id === taxInvoiceInput.id && p.ownerId === userId
      );
      if (!found) throw new Error("선택한 세금계산서 정보를 찾을 수 없습니다.");
      taxInvoice = found;
    } else {
      taxInvoice = {
        id: randomUUID(),
        ownerId: userId,
        createdAt: new Date().toISOString(),
        ...taxInvoiceInput.data,
      };
      db.taxInvoiceProfiles.push(taxInvoice);
    }

    let contract: ContractProfile;
    if (contractInput.mode === "existing") {
      const found = db.contractProfiles.find(
        (p) => p.id === contractInput.id && p.ownerId === userId
      );
      if (!found) throw new Error("선택한 계약서 정보를 찾을 수 없습니다.");
      contract = found;
    } else {
      contract = {
        id: randomUUID(),
        ownerId: userId,
        createdAt: new Date().toISOString(),
        ...contractInput.data,
      };
      db.contractProfiles.push(contract);
    }

    const submission: Submission = {
      id: randomUUID(),
      ownerId: userId,
      siteName,
      clientName,
      taxInvoice,
      contract,
      managerEmail: manager.email,
      emailStatus: "not_configured",
      createdAt: new Date().toISOString(),
    };
    db.submissions.push(submission);
    return submission;
  }).catch((err: Error) => {
    return { error: err.message };
  });

  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  const submission = result;
  const message = buildMessage(submission);
  const emailResult = await sendEmail(
    submission.managerEmail,
    `[건설기계 대여대금 지급보증서] ${submission.siteName}`,
    message
  );

  await updateDb((db) => {
    const target = db.submissions.find((s) => s.id === submission.id);
    if (target) {
      target.emailStatus = emailResult.ok
        ? "sent"
        : emailResult.reason === "not_configured"
          ? "not_configured"
          : "failed";
      target.emailDetail = emailResult.detail;
    }
  });

  return NextResponse.json({
    submission,
    email: emailResult,
    message,
  });
}
