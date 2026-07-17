import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getConsent } from "@/lib/consent";
import { readDb } from "@/lib/db";
import FormClient from "./FormClient";

export default async function FormPage() {
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
  const taxInvoiceProfiles = db.taxInvoiceProfiles.filter(
    (p) => p.ownerId === userId
  );
  const contractProfiles = db.contractProfiles.filter(
    (p) => p.ownerId === userId
  );
  const managerContacts = db.managerContacts.filter(
    (c) => c.ownerId === userId
  );

  return (
    <FormClient
      userName={session.user.name ?? session.user.email ?? "사용자"}
      taxInvoiceProfiles={taxInvoiceProfiles}
      contractProfiles={contractProfiles}
      managerContacts={managerContacts}
    />
  );
}
