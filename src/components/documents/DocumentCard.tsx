import { FileText, MoreHorizontal, Play, Download, Pencil, Trash2, Sparkles, Clock } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useApp } from '@/state/AppContext';
import { StatusBadge } from '@/components/ui/Badge';
import type { DocRecord } from '@/types';

interface DocumentCardProps {
  doc: DocRecord;
  onOpen?: () => void;
  onRename?: () => void;
  onDelete?: () => void;
}

function formatDuration(sec?: number): string {
  if (!sec) return '—';
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}m ${s.toString().padStart(2, '0')}s`;
}

export function DocumentCard({ doc, onOpen, onRename, onDelete }: DocumentCardProps) {
  const { toast, navigate, setActivePodcast, podcasts } = useApp();
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

  const playPodcast = () => {
    const pod = podcasts.find((p) => p.docId === doc.id);
    if (pod) {
      setActivePodcast(pod);
      navigate('podcast');
    } else {
      toast({ title: 'No podcast available', description: 'Generate audio for this document first.', variant: 'warning' });
    }
  };

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-white/5 bg-ink-850 p-4 transition-all duration-300 hover:border-white/10 hover:shadow-card">
      <div className="flex items-start gap-3">
        <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${doc.status === 'failed' ? 'bg-bad-500/10 text-bad-400' : 'bg-brand-500/10 text-brand-300'}`}>
          <FileText size={20} />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-[14px] font-semibold text-white">{doc.name}</h3>
          <p className="mt-0.5 text-[12px] text-slate-500">{doc.category} · {doc.pages} pages · {doc.sizeMb} MB</p>
        </div>
        <div ref={menuRef} className="relative">
          <button
            onClick={() => setMenuOpen((m) => !m)}
            className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-white/5 hover:text-white"
            aria-label="More options"
          >
            <MoreHorizontal size={16} />
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-9 z-20 w-44 animate-fade-in-fast rounded-xl border border-white/10 bg-ink-800 p-1.5 shadow-card">
              <button onClick={(e) => { e.stopPropagation(); setMenuOpen(false); onOpen?.(); }} className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-[13px] text-slate-200 hover:bg-white/5">
                <FileText size={14} /> Open
              </button>
              <button onClick={(e) => { e.stopPropagation(); setMenuOpen(false); navigate('create'); }} className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-[13px] text-slate-200 hover:bg-white/5">
                <Sparkles size={14} /> Generate Audio
              </button>
              {doc.hasAudio && (
                <button onClick={(e) => { e.stopPropagation(); setMenuOpen(false); playPodcast(); }} className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-[13px] text-slate-200 hover:bg-white/5">
                  <Play size={14} /> Play
                </button>
              )}
              <button onClick={(e) => { e.stopPropagation(); setMenuOpen(false); toast({ title: 'Downloading…', variant: 'success' }); }} className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-[13px] text-slate-200 hover:bg-white/5">
                <Download size={14} /> Download
              </button>
              <button onClick={(e) => { e.stopPropagation(); setMenuOpen(false); onRename?.(); }} className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-[13px] text-slate-200 hover:bg-white/5">
                <Pencil size={14} /> Rename
              </button>
              <div className="my-1 h-px bg-white/5" />
              <button onClick={(e) => { e.stopPropagation(); setMenuOpen(false); onDelete?.(); }} className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-[13px] text-bad-400 hover:bg-bad-500/10">
                <Trash2 size={14} /> Delete
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <StatusBadge status={doc.status} />
        <span className="text-[11.5px] text-slate-500">{doc.date}</span>
      </div>

      {doc.hasAudio && (
        <div className="mt-3 flex items-center gap-2 rounded-lg border border-white/5 bg-white/[0.02] px-3 py-2">
          <Clock size={13} className="text-slate-500" />
          <span className="text-[12px] text-slate-400">Audio · {formatDuration(doc.audioDurationSec)}</span>
          <button
            onClick={playPodcast}
            className="ml-auto flex h-7 w-7 items-center justify-center rounded-full bg-brand-500 text-white transition-colors hover:bg-brand-400"
            aria-label="Play podcast"
          >
            <Play size={12} fill="currentColor" />
          </button>
        </div>
      )}
    </div>
  );
}
