import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { Route, Toast, DocRecord, Podcast, GenerationConfig } from '@/types';
import * as api from '@/services/api';

interface AppState {
  route: Route;
  navigate: (route: Route) => void;

  // Auth (MongoDB-backed: users + sessions stored in MongoDB)
  authed: boolean;
  sessionLoading: boolean;
  user: { name: string; email: string; avatarHue: number };
  login: (email: string, password: string, remember?: boolean) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;

  // Data (persisted in MongoDB, scoped to the signed-in user)
  docs: DocRecord[];
  podcasts: Podcast[];
  loadUserData: () => Promise<void>;
  toggleFavoriteDoc: (id: string) => void;
  toggleFavoritePodcast: (id: string) => void;
  renameDoc: (id: string, name: string) => void;
  deleteDoc: (id: string) => void;

  // Create flow
  uploadedFile: { name: string; sizeMb: number; pages: number } | null;
  uploadedFileRaw: File | null;
  setUploadedFile: (f: { name: string; sizeMb: number; pages: number } | null) => void;
  setUploadedFileRaw: (f: File | null) => void;
  genConfig: GenerationConfig;
  setGenConfig: (c: Partial<GenerationConfig>) => void;

  // Processing + active podcast
  processingStep: number;
  setProcessingStep: (n: number | ((prev: number) => number)) => void;
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

const guestUser = { name: 'Guest', email: '', avatarHue: 205 };

function hueFromEmail(email: string): number {
  let hash = 0;
  for (let i = 0; i < email.length; i++) hash = (hash * 31 + email.charCodeAt(i)) % 360;
  return hash;
}

function makeUser(u: api.UserInfo): { name: string; email: string; avatarHue: number } {
  const cleanName = u.name && u.name.trim() ? u.name.trim() : u.email.split('@')[0];
  const niceName = cleanName.charAt(0).toUpperCase() + cleanName.slice(1);
  return { name: niceName, email: u.email, avatarHue: hueFromEmail(u.email) };
}

function errorMessage(err: unknown): string {
  if (err instanceof api.ApiError) return err.message;
  if (err instanceof Error) return err.message;
  return 'Something went wrong. Please try again.';
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [route, setRoute] = useState<Route>('landing');
  const [authed, setAuthed] = useState(false);
  const [sessionLoading, setSessionLoading] = useState(true);
  const [user, setUser] = useState(guestUser);

  const [docs, setDocs] = useState<DocRecord[]>([]);
  const [pods, setPods] = useState<Podcast[]>([]);

  const [uploadedFile, setUploadedFile] = useState<AppState['uploadedFile']>(null);
  const [uploadedFileRaw, setUploadedFileRaw] = useState<File | null>(null);
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

  // -------------------------------------------------------------------------
  // Data loading (from MongoDB)
  // -------------------------------------------------------------------------

  const loadUserData = useCallback(async () => {
    try {
      const [loadedDocs, loadedPods] = await Promise.all([
        api.fetchDocuments(),
        api.fetchPodcasts(),
      ]);
      setDocs(loadedDocs);
      setPods(loadedPods);
    } catch (err) {
      toast({
        title: 'Could not load your library',
        description: errorMessage(err),
        variant: 'error',
      });
    }
  }, [toast]);

  // -------------------------------------------------------------------------
  // Auth
  // -------------------------------------------------------------------------

  const login = useCallback(
    async (email: string, password: string, remember = true) => {
      const res = await api.login(email, password, remember);
      setUser(makeUser(res.user));
      setAuthed(true);
      await loadUserData();
      navigate('dashboard');
    },
    [navigate, loadUserData],
  );

  const signup = useCallback(
    async (name: string, email: string, password: string) => {
      const res = await api.signup(name, email, password);
      setUser(makeUser(res.user));
      setAuthed(true);
      await loadUserData();
      navigate('dashboard');
    },
    [navigate, loadUserData],
  );

  const logout = useCallback(async () => {
    try {
      await api.logout(); // destroys the session token in MongoDB
    } catch {
      /* best effort */
    }
    setAuthed(false);
    setUser(guestUser);
    setDocs([]);
    setPods([]);
    setMiniPodcast(null);
    setPlaying(false);
    navigate('landing');
  }, [navigate]);

  // Restore the session on first load (token -> MongoDB session lookup).
  useEffect(() => {
    let cancelled = false;

    const restore = async () => {
      if (!api.getToken()) {
        if (!cancelled) setSessionLoading(false);
        return;
      }
      try {
        const me = await api.getMe();
        if (cancelled) return;
        setUser(makeUser(me));
        setAuthed(true);
        await loadUserData();
      } catch {
        // apiFetch clears the invalid token automatically on 401.
      } finally {
        if (!cancelled) setSessionLoading(false);
      }
    };

    const onUnauthorized = () => {
      setAuthed(false);
      setUser(guestUser);
      setDocs([]);
      setPods([]);
      setMiniPodcast(null);
      setPlaying(false);
      navigate('landing');
    };

    restore();
    window.addEventListener(api.UNAUTHORIZED_EVENT, onUnauthorized);
    return () => {
      cancelled = true;
      window.removeEventListener(api.UNAUTHORIZED_EVENT, onUnauthorized);
    };
  }, [navigate, loadUserData]);

  // -------------------------------------------------------------------------
  // Document / podcast mutations (optimistic UI + MongoDB persistence)
  // -------------------------------------------------------------------------

  const toggleFavoriteDoc = useCallback(
    (id: string) => {
      const target = docs.find((d) => d.id === id);
      if (!target) return;
      const next = !target.favorite;
      setDocs((prev) => prev.map((d) => (d.id === id ? { ...d, favorite: next } : d)));
      api
        .updateDocument(id, { favorite: next })
        .catch((err) =>
          toast({ title: 'Could not update document', description: errorMessage(err), variant: 'error' }),
        );
    },
    [docs, toast],
  );

  const renameDoc = useCallback(
    (id: string, name: string) => {
      setDocs((prev) => prev.map((d) => (d.id === id ? { ...d, name } : d)));
      api
        .updateDocument(id, { name })
        .catch((err) =>
          toast({ title: 'Could not rename document', description: errorMessage(err), variant: 'error' }),
        );
    },
    [toast],
  );

  const deleteDoc = useCallback(
    (id: string) => {
      const target = docs.find((d) => d.id === id);
      setDocs((prev) => prev.filter((d) => d.id !== id));
      if (target) {
        api
          .deleteDocument(id)
          .catch((err) =>
            toast({ title: 'Could not delete document', description: errorMessage(err), variant: 'error' }),
          );
      }
    },
    [docs, toast],
  );

  const toggleFavoritePodcast = useCallback(
    (id: string) => {
      const target = pods.find((p) => p.id === id);
      if (!target) return;
      const next = !target.favorite;
      setPods((prev) => prev.map((p) => (p.id === id ? { ...p, favorite: next } : p)));
      setActivePodcast((prev) => (prev && prev.id === id ? { ...prev, favorite: next } : prev));
      api
        .updatePodcast(id, { favorite: next })
        .catch((err) =>
          toast({ title: 'Could not update podcast', description: errorMessage(err), variant: 'error' }),
        );
    },
    [pods, toast],
  );

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

  const value = useMemo<AppState>(
    () => ({
      route,
      navigate,
      authed,
      sessionLoading,
      user,
      login,
      signup,
      logout,
      docs,
      podcasts: pods,
      loadUserData,
      toggleFavoriteDoc,
      toggleFavoritePodcast,
      renameDoc,
      deleteDoc,
      uploadedFile,
      setUploadedFile,
      uploadedFileRaw,
      setUploadedFileRaw,
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
    }),
    [
      route, navigate, authed, sessionLoading, user, login, signup, logout, docs, pods,
      loadUserData, toggleFavoriteDoc, toggleFavoritePodcast, renameDoc, deleteDoc,
      uploadedFile, uploadedFileRaw, genConfig, setGenConfig, processingStep,
      setProcessingStep, activePodcast, setActivePodcast, startProcessing, playing,
      setPlaying, miniPodcast, openMiniPlayer, closeMiniPlayer, toasts, toast, dismissToast,
    ],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useApp(): AppState {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
