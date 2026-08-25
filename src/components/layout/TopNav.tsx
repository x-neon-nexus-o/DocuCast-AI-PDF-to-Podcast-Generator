import { Search, Bell, Menu, Command } from 'lucide-react';
import { useApp } from '@/state/AppContext';

interface TopNavProps {
  onOpenMobileNav: () => void;
}

export function TopNav({ onOpenMobileNav }: TopNavProps) {
  const { user, navigate, docs } = useApp();

  const greetingHour = new Date().getHours();
  const greeting = greetingHour < 12 ? 'Good morning' : greetingHour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center gap-3 border-b border-white/5 bg-ink-950/80 px-4 backdrop-blur-md sm:px-6">
      <button
        onClick={onOpenMobileNav}
        className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-300 transition-colors hover:bg-white/5 lg:hidden"
        aria-label="Open menu"
      >
        <Menu size={20} />
      </button>

      <div className="hidden lg:block">
        <p className="text-[13px] text-slate-500">{greeting},</p>
        <p className="text-[14px] font-semibold text-white">{user.name}</p>
      </div>

      <div className="ml-auto flex items-center gap-2.5">
        <button
          onClick={() => navigate('search')}
          className="hidden h-10 items-center gap-2 rounded-xl border border-white/5 bg-ink-800 px-3.5 text-[13px] text-slate-400 transition-colors hover:border-white/10 hover:text-slate-200 sm:flex"
        >
          <Search size={15} />
          <span>Search documents, podcasts…</span>
          <kbd className="ml-2 hidden items-center gap-0.5 rounded border border-white/10 px-1.5 py-0.5 text-[10px] text-slate-500 md:flex">
            <Command size={9} /> K
          </kbd>
        </button>
        <button
          onClick={() => navigate('search')}
          className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-300 transition-colors hover:bg-white/5 sm:hidden"
          aria-label="Search"
        >
          <Search size={18} />
        </button>
        <button
          className="relative flex h-10 w-10 items-center justify-center rounded-xl text-slate-300 transition-colors hover:bg-white/5"
          aria-label="Notifications"
        >
          <Bell size={18} />
          <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-bad-500" />
        </button>
        <button
          onClick={() => navigate('profile')}
          className="flex h-9 w-9 items-center justify-center rounded-full text-[13px] font-semibold text-white transition-transform hover:scale-105"
          style={{ background: `hsl(${user.avatarHue} 70% 45%)` }}
          aria-label="Profile"
        >
          {user.name.charAt(0).toUpperCase()}
        </button>
      </div>
    </header>
  );
}
