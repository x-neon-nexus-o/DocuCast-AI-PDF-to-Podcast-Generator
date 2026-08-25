import { useEffect, useRef, useState } from 'react';
import { ChevronDown, Check } from 'lucide-react';

interface FilterDropdownProps {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
  className?: string;
}

export function FilterDropdown({ label, value, options, onChange, className = '' }: FilterDropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selected = options.find((o) => o.value === value) ?? options[0];

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener('mousedown', handler);
    return () => window.removeEventListener('mousedown', handler);
  }, [open]);

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="inline-flex h-10 items-center gap-2 rounded-xl border border-white/5 bg-ink-800 px-3.5 text-sm text-slate-200 transition-colors hover:border-white/10 hover:bg-ink-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/30"
      >
        <span className="text-slate-500">{label}:</span>
        <span className="font-medium text-white">{selected?.label}</span>
        <ChevronDown size={14} className={`text-slate-500 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute right-0 z-30 mt-2 min-w-[180px] animate-fade-in-fast rounded-xl border border-white/10 bg-ink-800 p-1.5 shadow-card">
          {options.map((o) => (
            <button
              key={o.value}
              onClick={() => {
                onChange(o.value);
                setOpen(false);
              }}
              className="flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-[13.5px] text-slate-200 transition-colors hover:bg-white/5"
            >
              {o.label}
              {o.value === value && <Check size={14} className="text-brand-400" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
