import { useState } from 'react';
import { AudioLines, Clock, Heart, Download, Play } from 'lucide-react';
import { useApp } from '@/state/AppContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { PodcastCard } from '@/components/audio/PodcastCard';
import type { Podcast } from '@/types';

type Tab = 'recent-played' | 'recent-generated' | 'favorites' | 'downloaded';

const tabs: { id: Tab; label: string; icon: typeof Clock }[] = [
  { id: 'recent-played', label: 'Recently Played', icon: Clock },
  { id: 'recent-generated', label: 'Recently Generated', icon: AudioLines },
  { id: 'favorites', label: 'Favorites', icon: Heart },
  { id: 'downloaded', label: 'Downloaded', icon: Download },
];

export function AudioLibrary() {
  const { podcasts, navigate, setActivePodcast, toast } = useApp();
  const [tab, setTab] = useState<Tab>('recent-generated');

  let list: Podcast[] = [];
  if (tab === 'recent-played') list = podcasts.slice(0, 4);
  else if (tab === 'recent-generated') list = [...podcasts].sort((a, b) => b.date.localeCompare(a.date));
  else if (tab === 'favorites') list = podcasts.filter((p) => p.favorite);
  else if (tab === 'downloaded') list = podcasts.filter((p) => p.downloaded);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight text-white">Audio Library</h1>
        <p className="text-[14px] text-slate-400">{podcasts.length} podcasts · {podcasts.filter((p) => p.favorite).length} favorites</p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2">
        {tabs.map((t) => {
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-[13px] font-medium transition-all ${
                active
                  ? 'border-brand-500/40 bg-brand-500/10 text-white'
                  : 'border-white/5 bg-ink-800 text-slate-400 hover:border-white/10 hover:text-white'
              }`}
            >
              <t.icon size={15} />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Content */}
      {list.length === 0 ? (
        <Card>
          <EmptyState
            icon={tab === 'favorites' ? <Heart size={28} /> : <Download size={28} />}
            title={
              tab === 'favorites' ? 'No favorites yet' :
              tab === 'downloaded' ? 'No downloads yet' :
              'No podcasts here yet'
            }
            description={
              tab === 'favorites' ? 'Tap the heart on any podcast to save it here.' :
              tab === 'downloaded' ? 'Downloaded podcasts will appear here for offline listening.' :
              'Generate your first podcast to see it here.'
            }
            action={tab === 'recent-generated' ? <Button onClick={() => navigate('create')} leftIcon={<Play size={15} />}>Create Podcast</Button> : undefined}
          />
        </Card>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {list.map((p) => (
            <PodcastCard
              key={p.id}
              podcast={p}
              onOpen={() => { setActivePodcast(p); navigate('podcast'); }}
            />
          ))}
        </div>
      )}

      {/* Recently played full-width row */}
      {tab === 'recent-played' && list.length > 0 && (
        <div>
          <h2 className="mb-3 text-[15px] font-semibold text-white">Continue Listening</h2>
          <div className="space-y-2">
            {list.map((p) => (
              <button
                key={p.id}
                onClick={() => { setActivePodcast(p); navigate('podcast'); }}
                className="group flex w-full items-center gap-4 rounded-2xl border border-white/5 bg-ink-850 p-3 text-left transition-all hover:border-white/10 hover:shadow-card"
              >
                <div
                  className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl text-white"
                  style={{ background: `linear-gradient(135deg, ${p.coverAccent}, ${p.coverAccent}99)` }}
                >
                  <Play size={18} fill="currentColor" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[14px] font-medium text-white">{p.title}</p>
                  <p className="text-[12px] text-slate-500">{p.category} · {Math.floor(p.durationSec / 60)} min</p>
                </div>
                <div className="hidden items-center gap-2 sm:flex">
                  {p.favorite && <Heart size={14} className="fill-bad-500 text-bad-500" />}
                  {p.downloaded && <Download size={14} className="text-good-400" />}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
