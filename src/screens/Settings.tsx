import { useState } from 'react';
import {
  User, Palette, AudioLines, Brain, Bell, HardDrive, Lock,
  Moon, Sun, Monitor,
} from 'lucide-react';
import { useApp } from '@/state/AppContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { voices, languages, podcastStyles, complexities } from '@/data/mock';

type Category = 'profile' | 'appearance' | 'audio' | 'ai' | 'notifications' | 'storage' | 'privacy';

const categories: { id: Category; label: string; icon: typeof User }[] = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'appearance', label: 'Appearance', icon: Palette },
  { id: 'audio', label: 'Audio Preferences', icon: AudioLines },
  { id: 'ai', label: 'AI Preferences', icon: Brain },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'storage', label: 'Storage', icon: HardDrive },
  { id: 'privacy', label: 'Privacy', icon: Lock },
];

export function Settings() {
  const { user, toast } = useApp();
  const [cat, setCat] = useState<Category>('profile');
  const [theme, setTheme] = useState<'dark' | 'light' | 'system'>('dark');
  const [defaultVoice, setDefaultVoice] = useState('sarah');
  const [defaultLang, setDefaultLang] = useState('English');
  const [playbackSpeed, setPlaybackSpeed] = useState('1');
  const [autoplay, setAutoplay] = useState(true);
  const [summaryDetail, setSummaryDetail] = useState('balanced');
  const [podcastStyle, setPodcastStyle] = useState('conversational');
  const [analogyFreq, setAnalogyFreq] = useState('medium');
  const [notifGen, setNotifGen] = useState(true);
  const [notifFail, setNotifFail] = useState(true);
  const [notifUpdates, setNotifUpdates] = useState(false);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">Settings</h1>
        <p className="mt-1 text-[14px] text-slate-400">Manage your account and preferences.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[200px_1fr]">
        {/* Sidebar */}
        <div className="flex gap-2 overflow-x-auto lg:flex-col lg:overflow-visible">
          {categories.map((c) => {
            const active = cat === c.id;
            return (
              <button
                key={c.id}
                onClick={() => setCat(c.id)}
                className={`flex shrink-0 items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-[13.5px] font-medium transition-all ${
                  active
                    ? 'border border-brand-500/30 bg-brand-500/10 text-white'
                    : 'border border-transparent text-slate-400 hover:bg-white/[0.03] hover:text-white'
                }`}
              >
                <c.icon size={16} className={active ? 'text-brand-400' : 'text-slate-500'} />
                {c.label}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div>
          {cat === 'profile' && (
            <Card className="p-6 space-y-5">
              <h2 className="text-[15px] font-semibold text-white">Profile</h2>
              <div className="flex items-center gap-4">
                <div
                  className="flex h-16 w-16 items-center justify-center rounded-full text-[20px] font-bold text-white"
                  style={{ background: `hsl(${user.avatarHue} 70% 45%)` }}
                >
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <Button variant="secondary" size="sm" onClick={() => toast({ title: 'Upload coming soon', variant: 'info' })}>
                  Change Image
                </Button>
              </div>
              <Field label="Name">
                <input type="text" defaultValue={user.name} className="settings-input" />
              </Field>
              <Field label="Email">
                <input type="email" defaultValue={user.email} className="settings-input" />
              </Field>
              <Button onClick={() => toast({ title: 'Profile saved', variant: 'success' })}>Save Changes</Button>
            </Card>
          )}

          {cat === 'appearance' && (
            <Card className="p-6 space-y-5">
              <h2 className="text-[15px] font-semibold text-white">Appearance</h2>
              <div className="grid grid-cols-3 gap-3">
                {([
                  { id: 'dark', label: 'Dark', icon: Moon },
                  { id: 'light', label: 'Light', icon: Sun },
                  { id: 'system', label: 'System', icon: Monitor },
                ] as const).map((t) => (
                  <button
                    key={t.id}
                    onClick={() => { setTheme(t.id); toast({ title: `Switched to ${t.label} mode`, variant: 'info' }); }}
                    className={`flex flex-col items-center gap-2 rounded-xl border p-4 transition-all ${
                      theme === t.id ? 'border-brand-500/40 bg-brand-500/10' : 'border-white/5 bg-ink-800 hover:border-white/10'
                    }`}
                  >
                    <t.icon size={20} className={theme === t.id ? 'text-brand-300' : 'text-slate-400'} />
                    <span className={`text-[13px] font-medium ${theme === t.id ? 'text-white' : 'text-slate-400'}`}>{t.label}</span>
                  </button>
                ))}
              </div>
            </Card>
          )}

          {cat === 'audio' && (
            <Card className="p-6 space-y-5">
              <h2 className="text-[15px] font-semibold text-white">Audio Preferences</h2>
              <Field label="Default voice">
                <select value={defaultVoice} onChange={(e) => setDefaultVoice(e.target.value)} className="settings-input">
                  {voices.map((v) => (
                    <option key={v.id} value={v.id}>{v.name} — {v.description}</option>
                  ))}
                </select>
              </Field>
              <Field label="Default language">
                <select value={defaultLang} onChange={(e) => setDefaultLang(e.target.value)} className="settings-input">
                  {languages.map((l) => (
                    <option key={l} value={l}>{l}</option>
                  ))}
                </select>
              </Field>
              <Field label="Playback speed">
                <select value={playbackSpeed} onChange={(e) => setPlaybackSpeed(e.target.value)} className="settings-input">
                  <option value="0.75">0.75x</option>
                  <option value="1">1x (Normal)</option>
                  <option value="1.25">1.25x</option>
                  <option value="1.5">1.5x</option>
                  <option value="2">2x</option>
                </select>
              </Field>
              <Toggle label="Auto-play next podcast" checked={autoplay} onChange={setAutoplay} />
              <Button onClick={() => toast({ title: 'Audio preferences saved', variant: 'success' })}>Save</Button>
            </Card>
          )}

          {cat === 'ai' && (
            <Card className="p-6 space-y-5">
              <h2 className="text-[15px] font-semibold text-white">AI Preferences</h2>
              <Field label="Summary detail level">
                <select value={summaryDetail} onChange={(e) => setSummaryDetail(e.target.value)} className="settings-input">
                  {complexities.map((c) => (
                    <option key={c.id} value={c.id}>{c.label} — {c.description}</option>
                  ))}
                </select>
              </Field>
              <Field label="Default podcast style">
                <select value={podcastStyle} onChange={(e) => setPodcastStyle(e.target.value)} className="settings-input">
                  {podcastStyles.map((s) => (
                    <option key={s.id} value={s.id}>{s.label}</option>
                  ))}
                </select>
              </Field>
              <Field label="Analogy frequency">
                <select value={analogyFreq} onChange={(e) => setAnalogyFreq(e.target.value)} className="settings-input">
                  <option value="low">Low — stick to the facts</option>
                  <option value="medium">Medium — occasional analogies</option>
                  <option value="high">High — explain with analogies often</option>
                </select>
              </Field>
              <Button onClick={() => toast({ title: 'AI preferences saved', variant: 'success' })}>Save</Button>
            </Card>
          )}

          {cat === 'notifications' && (
            <Card className="p-6 space-y-5">
              <h2 className="text-[15px] font-semibold text-white">Notifications</h2>
              <Toggle label="Podcast generation completed" description="Get notified when your podcast is ready" checked={notifGen} onChange={setNotifGen} />
              <Toggle label="Processing failures" description="Get notified when processing fails" checked={notifFail} onChange={setNotifFail} />
              <Toggle label="Product updates" description="News about new features and improvements" checked={notifUpdates} onChange={setNotifUpdates} />
              <Button onClick={() => toast({ title: 'Notification settings saved', variant: 'success' })}>Save</Button>
            </Card>
          )}

          {cat === 'storage' && (
            <Card className="p-6 space-y-5">
              <h2 className="text-[15px] font-semibold text-white">Storage</h2>
              <div>
                <div className="mb-2 flex items-center justify-between text-[13px]">
                  <span className="text-slate-400">Used</span>
                  <span className="font-medium text-white">24.8 MB of 1 GB</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-ink-700">
                  <div className="h-full rounded-full bg-brand-500" style={{ width: '2.5%' }} />
                </div>
              </div>
              <div className="space-y-2">
                <StorageRow label="Documents" value="12.4 MB" />
                <StorageRow label="Audio files" value="10.2 MB" />
                <StorageRow label="Scripts" value="2.2 MB" />
              </div>
              <Button variant="danger" onClick={() => toast({ title: 'Cache cleared', variant: 'success' })}>Clear Cache</Button>
            </Card>
          )}

          {cat === 'privacy' && (
            <Card className="p-6 space-y-5">
              <h2 className="text-[15px] font-semibold text-white">Privacy</h2>
              <Toggle label="Private account" description="Only you can see your documents" checked={true} onChange={() => {}} />
              <Toggle label="Save listening history" checked={true} onChange={() => {}} />
              <Button variant="danger" onClick={() => toast({ title: 'Demo mode — data export simulated', variant: 'info' })}>Export My Data</Button>
            </Card>
          )}
        </div>
      </div>

      <style>{`
        .settings-input {
          width: 100%;
          height: 42px;
          padding: 0 12px;
          border-radius: 12px;
          border: 1px solid rgba(255,255,255,0.06);
          background: #111a2e;
          color: #e2e8f0;
          font-size: 13.5px;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .settings-input:focus {
          outline: none;
          border-color: rgba(59,150,255,0.4);
          box-shadow: 0 0 0 3px rgba(27,123,246,0.15);
        }
      `}</style>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-[12.5px] font-medium text-slate-300">{label}</label>
      {children}
    </div>
  );
}

function Toggle({ label, description, checked, onChange }: { label: string; description?: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <p className="text-[13.5px] font-medium text-white">{label}</p>
        {description && <p className="text-[12px] text-slate-500">{description}</p>}
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${checked ? 'bg-brand-500' : 'bg-ink-600'}`}
        role="switch"
        aria-checked={checked}
      >
        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${checked ? 'translate-x-[22px]' : 'translate-x-0.5'}`} />
      </button>
    </div>
  );
}

function StorageRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-white/5 bg-ink-800 px-3 py-2">
      <span className="text-[13px] text-slate-400">{label}</span>
      <span className="text-[13px] font-medium text-white">{value}</span>
    </div>
  );
}
