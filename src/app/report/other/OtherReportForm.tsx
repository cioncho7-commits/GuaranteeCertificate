"use client";

import { useState } from "react";
import type { ManagerContact } from "@/lib/types";

type Props = {
  managerContacts: ManagerContact[];
};

type Attachment = { url: string; name: string } | null;
type Outcome = { ok: boolean; title: string; detail: string };

export default function OtherReportForm({ managerContacts }: Props) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [attachment, setAttachment] = useState<Attachment>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [managerContactId, setManagerContactId] = useState(
    managerContacts[0]?.id ?? ""
  );
  const [submitting, setSubmitting] = useState(false);
  const [outcome, setOutcome] = useState<Outcome | null>(null);

  async function handleFileSelect(file: File) {
    setUploading(true);
    setUploadError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) {
        setUploadError(data.error ?? "업로드에 실패했습니다.");
        return;
      }
      setAttachment({ url: data.url, name: data.name });
    } catch {
      setUploadError("네트워크 오류로 업로드하지 못했습니다.");
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setOutcome(null);

    if (!managerContactId) {
      setOutcome({
        ok: false,
        title: "담당자 미등록",
        detail: "설정에서 담당자 이메일 주소를 먼저 등록해 주세요.",
      });
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "other",
          title,
          description,
          attachmentUrl: attachment?.url,
          attachmentName: attachment?.name,
          managerContactId,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setOutcome({ ok: false, title: "신고 접수 실패", detail: data.error ?? "요청을 처리할 수 없습니다." });
        return;
      }

      if (data.email.ok) {
        setOutcome({
          ok: true,
          title: "접수 완료",
          detail: `담당자(${data.report.managerEmail})에게 신고 내용을 발송했습니다.`,
        });
        setTitle("");
        setDescription("");
        setAttachment(null);
      } else if (data.email.reason === "not_configured") {
        setOutcome({
          ok: false,
          title: "접수는 되었습니다 (이메일 미발송)",
          detail: "이메일 발송 계정이 아직 설정되지 않았습니다.",
        });
      } else {
        setOutcome({
          ok: false,
          title: "이메일 발송 실패",
          detail: data.email.detail ?? "잠시 후 다시 시도해 주세요.",
        });
      }
    } catch {
      setOutcome({ ok: false, title: "오류", detail: "네트워크 오류로 요청을 처리하지 못했습니다." });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 px-5 py-6">
      <a href="/menu" className="text-sm text-blue-700 underline underline-offset-2">
        ← 메뉴로
      </a>
      <h1 className="text-lg font-bold text-slate-900">기타 신고</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <section className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <label className="flex flex-col gap-1 text-sm font-medium text-slate-600">
            제목
            <input
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={inputCls}
            />
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium text-slate-600">
            내용
            <textarea
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={8}
              className={`${inputCls} resize-none`}
            />
          </label>

          <div className="flex flex-col gap-1 text-sm font-medium text-slate-600">
            <span>첨부파일 (사진/PDF, 선택)</span>
            {attachment ? (
              <div className="flex items-center justify-between rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-[15px]">
                <a
                  href={attachment.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="truncate text-blue-700 underline underline-offset-2"
                >
                  {attachment.name}
                </a>
                <button
                  type="button"
                  onClick={() => setAttachment(null)}
                  className="ml-2 shrink-0 text-slate-400 hover:text-red-600"
                >
                  삭제
                </button>
              </div>
            ) : (
              <input
                type="file"
                accept="image/*,.pdf"
                disabled={uploading}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileSelect(file);
                  e.target.value = "";
                }}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-[14px] text-slate-600 file:mr-3 file:rounded-md file:border-0 file:bg-blue-50 file:px-3 file:py-1.5 file:text-blue-700"
              />
            )}
            {uploading && <p className="text-xs text-slate-400">업로드 중...</p>}
            {uploadError && <p className="text-xs text-red-600">{uploadError}</p>}
          </div>
        </section>

        <section className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          {managerContacts.length === 0 ? (
            <p className="rounded-xl bg-amber-50 p-3 text-sm text-amber-700">
              등록된 담당자가 없습니다.{" "}
              <a href="/settings" className="underline underline-offset-2">
                담당자 설정
              </a>
              에서 먼저 등록해 주세요.
            </p>
          ) : (
            <label className="flex flex-col gap-1 text-sm font-medium text-slate-600">
              접수 담당자
              <select
                value={managerContactId}
                onChange={(e) => setManagerContactId(e.target.value)}
                className={inputCls}
              >
                {managerContacts.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.email})
                  </option>
                ))}
              </select>
            </label>
          )}
        </section>

        {outcome && (
          <div
            className={`rounded-xl p-4 text-sm ${
              outcome.ok ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
            }`}
          >
            <p className="font-semibold">{outcome.title}</p>
            <p className="mt-0.5">{outcome.detail}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={submitting || uploading || managerContacts.length === 0}
          className="rounded-xl bg-blue-700 px-4 py-3.5 text-[16px] font-bold text-white shadow-sm transition hover:bg-blue-800 active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          {submitting ? "접수 중..." : "신고 접수"}
        </button>
      </form>
    </main>
  );
}

const inputCls =
  "w-full rounded-lg border border-slate-300 px-3 py-2.5 text-[15px] text-slate-900 focus:border-blue-500 focus:outline-none";
