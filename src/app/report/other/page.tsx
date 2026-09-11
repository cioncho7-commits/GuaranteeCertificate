import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getConsent } from "@/lib/consent";
import { readDb } from "@/lib/db";
import OtherReportForm from "./OtherReportForm";

export default async function OtherReportPage() {
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

  return <OtherReportForm managerContacts={managerContacts} />;
}
