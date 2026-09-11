import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getConsent } from "@/lib/consent";

export default async function MenuPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/");
  }
  const userId =
    (session.user as { id?: string }).id ?? session.user.email ?? "";

  const consent = await getConsent(userId);
  if (!consent?.requiredAgreed) {
    redirect("/consent");
  }

  const userName = session.user.name ?? session.user.email ?? "사용자";

  const menuItems = [
    {
      href: "/about",
      title: "한북지회 소개",
      desc: "한북지회에 대해 알아보세요",
    },
    {
      href: "/report/subcontract",
      title: "불법하도급 신고",
      desc: "불법 하도급 사례를 신고합니다",
    },
    {
      href: "/report/no-contract",
      title: "계약서 미작성 신고",
      desc: "계약서 미작성 사례를 신고합니다",
    },
    {
      href: "/form",
      title: "보증보험 가입요청",
      desc: "건설기계 대여대금 지급보증서 발급을 신청합니다",
    },
  ];

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 px-5 py-8">
      <div>
        <p className="text-xs text-slate-400">{userName}님</p>
        <h1 className="mt-1 text-xl font-bold text-slate-900">
          한북지회 서비스
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          이용하실 서비스를 선택해 주세요.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {menuItems.map((item) => (
          <a
            key={item.href}
            href={item.href}
            className="flex flex-col gap-1 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-blue-300 hover:shadow-md"
          >
            <span className="text-[16px] font-bold text-slate-900">
              {item.title}
            </span>
            <span className="text-sm text-slate-500">{item.desc}</span>
          </a>
        ))}
      </div>
    </main>
  );
}
