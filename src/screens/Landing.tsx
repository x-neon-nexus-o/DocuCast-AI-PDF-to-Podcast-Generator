import {
  Sparkles, Brain, AudioLines, Download, ArrowRight, Upload, FileText,
  Play, Pause, Menu, X, Zap, Check, Github, Twitter, Linkedin,
} from 'lucide-react';
import { useState } from 'react';
import { useApp } from '@/state/AppContext';
import { Button } from '@/components/ui/Button';
import { Logo } from '@/components/ui/Logo';
import { Waveform } from '@/components/audio/Waveform';

const features = [
  { icon: Brain, title: 'AI Summarization', description: 'Gemini AI distills your document into the key concepts that actually matter.' },
  { icon: Sparkles, title: 'Smart Analogies', description: 'Complex topics are explained with relatable analogies that stick.' },
  { icon: AudioLines, title: 'Natural AI Voice', description: 'Edge-TTS produces lifelike speech in multiple languages and voices.' },
  { icon: Download, title: 'Downloadable Audio', description: 'Take your podcasts offline as MP3 files and listen anywhere.' },
];

const workflow = [
  { icon: Upload, label: 'Upload', description: 'Drop your PDF into DocuCast' },
  { icon: Brain, label: 'AI Understands', description: 'Gemini reads and summarizes' },
  { icon: Sparkles, label: 'Generate Podcast', description: 'A script is written & voiced' },
  { icon: AudioLines, label: 'Listen', description: 'Play or download MP3' },
];

