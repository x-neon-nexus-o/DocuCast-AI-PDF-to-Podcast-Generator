import { useRef, useState, type DragEvent } from 'react';
import { UploadCloud, FileText, X } from 'lucide-react';
import { useApp } from '@/state/AppContext';

interface UploadZoneProps {
  onFileSelected?: (file: { name: string; sizeMb: number; pages: number }) => void;
}

export function UploadZone({ onFileSelected }: UploadZoneProps) {
  const { uploadedFile, setUploadedFile, toast } = useApp();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const handleFile = (name: string, sizeBytes: number) => {
    const sizeMb = Math.max(0.1, +(sizeBytes / (1024 * 1024)).toFixed(1));
    if (sizeMb > 20) {
      toast({ title: 'File too large', description: 'Maximum file size is 20 MB.', variant: 'error' });
      return;
    }
    // Simulate page count based on size
    const pages = Math.max(1, Math.round(sizeMb * 6));
    const fileObj = { name, sizeMb, pages };
    setUploadedFile(fileObj);
    onFileSelected?.(fileObj);
    toast({ title: 'PDF uploaded', description: name, variant: 'success' });
  };

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      if (!file.name.toLowerCase().endsWith('.pdf')) {
        toast({ title: 'Unsupported file', description: 'Only PDF files are supported.', variant: 'error' });
        return;
      }
      handleFile(file.name, file.size);
    }
  };

  const simulateFile = () => {
    // Simulate picking a real file
    handleFile('Machine Learning Fundamentals.pdf', 2.4 * 1024 * 1024);
  };

  if (uploadedFile) {
    return (
      <div className="rounded-2xl border border-brand-500/30 bg-brand-500/[0.06] p-5 animate-scale-in">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-brand-500/15 text-brand-300">
            <FileText size={26} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[14px] font-semibold text-white">{uploadedFile.name}</p>
            <p className="mt-0.5 text-[12.5px] text-slate-400">
              {uploadedFile.sizeMb} MB · {uploadedFile.pages} pages
            </p>
          </div>
          <button
            onClick={() => setUploadedFile(null)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-white/5 hover:text-white"
            aria-label="Remove file"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={onDrop}
      onClick={simulateFile}
      className={`group relative cursor-pointer rounded-2xl border-2 border-dashed p-10 text-center transition-all duration-300 sm:p-16 ${
        dragging
          ? 'border-brand-400 bg-brand-500/10 scale-[1.01]'
          : 'border-white/10 bg-ink-850 hover:border-brand-500/40 hover:bg-ink-800'
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".pdf"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file.name, file.size);
        }}
      />
      <div className={`mx-auto flex h-16 w-16 items-center justify-center rounded-2xl transition-all duration-300 ${
        dragging ? 'bg-brand-500/20 text-brand-300' : 'bg-white/[0.03] text-slate-400 group-hover:text-brand-300'
      }`}>
        <UploadCloud size={28} className={dragging ? 'animate-bounce' : ''} />
      </div>
      <p className="mt-5 text-[15px] font-semibold text-white">
        {dragging ? 'Drop to upload' : 'Drop your PDF here'}
      </p>
      <p className="mt-1.5 text-[13px] text-slate-400">
        or <span className="font-medium text-brand-300">Browse Files</span>
      </p>
      <div className="mt-5 flex items-center justify-center gap-2">
        <span className="rounded-md border border-white/5 bg-white/[0.02] px-2.5 py-1 text-[11.5px] text-slate-400">
          PDF only
        </span>
        <span className="rounded-md border border-white/5 bg-white/[0.02] px-2.5 py-1 text-[11.5px] text-slate-400">
          Maximum file size: 20 MB
        </span>
      </div>
    </div>
  );
}
