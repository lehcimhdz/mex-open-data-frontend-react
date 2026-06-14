export function Wordmark({ size = 22 }: { size?: number }) {
  return (
    <span className="inline-flex items-center gap-2 select-none">
      <svg
        width={size}
        height={size}
        viewBox="0 0 32 32"
        aria-hidden="true"
        className="shrink-0"
      >
        <rect width="32" height="32" rx="7" fill="var(--text-strong)" />
        <path
          d="M9 10 L16 18 L23 10"
          stroke="var(--surface-0)"
          strokeWidth="3"
          fill="none"
          strokeLinecap="square"
        />
        <path
          d="M9 22 L23 22"
          stroke="var(--color-accent-500)"
          strokeWidth="3"
          strokeLinecap="square"
        />
      </svg>
      <span className="flex flex-col leading-none">
        <span className="serif text-[15px] font-semibold text-[var(--text-strong)] tracking-tight">
          MX Open
        </span>
        <span className="text-[10px] mono tracking-[0.18em] text-[var(--text-muted)] mt-0.5 uppercase">
          datos abiertos
        </span>
      </span>
    </span>
  );
}
