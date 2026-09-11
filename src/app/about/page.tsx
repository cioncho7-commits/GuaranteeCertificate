import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export default async function AboutPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/");
  }

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 px-5 py-8">
      <a href="/menu" className="text-sm text-blue-700 underline underline-offset-2">
        ← 메뉴로
      </a>

      <div>
        <h1 className="text-xl font-bold text-slate-900">한북지회 소개</h1>
      </div>

      <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 text-sm leading-relaxed text-slate-700 shadow-sm">
        <p>
          한북지회는 건설기계 대여 사업자의 권익 보호와 건전한 건설현장
          거래질서 확립을 위해 활동하는 지역 조직입니다.
        </p>
        <p>
          건설기계 대여대금 지급보증서 발급 지원, 불법 하도급 및 계약서
          미작성 관행 신고 접수 등을 통해 회원의 대여대금을 안전하게
          지키고 있습니다.
        </p>
        <p className="text-xs text-slate-400">
          ※ 이 페이지의 소개 내용은 임시 문구입니다. 실제 안내하실 내용(연락처,
          주소, 연혁 등)을 알려주시면 반영해 드리겠습니다.
        </p>
      </div>
    </main>
  );
}
