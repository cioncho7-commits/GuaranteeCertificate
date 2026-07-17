"use client";

import { useState } from "react";
import type { ContractProfile, ManagerContact, TaxInvoiceProfile } from "@/lib/types";

type Props = {
  userName: string;
  taxInvoiceProfiles: TaxInvoiceProfile[];
  contractProfiles: ContractProfile[];
  managerContacts: ManagerContact[];
};

type SubmitOutcome = {
  ok: boolean;
  title: string;
  detail: string;
};

export default function FormClient({
  userName,
  taxInvoiceProfiles,
  contractProfiles,
  managerContacts,
}: Props) {
  const [siteName, setSiteName] = useState("");
  const [clientName, setClientName] = useState("");

  const [taxMode, setTaxMode] = useState<"select" | "new">(
    taxInvoiceProfiles.length > 0 ? "select" : "new"
  );
  const [selectedTaxId, setSelectedTaxId] = useState(
    taxInvoiceProfiles[0]?.id ?? ""
  );
  const [lesseeName, setLesseeName] = useState("");
  const [lessorCompanyName, setLessorCompanyName] = useState("");
  const [lessorRepName, setLessorRepName] = useState("");
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [businessRegNumber, setBusinessRegNumber] = useState("");
  const [repPhone, setRepPhone] = useState("");

  const [contractMode, setContractMode] = useState<"select" | "new">(
    contractProfiles.length > 0 ? "select" : "new"
  );
  const [selectedContractId, setSelectedContractId] = useState(
    contractProfiles[0]?.id ?? ""
  );
  const [periodStart, setPeriodStart] = useState("");
  const [periodEnd, setPeriodEnd] = useState("");
  const [unitPrice, setUnitPrice] = useState("");
  const [paymentDueTerms, setPaymentDueTerms] = useState("");

  const [managerContactId, setManagerContactId] = useState(
    managerContacts[0]?.id ?? ""
  );

  const [submitting, setSubmitting] = useState(false);
  const [outcome, setOutcome] = useState<SubmitOutcome | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setOutcome(null);

    if (!managerContactId) {
      setOutcome({
        ok: false,
        title: "담당자 미등록",
        detail: "설정에서 담당자 휴대폰번호를 먼저 등록해 주세요.",
      });
      return;
    }

    const taxInvoice =
      taxMode === "select"
        ? { mode: "existing" as const, id: selectedTaxId }
        : {
            mode: "new" as const,
            data: {
              lesseeName,
              lessorCompanyName,
              lessorRepName,
              vehicleNumber,
              businessRegNumber,
              repPhone,
            },
          };

    const contract =
      contractMode === "select"
        ? { mode: "existing" as const, id: selectedContractId }
        : {
            mode: "new" as const,
            data: { periodStart, periodEnd, unitPrice, paymentDueTerms },
          };

    setSubmitting(true);
    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          siteName,
          clientName,
          taxInvoice,
          contract,
          managerContactId,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setOutcome({ ok: false, title: "송신 실패", detail: data.error ?? "요청을 처리할 수 없습니다." });
        return;
      }

      if (data.sms.ok) {
        setOutcome({
          ok: true,
          title: "발송 완료",
          detail: `담당자(${data.submission.managerPhone})에게 SMS를 발송했습니다.`,
        });
      } else if (data.sms.reason === "not_configured") {
        setOutcome({
          ok: false,
          title: "정보는 저장되었습니다 (SMS 미발송)",
          detail:
            "SMS 연동 키가 아직 설정되지 않았습니다. 관리자가 .env.local에 알리고(Aligo) 키를 설정하면 자동 발송됩니다.",
        });
      } else {
        setOutcome({
          ok: false,
          title: "SMS 발송 실패",
          detail: data.sms.detail ?? "잠시 후 다시 시도해 주세요.",
        });
      }
    } catch {
      setOutcome({
        ok: false,
        title: "오류",
        detail: "네트워크 오류로 요청을 처리하지 못했습니다.",
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 px-5 py-6">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-xs text-slate-400">{userName}님</p>
          <h1 className="text-lg font-bold text-slate-900">
            건설기계 대여대금 지급보증서 등록
          </h1>
        </div>
        <a
          href="/settings"
          className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
        >
          담당자 설정
        </a>
      </header>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <Section title="1. 현장 정보">
          <Field label="현장명">
            <input
              required
              value={siteName}
              onChange={(e) => setSiteName(e.target.value)}
              placeholder="예: OO아파트 신축공사"
              className={inputCls}
            />
          </Field>
          <Field label="원청명">
            <input
              required
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              placeholder="예: OO건설(주)"
              className={inputCls}
            />
          </Field>
        </Section>

        <Section title="2. 세금계산서 등록">
          <ModeToggle
            mode={taxMode}
            onChange={setTaxMode}
            hasSaved={taxInvoiceProfiles.length > 0}
            selectLabel="등록된 정보 불러오기"
            newLabel="신규 등록"
          />

          {taxMode === "select" ? (
            <Field label="등록된 세금계산서 정보">
              <select
                value={selectedTaxId}
                onChange={(e) => setSelectedTaxId(e.target.value)}
                className={inputCls}
              >
                {taxInvoiceProfiles.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.lessorCompanyName} / {p.vehicleNumber} (임차인 {p.lesseeName})
                  </option>
                ))}
              </select>
            </Field>
          ) : (
            <>
              <Field label="건설기계임차인명">
                <input
                  required
                  value={lesseeName}
                  onChange={(e) => setLesseeName(e.target.value)}
                  className={inputCls}
                />
              </Field>
              <Field label="건설기계임대인명 (회사명)">
                <input
                  required
                  value={lessorCompanyName}
                  onChange={(e) => setLessorCompanyName(e.target.value)}
                  placeholder="사업자등록증상 회사명"
                  className={inputCls}
                />
              </Field>
              <Field label="건설기계임대인명 (대표자명)">
                <input
                  required
                  value={lessorRepName}
                  onChange={(e) => setLessorRepName(e.target.value)}
                  className={inputCls}
                />
              </Field>
              <Field label="차량번호">
                <input
                  required
                  value={vehicleNumber}
                  onChange={(e) => setVehicleNumber(e.target.value)}
                  placeholder="예: 12가 3456"
                  className={inputCls}
                />
              </Field>
              <Field label="사업자등록번호">
                <input
                  required
                  value={businessRegNumber}
                  onChange={(e) => setBusinessRegNumber(e.target.value)}
                  placeholder="000-00-00000"
                  className={inputCls}
                />
              </Field>
              <Field label="대표자 휴대폰번호">
                <input
                  required
                  value={repPhone}
                  onChange={(e) => setRepPhone(e.target.value)}
                  placeholder="010-0000-0000"
                  className={inputCls}
                />
              </Field>
            </>
          )}
        </Section>

        <Section title="3. 계약서 등록">
          <ModeToggle
            mode={contractMode}
            onChange={setContractMode}
            hasSaved={contractProfiles.length > 0}
            selectLabel="등록된 계약서 불러오기"
            newLabel="신규 등록"
          />

          {contractMode === "select" ? (
            <Field label="등록된 계약서">
              <select
                value={selectedContractId}
                onChange={(e) => setSelectedContractId(e.target.value)}
                className={inputCls}
              >
                {contractProfiles.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.periodStart} ~ {p.periodEnd} / 단가 {p.unitPrice}
                  </option>
                ))}
              </select>
            </Field>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3">
                <Field label="계약기간 시작">
                  <input
                    type="date"
                    required
                    value={periodStart}
                    onChange={(e) => setPeriodStart(e.target.value)}
                    className={inputCls}
                  />
                </Field>
                <Field label="계약기간 종료">
                  <input
                    type="date"
                    required
                    value={periodEnd}
                    onChange={(e) => setPeriodEnd(e.target.value)}
                    className={inputCls}
                  />
                </Field>
              </div>
              <Field label="단가">
                <input
                  required
                  value={unitPrice}
                  onChange={(e) => setUnitPrice(e.target.value)}
                  placeholder="예: 시간당 55,000원"
                  className={inputCls}
                />
              </Field>
              <Field label="결제기한">
                <input
                  required
                  value={paymentDueTerms}
                  onChange={(e) => setPaymentDueTerms(e.target.value)}
                  placeholder="예: 익월 10일"
                  className={inputCls}
                />
              </Field>
            </>
          )}
        </Section>

        <Section title="4. 담당자">
          {managerContacts.length === 0 ? (
            <p className="rounded-xl bg-amber-50 p-3 text-sm text-amber-700">
              등록된 담당자가 없습니다.{" "}
              <a href="/settings" className="underline underline-offset-2">
                담당자 설정
              </a>
              에서 먼저 등록해 주세요.
            </p>
          ) : (
            <Field label="발송 대상 담당자">
              <select
                value={managerContactId}
                onChange={(e) => setManagerContactId(e.target.value)}
                className={inputCls}
              >
                {managerContacts.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.phone})
                  </option>
                ))}
              </select>
            </Field>
          )}
        </Section>

        {outcome && (
          <div
            className={`rounded-xl p-4 text-sm ${
              outcome.ok
                ? "bg-emerald-50 text-emerald-700"
                : "bg-amber-50 text-amber-700"
            }`}
          >
            <p className="font-semibold">{outcome.title}</p>
            <p className="mt-0.5">{outcome.detail}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={submitting || managerContacts.length === 0}
          className="rounded-xl bg-blue-700 px-4 py-3.5 text-[16px] font-bold text-white shadow-sm transition hover:bg-blue-800 active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          {submitting ? "송신 중..." : "송신"}
        </button>
      </form>
    </main>
  );
}

