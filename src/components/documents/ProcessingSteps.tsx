import { Check, Loader2, Circle } from 'lucide-react';

interface ProcessingStepsProps {
  currentStep: number;
  steps?: { id: number; label: string; description: string }[];
}

const defaultSteps = [
  { id: 0, label: 'Uploading PDF', description: 'Transferring your document securely' },
  { id: 1, label: 'Extracting Text', description: 'Reading all pages with PyPDF2' },
  { id: 2, label: 'Understanding Document', description: 'Gemini AI is analyzing the content' },
  { id: 3, label: 'Generating Podcast Script', description: 'Writing a natural conversation' },
  { id: 4, label: 'Synthesizing Voice', description: 'Edge-TTS is producing natural speech' },
  { id: 5, label: 'Preparing Audio', description: 'Encoding MP3 and adding chapters' },
];

export function ProcessingSteps({ currentStep, steps = defaultSteps }: ProcessingStepsProps) {
  return (
    <div className="space-y-1">
      {steps.map((step, idx) => {
        const isComplete = idx < currentStep;
        const isActive = idx === currentStep;
        const isWaiting = idx > currentStep;
        return (
          <div
            key={step.id}
            className={`relative flex items-start gap-4 rounded-xl p-3 transition-all duration-500 ${
              isActive ? 'bg-brand-500/[0.06]' : ''
            }`}
          >
            <div className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center">
              {isComplete ? (
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-good-500 text-white animate-scale-in">
                  <Check size={16} />
                </div>
              ) : isActive ? (
                <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-brand-400 bg-brand-500/10">
                  <Loader2 size={16} className="animate-spin text-brand-300" />
                </div>
              ) : (
                <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-ink-600 text-slate-600">
                  <Circle size={10} fill="currentColor" />
                </div>
              )}
              {idx < steps.length - 1 && (
                <div
                  className={`absolute left-1/2 top-full h-[calc(100%+4px)] w-px -translate-x-1/2 ${
                    isComplete ? 'bg-good-500/50' : 'bg-ink-600'
                  }`}
                />
              )}
            </div>
            <div className="flex-1 pb-2">
              <p className={`text-[14px] font-medium transition-colors ${
                isComplete ? 'text-slate-400' : isActive ? 'text-white' : 'text-slate-600'
              }`}>
                {step.label}
                {isComplete && <span className="ml-2 text-[11.5px] text-good-400">✓ Complete</span>}
                {isActive && <span className="ml-2 text-[11.5px] text-brand-300">● Processing</span>}
                {isWaiting && <span className="ml-2 text-[11.5px] text-slate-600">○ Waiting</span>}
              </p>
              <p className={`mt-0.5 text-[12.5px] transition-colors ${
                isActive ? 'text-slate-400' : 'text-slate-600'
              }`}>
                {step.description}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
