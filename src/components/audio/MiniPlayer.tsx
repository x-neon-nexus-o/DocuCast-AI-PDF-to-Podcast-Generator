import { useEffect, useRef, useState } from 'react';
import { Play, Pause, ChevronUp, X, Heart } from 'lucide-react';
import { useApp } from '@/state/AppContext';
import { Waveform } from './Waveform';

function formatTime(sec: number): string {
  if (!isFinite(sec) || sec < 0) sec = 0;
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function MiniPlayer() {
  const { miniPodcast, closeMiniPlayer, playing, setPlaying, navigate } = useApp();
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (!miniPodcast) {
      setProgress(0);
      return;
    }
  }, [miniPodcast]);

  useEffect(() => {
    if (!miniPodcast || !playing) {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
      return;
    }
    intervalRef.current = window.setInterval(() => {
      setProgress((p) => {
        if (!miniPodcast) return 0;
        const next = p + 1;
        if (next >= miniPodcast.durationSec) return miniPodcast.durationSec;
        return next;
      });
    }, 1000);
    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
    };
  }, [miniPodcast, playing]);

  if (!miniPodcast) return null;

  const pct = (progress / miniPodcast.durationSec) * 100;

  return (
    <div className="fixed bottom-4 left-1/2 z-[90] w-[calc(100%-2rem)] max-w-[640px] -translate-x-1/2 animate-slide-up">
      <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-ink-850/95 p-2.5 shadow-card backdrop-blur-xl">
        <div
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-white"
          style={{ background: `linear-gradient(135deg, ${miniPodcast.coverAccent}, ${miniPodcast.coverAccent}99)` }}
        >
          <Play size={16} fill="currentColor" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13px] font-medium text-white">{miniPodcast.title}</p>
          <div className="mt-1 flex items-center gap-2">
            <Waveform progress={progress} durationSec={miniPodcast.durationSec} onSeek={setProgress} playing={playing} bars={28} height={16} variant="mini" />
            <span className="shrink-0 text-[11px] tabular-nums text-slate-500">{formatTime(progress)}</span>
          </div>
        </div>
        <button
          onClick={() => setPlaying(!playing)}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-500 text-white transition-colors hover:bg-brand-400"
          aria-label={playing ? 'Pause' : 'Play'}
        >
          {playing ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" />}
        </button>
        <button
          onClick={() => { setActive(); navigate('podcast'); }}
          className="hidden shrink-0 items-center justify-center rounded-lg p-2 text-slate-400 transition-colors hover:text-white sm:flex"
          aria-label="Expand player"
        >
          <ChevronUp size={16} />
        </button>
        <button
          onClick={closeMiniPlayer}
          className="shrink-0 rounded-lg p-2 text-slate-400 transition-colors hover:text-white"
          aria-label="Close player"
        >
          <X size={16} />
        </button>
      </div>
      <div className="absolute -bottom-0.5 left-2.5 right-2.5 h-0.5 overflow-hidden rounded-full">
        <div className="h-full bg-brand-500/80 transition-[width] duration-300" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );

  function setActive() {
    /* navigate handled by caller */
  }
}
