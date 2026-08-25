import { useState, type ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { TopNav } from './TopNav';
import { MobileNav, BottomNav } from './MobileNav';
import { MiniPlayer } from '@/components/audio/MiniPlayer';
import { useApp } from '@/state/AppContext';

export function AppLayout({ children }: { children: ReactNode }) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const { miniPodcast } = useApp();

  return (
    <div className="flex h-screen overflow-hidden bg-ink-950">
      <div className="hidden lg:flex">
        <Sidebar />
      </div>

      <div className="flex flex-1 flex-col overflow-hidden">
        <TopNav onOpenMobileNav={() => setMobileNavOpen(true)} />
        <main className="flex-1 overflow-y-auto pb-20 lg:pb-0">
          <div className="mx-auto w-full max-w-[1280px] px-4 py-6 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>

      <MobileNav open={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />
      <BottomNav />
      {miniPodcast && (
        <div className="hidden lg:block">
          <MiniPlayer />
        </div>
      )}
    </div>
  );
}
