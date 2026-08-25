import { Search, X } from 'lucide-react';

interface SearchBarProps {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
  autoFocus?: boolean;
  onSubmit?: () => void;
}

export function SearchBar({ value, onChange, placeholder = 'Search', className = '', autoFocus = false, onSubmit }: SearchBarProps) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit?.();
      }}
      className={`relative ${className}`}
    >
      <Search
        size={16}
        className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500"
      />
      <input
        type="text"
        value={value}
        autoFocus={autoFocus}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-10 w-full rounded-xl border border-white/5 bg-ink-800 pl-10 pr-9 text-sm text-slate-100 placeholder:text-slate-500 transition-colors focus:border-brand-500/40 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-500 transition-colors hover:text-white"
          aria-label="Clear search"
        >
          <X size={14} />
        </button>
      )}
    </form>
  );
}
