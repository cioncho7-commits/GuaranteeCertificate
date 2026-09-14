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
      icon: "🏢",
    },
    {
      href: "/report/subcontract",
      title: "불법하도급 신고",
      desc: "불법 하도급 사례를 신고합니다",
      icon: "⚠️",
    },
    {
      href: "/report/no-contract",
      title: "계약서 미작성 신고",
      desc: "계약서 미작성 사례를 신고합니다",
      icon: "📝",
    },
    {
      href: "/form",
      title: "보증보험 가입요청",
      desc: "건설기계 대여대금 지급보증서 발급을 신청합니다",
      icon: "🛡️",
      wide: true,
    },
    {
      href: "/report/other",
      title: "기타 신고",
      desc: "그 외 신고하실 내용을 자유롭게 접수합니다",
      icon: "💬",
      wide: true,
    },
  ];

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 px-5 py-8">
      <div>
        <p className="text-xs text-slate-400">{userName}님</p>
        <h1 className="mt-1 text-xl font-bold text-slate-900">
          한북지회 온라인 사업단
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          이용하실 서비스를 선택해 주세요.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {menuItems.map((item) => (
          <a
            key={item.href}
            href={item.href}
            className={`flex flex-col justify-between gap-4 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 p-4 text-white shadow-sm transition active:scale-[0.98] hover:shadow-md ${
              item.wide ? "col-span-2" : ""
            }`}
          >
            <span className="text-3xl">{item.icon}</span>
            <div>
              <p className="text-[16px] font-bold">{item.title}</p>
              <p className="mt-0.5 text-xs text-white/85">{item.desc}</p>
            </div>
          </a>
        ))}
      </div>
    </main>
  );
}
