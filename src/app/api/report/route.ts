import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { updateDb } from "@/lib/db";
import { requireUserId } from "@/lib/session";
import { sendEmail } from "@/lib/email";
import type { Report, ReportType } from "@/lib/types";

const TITLES: Record<ReportType, string> = {
  subcontract: "불법하도급 신고",
  no_contract: "계약서 미작성 신고",
};

function buildMessage(report: Report) {
  const lines = [
    `[${TITLES[report.type]}]`,
    `현장명: ${report.siteName}`,
    `신고 대상 업체명: ${report.targetCompanyName}`,
    `신고인: ${report.reporterName} (${report.reporterPhone})`,
    "",
    "신고 내용:",
    report.description,
  ];
  if (report.attachmentUrl) {
    lines.push("", `증빙자료: ${report.attachmentUrl}`);
  }
  return lines.join("\n");
}

export async function POST(req: Request) {
  const userId = await requireUserId(req);
  if (!userId) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const type = body?.type as ReportType | undefined;
  const siteName = String(body?.siteName ?? "").trim();
  const targetCompanyName = String(body?.targetCompanyName ?? "").trim();
  const reporterName = String(body?.reporterName ?? "").trim();
  const reporterPhone = String(body?.reporterPhone ?? "").trim();
  const description = String(body?.description ?? "").trim();
  const attachmentUrl = body?.attachmentUrl ? String(body.attachmentUrl) : undefined;
  const attachmentName = body?.attachmentName ? String(body.attachmentName) : undefined;
  const managerContactId = String(body?.managerContactId ?? "");

  if (!type || !TITLES[type]) {
    return NextResponse.json({ error: "신고 종류가 올바르지 않습니다." }, { status: 400 });
  }
  if (
    !siteName ||
    !targetCompanyName ||
    !reporterName ||
    !reporterPhone ||
    !description ||
    !managerContactId
  ) {
    return NextResponse.json({ error: "필수 항목이 누락되었습니다." }, { status: 400 });
  }

  const result = await updateDb((db) => {
    const manager = db.managerContacts.find(
      (m) => m.id === managerContactId && m.ownerId === userId
    );
    if (!manager) {
      throw new Error("담당자 정보를 찾을 수 없습니다. 설정에서 먼저 등록하세요.");
    }

    const report: Report = {
      id: randomUUID(),
      ownerId: userId,
      type,
      siteName,
      targetCompanyName,
      reporterName,
      reporterPhone,
      description,
      attachmentUrl,
      attachmentName,
      managerEmail: manager.email,
      emailStatus: "not_configured",
      createdAt: new Date().toISOString(),
    };
    db.reports.push(report);
    return report;
  }).catch((err: Error) => ({ error: err.message }));

  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  const report = result;
  const message = buildMessage(report);
  const emailResult = await sendEmail(
    report.managerEmail,
    `[${TITLES[report.type]}] ${report.siteName}`,
    message
  );

  await updateDb((db) => {
    const target = db.reports.find((r) => r.id === report.id);
    if (target) {
      target.emailStatus = emailResult.ok
        ? "sent"
        : emailResult.reason === "not_configured"
          ? "not_configured"
          : "failed";
      target.emailDetail = emailResult.detail;
    }
  });

  return NextResponse.json({ report, email: emailResult, message });
}
