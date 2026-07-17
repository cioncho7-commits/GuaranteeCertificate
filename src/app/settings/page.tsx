import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { readDb, updateDb } from "@/lib/db";
import { randomUUID } from "crypto";
import type { ManagerContact } from "@/lib/types";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/");
  }
  const userId =
    (session.user as { id?: string }).id ?? session.user.email ?? "";

  const db = await readDb();
  const contacts = db.managerContacts.filter((c) => c.ownerId === userId);

  async function addContact(formData: FormData) {
    "use server";
    const name = String(formData.get("name") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim();
    if (!name || !EMAIL_RE.test(email)) {
      redirect("/settings?error=1");
    }
    const contact: ManagerContact = {
      id: randomUUID(),
      ownerId: userId,
      name,
      email,
      createdAt: new Date().toISOString(),
    };
    await updateDb((db) => {
      db.managerContacts.push(contact);
    });
    redirect("/settings");
  }

  async function removeContact(formData: FormData) {
    "use server";
    const id = String(formData.get("id") ?? "");
    await updateDb((db) => {
      db.managerContacts = db.managerContacts.filter(
        (c) => !(c.id === id && c.ownerId === userId)
      );
    });
    redirect("/settings");
  }

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 px-5 py-8">
      <div>
        <a href="/form" className="text-sm text-blue-700 underline underline-offset-2">
          ← 입력 화면으로
        </a>
        <h1 className="mt-2 text-xl font-bold text-slate-900">담당자 설정</h1>
        <p className="mt-1 text-sm text-slate-500">
          송신 시 정보를 받을 담당자의 이메일 주소를 등록하세요.
        </p>
      </div>

      <form
        action={addContact}
        className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
      >
        <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
          담당자 이름
          <input
            name="name"
            required
            placeholder="예: 홍길동"
            className="rounded-lg border border-slate-300 px-3 py-2 text-[15px] focus:border-blue-500 focus:outline-none"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
          이메일 주소
          <input
            name="email"
            type="email"
            required
            placeholder="manager@example.com"
            className="rounded-lg border border-slate-300 px-3 py-2 text-[15px] focus:border-blue-500 focus:outline-none"
          />
        </label>
        <button
          type="submit"
          className="mt-1 rounded-xl bg-blue-700 px-4 py-2.5 text-[15px] font-semibold text-white transition hover:bg-blue-800 active:scale-[0.99]"
        >
          담당자 등록
        </button>
      </form>

      <div className="flex flex-col gap-2">
        {contacts.length === 0 && (
          <p className="rounded-xl bg-slate-100 p-4 text-center text-sm text-slate-400">
            등록된 담당자가 없습니다.
          </p>
        )}
        {contacts.map((c) => (
          <div
            key={c.id}
            className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3"
          >
            <div>
              <p className="text-[15px] font-semibold text-slate-800">{c.name}</p>
              <p className="text-sm text-slate-500">{c.email}</p>
            </div>
            <form action={removeContact}>
              <input type="hidden" name="id" value={c.id} />
              <button
                type="submit"
                className="rounded-lg px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50"
              >
                삭제
              </button>
            </form>
          </div>
        ))}
      </div>
    </main>
  );
}
