import type { ReactNode } from 'react';
import { AlertTriangle, RefreshCw, FileText } from 'lucide-react';
import { Button } from './Button';

interface ErrorStateProps {
  variant?: 'pdf' | 'ai' | 'audio' | 'generic';
  title?: string;
  description?: string;
  reason?: string;
  reasons?: string[];
  onRetry?: () => void;
  onAlternative?: () => void;
  retryLabel?: string;
  alternativeLabel?: string;
}

const defaults = {
  pdf: {
    title: 'Unable to process this PDF',
    description: 'We could not extract the text from your document.',
    reasons: ['File too large (over 20 MB)', 'Corrupted PDF', 'Unsupported document type', 'Processing timeout'],
    retryLabel: 'Try Again',
    alternativeLabel: 'Choose Another File',
  },
  ai: {
    title: 'Something went wrong while generating your podcast.',
    description: 'The AI could not produce a script from this document.',
    reasons: ['No readable text found', 'AI service timed out', 'Document content too short'],
    retryLabel: 'Retry Generation',
    alternativeLabel: 'Back to Upload',
  },
  audio: {
    title: 'Voice synthesis failed.',
    description: 'We could not generate the audio for your script.',
    reasons: ['Voice service unavailable', 'Script too long for one pass', 'Language not supported'],
    retryLabel: 'Retry Synthesis',
    alternativeLabel: 'Change Settings',
  },
  generic: {
    title: 'Something went wrong',
    description: 'An unexpected error occurred.',
    reasons: [],
    retryLabel: 'Try Again',
    alternativeLabel: 'Go Back',
  },
};

export function ErrorState({
  variant = 'generic',
  title,
  description,
  reason,
  reasons,
  onRetry,
  onAlternative,
  retryLabel,
  alternativeLabel,
}: ErrorStateProps) {
  const d = defaults[variant];
  const list = reasons ?? d.reasons;
  return (
    <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
      <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-bad-500/30 bg-bad-500/10 text-bad-400">
        {variant === 'pdf' ? <FileText size={26} /> : <AlertTriangle size={26} />}
      </div>
      <h3 className="text-lg font-semibold text-white">{title ?? d.title}</h3>
      <p className="mt-1.5 max-w-md text-sm text-slate-400">{description ?? d.description}</p>

      {reason && (
        <p className="mt-3 inline-flex items-center gap-2 rounded-lg border border-bad-500/20 bg-bad-500/5 px-3 py-1.5 text-[12.5px] text-bad-300">
          {reason}
        </p>
      )}

      {list.length > 0 && !reason && (
        <div className="mt-5 w-full max-w-sm rounded-xl border border-white/5 bg-ink-850 p-4 text-left">
          <p className="mb-2 text-[12px] font-medium uppercase tracking-wide text-slate-500">Possible causes</p>
          <ul className="space-y-1.5">
            {list.map((r) => (
              <li key={r} className="flex items-center gap-2 text-[13px] text-slate-300">
                <span className="h-1 w-1 rounded-full bg-slate-500" />
                {r}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        {onRetry && (
          <Button onClick={onRetry} leftIcon={<RefreshCw size={16} />}>
            {retryLabel ?? d.retryLabel}
          </Button>
        )}
        {onAlternative && (
          <Button variant="secondary" onClick={onAlternative}>
            {alternativeLabel ?? d.alternativeLabel}
          </Button>
        )}
      </div>
    </div>
  );
}
