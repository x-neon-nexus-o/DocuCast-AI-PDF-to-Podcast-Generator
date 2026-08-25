import { Play, Heart, MoreHorizontal, Clock } from 'lucide-react';
import { useApp } from '@/state/AppContext';
import type { Podcast } from '@/types';
import { useEffect, useRef, useState } from 'react';

interface PodcastCardProps {
  podcast: Podcast;
  onOpen?: () => void;
}

function formatDuration(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m} min ${s.toString().padStart(2, '0')} sec`;
}

export function PodcastCard({ podcast, onOpen }: PodcastCardProps) {
  const { toggleFavoritePodcast, openMiniPlayer, toast } = useApp();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    window.addEventListener('mousedown', handler);
    return () => window.removeEventListener('mousedown', handler);
  }, [menuOpen]);

  const handlePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    openMiniPlayer(podcast);
    toast({ title: `Playing "${podcast.title}"`, variant: 'info' });
  };

  return (
    <div
      onClick={onOpen}
      className="group cursor-pointer overflow-hidden rounded-2xl border border-white/5 bg-ink-850 p-4 transition-all duration-300 hover:-translate-y-1 hover:border-white/10 hover:shadow-card"
    >
      <div className="relative mb-4 aspect-square overflow-hidden rounded-xl">
        <div
          className="absolute inset-0"
          style={{ background: `linear-gradient(135deg, ${podcast.coverAccent}, ${podcast.coverAccent}55 70%, transparent)` }}
        />
        <div className="absolute inset-0 opacity-30 grid-bg" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm transition-all duration-300 group-hover:scale-110 group-hover:bg-white/20">
            <Play size={24} fill="white" className="text-white" />
          </div>
        </div>
        <div className="absolute left-3 top-3 rounded-md bg-black/30 px-2 py-0.5 text-[10.5px] font-medium uppercase tracking-wide text-white/90 backdrop-blur-sm">
          {podcast.category}
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); toggleFavoritePodcast(podcast.id); toast({ title: podcast.favorite ? 'Removed from Favorites' : 'Added to Favorites', variant: 'success' }); }}
          className="absolute right-3 top-3 rounded-md bg-black/30 p-1.5 text-white/80 backdrop-blur-sm transition-colors hover:text-white"
          aria-label="Favorite"
        >
          <Heart size={14} className={podcast.favorite ? 'fill-bad-500 text-bad-500' : ''} />
        </button>
        <div className="absolute bottom-3 left-3 flex items-center gap-1.5 rounded-md bg-black/30 px-2 py-0.5 text-[11px] text-white/90 backdrop-blur-sm">
          <Clock size={11} />
          {formatDuration(podcast.durationSec)}
        </div>
      </div>

      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-[14px] font-semibold text-white">{podcast.title}</h3>
          <p className="mt-0.5 truncate text-[12.5px] text-slate-400">{podcast.date} · {podcast.language}</p>
        </div>
        <div ref={menuRef} className="relative">
          <button
            onClick={(e) => { e.stopPropagation(); setMenuOpen((m) => !m); }}
            className="rounded-md p-1.5 text-slate-400 transition-colors hover:bg-white/5 hover:text-white"
            aria-label="More options"
          >
            <MoreHorizontal size={16} />
          </button>
          {menuOpen && (
            <div
              onClick={(e) => e.stopPropagation()}
              className="absolute right-0 top-8 z-20 w-44 animate-fade-in-fast rounded-xl border border-white/10 bg-ink-800 p-1.5 shadow-card"
            >
              <button onClick={(e) => { e.stopPropagation(); setMenuOpen(false); onOpen?.(); }} className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-[13px] text-slate-200 hover:bg-white/5">
                <Play size={14} /> Open
              </button>
              <button onClick={(e) => { e.stopPropagation(); setMenuOpen(false); toast({ title: 'Downloading MP3…', variant: 'success' }); }} className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-[13px] text-slate-200 hover:bg-white/5">
                Download
              </button>
              <button onClick={(e) => { e.stopPropagation(); setMenuOpen(false); toggleFavoritePodcast(podcast.id); }} className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-[13px] text-slate-200 hover:bg-white/5">
                <Heart size={14} /> {podcast.favorite ? 'Unfavorite' : 'Favorite'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
