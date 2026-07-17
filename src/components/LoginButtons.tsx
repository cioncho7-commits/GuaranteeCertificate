import { signIn } from "@/lib/auth";

function ProviderButton({
  provider,
  label,
  className,
  icon,
}: {
  provider: string;
  label: string;
  className: string;
  icon: React.ReactNode;
}) {
  return (
    <form
      action={async () => {
        "use server";
        await signIn(provider, { redirectTo: "/consent" });
      }}
    >
      <button
        type="submit"
        className={`flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-[15px] font-semibold shadow-sm transition active:scale-[0.99] ${className}`}
      >
        {icon}
        {label}
      </button>
    </form>
  );
}

export default function LoginButtons() {
  return (
    <div className="flex w-full flex-col gap-3">
      <ProviderButton
        provider="naver"
        label="네이버 로그인"
        className="bg-[#03C75A] text-white hover:brightness-95"
        icon={
          <span className="flex h-5 w-5 items-center justify-center rounded bg-white text-[13px] font-extrabold text-[#03C75A]">
            N
          </span>
        }
      />
      <ProviderButton
        provider="google"
        label="구글 로그인"
        className="border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
        icon={
          <svg className="h-5 w-5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M23.52 12.27c0-.85-.08-1.66-.22-2.44H12v4.62h6.47a5.53 5.53 0 01-2.4 3.63v3h3.88c2.27-2.09 3.57-5.17 3.57-8.81z"
            />
            <path
              fill="#34A853"
              d="M12 24c3.24 0 5.96-1.07 7.95-2.92l-3.88-3c-1.08.73-2.46 1.15-4.07 1.15-3.13 0-5.78-2.11-6.73-4.96H1.27v3.11A12 12 0 0012 24z"
            />
            <path
              fill="#FBBC05"
              d="M5.27 14.27a7.2 7.2 0 010-4.54V6.62H1.27a12 12 0 000 10.76l4-3.11z"
            />
            <path
              fill="#EA4335"
              d="M12 4.77c1.76 0 3.34.6 4.58 1.79l3.44-3.44C17.95 1.19 15.24 0 12 0A12 12 0 001.27 6.62l4 3.11C6.22 6.88 8.87 4.77 12 4.77z"
            />
          </svg>
        }
      />
      <ProviderButton
        provider="kakao"
        label="카카오 로그인"
        className="bg-[#FEE500] text-[#191600] hover:brightness-95"
        icon={
          <svg className="h-5 w-5" viewBox="0 0 24 24">
            <path
              fill="#191600"
              d="M12 3C6.48 3 2 6.48 2 10.8c0 2.75 1.84 5.17 4.62 6.55-.2.72-.73 2.63-.84 3.04-.13.5.18.5.39.36.16-.11 2.6-1.77 3.66-2.49.7.1 1.42.16 2.17.16 5.52 0 10-3.48 10-7.62S17.52 3 12 3z"
            />
          </svg>
        }
      />
    </div>
  );
}
