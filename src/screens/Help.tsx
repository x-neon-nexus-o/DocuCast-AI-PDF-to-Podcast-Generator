import { useState } from 'react';
import {
  Search, ChevronDown, Upload, Brain, AudioLines, Download, UserCircle, Wrench,
  LifeBuoy, Mail,
} from 'lucide-react';
import { useApp } from '@/state/AppContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { SearchBar } from '@/components/ui/SearchBar';
import { helpCategories } from '@/data/mock';

const iconMap: Record<string, typeof Upload> = {
  Upload: Upload,
  Brain: Brain,
  AudioLines: AudioLines,
  Download: Download,
  UserCircle: UserCircle,
  Wrench: Wrench,
};

export function Help() {
  const { toast } = useApp();
  const [query, setQuery] = useState('');
  const [openCat, setOpenCat] = useState<string | null>(helpCategories[0].id);
  const [openQ, setOpenQ] = useState<string | null>(null);

  const q = query.toLowerCase().trim();
  const filteredCats = q
    ? helpCategories.map((c) => ({
        ...c,
        questions: c.questions.filter(
          (qa) => qa.q.toLowerCase().includes(q) || qa.a.toLowerCase().includes(q),
        ),
      })).filter((c) => c.questions.length > 0)
    : helpCategories;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-brand-500/30 bg-brand-500/10 text-brand-300">
          <LifeBuoy size={26} />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-white">How can we help?</h1>
        <p className="mt-1.5 text-[14px] text-slate-400">Search our help center or browse by category.</p>
      </div>

      <div className="mx-auto max-w-2xl">
        <SearchBar
          value={query}
          onChange={setQuery}
          placeholder="Search for help…"
          autoFocus
        />
      </div>

      {/* Category cards */}
      {!q && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {helpCategories.map((c) => {
            const Icon = iconMap[c.icon] ?? Upload;
            return (
              <button
                key={c.id}
                onClick={() => { setOpenCat(c.id); setOpenQ(null); document.getElementById('faq-list')?.scrollIntoView({ behavior: 'smooth' }); }}
                className="flex flex-col items-center gap-2 rounded-2xl border border-white/5 bg-ink-850 p-4 transition-all hover:border-brand-500/20 hover:shadow-card"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500/10 text-brand-300">
                  <Icon size={18} />
                </div>
                <span className="text-center text-[12px] font-medium text-slate-300">{c.label}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* FAQ list */}
      <div id="faq-list" className="mx-auto max-w-3xl space-y-4">
        {filteredCats.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-[14px] text-slate-400">No results for "{query}".</p>
            <Button variant="secondary" className="mt-4" onClick={() => setQuery('')}>Clear search</Button>
          </Card>
        ) : (
          filteredCats.map((cat) => (
            <Card key={cat.id} className="overflow-hidden">
              <button
                onClick={() => { setOpenCat(openCat === cat.id ? null : cat.id); setOpenQ(null); }}
                className="flex w-full items-center justify-between gap-3 p-5 text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-500/10 text-brand-300">
                    {(() => { const Icon = iconMap[cat.icon] ?? Upload; return <Icon size={16} />; })()}
                  </div>
                  <h2 className="text-[15px] font-semibold text-white">{cat.label}</h2>
                </div>
                <ChevronDown
                  size={18}
                  className={`shrink-0 text-slate-500 transition-transform ${openCat === cat.id ? 'rotate-180' : ''}`}
                />
              </button>
              {openCat === cat.id && (
                <div className="border-t border-white/5 animate-fade-in">
                  {cat.questions.map((qa) => (
                    <div key={qa.q} className="border-b border-white/5 last:border-b-0">
                      <button
                        onClick={() => setOpenQ(openQ === qa.q ? null : qa.q)}
                        className="flex w-full items-center justify-between gap-3 px-5 py-3.5 text-left transition-colors hover:bg-white/[0.02]"
                      >
                        <span className="text-[13.5px] font-medium text-slate-200">{qa.q}</span>
                        <ChevronDown
                          size={15}
                          className={`shrink-0 text-slate-500 transition-transform ${openQ === qa.q ? 'rotate-180' : ''}`}
                        />
                      </button>
                      {openQ === qa.q && (
                        <div className="px-5 pb-4 animate-fade-in">
                          <p className="text-[13px] leading-relaxed text-slate-400">{qa.a}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </Card>
          ))
        )}
      </div>

      {/* Contact */}
      <Card className="p-6 text-center">
        <h2 className="text-[15px] font-semibold text-white">Still need help?</h2>
        <p className="mt-1 text-[13px] text-slate-400">Our team is here to help you with any questions.</p>
        <Button
          className="mt-4"
          variant="secondary"
          leftIcon={<Mail size={15} />}
          onClick={() => toast({ title: 'Email copied', description: 'support@docucast.app', variant: 'success' })}
        >
          Contact Support
        </Button>
      </Card>
    </div>
  );
}