const inputCls =
  "w-full rounded-lg border border-slate-300 px-3 py-2.5 text-[15px] text-slate-900 focus:border-blue-500 focus:outline-none";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="text-[15px] font-bold text-slate-800">{title}</h2>
      {children}
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1 text-sm font-medium text-slate-600">
      {label}
      {children}
    </label>
  );
}

function ModeToggle({
  mode,
  onChange,
  hasSaved,
  selectLabel,
  newLabel,
}: {
  mode: "select" | "new";
  onChange: (m: "select" | "new") => void;
  hasSaved: boolean;
  selectLabel: string;
  newLabel: string;
}) {
  return (
    <div className="flex gap-2 text-sm">
      <button
        type="button"
        disabled={!hasSaved}
        onClick={() => onChange("select")}
        className={`flex-1 rounded-lg px-3 py-2 font-medium transition disabled:cursor-not-allowed disabled:opacity-40 ${
          mode === "select"
            ? "bg-blue-700 text-white"
            : "bg-slate-100 text-slate-600"
        }`}
      >
        {selectLabel}
      </button>
      <button
        type="button"
        onClick={() => onChange("new")}
        className={`flex-1 rounded-lg px-3 py-2 font-medium transition ${
          mode === "new" ? "bg-blue-700 text-white" : "bg-slate-100 text-slate-600"
        }`}
      >
        {newLabel}
      </button>
    </div>
  );
}
