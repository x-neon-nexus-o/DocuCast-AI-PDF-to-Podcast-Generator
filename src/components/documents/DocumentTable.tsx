import { FileText, Play, Download, Pencil, Trash2, MoreHorizontal, Clock } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useApp } from '@/state/AppContext';
import { StatusBadge } from '@/components/ui/Badge';
import type { DocRecord } from '@/types';

interface DocumentTableProps {
  docs: DocRecord[];
  onRename?: (doc: DocRecord) => void;
  onDelete?: (doc: DocRecord) => void;
}

function formatDuration(sec?: number): string {
  if (!sec) return '—';
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}m ${s.toString().padStart(2, '0')}s`;
}

export function DocumentTable({ docs, onRename, onDelete }: DocumentTableProps) {
  const { navigate, setActivePodcast, podcasts, toast } = useApp();

  return (
    <div className="overflow-hidden rounded-2xl border border-white/5 bg-ink-850">
      {/* Header — hidden on mobile */}
      <div className="hidden grid-cols-[2.4fr_0.9fr_0.7fr_1fr_1fr_0.6fr] gap-4 border-b border-white/5 px-5 py-3 text-[11.5px] font-semibold uppercase tracking-wide text-slate-500 sm:grid">
        <span>Document</span>
        <span>Type</span>
        <span>Pages</span>
        <span>Status</span>
        <span>Audio</span>
        <span className="text-right">Actions</span>
      </div>

      <div className="divide-y divide-white/5">
        {docs.map((doc) => (
          <Row
            key={doc.id}
            doc={doc}
            onOpen={() => { const pod = podcasts.find((p) => p.docId === doc.id); if (pod) { setActivePodcast(pod); navigate('podcast'); } else { toast({ title: 'No podcast yet', description: 'Generate audio for this document.', variant: 'warning' }); } }}
            onRename={() => onRename?.(doc)}
            onDelete={() => onDelete?.(doc)}
            onDownload={() => toast({ title: 'Downloading…', variant: 'success' })}
            onGenerate={() => navigate('create')}
          />
        ))}
      </div>
    </div>
  );
}

function Row({ doc, onOpen, onRename, onDelete, onDownload, onGenerate }: {
  doc: DocRecord;
  onOpen: () => void;
  onRename: () => void;
  onDelete: () => void;
  onDownload: () => void;
  onGenerate: () => void;
}) {
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

  return (
    <div className="group grid grid-cols-1 gap-3 px-4 py-3.5 transition-colors hover:bg-white/[0.02] sm:grid-cols-[2.4fr_0.9fr_0.7fr_1fr_1fr_0.6fr] sm:items-center sm:gap-4 sm:px-5">
      {/* Document */}
      <div className="flex items-center gap-3">
        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${doc.status === 'failed' ? 'bg-bad-500/10 text-bad-400' : 'bg-brand-500/10 text-brand-300'}`}>
          <FileText size={16} />
        </div>
        <div className="min-w-0">
          <p className="truncate text-[13.5px] font-medium text-white">{doc.name}</p>
          <p className="text-[11.5px] text-slate-500">{doc.date} · {doc.sizeMb} MB</p>
        </div>
      </div>

      {/* Type */}
      <span className="hidden text-[12.5px] uppercase text-slate-400 sm:block">PDF</span>

      {/* Pages */}
      <span className="hidden text-[12.5px] text-slate-400 sm:block">{doc.pages}</span>

      {/* Status */}
      <div className="hidden sm:block">
        <StatusBadge status={doc.status} />
      </div>

      {/* Audio */}
      <div className="hidden sm:block">
        {doc.hasAudio ? (
          <span className="inline-flex items-center gap-1.5 text-[12.5px] text-slate-300">
            <Clock size={12} className="text-slate-500" />
            {formatDuration(doc.audioDurationSec)}
          </span>
        ) : (
          <span className="text-[12px] text-slate-600">—</span>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-1.5">
        {doc.hasAudio && (
          <button
            onClick={onOpen}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-brand-500/10 hover:text-brand-300"
            aria-label="Play"
          >
            <Play size={15} />
          </button>
        )}
        <button
          onClick={onGenerate}
          className="hidden h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-white/5 hover:text-white sm:flex"
          aria-label="Generate"
        >
          <Download size={15} />
        </button>
        <div ref={menuRef} className="relative">
          <button
            onClick={() => setMenuOpen((m) => !m)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-white/5 hover:text-white"
            aria-label="More"
          >
            <MoreHorizontal size={15} />
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-9 z-20 w-44 animate-fade-in-fast rounded-xl border border-white/10 bg-ink-800 p-1.5 shadow-card">
              <button onClick={() => { setMenuOpen(false); onOpen(); }} className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-[13px] text-slate-200 hover:bg-white/5">
                <Play size={14} /> Open
              </button>
              <button onClick={() => { setMenuOpen(false); onGenerate(); }} className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-[13px] text-slate-200 hover:bg-white/5">
                <FileText size={14} /> Generate Audio
              </button>
              <button onClick={() => { setMenuOpen(false); onDownload(); }} className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-[13px] text-slate-200 hover:bg-white/5">
                <Download size={14} /> Download
              </button>
              <button onClick={() => { setMenuOpen(false); onRename(); }} className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-[13px] text-slate-200 hover:bg-white/5">
                <Pencil size={14} /> Rename
              </button>
              <div className="my-1 h-px bg-white/5" />
              <button onClick={() => { setMenuOpen(false); onDelete(); }} className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-[13px] text-bad-400 hover:bg-bad-500/10">
                <Trash2 size={14} /> Delete
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
