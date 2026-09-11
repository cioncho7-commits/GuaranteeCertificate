import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getConsent } from "@/lib/consent";
import Logo from "@/components/Logo";
import LoginButtons from "@/components/LoginButtons";

export default async function HomePage() {
  const session = await auth();

  if (session?.user) {
    const userId = (session.user as { id?: string }).id ?? session.user.email ?? "";
    const consent = await getConsent(userId);
    redirect(consent?.requiredAgreed ? "/menu" : "/consent");
  }

  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-12">
      <div className="flex w-full max-w-sm flex-col items-center gap-8">
        <div className="flex flex-col items-center gap-4">
          <Logo />
          <h1 className="text-center text-2xl font-bold leading-snug text-slate-900">
            건설기계 대여대금
            <br />
            지급보증서
          </h1>
          <p className="text-center text-sm text-slate-500">
            현장 정보를 등록하고 담당자에게 바로 알려드립니다
          </p>
        </div>

        <LoginButtons />

        <p className="text-center text-xs leading-relaxed text-slate-400">
          로그인 시 이용약관 및 개인정보 처리방침에 동의하는 것으로
          간주됩니다.
        </p>
      </div>
    </main>
  );
}