export function Landing() {
  const { navigate, toast } = useApp();
  const [menuOpen, setMenuOpen] = useState(false);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-ink-950 text-slate-200">
      {/* Background */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-40" />
        <div className="absolute inset-0 radial-fade" />
        <div className="blob -top-40 -left-40 h-96 w-96 bg-brand-500/10" />
        <div className="blob -top-20 right-0 h-80 w-80 bg-cyan-500/10" />
      </div>

      {/* Navbar */}
      <header className="sticky top-0 z-50 border-b border-white/5 bg-ink-950/70 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2.5">
            <Logo />
            <span className="text-[16px] font-bold tracking-tight text-white">DocuCast</span>
          </div>
          <nav className="hidden items-center gap-8 md:flex">
            <button onClick={() => scrollTo('hero')} className="nav-link-anim text-[13.5px] text-slate-300 hover:text-white">Home</button>
            <button onClick={() => scrollTo('features')} className="nav-link-anim text-[13.5px] text-slate-300 hover:text-white">Features</button>
            <button onClick={() => scrollTo('how')} className="nav-link-anim text-[13.5px] text-slate-300 hover:text-white">How It Works</button>
            <button onClick={() => scrollTo('about')} className="nav-link-anim text-[13.5px] text-slate-300 hover:text-white">About</button>
          </nav>
          <div className="hidden items-center gap-3 md:flex">
            <button onClick={() => navigate('login')} className="text-[13.5px] font-medium text-slate-300 transition-colors hover:text-white">
              Login
            </button>
            <Button size="sm" onClick={() => navigate('signup')} rightIcon={<ArrowRight size={14} />}>
              Get Started
            </Button>
          </div>
          <button
            onClick={() => setMenuOpen((m) => !m)}
            className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-300 hover:bg-white/5 md:hidden"
            aria-label="Menu"
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
        {menuOpen && (
          <div className="border-t border-white/5 bg-ink-900 p-4 md:hidden">
            <nav className="flex flex-col gap-3">
              <button onClick={() => scrollTo('hero')} className="text-left text-[14px] text-slate-300">Home</button>
              <button onClick={() => scrollTo('features')} className="text-left text-[14px] text-slate-300">Features</button>
              <button onClick={() => scrollTo('how')} className="text-left text-[14px] text-slate-300">How It Works</button>
              <button onClick={() => scrollTo('about')} className="text-left text-[14px] text-slate-300">About</button>
              <div className="flex gap-3 pt-2">
                <Button variant="secondary" fullWidth onClick={() => navigate('login')}>Login</Button>
                <Button fullWidth onClick={() => navigate('signup')}>Get Started</Button>
              </div>
            </nav>
          </div>
        )}
      </header>

      {/* Hero */}
      <section id="hero" className="relative mx-auto max-w-[1200px] px-4 pt-16 sm:px-6 sm:pt-24">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-brand-500/30 bg-brand-500/10 px-3.5 py-1.5 text-[12.5px] text-brand-300 animate-fade-in">
            <Sparkles size={13} />
            AI-powered PDF-to-podcast learning
          </div>
          <h1 className="text-4xl font-extrabold leading-[1.1] tracking-tight text-white sm:text-6xl animate-slide-up">
            Turn Long PDFs Into <span className="text-grad">Podcasts</span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-[16px] leading-relaxed text-slate-400 animate-slide-up" style={{ animationDelay: '60ms' }}>
            Upload a document, let AI simplify the content, and listen to it as a natural
            podcast-style conversation.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row animate-slide-up" style={{ animationDelay: '120ms' }}>
            <Button size="lg" onClick={() => navigate('signup')} leftIcon={<Upload size={18} />} rightIcon={<ArrowRight size={16} />}>
              Convert a PDF
            </Button>
            <Button size="lg" variant="secondary" onClick={() => scrollTo('how')} leftIcon={<Play size={16} />}>
              See How It Works
            </Button>
          </div>
        </div>

        {/* App preview */}
        <div className="mt-16 animate-scale-in" style={{ animationDelay: '200ms' }}>
          <AppPreview />
        </div>
      </section>

      {/* Workflow */}
      <section id="how" className="relative mx-auto max-w-[1200px] px-4 py-20 sm:px-6">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white">From PDF to Podcast in 4 Steps</h2>
          <p className="mt-2 text-[15px] text-slate-400">No setup. No technical know-how. Just upload and listen.</p>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {workflow.map((step, i) => (
            <div key={step.label} className="relative rounded-2xl border border-white/5 bg-ink-850 p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-500/10 text-brand-300">
                <step.icon size={22} />
              </div>
              <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-slate-600">Step {i + 1}</div>
              <h3 className="text-[15px] font-semibold text-white">{step.label}</h3>
              <p className="mt-1 text-[13px] text-slate-400">{step.description}</p>
              {i < workflow.length - 1 && (
                <div className="absolute -right-2 top-1/2 hidden -translate-y-1/2 text-slate-700 lg:block">
                  <ArrowRight size={16} />
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="relative mx-auto max-w-[1200px] px-4 py-20 sm:px-6">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white">Built for better learning</h2>
          <p className="mt-2 text-[15px] text-slate-400">Everything you need to turn reading time into listening time.</p>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => (
            <div
              key={f.title}
              className="group rounded-2xl border border-white/5 bg-ink-850 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-brand-500/20 hover:shadow-card"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-500/10 text-brand-300 transition-colors group-hover:bg-brand-500/20">
                <f.icon size={22} />
              </div>
              <h3 className="text-[15px] font-semibold text-white">{f.title}</h3>
              <p className="mt-1.5 text-[13px] leading-relaxed text-slate-400">{f.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Built for students & professionals */}
      <section id="about" className="relative mx-auto max-w-[1200px] px-4 py-20 sm:px-6">
        <div className="overflow-hidden rounded-3xl border border-white/5 bg-ink-850 p-8 sm:p-12">
          <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-white">Built for Students & Professionals</h2>
              <p className="mt-3 text-[15px] leading-relaxed text-slate-400">
                Whether you are preparing for exams or catching up on industry reports during your commute,
                DocuCast turns dense documents into audio you can actually get through.
              </p>
              <ul className="mt-6 space-y-3">
                {[
                  'Listen on the go — during travel, gym, or walks',
                  'Revise faster with quick-recognition podcasts',
                  'Understand complex topics through conversational explanations',
                  'Works on any device, anywhere',
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-[14px] text-slate-200">
                    <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-good-500/20 text-good-400">
                      <Check size={12} />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
              <div className="mt-8">
                <Button onClick={() => navigate('signup')} rightIcon={<ArrowRight size={16} />}>
                  Get Started Free
                </Button>
              </div>
            </div>
            <div className="relative">
              <div className="grid grid-cols-2 gap-3">
                <StatCard value="50k+" label="Documents processed" />
                <StatCard value="120k+" label="Podcasts generated" />
                <StatCard value="8+" label="Languages supported" />
                <StatCard value="4.9" label="Average rating" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative mx-auto max-w-[1200px] px-4 py-12 sm:px-6">
        <div className="rounded-3xl border border-brand-500/20 bg-brand-grad-soft p-10 text-center sm:p-16">
          <Zap className="mx-auto mb-4 text-brand-400" size={32} />
          <h2 className="text-3xl font-bold text-white">Ready to listen to your next document?</h2>
          <p className="mx-auto mt-2 max-w-md text-[15px] text-slate-400">
            Create your free account and convert your first PDF in under a minute.
          </p>
          <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button size="lg" onClick={() => navigate('signup')} rightIcon={<ArrowRight size={16} />}>
              Get Started Free
            </Button>
            <Button size="lg" variant="secondary" onClick={() => toast({ title: 'Demo mode active', description: 'Explore the full app with sample data.', variant: 'info' })}>
              View Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative border-t border-white/5">
        <div className="mx-auto max-w-[1200px] px-4 py-12 sm:px-6">
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
            <div className="col-span-2 sm:col-span-1">
              <div className="flex items-center gap-2.5">
                <Logo size={26} />
                <span className="text-[15px] font-bold text-white">DocuCast</span>
              </div>
              <p className="mt-3 max-w-xs text-[12.5px] leading-relaxed text-slate-500">
                AI-powered PDF-to-podcast learning platform for students and professionals.
              </p>
              <div className="mt-4 flex gap-3">
                <button className="text-slate-500 hover:text-white" aria-label="GitHub"><Github size={18} /></button>
                <button className="text-slate-500 hover:text-white" aria-label="Twitter"><Twitter size={18} /></button>
                <button className="text-slate-500 hover:text-white" aria-label="LinkedIn"><Linkedin size={18} /></button>
              </div>
            </div>
            <FooterCol title="Product" links={['Features', 'How It Works', 'Pricing', 'Changelog']} />
            <FooterCol title="Company" links={['About', 'Blog', 'Careers', 'Contact']} />
            <FooterCol title="Legal" links={['Privacy', 'Terms', 'Security', 'Cookies']} />
          </div>
          <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-white/5 pt-6 sm:flex-row">
            <p className="text-[12.5px] text-slate-600">© 2026 DocuCast. A B.Tech mini-project.</p>
            <p className="text-[12.5px] text-slate-600">Built with React, Vite, TailwindCSS & Gemini AI</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FooterCol({ title, links }: { title: string; links: string[] }) {
  return (
    <div>
      <h4 className="text-[13px] font-semibold text-white">{title}</h4>
      <ul className="mt-3 space-y-2">
        {links.map((l) => (
          <li key={l}>
            <a href="#" className="text-[12.5px] text-slate-500 transition-colors hover:text-slate-200">{l}</a>
          </li>
        ))}
      </ul>
    </div>
  );
}

function StatCard({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-2xl border border-white/5 bg-ink-800 p-5">
      <p className="text-2xl font-bold text-white">{value}</p>
      <p className="mt-1 text-[12.5px] text-slate-400">{label}</p>
    </div>
  );
}

function AppPreview() {
  const [playing, setPlaying] = useState(false);
  return (
    <div className="relative mx-auto max-w-4xl">
      <div className="absolute -inset-4 -z-10 rounded-3xl bg-brand-500/10 blur-2xl" />
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-ink-900 shadow-card">
        {/* Window bar */}
        <div className="flex items-center gap-2 border-b border-white/5 px-4 py-3">
          <div className="flex gap-1.5">
            <div className="h-2.5 w-2.5 rounded-full bg-bad-500/70" />
            <div className="h-2.5 w-2.5 rounded-full bg-warn-500/70" />
            <div className="h-2.5 w-2.5 rounded-full bg-good-500/70" />
          </div>
          <div className="mx-auto flex h-6 items-center rounded-md border border-white/5 bg-ink-800 px-3 text-[11px] text-slate-500">
            docucast.app/dashboard
          </div>
        </div>
        {/* Preview content */}
        <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-3">
          {/* PDF card */}
          <div className="rounded-xl border border-white/5 bg-ink-850 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-500/10 text-brand-300">
                <FileText size={20} />
              </div>
              <div className="min-w-0">
                <p className="truncate text-[12.5px] font-medium text-white">Machine Learning Fundamentals.pdf</p>
                <p className="text-[11px] text-slate-500">12 pages · 2.4 MB</p>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-ink-700">
                <div className="h-full w-3/4 rounded-full bg-good-500" />
              </div>
              <span className="text-[10.5px] text-good-400">Ready</span>
            </div>
          </div>

          {/* AI processing */}
          <div className="rounded-xl border border-brand-500/20 bg-brand-500/[0.06] p-4">
            <div className="flex items-center gap-2">
              <Brain size={16} className="text-brand-300" />
              <p className="text-[12px] font-semibold text-white">AI Processing</p>
            </div>
            <p className="mt-2 text-[11px] text-slate-400">Generating podcast script…</p>
            <div className="mt-3 flex items-center gap-1.5">
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-1.5 flex-1 rounded-full bg-brand-400/40"
                  style={{ animation: `progress-glow 1.4s ease-in-out ${i * 0.2}s infinite` }}
                />
              ))}
            </div>
          </div>

          {/* Audio player */}
          <div className="rounded-xl border border-white/5 bg-ink-850 p-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPlaying((p) => !p)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-500 text-white"
                aria-label="Play"
              >
                {playing ? <Pause size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" />}
              </button>
              <div className="min-w-0">
                <p className="truncate text-[12px] font-medium text-white">ML Fundamentals</p>
                <p className="text-[10.5px] text-slate-500">18:42 · English</p>
              </div>
            </div>
            <div className="mt-3">
              <Waveform progress={420} durationSec={1122} playing={playing} bars={28} height={24} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
