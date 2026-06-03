export default function VerifiedBadge({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 18 18" fill="none" aria-label="Verificado" style={{ display: "inline-block", flexShrink: 0 }}>
      <defs>
        <linearGradient id="vbg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#4facfe" />
          <stop offset="100%" stopColor="#1d6cf5" />
        </linearGradient>
      </defs>
      <circle cx="9" cy="9" r="9" fill="url(#vbg)" />
      <path d="M5 9l2.8 2.8 5-5.3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
