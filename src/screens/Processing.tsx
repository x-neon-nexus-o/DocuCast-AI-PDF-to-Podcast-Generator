import { useEffect, useRef, useState } from 'react';
import { FileText, X, Sparkles, Brain } from 'lucide-react';
import { useApp } from '@/state/AppContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { ProcessingSteps } from '@/components/documents/ProcessingSteps';
import { podcasts } from '@/data/mock';

const statusMessages = [
  'Uploading your document securely…',
  'Extracting text from all pages…',
  'DocuCast is identifying the key concepts in your document…',
  'Writing a natural podcast script with Gemini AI…',
  'Synthesizing natural-sounding voice with Edge-TTS…',
  'Encoding MP3 and adding chapter markers…',
];

export function Processing() {
  const { uploadedFile, processingStep, setProcessingStep, navigate, setActivePodcast, toast } = useApp();
  const [progress, setProgress] = useState(0);
  const [cancelled, setCancelled] = useState(false);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (cancelled) return;
    // Advance steps every ~2.5s
    intervalRef.current = window.setInterval(() => {
      setProcessingStep(processingStep + 1);
    }, 2600);

    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
    };
  }, [processingStep, setProcessingStep, cancelled]);

  // When step reaches 6, navigate to podcast result
  useEffect(() => {
    if (processingStep >= 6 && !cancelled) {
      const pod = podcasts[0];
      setActivePodcast(pod);
      toast({ title: 'Podcast ready!', description: pod.title, variant: 'success' });
      navigate('podcast');
    }
  }, [processingStep, cancelled, navigate, setActivePodcast, toast]);

  // Smooth progress bar
  useEffect(() => {
    const target = ((processingStep + 1) / 6) * 100;
    const id = window.setInterval(() => {
      setProgress((p) => {
        if (p >= target) {
          window.clearInterval(id);
          return p;
        }
        return Math.min(target, p + 2);
      });
    }, 50);
    return () => window.clearInterval(id);
  }, [processingStep]);

  const handleCancel = () => {
    setCancelled(true);
    if (intervalRef.current) window.clearInterval(intervalRef.current);
    toast({ title: 'Processing cancelled', variant: 'warning' });
    navigate('create');
  };

  if (!uploadedFile) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <p className="text-[14px] text-slate-400">No file uploaded.</p>
          <Button className="mt-4" onClick={() => navigate('create')}>Back to Upload</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-brand-500/30 bg-brand-500/10 text-brand-300">
          <Brain size={28} className="animate-pulse-soft" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-white">Creating Your Podcast</h1>
        <p className="mt-1.5 text-[14px] text-slate-400">{statusMessages[Math.min(processingStep, 5)]}</p>
      </div>

      <Card className="p-6">
        <div className="mb-6">
          <div className="mb-2 flex items-center justify-between text-[12.5px]">
            <span className="text-slate-400">Overall progress</span>
            <span className="font-semibold text-white">{Math.round(progress)}%</span>
          </div>
          <ProgressBar value={progress} />
        </div>

        <ProcessingSteps currentStep={processingStep} />
      </Card>

      <Card className="p-5">
        <h3 className="mb-3 text-[13px] font-semibold uppercase tracking-wide text-slate-500">Document Information</h3>
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-500/10 text-brand-300">
            <FileText size={22} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[14px] font-medium text-white">{uploadedFile.name}</p>
            <p className="text-[12.5px] text-slate-400">
              {uploadedFile.pages} pages · {uploadedFile.sizeMb} MB
            </p>
          </div>
          <div className="text-right">
            <p className="text-[11.5px] text-slate-500">Est. time</p>
            <p className="text-[13px] font-semibold text-white">~45 sec</p>
          </div>
        </div>
      </Card>

      <div className="flex items-center justify-between rounded-2xl border border-brand-500/20 bg-brand-grad-soft p-4">
        <div className="flex items-center gap-2">
          <Sparkles size={16} className="text-brand-300" />
          <p className="text-[13px] text-slate-300">
            {processingStep < 6 ? 'AI is working… this usually takes under a minute.' : 'Finishing up…'}
          </p>
        </div>
        <Button variant="danger" size="sm" onClick={handleCancel} leftIcon={<X size={14} />}>
          Cancel
        </Button>
      </div>
    </div>
  );
}
