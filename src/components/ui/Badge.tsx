import type { ReactNode } from 'react';
import type { ProcessingStatus } from '@/types';

interface StatusBadgeProps {
  status: ProcessingStatus;
}

const statusMap: Record<ProcessingStatus, { label: string; cls: string; dot: string }> = {
  ready: { label: 'Ready', cls: 'border-good-500/30 bg-good-500/10 text-good-400', dot: 'bg-good-400' },
  processing: { label: 'Processing', cls: 'border-brand-500/30 bg-brand-500/10 text-brand-300', dot: 'bg-brand-400' },
  failed: { label: 'Failed', cls: 'border-bad-500/30 bg-bad-500/10 text-bad-400', dot: 'bg-bad-400' },
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const s = statusMap[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11.5px] font-medium ${s.cls}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${s.dot} ${status === 'processing' ? 'animate-pulse-soft' : ''}`} />
      {s.label}
    </span>
  );
}

export function Tag({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-md bg-white/5 px-2 py-0.5 text-[11.5px] font-medium text-slate-300 ${className}`}>
      {children}
    </span>
  );
}
