import { useMemo } from 'react';

interface WaveformProps {
  progress?: number;
  durationSec?: number;
  onSeek?: (sec: number) => void;
  bars?: number;
  height?: number;
  playing?: boolean;
  className?: string;
  variant?: 'default' | 'mini';
}

export function Waveform({
  progress = 0,
  durationSec = 1,
  onSeek,
  bars = 64,
  height = 56,
  playing = false,
  className = '',
  variant = 'default',
}: WaveformProps) {
  const heights = useMemo(() => {
    const seed = [0.4, 0.7, 0.3, 0.9, 0.5, 0.8, 0.35, 0.6, 0.45, 0.75, 0.55, 0.85, 0.4, 0.65, 0.5, 0.9];
    const arr: number[] = [];
    for (let i = 0; i < bars; i++) {
      const base = seed[i % seed.length];
      const wave = Math.sin(i * 0.4) * 0.2 + 0.5;
      arr.push(Math.min(1, Math.max(0.12, base * 0.6 + wave * 0.4)));
    }
    return arr;
  }, [bars]);

  const playedPct = durationSec > 0 ? Math.min(1, Math.max(0, progress / durationSec)) : 0;
  const playedBars = Math.floor(playedPct * bars);

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!onSeek) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    onSeek(Math.max(0, Math.min(durationSec, pct * durationSec)));
  };

  return (
    <div
      className={`flex items-end gap-[2px] ${onSeek ? 'cursor-pointer' : ''} ${className}`}
      style={{ height }}
      onClick={handleClick}
      role="slider"
      aria-valuenow={Math.round(playedPct * 100)}
      aria-valuemin={0}
      aria-valuemax={100}
      tabIndex={0}
    >
      {heights.map((h, i) => {
        const isPlayed = i < playedBars;
        const isCurrent = i === playedBars;
        return (
          <div
            key={i}
            className={`flex-1 rounded-full transition-colors duration-150 ${variant === 'mini' ? 'min-w-[1.5px]' : 'min-w-[2px]'} ${
              isPlayed
                ? 'bg-brand-400'
                : isCurrent
                  ? 'bg-brand-500/80'
                  : 'bg-slate-600/60'
            }`}
            style={{
              height: `${h * 100}%`,
              ...(playing && isCurrent ? { animation: 'wave 0.8s ease-in-out infinite' } : {}),
            }}
          />
        );
      })}
    </div>
  );
}
