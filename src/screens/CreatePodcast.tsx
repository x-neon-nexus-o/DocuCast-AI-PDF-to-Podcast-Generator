import { Sparkles, FileText, ArrowRight, Check } from 'lucide-react';
import { useApp } from '@/state/AppContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { UploadZone } from '@/components/documents/UploadZone';
import {
  podcastStyles, complexities, lengths, languages, voices,
} from '@/data/mock';
import type { PodcastStyle, Complexity, GenLength, Language, VoiceId } from '@/types';

export function CreatePodcast() {
  const { uploadedFile, genConfig, setGenConfig, startProcessing, toast } = useApp();

  const handleGenerate = () => {
    if (!uploadedFile) {
      toast({ title: 'Upload a PDF first', description: 'Drop a PDF to start generating.', variant: 'warning' });
      return;
    }
    startProcessing();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">Create New Podcast</h1>
        <p className="mt-1 text-[14px] text-slate-400">Upload a PDF, configure your podcast, and let AI do the rest.</p>
      </div>

      <Card>
        <div className="p-5">
          <h2 className="mb-4 flex items-center gap-2 text-[15px] font-semibold text-white">
            <FileText size={16} className="text-brand-300" /> 1. Upload PDF
          </h2>
          <UploadZone />
        </div>
      </Card>

      {uploadedFile && (
        <Card className="animate-fade-in">
          <div className="p-5">
            <h2 className="mb-4 flex items-center gap-2 text-[15px] font-semibold text-white">
              <Sparkles size={16} className="text-brand-300" /> 2. Configure Podcast
            </h2>

            <div className="space-y-6">
              {/* Content range */}
              <ConfigSection label="Content range">
                <div className="flex flex-wrap gap-2">
                  <Pill active={genConfig.range === 'entire'} onClick={() => setGenConfig({ range: 'entire' })}>Entire document</Pill>
                  <Pill active={genConfig.range === 'pages'} onClick={() => setGenConfig({ range: 'pages' })}>Selected pages</Pill>
                </div>
                {genConfig.range === 'pages' && (
                  <div className="mt-3 flex items-center gap-3 animate-fade-in">
                    <label className="text-[13px] text-slate-400">From</label>
                    <input
                      type="number"
                      min={1}
                      max={uploadedFile.pages}
                      value={genConfig.pageFrom}
                      onChange={(e) => setGenConfig({ pageFrom: Math.max(1, +e.target.value) })}
                      className="h-9 w-16 rounded-lg border border-white/5 bg-ink-800 px-2 text-[13px] text-white focus:border-brand-500/40 focus:outline-none"
                    />
                    <label className="text-[13px] text-slate-400">To</label>
                    <input
                      type="number"
                      min={genConfig.pageFrom}
                      max={uploadedFile.pages}
                      value={genConfig.pageTo}
                      onChange={(e) => setGenConfig({ pageTo: Math.min(uploadedFile.pages, +e.target.value) })}
                      className="h-9 w-16 rounded-lg border border-white/5 bg-ink-800 px-2 text-[13px] text-white focus:border-brand-500/40 focus:outline-none"
                    />
                    <span className="text-[12px] text-slate-500">of {uploadedFile.pages} pages</span>
                  </div>
                )}
              </ConfigSection>

              {/* Podcast style */}
              <ConfigSection label="Podcast style">
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {podcastStyles.map((s) => (
                    <OptionCard
                      key={s.id}
                      active={genConfig.style === s.id}
                      onClick={() => setGenConfig({ style: s.id as PodcastStyle })}
                      title={s.label}
                      description={s.description}
                    />
                  ))}
                </div>
              </ConfigSection>

              {/* Content complexity */}
              <ConfigSection label="Content complexity">
                <div className="flex flex-wrap gap-2">
                  {complexities.map((c) => (
                    <Pill key={c.id} active={genConfig.complexity === c.id} onClick={() => setGenConfig({ complexity: c.id as Complexity })}>
                      {c.label}
                    </Pill>
                  ))}
                </div>
              </ConfigSection>

              {/* Language */}
              <ConfigSection label="Language">
                <div className="flex flex-wrap gap-2">
                  {languages.map((l) => (
                    <Pill key={l} active={genConfig.language === l} onClick={() => setGenConfig({ language: l as Language })}>
                      {l}
                    </Pill>
                  ))}
                  <Pill active={false} onClick={() => toast({ title: 'More languages coming soon', variant: 'info' })}>
                    More languages
                  </Pill>
                </div>
              </ConfigSection>

              {/* Voice */}
              <ConfigSection label="Voice">
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
                  {voices.map((v) => (
                    <OptionCard
                      key={v.id}
                      active={genConfig.voice === v.id}
                      onClick={() => setGenConfig({ voice: v.id as VoiceId })}
                      title={v.name}
                      description={v.description}
                    />
                  ))}
                </div>
              </ConfigSection>

              {/* Generation length */}
              <ConfigSection label="Generation length">
                <div className="flex flex-wrap gap-2">
                  {lengths.map((l) => (
                    <Pill key={l.id} active={genConfig.length === l.id} onClick={() => setGenConfig({ length: l.id as GenLength })}>
                      {l.label} <span className="ml-1 text-[11px] text-slate-500">{l.description}</span>
                    </Pill>
                  ))}
                </div>
              </ConfigSection>
            </div>
          </div>
        </Card>
      )}

      {/* Generate button */}
      <div className="flex flex-col items-center gap-3 pb-8">
        <Button
          size="lg"
          onClick={handleGenerate}
          disabled={!uploadedFile}
          leftIcon={<Sparkles size={18} />}
          rightIcon={<ArrowRight size={16} />}
        >
          Generate Podcast
        </Button>
        {!uploadedFile && (
          <p className="text-[12.5px] text-slate-500">Upload a PDF to enable generation</p>
        )}
      </div>
    </div>
  );
}

function ConfigSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="mb-3 text-[13px] font-semibold text-slate-300">{label}</h3>
      {children}
    </div>
  );
}

function Pill({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-[13px] font-medium transition-all ${
        active
          ? 'border-brand-500/40 bg-brand-500/10 text-white'
          : 'border-white/5 bg-ink-800 text-slate-400 hover:border-white/10 hover:text-white'
      }`}
    >
      {active && <Check size={13} className="text-brand-400" />}
      {children}
    </button>
  );
}

function OptionCard({ active, onClick, title, description }: { active: boolean; onClick: () => void; title: string; description: string }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-start gap-3 rounded-xl border p-3.5 text-left transition-all ${
        active
          ? 'border-brand-500/40 bg-brand-500/10'
          : 'border-white/5 bg-ink-800 hover:border-white/10'
      }`}
    >
      <div className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${active ? 'border-brand-400 bg-brand-500' : 'border-ink-500'}`}>
        {active && <Check size={11} className="text-white" />}
      </div>
      <div className="min-w-0">
        <p className={`text-[13.5px] font-medium ${active ? 'text-white' : 'text-slate-200'}`}>{title}</p>
        <p className="mt-0.5 text-[12px] text-slate-500">{description}</p>
      </div>
    </button>
  );
}
