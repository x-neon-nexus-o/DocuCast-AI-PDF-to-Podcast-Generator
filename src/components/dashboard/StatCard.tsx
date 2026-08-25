import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  accent: string;
  trend: string;
}

const accentMap: Record<string, { bg: string; text: string }> = {
  brand: { bg: 'bg-brand-500/10', text: 'text-brand-300' },
  cyan: { bg: 'bg-cyan-500/10', text: 'text-cyan-400' },
  good: { bg: 'bg-good-500/10', text: 'text-good-400' },
  warn: { bg: 'bg-warn-500/10', text: 'text-warn-500' },
  bad: { bg: 'bg-bad-500/10', text: 'text-bad-400' },
};

export function StatCard({ icon: Icon, label, value, accent, trend }: StatCardProps) {
  const a = accentMap[accent] ?? accentMap.brand;
  return (
    <div className="rounded-2xl border border-white/5 bg-ink-850 p-5 transition-all duration-300 hover:border-white/10 hover:shadow-card">
      <div className="flex items-center justify-between">
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${a.bg} ${a.text}`}>
          <Icon size={18} />
        </div>
        <span className="text-[11px] text-slate-500">{trend}</span>
      </div>
      <p className="mt-4 text-2xl font-bold text-white">{value}</p>
      <p className="mt-0.5 text-[12.5px] text-slate-400">{label}</p>
    </div>
  );
}
