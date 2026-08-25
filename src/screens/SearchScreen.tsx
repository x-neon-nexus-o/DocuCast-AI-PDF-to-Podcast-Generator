import { useState, useEffect } from 'react';
import { Search, FileText, AudioLines, ScrollText, Clock, X, TrendingUp } from 'lucide-react';
import { useApp } from '@/state/AppContext';
import { Card } from '@/components/ui/Card';
import { SearchBar } from '@/components/ui/SearchBar';
import { EmptyState } from '@/components/ui/EmptyState';
import { StatusBadge } from '@/components/ui/Badge';
import { recentSearches } from '@/data/mock';
import type { Podcast, DocRecord } from '@/types';

export function SearchScreen() {
  const { docs, podcasts, navigate, setActivePodcast } = useApp();
  const [query, setQuery] = useState('');
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    if (query.trim()) setSearched(true);
    else setSearched(false);
  }, [query]);

  const q = query.toLowerCase().trim();

  const matchedDocs: DocRecord[] = q
    ? docs.filter((d) => d.name.toLowerCase().includes(q) || d.category.toLowerCase().includes(q))
    : [];
  const matchedPodcasts: Podcast[] = q
    ? podcasts.filter((p) => p.title.toLowerCase().includes(q) || p.category.toLowerCase().includes(q))
    : [];
  const matchedChapters = q
    ? podcasts.flatMap((p) =>
        p.chapters
          .filter((c) => c.title.toLowerCase().includes(q))
          .map((c) => ({ podcast: p, chapter: c })),
      )
    : [];

  const hasResults = matchedDocs.length > 0 || matchedPodcasts.length > 0 || matchedChapters.length > 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">Search</h1>
        <p className="mt-1 text-[14px] text-slate-400">Find documents, podcasts, and chapters.</p>
      </div>

      <SearchBar
        value={query}
        onChange={setQuery}
        placeholder="Search documents, podcasts, chapters…"
        autoFocus
        className="max-w-2xl"
      />

      {!searched ? (
        <div className="space-y-6">
          {/* Recent searches */}
          <Card className="p-5">
            <h3 className="mb-3 flex items-center gap-2 text-[13px] font-semibold uppercase tracking-wide text-slate-500">
              <Clock size={14} /> Recent Searches
            </h3>
            <div className="flex flex-wrap gap-2">
              {recentSearches.map((s) => (
                <button
                  key={s}
                  onClick={() => setQuery(s)}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-white/5 bg-ink-800 px-3 py-1.5 text-[13px] text-slate-300 transition-colors hover:border-white/10 hover:text-white"
                >
                  <Search size={12} className="text-slate-500" />
                  {s}
                </button>
              ))}
            </div>
          </Card>

          {/* Suggestions */}
          <Card className="p-5">
            <h3 className="mb-3 flex items-center gap-2 text-[13px] font-semibold uppercase tracking-wide text-slate-500">
              <TrendingUp size={14} /> Suggested
            </h3>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {['Machine Learning', 'Computer Networks', 'Operating Systems', 'Software Engineering'].map((s) => (
                <button
                  key={s}
                  onClick={() => setQuery(s)}
                  className="flex items-center gap-3 rounded-xl border border-white/5 bg-ink-800 p-3 text-left transition-colors hover:border-white/10"
                >
                  <Search size={15} className="text-slate-500" />
                  <span className="text-[13px] text-slate-300">{s}</span>
                </button>
              ))}
            </div>
          </Card>
        </div>
      ) : !hasResults ? (
        <Card>
          <EmptyState
            icon={<Search size={28} />}
            title="No results found"
            description={`We couldn't find anything matching "${query}". Try a different search term.`}
            action={
              <button
                onClick={() => setQuery('')}
                className="inline-flex items-center gap-2 rounded-xl border border-white/5 bg-ink-800 px-4 py-2 text-[13px] text-slate-300 hover:text-white"
              >
                <X size={14} /> Clear search
              </button>
            }
          />
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Documents */}
          {matchedDocs.length > 0 && (
            <div>
              <h2 className="mb-3 flex items-center gap-2 text-[15px] font-semibold text-white">
                <FileText size={16} className="text-brand-300" /> Documents
                <span className="text-[12px] text-slate-500">({matchedDocs.length})</span>
              </h2>
              <div className="space-y-2">
                {matchedDocs.map((d) => (
                  <button
                    key={d.id}
                    onClick={() => navigate('documents')}
                    className="flex w-full items-center gap-3 rounded-xl border border-white/5 bg-ink-850 p-3 text-left transition-all hover:border-white/10 hover:shadow-card"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-500/10 text-brand-300">
                      <FileText size={18} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13.5px] font-medium text-white">{d.name}</p>
                      <p className="text-[12px] text-slate-500">{d.category} · {d.pages} pages</p>
                    </div>
                    <StatusBadge status={d.status} />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Podcasts */}
          {matchedPodcasts.length > 0 && (
            <div>
              <h2 className="mb-3 flex items-center gap-2 text-[15px] font-semibold text-white">
                <AudioLines size={16} className="text-cyan-400" /> Podcasts
                <span className="text-[12px] text-slate-500">({matchedPodcasts.length})</span>
              </h2>
              <div className="space-y-2">
                {matchedPodcasts.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => { setActivePodcast(p); navigate('podcast'); }}
                    className="flex w-full items-center gap-3 rounded-xl border border-white/5 bg-ink-850 p-3 text-left transition-all hover:border-white/10 hover:shadow-card"
                  >
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-lg text-white"
                      style={{ background: `linear-gradient(135deg, ${p.coverAccent}, ${p.coverAccent}99)` }}
                    >
                      <AudioLines size={16} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13.5px] font-medium text-white">{p.title}</p>
                      <p className="text-[12px] text-slate-500">{Math.floor(p.durationSec / 60)} min · {p.language}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Chapters */}
          {matchedChapters.length > 0 && (
            <div>
              <h2 className="mb-3 flex items-center gap-2 text-[15px] font-semibold text-white">
                <ScrollText size={16} className="text-good-400" /> Chapters
                <span className="text-[12px] text-slate-500">({matchedChapters.length})</span>
              </h2>
              <div className="space-y-2">
                {matchedChapters.map(({ podcast, chapter }) => (
                  <button
                    key={`${podcast.id}-${chapter.id}`}
                    onClick={() => { setActivePodcast(podcast); navigate('script'); }}
                    className="flex w-full items-center gap-3 rounded-xl border border-white/5 bg-ink-850 p-3 text-left transition-all hover:border-white/10 hover:shadow-card"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-good-500/10 text-good-400">
                      <ScrollText size={16} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13.5px] font-medium text-white">{chapter.title}</p>
                      <p className="text-[12px] text-slate-500">in {podcast.title}</p>
                    </div>
                    <span className="text-[12px] tabular-nums text-slate-500">
                      {Math.floor(chapter.startSec / 60)}:{(chapter.startSec % 60).toString().padStart(2, '0')}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
