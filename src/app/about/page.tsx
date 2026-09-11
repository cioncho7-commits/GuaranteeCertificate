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
          안녕하십니까? 민주노총 전국건설노동조합 서울경기북부 건설기계지부
          한북지회입니다.
        </p>
        <p>
          한북지회의 관할구역은 성북구, 강북구, 도봉구, 노원구, 의정부시,
          양주시, 동두천시입니다.
        </p>
        <p>
          이 지역에서 건설기계 임대료 체불에 불안을 가지신 분이라면 조합원,
          비조합원을 망라하고 누구나 대리 가입을 요청하시면 건설기계
          지급보증서의 보증보험 등록을 도와드리고 있습니다.
        </p>
        <p>많은 건설기계 종사자분들의 참여를 바랍니다.</p>
      </div>
    </main>
  );
}
