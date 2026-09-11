import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getConsent } from "@/lib/consent";
import { readDb } from "@/lib/db";
import ReportForm from "../ReportForm";

export default async function SubcontractReportPage() {
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
      type="subcontract"
      title="불법하도급 신고"
      showResubcontractor
      managerContacts={managerContacts}
    />
  );
}
