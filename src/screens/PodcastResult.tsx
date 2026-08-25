import { useState } from 'react';
import {
  Sparkles, FileText, Clock, Globe, Mic, BookOpen, ChevronRight, ScrollText,
} from 'lucide-react';
import { useApp } from '@/state/AppContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Tag } from '@/components/ui/Badge';
import { AudioPlayer } from '@/components/audio/AudioPlayer';
import { ChapterList } from '@/components/audio/ChapterList';

export function PodcastResult() {
  const { activePodcast, navigate, toast } = useApp();
  const [seekTo, setSeekTo] = useState<number | null>(null);

  if (!activePodcast) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <p className="text-[14px] text-slate-400">No podcast selected.</p>
          <Button className="mt-4" onClick={() => navigate('library')}>Browse Library</Button>
        </div>
      </div>
    );
  }

  const p = activePodcast;
  const mins = Math.floor(p.durationSec / 60);
  const secs = p.durationSec % 60;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-good-500/30 bg-good-500/10 px-2.5 py-0.5 text-[11.5px] font-medium text-good-400">
            <Sparkles size={11} /> AI Generated
          </span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-white">Your Podcast Is Ready</h1>
        <p className="text-[14px] text-slate-400">{p.title}</p>
      </div>

      {/* Info bar */}
      <div className="flex flex-wrap items-center gap-3">
        <Tag><Clock size={11} /> {mins} min {secs.toString().padStart(2, '0')} sec</Tag>
        <Tag><FileText size={11} /> {p.pages} pages</Tag>
        <Tag><Globe size={11} /> {p.language}</Tag>
        <Tag><Mic size={11} /> {p.voice}</Tag>
        <Tag><Sparkles size={11} /> {p.style}</Tag>
      </div>

      {/* Audio player */}
      <AudioPlayer podcast={p} />

      {/* Summary + Chapters */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Summary */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <div className="p-5">
              <h2 className="mb-4 flex items-center gap-2 text-[15px] font-semibold text-white">
                <BookOpen size={16} className="text-brand-300" /> AI-Generated Summary
              </h2>

              <div className="space-y-5">
                <div>
                  <h3 className="mb-2 text-[13px] font-semibold uppercase tracking-wide text-slate-500">Overview</h3>
                  <p className="text-[13.5px] leading-relaxed text-slate-300">{p.summary.overview}</p>
                </div>

                <div>
                  <h3 className="mb-2 text-[13px] font-semibold uppercase tracking-wide text-slate-500">Key Concepts</h3>
                  <ul className="space-y-2">
                    {p.summary.keyConcepts.map((c) => (
                      <li key={c} className="flex items-start gap-2.5 text-[13.5px] text-slate-300">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-400" />
                        {c}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="mb-2 text-[13px] font-semibold uppercase tracking-wide text-slate-500">Important Takeaways</h3>
                  <ul className="space-y-2">
                    {p.summary.takeaways.map((t) => (
                      <li key={t} className="flex items-start gap-2.5 text-[13.5px] text-slate-300">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-good-400" />
                        {t}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </Card>

          {/* Script link */}
          <Card interactive className="cursor-pointer" onClick={() => navigate('script')}>
            <div className="flex items-center gap-3 p-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500/10 text-brand-300">
                <ScrollText size={18} />
              </div>
              <div className="flex-1">
                <p className="text-[14px] font-medium text-white">View Full Podcast Script</p>
                <p className="text-[12.5px] text-slate-400">Read the AI-generated conversation with speaker labels</p>
              </div>
              <ChevronRight size={18} className="text-slate-500" />
            </div>
          </Card>
        </div>

        {/* Chapters */}
        <div>
          <Card className="sticky top-20">
            <div className="p-5">
              <h2 className="mb-4 flex items-center gap-2 text-[15px] font-semibold text-white">
                <Clock size={16} className="text-brand-300" /> Podcast Chapters
              </h2>
              <ChapterList
                chapters={p.chapters}
                currentSec={seekTo ?? 0}
                onSeek={(sec) => { setSeekTo(sec); toast({ title: `Jumped to chapter`, variant: 'info' }); }}
              />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
