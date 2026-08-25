import { CheckCircle2, XCircle, Info, AlertTriangle, X } from 'lucide-react';
import { useApp } from '@/state/AppContext';
import type { Toast as ToastType } from '@/types';

const iconMap = {
  success: <CheckCircle2 size={18} className="text-good-400" />,
  error: <XCircle size={18} className="text-bad-400" />,
  info: <Info size={18} className="text-brand-400" />,
  warning: <AlertTriangle size={18} className="text-warn-500" />,
};

const accentMap = {
  success: 'border-good-500/30 bg-good-500/[0.06]',
  error: 'border-bad-500/30 bg-bad-500/[0.06]',
  info: 'border-brand-500/30 bg-brand-500/[0.06]',
  warning: 'border-warn-500/30 bg-warn-500/[0.06]',
};

export function ToastHost() {
  const { toasts, dismissToast } = useApp();
  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-[200] flex w-full max-w-sm flex-col gap-2 p-4">
      {toasts.map((t: ToastType) => (
        <div
          key={t.id}
          className={`pointer-events-auto flex items-start gap-3 rounded-xl border px-4 py-3 shadow-card backdrop-blur-md animate-slide-in-right ${accentMap[t.variant]}`}
          role="status"
        >
          <div className="mt-0.5 shrink-0">{iconMap[t.variant]}</div>
          <div className="min-w-0 flex-1">
            <p className="text-[13.5px] font-medium text-white">{t.title}</p>
            {t.description && <p className="mt-0.5 text-[12.5px] text-slate-400">{t.description}</p>}
          </div>
          <button
            onClick={() => dismissToast(t.id)}
            className="shrink-0 text-slate-500 transition-colors hover:text-white"
            aria-label="Dismiss"
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
