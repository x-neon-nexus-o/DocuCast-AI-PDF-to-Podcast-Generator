import {
  LayoutDashboard,
  FileText,
  AudioLines,
  Plus,
  Star,
  Settings,
  LifeBuoy,
  LogOut,
  Sparkles,
} from 'lucide-react';
import { useApp } from '@/state/AppContext';
import { Logo } from '@/components/ui/Logo';
import type { Route } from '@/types';

const navItems: { id: Route; label: string; icon: typeof LayoutDashboard }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'documents', label: 'My Documents', icon: FileText },
  { id: 'library', label: 'Audio Library', icon: AudioLines },
  { id: 'create', label: 'Create Podcast', icon: Plus },
];

const secondaryItems: { id: Route; label: string; icon: typeof Star }[] = [
  { id: 'search', label: 'Search', icon: Star },
  { id: 'settings', label: 'Settings', icon: Settings },
  { id: 'profile', label: 'Profile', icon: Settings },
  { id: 'help', label: 'Help', icon: LifeBuoy },
];

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const { route, navigate, user, logout, docs, toast } = useApp();

  const go = (r: Route) => {
    navigate(r);
    onNavigate?.();
  };

  const favoritesCount = docs.filter((d) => d.favorite).length;

  return (
    <aside className="flex h-full w-[244px] flex-col border-r border-white/5 bg-ink-900">
      <div className="flex h-16 shrink-0 items-center gap-2.5 px-5">
        <button onClick={() => go('dashboard')} className="flex items-center gap-2.5">
          <Logo />
          <span className="text-[15px] font-bold tracking-tight text-white">DocuCast</span>
        </button>

      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-2 no-scrollbar">
        <p className="px-3 py-2 text-[10.5px] font-semibold uppercase tracking-wider text-slate-600">Menu</p>
        <ul className="space-y-0.5">
          {navItems.map((item) => {
            const active = route === item.id;
            return (
              <li key={item.id}>
                <button
                  onClick={() => go(item.id)}
                  className={`group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[13.5px] font-medium transition-all duration-200 ${
                    active
                      ? 'border border-brand-500/30 bg-brand-500/10 text-white'
                      : 'border border-transparent text-slate-400 hover:border-white/5 hover:bg-white/[0.03] hover:text-white'
                  }`}
                >
                  <item.icon size={18} className={active ? 'text-brand-400' : 'text-slate-500 group-hover:text-slate-300'} />
                  {item.label}
                </button>
              </li>
            );
          })}
        </ul>

        <p className="mt-5 px-3 py-2 text-[10.5px] font-semibold uppercase tracking-wider text-slate-600">Library</p>
        <ul className="space-y-0.5">
          {secondaryItems.map((item) => {
            const active = route === item.id;
            return (
              <li key={item.id}>
                <button
                  onClick={() => go(item.id)}
                  className={`group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[13.5px] font-medium transition-all duration-200 ${
                    active
                      ? 'border border-brand-500/30 bg-brand-500/10 text-white'
                      : 'border border-transparent text-slate-400 hover:border-white/5 hover:bg-white/[0.03] hover:text-white'
                  }`}
                >
                  <item.icon size={18} className={active ? 'text-brand-400' : 'text-slate-500 group-hover:text-slate-300'} />
                  {item.label}
                  {item.id === 'search' && favoritesCount > 0 && (
                    <span className="ml-auto rounded-full bg-bad-500/20 px-1.5 py-0.5 text-[10px] font-semibold text-bad-400">
                      {favoritesCount}
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>

        <div className="mx-2 mt-5 rounded-xl border border-brand-500/20 bg-brand-grad-soft p-3.5">
          <div className="flex items-center gap-2">
            <Sparkles size={14} className="text-brand-400" />
            <p className="text-[12px] font-semibold text-white">Upgrade to Pro</p>
          </div>
          <p className="mt-1 text-[11.5px] text-slate-400">Unlimited podcasts & longer documents.</p>
          <button
            onClick={() => toast({ title: 'Upgrade to Pro', description: 'Plans are coming soon.', variant: 'info' })}
            className="mt-2.5 w-full rounded-lg bg-brand-500 py-1.5 text-[12px] font-medium text-white transition-colors hover:bg-brand-400"
          >
            See Plans
          </button>
        </div>
      </nav>

      <div className="border-t border-white/5 p-3">
        <button
          onClick={() => go('profile')}
          className="flex w-full items-center gap-3 rounded-xl p-2 transition-colors hover:bg-white/[0.03]"
        >
          <div
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[13px] font-semibold text-white"
            style={{ background: `hsl(${user.avatarHue} 70% 45%)` }}
          >
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1 text-left">
            <p className="truncate text-[13px] font-medium text-white">{user.name}</p>
            <p className="truncate text-[11.5px] text-slate-500">{user.email}</p>
          </div>
        </button>
        <button
          onClick={logout}
          className="mt-1 flex w-full items-center gap-3 rounded-xl px-2 py-2 text-[13px] text-slate-400 transition-colors hover:bg-white/[0.03] hover:text-white"
        >
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </aside>
  );

}
