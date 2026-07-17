import nodemailer from "nodemailer";

// 이메일 발송 모듈 (Gmail SMTP).
// 실제 발송을 위해서는 발신용 구글 계정에서 앱 비밀번호를 발급받아
// .env.local 에 GMAIL_USER, GMAIL_APP_PASSWORD 를 설정해야 합니다.
// 발급 방법: 구글 계정 > 보안 > 2단계 인증 활성화 > 앱 비밀번호 생성

export type EmailResult =
  | { ok: true; detail: string }
  | { ok: false; reason: "not_configured" | "send_failed"; detail: string };

let cachedTransporter: ReturnType<typeof nodemailer.createTransport> | null = null;

function getTransporter() {
  const user = process.env.GMAIL_USER;
  const appPassword = process.env.GMAIL_APP_PASSWORD;
  if (!user || !appPassword) return null;

  if (!cachedTransporter) {
    cachedTransporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user, pass: appPassword },
    });
  }
  return cachedTransporter;
}

export async function sendEmail(
  to: string,
  subject: string,
  text: string
): Promise<EmailResult> {
  const transporter = getTransporter();
  const from = process.env.GMAIL_USER;

  if (!transporter || !from) {
    return {
      ok: false,
      reason: "not_configured",
      detail:
        "이메일 발송 계정이 설정되지 않았습니다. .env.local에 GMAIL_USER, GMAIL_APP_PASSWORD를 설정하세요.",
    };
  }

  try {
    await transporter.sendMail({
      from: `"건설기계 대여대금 지급보증서" <${from}>`,
      to,
      subject,
      text,
    });
    return { ok: true, detail: `${to}로 이메일을 발송했습니다.` };
  } catch (err) {
    return {
      ok: false,
      reason: "send_failed",
      detail: err instanceof Error ? err.message : "발송 요청 중 오류 발생",
    };
  }
}
