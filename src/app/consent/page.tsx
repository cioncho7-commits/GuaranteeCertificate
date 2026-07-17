import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getConsent, saveConsent } from "@/lib/consent";

export default async function ConsentPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/");
  }

  const userId =
    (session.user as { id?: string }).id ?? session.user.email ?? "";
  const existing = await getConsent(userId);
  if (existing?.requiredAgreed) {
    redirect("/form");
  }

  async function agree(formData: FormData) {
    "use server";
    const required = formData.get("required") === "on";
    const marketing = formData.get("marketing") === "on";
    if (!required) {
      redirect("/consent");
    }
    await saveConsent(userId, required, marketing);
    redirect("/form");
  }

  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-lg font-bold text-slate-900">
          개인정보 수집 및 이용 동의
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          {session.user.name ?? session.user.email}님, 서비스 이용을 위해
          아래 내용에 동의해 주세요.
        </p>

        <div className="mt-5 space-y-4 rounded-xl bg-slate-50 p-4 text-sm text-slate-600">
          <div>
            <p className="font-semibold text-slate-800">
              1. 수집 항목 (필수)
            </p>
            <p>이름, 이메일, 휴대폰번호, 로그인 계정 식별정보</p>
          </div>
          <div>
            <p className="font-semibold text-slate-800">
              2. 수집·이용 목적 (필수)
            </p>
            <p>
              건설기계 대여대금 지급보증서 발급, 현장/계약 정보 등록 및
              담당자 SMS 발송
            </p>
          </div>
          <div>
            <p className="font-semibold text-slate-800">
              3. 보유·이용 기간 (필수)
            </p>
            <p>회원 탈퇴 시 또는 목적 달성 후 지체 없이 파기</p>
          </div>
          <p className="text-xs text-slate-400">
            동의를 거부할 권리가 있으며, 필수 항목 동의 거부 시 서비스 이용이
            제한될 수 있습니다.
          </p>
        </div>

        <form action={agree} className="mt-6 space-y-4">
          <label className="flex items-start gap-3 text-sm text-slate-700">
            <input
              type="checkbox"
              name="required"
              required
              className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            <span>
              <strong>(필수)</strong> 개인정보 수집 및 이용에 동의합니다.
            </span>
          </label>
          <label className="flex items-start gap-3 text-sm text-slate-700">
            <input
              type="checkbox"
              name="marketing"
              className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            <span>(선택) 서비스 안내 및 이벤트 정보 수신에 동의합니다.</span>
          </label>

          <button
            type="submit"
            className="w-full rounded-xl bg-blue-700 px-4 py-3 text-[15px] font-semibold text-white shadow-sm transition hover:bg-blue-800 active:scale-[0.99]"
          >
            동의하고 계속하기
          </button>
        </form>
      </div>
    </main>
  );
}
