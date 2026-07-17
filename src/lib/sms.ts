// SMS 발송 연동 모듈 (알리고 Aligo REST API 구조)
// 실제 발송을 위해서는 알리고(https://smartsms.aligo.in) 가입 및
// 발신번호 사전등록(통신사 심사) 후 발급되는 키를 .env.local 에 설정해야 합니다.
//   ALIGO_API_KEY, ALIGO_USER_ID, ALIGO_SENDER

export type SmsResult =
  | { ok: true; detail: string }
  | { ok: false; reason: "not_configured" | "send_failed"; detail: string };

export async function sendSms(
  receiver: string,
  message: string
): Promise<SmsResult> {
  const apiKey = process.env.ALIGO_API_KEY;
  const userId = process.env.ALIGO_USER_ID;
  const sender = process.env.ALIGO_SENDER;

  if (!apiKey || !userId || !sender) {
    return {
      ok: false,
      reason: "not_configured",
      detail:
        "SMS 연동사(알리고) 키가 설정되지 않았습니다. .env.local에 ALIGO_API_KEY, ALIGO_USER_ID, ALIGO_SENDER를 설정하세요.",
    };
  }

  const body = new URLSearchParams({
    key: apiKey,
    user_id: userId,
    sender,
    receiver,
    msg: message,
    msg_type: message.length > 90 ? "LMS" : "SMS",
    title: "건설기계 대여대금 지급보증서",
  });

  try {
    const res = await fetch("https://apis.aligo.in/send/", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });
    const data = (await res.json()) as {
      result_code?: number | string;
      message?: string;
    };

    if (String(data.result_code) === "1") {
      return { ok: true, detail: data.message ?? "발송 요청 성공" };
    }
    return {
      ok: false,
      reason: "send_failed",
      detail: data.message ?? "알 수 없는 오류로 발송에 실패했습니다.",
    };
  } catch (err) {
    return {
      ok: false,
      reason: "send_failed",
      detail: err instanceof Error ? err.message : "발송 요청 중 오류 발생",
    };
  }
}
