import {
  FileText, AudioLines, Clock, HardDrive, ArrowRight, Upload, Star,
  TrendingUp, Play,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useApp } from '@/state/AppContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatCard } from '@/components/dashboard/StatCard';
import { DocumentTable } from '@/components/documents/DocumentTable';
import type { DocRecord } from '@/types';

export function Dashboard() {
  const { user, docs, navigate, podcasts, toast, setActivePodcast } = useApp();

  const greetingHour = new Date().getHours();
  const greeting = greetingHour < 12 ? 'Good morning' : greetingHour < 18 ? 'Good afternoon' : 'Good evening';

  const stats: { icon: LucideIcon; label: string; value: string | number; accent: string; trend: string }[] = [
    { icon: FileText, label: 'Documents Processed', value: docs.filter((d) => d.status === 'ready').length, accent: 'brand', trend: '+2 this week' },
    { icon: AudioLines, label: 'Podcasts Generated', value: podcasts.length, accent: 'cyan', trend: '+1 this week' },
    { icon: Clock, label: 'Listening Time', value: '4h 12m', accent: 'good', trend: '+38 min' },
    { icon: HardDrive, label: 'Storage Used', value: '24.8 MB', accent: 'warn', trend: 'of 1 GB' },
  ];

  const recentDocs = docs.slice(0, 5);
  const recentPodcasts = podcasts.slice(0, 3);

  const handleRename = (_doc: DocRecord) => {
    toast({ title: 'Rename opened', description: 'Edit in the Documents page.', variant: 'info' });
    navigate('documents');
  };
  const handleDelete = (_doc: DocRecord) => {
    toast({ title: 'Delete opened', description: 'Confirm in the Documents page.', variant: 'info' });
    navigate('documents');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight text-white">
          {greeting}, {user.name} <span className="inline-block">👋</span>
        </h1>
        <p className="text-[14px] text-slate-400">Here's what's happening with your learning today.</p>
      </div>

      <Card className="relative overflow-hidden">
        <div className="absolute right-0 top-0 h-full w-1/3 opacity-30 brand-grad-soft" />
        <div className="relative flex flex-col items-start justify-between gap-4 p-6 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-lg font-semibold text-white">Create a new podcast</h2>
            <p className="mt-1 text-[13.5px] text-slate-400">Turn your next PDF into an audio learning experience.</p>
          </div>
          <Button onClick={() => navigate('create')} leftIcon={<Upload size={16} />} size="lg">
            Upload PDF
          </Button>
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s) => (
          <StatCard key={s.label} icon={s.icon} label={s.label} value={s.value} accent={s.accent} trend={s.trend} />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-[15px] font-semibold text-white">Recent Documents</h2>
            <button onClick={() => navigate('documents')} className="flex items-center gap-1 text-[13px] text-brand-300 transition-colors hover:text-brand-200">
              View All <ArrowRight size={13} />
            </button>
          </div>
          <DocumentTable docs={recentDocs} onRename={handleRename} onDelete={handleDelete} />
        </div>

        <div>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-[15px] font-semibold text-white">Recent Podcasts</h2>
            <button onClick={() => navigate('library')} className="flex items-center gap-1 text-[13px] text-brand-300 transition-colors hover:text-brand-200">
              View All <ArrowRight size={13} />
            </button>
          </div>
          <div className="space-y-3">
            {recentPodcasts.map((p) => (
              <button
                key={p.id}
                onClick={() => { setActivePodcast(p); navigate('podcast'); }}
                className="group flex w-full items-center gap-3 rounded-2xl border border-white/5 bg-ink-850 p-3 text-left transition-all hover:border-white/10 hover:shadow-card"
              >
                <div
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-white"
                  style={{ background: `linear-gradient(135deg, ${p.coverAccent}, ${p.coverAccent}99)` }}
                >
                  <Play size={16} fill="currentColor" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-medium text-white">{p.title}</p>
                  <p className="text-[11.5px] text-slate-500">{Math.floor(p.durationSec / 60)} min · {p.date}</p>
                </div>
                {p.favorite && <Star size={14} className="shrink-0 fill-warn-500 text-warn-500" />}
              </button>
            ))}
          </div>
        </div>
      </div>

      <Card>
        <div className="flex items-center justify-between p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-good-500/10 text-good-400">
              <TrendingUp size={18} />
            </div>
            <div>
              <p className="text-[13.5px] font-medium text-white">You're on a 5-day learning streak</p>
              <p className="text-[12px] text-slate-400">Keep listening to maintain your streak.</p>
            </div>
          </div>
          <Button variant="secondary" size="sm" onClick={() => navigate('profile')}>View Activity</Button>
        </div>
      </Card>
    </div>
  );
}
