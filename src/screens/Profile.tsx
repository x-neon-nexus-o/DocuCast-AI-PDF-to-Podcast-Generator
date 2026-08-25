import {
  FileText, AudioLines, Clock, BarChart3, Activity, Download, Upload, Sparkles,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useApp } from '@/state/AppContext';
import { Card } from '@/components/ui/Card';
import { StatCard } from '@/components/dashboard/StatCard';

const weeklyListening = [12, 25, 8, 42, 18, 35, 28];
const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const monthlyProcessing = [3, 5, 4, 7, 6, 8, 5, 9];
const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'];

const recentActivity = [
  { icon: Sparkles, label: 'Generated podcast', detail: 'Machine Learning Fundamentals', time: '2 hours ago', accent: 'brand' },
  { icon: Upload, label: 'Uploaded document', detail: 'Database Management Systems.pdf', time: '5 hours ago', accent: 'cyan' },
  { icon: Download, label: 'Downloaded audio', detail: 'Computer Networks Notes.mp3', time: 'Yesterday', accent: 'good' },
  { icon: Sparkles, label: 'Generated podcast', detail: 'Operating Systems Unit 3', time: '2 days ago', accent: 'brand' },
  { icon: Upload, label: 'Uploaded document', detail: 'Cloud Computing Overview.pdf', time: '3 days ago', accent: 'cyan' },
];

export function Profile() {
  const { user, docs, podcasts } = useApp();

  const totalListeningSec = podcasts.reduce((sum, p) => sum + p.durationSec, 0);
  const avgPodcastSec = podcasts.length > 0 ? Math.floor(totalListeningSec / podcasts.length) : 0;

  const stats: { icon: LucideIcon; label: string; value: string | number; accent: string; trend: string }[] = [
    { icon: FileText, label: 'Documents Processed', value: docs.filter((d) => d.status === 'ready').length, accent: 'brand', trend: 'all time' },
    { icon: AudioLines, label: 'Podcasts Generated', value: podcasts.length, accent: 'cyan', trend: 'all time' },
    { icon: Clock, label: 'Total Listening Time', value: `${Math.floor(totalListeningSec / 3600)}h ${Math.floor((totalListeningSec % 3600) / 60)}m`, accent: 'good', trend: 'all time' },
    { icon: BarChart3, label: 'Average Podcast Length', value: `${Math.floor(avgPodcastSec / 60)} min`, accent: 'warn', trend: 'average' },
  ];

  const maxWeekly = Math.max(...weeklyListening);
  const maxMonthly = Math.max(...monthlyProcessing);

  return (
    <div className="space-y-6">
      {/* Profile header */}
      <Card className="p-6">
        <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center">
          <div
            className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl text-[28px] font-bold text-white"
            style={{ background: `hsl(${user.avatarHue} 70% 45%)` }}
          >
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-bold tracking-tight text-white">{user.name}</h1>
            <p className="text-[14px] text-slate-400">{user.email}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-md bg-brand-500/10 px-2.5 py-0.5 text-[11.5px] font-medium text-brand-300">
                <Sparkles size={11} /> Free Plan
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-md bg-good-500/10 px-2.5 py-0.5 text-[11.5px] font-medium text-good-400">
                5-day streak
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s) => (
          <StatCard key={s.label} icon={s.icon} label={s.label} value={s.value} accent={s.accent} trend={s.trend} />
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Weekly listening */}
        <Card className="p-5">
          <h2 className="mb-1 flex items-center gap-2 text-[15px] font-semibold text-white">
            <Activity size={16} className="text-brand-300" /> Your Learning Activity
          </h2>
          <p className="mb-5 text-[12.5px] text-slate-500">Weekly listening time (minutes)</p>
          <div className="flex items-end justify-between gap-2" style={{ height: 140 }}>
            {weeklyListening.map((v, i) => (
              <div key={i} className="flex flex-1 flex-col items-center gap-2">
                <div className="flex w-full flex-1 items-end">
                  <div
                    className="w-full rounded-t-md bg-brand-500/70 transition-all duration-500 hover:bg-brand-400"
                    style={{ height: `${(v / maxWeekly) * 100}%` }}
                    title={`${v} min`}
                  />
                </div>
                <span className="text-[10.5px] text-slate-500">{weekDays[i]}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Monthly processing */}
        <Card className="p-5">
          <h2 className="mb-1 flex items-center gap-2 text-[15px] font-semibold text-white">
            <BarChart3 size={16} className="text-cyan-400" /> Monthly Document Processing
          </h2>
          <p className="mb-5 text-[12.5px] text-slate-500">Documents processed per month</p>
          <div className="flex items-end justify-between gap-2" style={{ height: 140 }}>
            {monthlyProcessing.map((v, i) => (
              <div key={i} className="flex flex-1 flex-col items-center gap-2">
                <div className="flex w-full flex-1 items-end">
                  <div
                    className="w-full rounded-t-md bg-cyan-500/70 transition-all duration-500 hover:bg-cyan-400"
                    style={{ height: `${(v / maxMonthly) * 100}%` }}
                    title={`${v} docs`}
                  />
                </div>
                <span className="text-[10.5px] text-slate-500">{monthLabels[i]}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Recent activity */}
      <Card className="p-5">
        <h2 className="mb-4 flex items-center gap-2 text-[15px] font-semibold text-white">
          <Activity size={16} className="text-brand-300" /> Recent Activity
        </h2>
        <div className="space-y-2">
          {recentActivity.map((a, i) => {
            const accentClasses: Record<string, string> = {
              brand: 'bg-brand-500/10 text-brand-300',
              cyan: 'bg-cyan-500/10 text-cyan-400',
              good: 'bg-good-500/10 text-good-400',
            };
            return (
              <div key={i} className="flex items-center gap-3 rounded-xl border border-white/5 bg-ink-800 p-3">
                <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${accentClasses[a.accent]}`}>
                  <a.icon size={16} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-medium text-white">{a.label}</p>
                  <p className="truncate text-[12px] text-slate-500">{a.detail}</p>
                </div>
                <span className="shrink-0 text-[11.5px] text-slate-600">{a.time}</span>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
