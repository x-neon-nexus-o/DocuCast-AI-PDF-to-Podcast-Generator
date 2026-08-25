export function Logo({ size = 30 }: { size?: number }) {
  return (
    <div
      className="relative flex items-center justify-center rounded-[8px] brand-grad"
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <svg viewBox="0 0 32 32" width={size * 0.72} height={size * 0.72} fill="none">
        <path d="M8 11h4v2H8zM8 15h6v2H8zM8 19h4v2H8z" fill="#fff" opacity="0.9" />
        <path d="M20 9.5c2.5 1.5 2.5 11.5 0 13" stroke="#4cd9e8" strokeWidth="2" strokeLinecap="round" />
        <path d="M23 8c3 2 3 14 0 16" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" opacity="0.7" />
      </svg>
    </div>
  );
}
