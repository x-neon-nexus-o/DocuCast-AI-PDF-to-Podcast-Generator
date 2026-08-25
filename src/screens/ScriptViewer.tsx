import { useState } from 'react';
import {
  FileText, Clock, Sparkles, Pencil, RefreshCw,
  Copy, Download, Check,
} from 'lucide-react';
import { useApp } from '@/state/AppContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ChapterList } from '@/components/audio/ChapterList';

export function ScriptViewer() {
  const { activePodcast, navigate, toast } = useApp();
  const [activeChapter, setActiveChapter] = useState(0);
  const [copied, setCopied] = useState(false);

  if (!activePodcast) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <p className="text-[14px] text-slate-400">No script to display.</p>
          <Button className="mt-4" onClick={() => navigate('library')}>Browse Library</Button>
        </div>
      </div>
    );
  }

  const p = activePodcast;

  const handleCopy = () => {
    const text = p.script.map((l) => `${l.speaker}:\n${l.text}`).join('\n\n');
    navigator.clipboard?.writeText(text).catch(() => {});
    setCopied(true);
    toast({ title: 'Script copied to clipboard', variant: 'success' });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-500/30 bg-brand-500/10 px-2.5 py-0.5 text-[11.5px] font-medium text-brand-300">
            <Sparkles size={11} /> AI Generated
          </span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-white">Podcast Script</h1>
        <p className="text-[14px] text-slate-400">{p.title}</p>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-2">
        <Button variant="secondary" size="sm" leftIcon={<Pencil size={14} />} onClick={() => toast({ title: 'Edit mode (demo)', variant: 'info' })}>
          Edit Script
        </Button>
        <Button variant="secondary" size="sm" leftIcon={<RefreshCw size={14} />} onClick={() => toast({ title: 'Regenerating section…', variant: 'info' })}>
          Regenerate Section
        </Button>
        <Button variant="secondary" size="sm" leftIcon={copied ? <Check size={14} /> : <Copy size={14} />} onClick={handleCopy}>
          {copied ? 'Copied' : 'Copy'}
        </Button>
        <Button variant="secondary" size="sm" leftIcon={<Download size={14} />} onClick={() => toast({ title: 'Downloading script…', variant: 'success' })}>
          Download Script
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left: doc info + chapters */}
        <div className="space-y-4">
          <Card className="p-5">
            <h3 className="mb-3 flex items-center gap-2 text-[13px] font-semibold uppercase tracking-wide text-slate-500">
              <FileText size={14} /> Document Info
            </h3>
            <div className="space-y-2.5">
              <InfoRow label="Filename" value={p.title} />
              <InfoRow label="Pages" value={`${p.pages}`} />
              <InfoRow label="Duration" value={`${Math.floor(p.durationSec / 60)} min`} />
              <InfoRow label="Language" value={p.language} />
              <InfoRow label="Voice" value={p.voice} />
              <InfoRow label="Style" value={p.style} />
            </div>
          </Card>

          <Card className="p-5">
            <h3 className="mb-3 flex items-center gap-2 text-[13px] font-semibold uppercase tracking-wide text-slate-500">
              <Clock size={14} /> Chapters
            </h3>
            <ChapterList
              chapters={p.chapters}
              currentSec={p.chapters[activeChapter]?.startSec ?? 0}
              onSeek={(sec) => {
                const idx = p.chapters.findIndex((c) => c.startSec === sec);
                if (idx >= 0) setActiveChapter(idx);
                toast({ title: `Jumped to "${p.chapters[idx]?.title}"`, variant: 'info' });
              }}
            />
          </Card>
        </div>

        {/* Right: transcript */}
        <div className="lg:col-span-2">
          <Card className="p-6">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-[15px] font-semibold text-white">Transcript</h2>
              <span className="text-[12px] text-slate-500">{p.script.length} segments</span>
            </div>

            <div className="space-y-5">
              {p.script.map((line, i) => (
                <div
                  key={line.id}
                  className="flex gap-4 animate-fade-in"
                  style={{ animationDelay: `${i * 30}ms` }}
                >
                  {/* Speaker avatar */}
                  <div className="shrink-0">
                    <div
                      className={`flex h-9 w-9 items-center justify-center rounded-full text-[11px] font-bold uppercase ${
                        line.speaker === 'HOST'
                          ? 'bg-brand-500/15 text-brand-300'
                          : 'bg-cyan-500/15 text-cyan-400'
                      }`}
                    >
                      {line.speaker === 'HOST' ? 'H' : 'E'}
                    </div>
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className={`text-[11px] font-semibold uppercase tracking-wide ${
                      line.speaker === 'HOST' ? 'text-brand-400' : 'text-cyan-400'
                    }`}>
                      {line.speaker === 'HOST' ? 'Host' : 'Expert'}
                    </p>
                    <p className="mt-1 text-[14px] leading-relaxed text-slate-200">
                      {line.highlight ? (
                        <>
                          {line.text.split(line.highlight).map((part, idx, arr) => (
                            <span key={idx}>
                              {part}
                              {idx < arr.length - 1 && (
                                <mark className="rounded bg-brand-500/20 px-1 py-0.5 text-brand-200">
                                  {line.highlight}
                                </mark>
                              )}
                            </span>
                          ))}
                        </>
                      ) : (
                        line.text
                      )}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-[12.5px] text-slate-500">{label}</span>
      <span className="truncate text-[12.5px] font-medium text-slate-200">{value}</span>
    </div>
  );
}
