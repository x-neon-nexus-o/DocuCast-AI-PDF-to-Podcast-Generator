import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { Route, Toast, DocRecord, Podcast, GenerationConfig } from '@/types';
import { documents as seedDocs, podcasts as seedPodcasts } from '@/data/mock';

interface AppState {
  route: Route;
  navigate: (route: Route) => void;

  // Auth (mock)
  authed: boolean;
  user: { name: string; email: string; avatarHue: number };
  login: (email: string, name?: string) => void;
  logout: () => void;

  // Data
  docs: DocRecord[];
  podcasts: Podcast[];
  toggleFavoriteDoc: (id: string) => void;
  toggleFavoritePodcast: (id: string) => void;
  renameDoc: (id: string, name: string) => void;
  deleteDoc: (id: string) => void;

  // Create flow
  uploadedFile: { name: string; sizeMb: number; pages: number } | null;
  setUploadedFile: (f: { name: string; sizeMb: number; pages: number } | null) => void;
  genConfig: GenerationConfig;
  setGenConfig: (c: Partial<GenerationConfig>) => void;

  // Processing + active podcast
  processingStep: number;
  setProcessingStep: (n: number) => void;
  activePodcast: Podcast | null;
  setActivePodcast: (p: Podcast | null) => void;
  startProcessing: () => void;

  // Audio (mini-player)
  playing: boolean;
  setPlaying: (p: boolean) => void;
  miniPodcast: Podcast | null;
  openMiniPlayer: (p: Podcast) => void;
  closeMiniPlayer: () => void;

  // Toasts
  toasts: Toast[];
  toast: (t: Omit<Toast, 'id'>) => void;
  dismissToast: (id: string) => void;
}

const Ctx = createContext<AppState | null>(null);

const defaultConfig: GenerationConfig = {
  range: 'entire',
  pageFrom: 1,
  pageTo: 10,
  style: 'conversational',
  complexity: 'balanced',
  language: 'English',
  voice: 'sarah',
  length: 'medium',
};

export function AppProvider({ children }: { children: ReactNode }) {
  const [route, setRoute] = useState<Route>('landing');
  const [authed, setAuthed] = useState(false);
  const [user, setUser] = useState({ name: 'Paras', email: 'paras@docucast.app', avatarHue: 205 });

  const [docs, setDocs] = useState<DocRecord[]>(seedDocs);
  const [pods, setPods] = useState<Podcast[]>(seedPodcasts);

  const [uploadedFile, setUploadedFile] = useState<AppState['uploadedFile']>(null);
  const [genConfig, setGenConfigState] = useState<GenerationConfig>(defaultConfig);
  const [processingStep, setProcessingStep] = useState(0);
  const [activePodcast, setActivePodcast] = useState<Podcast | null>(null);

  const [playing, setPlaying] = useState(false);
  const [miniPodcast, setMiniPodcast] = useState<Podcast | null>(null);

  const [toasts, setToasts] = useState<Toast[]>([]);

  const navigate = useCallback((r: Route) => {
    setRoute(r);
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const toast = useCallback((t: Omit<Toast, 'id'>) => {
    const id = `t-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    setToasts((prev) => [...prev, { ...t, id }]);
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((x) => x.id !== id));
    }, 4200);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((x) => x.id !== id));
  }, []);

  const login = useCallback((email: string, name?: string) => {
    const cleanName = name && name.trim() ? name.trim() : email.split('@')[0].replace(/[._]/g, ' ');
    const niceName = cleanName.charAt(0).toUpperCase() + cleanName.slice(1);
    setUser({ name: niceName, email, avatarHue: 205 });
    setAuthed(true);
    navigate('dashboard');
  }, [navigate]);

  const logout = useCallback(() => {
    setAuthed(false);
    setMiniPodcast(null);
    setPlaying(false);
    navigate('landing');
  }, [navigate]);

  const toggleFavoriteDoc = useCallback((id: string) => {
    setDocs((prev) => prev.map((d) => (d.id === id ? { ...d, favorite: !d.favorite } : d)));
  }, []);

  const toggleFavoritePodcast = useCallback((id: string) => {
    setPods((prev) => prev.map((p) => (p.id === id ? { ...p, favorite: !p.favorite } : p)));
    if (activePodcast?.id === id) {
      setActivePodcast((prev) => (prev ? { ...prev, favorite: !prev.favorite } : prev));
    }
  }, [activePodcast?.id]);

  const renameDoc = useCallback((id: string, name: string) => {
    setDocs((prev) => prev.map((d) => (d.id === id ? { ...d, name } : d)));
  }, []);

  const deleteDoc = useCallback((id: string) => {
    setDocs((prev) => prev.filter((d) => d.id !== id));
  }, []);

  const setGenConfig = useCallback((c: Partial<GenerationConfig>) => {
    setGenConfigState((prev) => ({ ...prev, ...c }));
  }, []);

  const startProcessing = useCallback(() => {
    setProcessingStep(0);
    navigate('processing');
  }, [navigate]);

  const openMiniPlayer = useCallback((p: Podcast) => {
    setMiniPodcast(p);
    setPlaying(true);
  }, []);

  const closeMiniPlayer = useCallback(() => {
    setMiniPodcast(null);
    setPlaying(false);
  }, []);

  const value = useMemo<AppState>(() => ({
    route,
    navigate,
    authed,
    user,
    login,
    logout,
    docs,
    podcasts: pods,
    toggleFavoriteDoc,
    toggleFavoritePodcast,
    renameDoc,
    deleteDoc,
    uploadedFile,
    setUploadedFile,
    genConfig,
    setGenConfig,
    processingStep,
    setProcessingStep,
    activePodcast,
    setActivePodcast,
    startProcessing,
    playing,
    setPlaying,
    miniPodcast,
    openMiniPlayer,
    closeMiniPlayer,
    toasts,
    toast,
    dismissToast,
  }), [
    route, navigate, authed, user, login, logout, docs, pods, toggleFavoriteDoc,
    toggleFavoritePodcast, renameDoc, deleteDoc, uploadedFile, genConfig, processingStep,
    activePodcast, startProcessing, playing, miniPodcast, openMiniPlayer, closeMiniPlayer,
    toasts, toast, dismissToast,
  ]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useApp(): AppState {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
