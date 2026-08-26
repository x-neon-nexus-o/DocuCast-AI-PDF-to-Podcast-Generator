import { AppProvider, useApp } from '@/state/AppContext';
import { AppLayout } from '@/components/layout/AppLayout';
import { ToastHost } from '@/components/ui/Toast';
import { MiniPlayer } from '@/components/audio/MiniPlayer';
import { Logo } from '@/components/ui/Logo';
import { Landing } from '@/screens/Landing';
import { Auth } from '@/screens/Auth';
import { Dashboard } from '@/screens/Dashboard';
import { CreatePodcast } from '@/screens/CreatePodcast';
import { Processing } from '@/screens/Processing';
import { PodcastResult } from '@/screens/PodcastResult';
import { ScriptViewer } from '@/screens/ScriptViewer';
import { MyDocuments } from '@/screens/MyDocuments';
import { AudioLibrary } from '@/screens/AudioLibrary';
import { SearchScreen } from '@/screens/SearchScreen';
import { Settings } from '@/screens/Settings';
import { Profile } from '@/screens/Profile';
import { Help } from '@/screens/Help';
import type { Route } from '@/types';

function Router() {
  const { route, authed, sessionLoading, miniPodcast } = useApp();

  // While we restore the session from MongoDB (token -> sessions collection)
  // on first load, show a splash instead of flashing the login screen.
  if (sessionLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ink-950">
        <div className="flex flex-col items-center gap-3">
          <Logo />
          <p className="text-[13px] text-slate-500">Restoring your session…</p>
        </div>
      </div>
    );
  }

  // Public screens (no auth required)
  if (route === 'landing') return <Landing />;
  if (route === 'login') return <Auth mode="login" />;
  if (route === 'signup') return <Auth mode="signup" />;

  // Protected screens — redirect to login if not authed
  if (!authed) return <Auth mode="login" />;

  const screens: Partial<Record<Route, React.ReactNode>> = {
    dashboard: <Dashboard />,
    create: <CreatePodcast />,
    processing: <Processing />,
    podcast: <PodcastResult />,
    script: <ScriptViewer />,
    documents: <MyDocuments />,
    library: <AudioLibrary />,
    search: <SearchScreen />,
    settings: <Settings />,
    profile: <Profile />,
    help: <Help />,
  };

  return (
    <AppLayout>
      {screens[route] ?? <Dashboard />}
      {miniPodcast && <div className="lg:hidden"><MiniPlayer /></div>}
    </AppLayout>
  );
}

function App() {
  return (
    <AppProvider>
      <Router />
      <ToastHost />
    </AppProvider>
  );
}

export default App;
