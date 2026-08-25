import type { ReactNode } from 'react';

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({ icon, title, description, action, className = '' }: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center px-6 py-16 text-center ${className}`}>
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/5 bg-white/[0.02] text-slate-400">
        {icon}
      </div>
      <h3 className="text-base font-semibold text-white">{title}</h3>
      {description && <p className="mt-1.5 max-w-sm text-[13.5px] text-slate-400">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
