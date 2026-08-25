import { X, LayoutDashboard, FileText, AudioLines, Plus, Settings, LifeBuoy, Search, UserCircle, LogOut } from 'lucide-react';
import { useApp } from '@/state/AppContext';
import { Logo } from '@/components/ui/Logo';
import type { Route } from '@/types';

const items: { id: Route; label: string; icon: typeof LayoutDashboard }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'documents', label: 'Documents', icon: FileText },
  { id: 'library', label: 'Library', icon: AudioLines },
  { id: 'create', label: 'Create', icon: Plus },
  { id: 'search', label: 'Search', icon: Search },
  { id: 'profile', label: 'Profile', icon: UserCircle },
  { id: 'settings', label: 'Settings', icon: Settings },
  { id: 'help', label: 'Help', icon: LifeBuoy },
];

const bottomNavItems: { id: Route; label: string; icon: typeof LayoutDashboard }[] = [
  { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
  { id: 'documents', label: 'Docs', icon: FileText },
  { id: 'create', label: 'Create', icon: Plus },
  { id: 'library', label: 'Library', icon: AudioLines },
  { id: 'search', label: 'Search', icon: Search },
];

export function MobileNav({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { route, navigate, user, logout } = useApp();
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[110] lg:hidden">
      <div className="absolute inset-0 bg-ink-950/70 backdrop-blur-sm animate-fade-in-fast" onClick={onClose} />
      <div className="absolute left-0 top-0 h-full w-[280px] animate-slide-in-right rounded-r-2xl border-r border-white/10 bg-ink-900 p-4">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Logo />
            <span className="text-[15px] font-bold text-white">DocuCast</span>
          </div>
          <button onClick={onClose} className="rounded-lg p-2 text-slate-400 hover:bg-white/5 hover:text-white" aria-label="Close menu">
            <X size={18} />
          </button>
        </div>
        <nav className="space-y-1">
          {items.map((item) => {
            const active = route === item.id;
            return (
              <button
                key={item.id}
                onClick={() => { navigate(item.id); onClose(); }}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[14px] font-medium transition-all ${
                  active ? 'border border-brand-500/30 bg-brand-500/10 text-white' : 'text-slate-400 hover:bg-white/[0.03] hover:text-white'
                }`}
              >
                <item.icon size={18} className={active ? 'text-brand-400' : 'text-slate-500'} />
                {item.label}
              </button>
            );
          })}
        </nav>
        <div className="absolute bottom-4 left-4 right-4">
          <div className="rounded-xl border border-white/5 bg-ink-850 p-3">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full text-[13px] font-semibold text-white" style={{ background: `hsl(${user.avatarHue} 70% 45%)` }}>
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-medium text-white">{user.name}</p>
                <p className="truncate text-[11.5px] text-slate-500">{user.email}</p>
              </div>
            </div>
            <button onClick={logout} className="mt-2 flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-[13px] text-slate-400 hover:bg-white/5 hover:text-white">
              <LogOut size={14} /> Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function BottomNav() {
  const { route, navigate } = useApp();
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 flex h-16 items-center justify-around border-t border-white/5 bg-ink-900/95 backdrop-blur-md lg:hidden">
      {bottomNavItems.map((item) => {
        const active = route === item.id;
        return (
          <button
            key={item.id}
            onClick={() => navigate(item.id)}
            className="flex flex-1 flex-col items-center gap-1 py-1.5 text-[10.5px] font-medium transition-colors"
            style={{ color: active ? '#7ab8ff' : '#64748b' }}
          >
            <item.icon size={20} />
            {item.label}
          </button>
        );
      })}
    </nav>
  );
}
