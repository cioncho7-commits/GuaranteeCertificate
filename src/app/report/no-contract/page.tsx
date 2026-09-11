import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getConsent } from "@/lib/consent";
import { readDb } from "@/lib/db";
import ReportForm from "../ReportForm";

export default async function NoContractReportPage() {
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

  const db = await readDb();
  const managerContacts = db.managerContacts.filter((c) => c.ownerId === userId);

  return (
    <ReportForm
      type="no_contract"
      title="계약서 미작성 신고"
      companyLabel="신고 대상 업체명 (원청)"
      descriptionLabel="신고 내용"
      descriptionPlaceholder="계약서를 작성하지 않은 경위와 정황을 자세히 적어주세요."
      managerContacts={managerContacts}
    />
  );
}
