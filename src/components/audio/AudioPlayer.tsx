import { useEffect, useRef, useState, useCallback } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  Volume1,
  VolumeX,
  Download,
  Heart,
  Share2,
} from 'lucide-react';
import { Waveform } from './Waveform';
import { Button } from '@/components/ui/Button';
import { useApp } from '@/state/AppContext';
import type { Podcast } from '@/types';

interface AudioPlayerProps {
  podcast: Podcast;
  compact?: boolean;
}

const speeds = [0.75, 1, 1.25, 1.5, 2];

function formatTime(sec: number): string {
  if (!isFinite(sec) || sec < 0) sec = 0;
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function AudioPlayer({ podcast, compact = false }: AudioPlayerProps) {
  const { toast, toggleFavoritePodcast, openMiniPlayer } = useApp();
  const [current, setCurrent] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [volume, setVolume] = useState(0.8);
  const [muted, setMuted] = useState(false);
  const [speedIdx, setSpeedIdx] = useState(1);
  const [favorited, setFavorited] = useState(!!podcast.favorite);
  const intervalRef = useRef<number | null>(null);
  const speed = speeds[speedIdx];

  useEffect(() => {
    setCurrent(0);
    setPlaying(true);
  }, [podcast.id]);

  const tick = useCallback(() => {
    setCurrent((c) => {
      const next = c + speed;
      if (next >= podcast.durationSec) {
        return podcast.durationSec;
      }
      return next;
    });
  }, [speed, podcast.durationSec]);

  useEffect(() => {
    if (playing && current < podcast.durationSec) {
      intervalRef.current = window.setInterval(tick, 1000);
      openMiniPlayer({ ...podcast });
    }
    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
    };
  }, [playing, speed, podcast, current, tick, openMiniPlayer]);

  useEffect(() => {
    setFavorited(!!podcast.favorite);
  }, [podcast.favorite]);

  const seek = (sec: number) => setCurrent(Math.max(0, Math.min(podcast.durationSec, sec)));

  const cycleSpeed = () => setSpeedIdx((i) => (i + 1) % speeds.length);

  const volIcon = muted || volume === 0 ? <VolumeX size={18} /> : volume < 0.5 ? <Volume1 size={18} /> : <Volume2 size={18} />;

  const skipAmt = 15;

  return (
    <div className="rounded-2xl border border-white/10 bg-ink-850 p-5 shadow-card sm:p-6">
      <div className="flex flex-col gap-5">
        {/* Track info row */}
        <div className="flex items-center gap-4">
          <div
            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl text-white"
            style={{ background: `linear-gradient(135deg, ${podcast.coverAccent}, ${podcast.coverAccent}99)` }}
          >
            <Play size={22} fill="currentColor" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-[15px] font-semibold text-white">{podcast.title}</h3>
            <p className="mt-0.5 truncate text-[13px] text-slate-400">
              {formatTime(podcast.durationSec)} · {podcast.pages} pages · {podcast.language}
            </p>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" onClick={() => { setFavorited((f) => !f); toggleFavoritePodcast(podcast.id); toast({ title: favorited ? 'Removed from Favorites' : 'Added to Favorites', variant: 'success' }); }} aria-label="Favorite">
              <Heart size={18} className={favorited ? 'fill-bad-500 text-bad-500' : 'text-slate-400'} />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => { toast({ title: 'Share link copied', variant: 'info' }); }} aria-label="Share">
              <Share2 size={18} />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => toast({ title: 'Downloading MP3…', description: `${podcast.title}.mp3`, variant: 'success' })} aria-label="Download MP3">
              <Download size={18} />
            </Button>
          </div>
        </div>

        {/* Waveform */}
        <div>
          <Waveform progress={current} durationSec={podcast.durationSec} onSeek={seek} playing={playing} bars={compact ? 40 : 72} height={compact ? 40 : 56} />
          <div className="mt-2 flex items-center justify-between text-[12.5px] tabular-nums text-slate-400">
            <span>{formatTime(current)}</span>
            <span>{formatTime(podcast.durationSec)}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-1.5">
            <Button variant="ghost" size="icon" onClick={() => seek(current - skipAmt)} aria-label="Back 15s">
              <SkipBack size={18} />
            </Button>
            <Button
              size="icon"
              className="h-12 w-12"
              onClick={() => setPlaying((p) => !p)}
              aria-label={playing ? 'Pause' : 'Play'}
            >
              {playing ? <Pause size={22} fill="currentColor" /> : <Play size={22} fill="currentColor" />}
            </Button>
            <Button variant="ghost" size="icon" onClick={() => seek(current + skipAmt)} aria-label="Forward 15s">
              <SkipForward size={18} />
            </Button>
          </div>

          <div className="flex items-center gap-3">
            {/* Volume */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setMuted((m) => !m)}
                className="text-slate-400 transition-colors hover:text-white"
                aria-label="Mute"
              >
                {volIcon}
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={muted ? 0 : volume}
                onChange={(e) => {
                  setVolume(parseFloat(e.target.value));
                  setMuted(false);
                }}
                className="h-1 w-20 cursor-pointer appearance-none rounded-full bg-ink-600 accent-brand-500"
                aria-label="Volume"
              />
            </div>

            {/* Speed */}
            <button
              onClick={cycleSpeed}
              className="h-8 rounded-lg border border-white/5 bg-ink-700 px-3 text-[12.5px] font-semibold text-brand-300 transition-colors hover:border-brand-500/30 hover:bg-ink-600"
              aria-label="Playback speed"
            >
              {speed}x
            </button>

            <Button
              size="sm"
              variant="secondary"
              leftIcon={<Download size={14} />}
              onClick={() => toast({ title: 'Downloading MP3…', description: `${podcast.title}.mp3`, variant: 'success' })}
            >
              Download
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
