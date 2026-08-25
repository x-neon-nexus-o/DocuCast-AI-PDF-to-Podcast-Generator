interface ProgressBarProps {
  value: number;
  max?: number;
  className?: string;
  barClassName?: string;
  showGlow?: boolean;
}

export function ProgressBar({ value, max = 100, className = '', barClassName = '', showGlow = true }: ProgressBarProps) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <div className={`h-1.5 w-full overflow-hidden rounded-full bg-ink-700 ${className}`}>
      <div
        className={`h-full rounded-full bg-brand-500 transition-[width] duration-300 ease-out ${showGlow ? 'shadow-[0_0_8px_rgba(27,123,246,0.5)]' : ''} ${barClassName}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
