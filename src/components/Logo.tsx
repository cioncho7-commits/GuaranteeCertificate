export default function Logo({ className = "h-16 w-16" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      className={className}
      role="img"
      aria-label="건설기계 대여대금 지급보증서 로고"
    >
      <rect x="4" y="4" width="56" height="56" rx="14" fill="#1d4ed8" />
      <path
        d="M18 34l8-14 8 8 6-10 10 20"
        stroke="#ffffff"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <path
        d="M16 42h32"
        stroke="#facc15"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <path
        d="M22 48h20"
        stroke="#facc15"
        strokeWidth="4"
        strokeLinecap="round"
        opacity="0.7"
      />
    </svg>
  );
}
