import type { Chapter } from '@/types';

interface ChapterListProps {
  chapters: Chapter[];
  currentSec: number;
  onSeek: (sec: number) => void;
}

function formatTime(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

export function ChapterList({ chapters, currentSec, onSeek }: ChapterListProps) {
  const activeIdx = chapters.reduce((acc, ch, i) => (currentSec >= ch.startSec ? i : acc), 0);
  return (
    <div className="space-y-1">
      {chapters.map((ch, i) => {
        const active = i === activeIdx;
        return (
          <button
            key={ch.id}
            onClick={() => onSeek(ch.startSec)}
            className={`group flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-all duration-200 ${
              active
                ? 'border-brand-500/30 bg-brand-500/10'
                : 'border-transparent hover:border-white/5 hover:bg-white/[0.03]'
            }`}
          >
            <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[12px] font-semibold tabular-nums ${active ? 'bg-brand-500 text-white' : 'bg-ink-700 text-slate-400'}`}>
              {formatTime(ch.startSec)}
            </span>
            <span className={`flex-1 text-[13.5px] font-medium ${active ? 'text-white' : 'text-slate-300'}`}>
              {ch.title}
            </span>
            {active && <span className="h-1.5 w-1.5 animate-pulse-soft rounded-full bg-brand-400" />}
          </button>
        );
      })}
    </div>
  );
}
