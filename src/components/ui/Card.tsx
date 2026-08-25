import type { HTMLAttributes, ReactNode } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'glass' | 'plain';
  interactive?: boolean;
  children: ReactNode;
}

const base = 'rounded-2xl border border-white/5 card-grad';
const variants = {
  default: base,
  glass: `${base} backdrop-blur-md bg-white/[0.03]`,
  plain: 'rounded-2xl border border-white/5 bg-ink-850',
};

export function Card({ variant = 'default', interactive = false, className = '', children, ...rest }: CardProps) {
  return (
    <div
      className={`${variants[variant]} ${interactive ? 'transition-all duration-300 hover:border-white/10 hover:shadow-card hover:-translate-y-0.5' : ''} ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
}

export function CardHeader({ title, subtitle, action }: { title: ReactNode; subtitle?: ReactNode; action?: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 p-5 pb-0">
      <div>
        <h3 className="text-[15px] font-semibold text-white">{title}</h3>
        {subtitle && <p className="mt-0.5 text-[13px] text-slate-400">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function CardBody({ className = '', children }: { className?: string; children: ReactNode }) {
  return <div className={`p-5 ${className}`}>{children}</div>;
}
