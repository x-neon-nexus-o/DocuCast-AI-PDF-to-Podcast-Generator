import { useState, type FormEvent } from 'react';
import { Mail, Lock, Eye, EyeOff, User, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useApp } from '@/state/AppContext';
import { Button } from '@/components/ui/Button';
import { Logo } from '@/components/ui/Logo';

type Mode = 'login' | 'signup';

interface AuthProps {
  mode: Mode;
}

export function Auth({ mode }: AuthProps) {
  const { navigate, login, toast } = useApp();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);

  const isSignup = mode === 'signup';

  const validate = () => {
    const e: Record<string, string> = {};
    if (isSignup && !name.trim()) e.name = 'Name is required';
    if (!email.trim()) e.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'Enter a valid email';
    if (!password) e.password = 'Password is required';
    else if (password.length < 6) e.password = 'Password must be at least 6 characters';
    if (isSignup && confirm !== password) e.confirm = 'Passwords do not match';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onSubmit = (ev: FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setErrors({});
    window.setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      toast({
        title: isSignup ? 'Account created' : 'Welcome back',
        description: 'Redirecting to your dashboard…',
        variant: 'success',
      });
      window.setTimeout(() => {
        login(email, isSignup ? name : undefined);
      }, 800);
    }, 1200);
  };

  const googleSignIn = () => {
    setLoading(true);
    window.setTimeout(() => {
      login('paras@docucast.app', 'Paras');
      toast({ title: 'Signed in with Google', variant: 'success' });
    }, 1000);
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-ink-950">
      {/* Background */}
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute inset-0 grid-bg opacity-30" />
        <div className="blob -top-40 -left-40 h-96 w-96 bg-brand-500/10" />
        <div className="blob bottom-0 -right-40 h-96 w-96 bg-cyan-500/8" />
      </div>

      <div className="relative flex min-h-screen flex-col">
        {/* Top bar */}
        <div className="flex items-center justify-between px-6 py-5">
          <button onClick={() => navigate('landing')} className="flex items-center gap-2.5">
            <Logo />
            <span className="text-[15px] font-bold text-white">DocuCast</span>
          </button>
          <button
            onClick={() => navigate(isSignup ? 'login' : 'signup')}
            className="text-[13px] text-slate-400 transition-colors hover:text-white"
          >
            {isSignup ? 'Already have an account? Login' : "Don't have an account? Sign up"}
          </button>
        </div>

        {/* Form */}
        <div className="flex flex-1 items-center justify-center px-4 py-8">
          <div className="w-full max-w-md animate-scale-in">
            <div className="mb-8 text-center">
              <h1 className="text-2xl font-bold tracking-tight text-white">
                {isSignup ? 'Create your account' : 'Welcome back'}
              </h1>
              <p className="mt-2 text-[14px] text-slate-400">
                {isSignup
                  ? 'Start turning your PDFs into podcasts.'
                  : 'Sign in to access your DocuCast dashboard.'}
              </p>
            </div>

            <div className="rounded-2xl border border-white/5 bg-ink-850 p-6 shadow-card sm:p-8">
              {success ? (
                <div className="flex flex-col items-center py-8 text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-good-500/15 text-good-400 animate-scale-in">
                    <CheckCircle2 size={28} />
                  </div>
                  <p className="mt-4 text-[15px] font-semibold text-white">
                    {isSignup ? 'Account created!' : 'Signed in!'}
                  </p>
                  <p className="mt-1 text-[13px] text-slate-400">Redirecting to dashboard…</p>
                </div>
              ) : (
                <>
                  {/* Google */}
                  <button
                    onClick={googleSignIn}
                    className="flex w-full items-center justify-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] py-3 text-[13.5px] font-medium text-slate-200 transition-colors hover:bg-white/[0.06]"
                  >
                    <GoogleIcon />
                    Continue with Google
                  </button>

                  <div className="my-5 flex items-center gap-3">
                    <div className="h-px flex-1 bg-white/5" />
                    <span className="text-[11.5px] text-slate-600">or continue with email</span>
                    <div className="h-px flex-1 bg-white/5" />
                  </div>

                  <form onSubmit={onSubmit} className="space-y-4" noValidate>
                    {isSignup && (
                      <Field
                        label="Name"
                        icon={<User size={16} />}
                        error={errors.name}
                      >
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Your name"
                          className="auth-input"
                        />
                      </Field>
                    )}
                    <Field label="Email" icon={<Mail size={16} />} error={errors.email}>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="auth-input"
                        autoComplete="email"
                      />
                    </Field>
                    <Field label="Password" icon={<Lock size={16} />} error={errors.password}>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          className="auth-input pr-10"
                          autoComplete={isSignup ? 'new-password' : 'current-password'}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword((s) => !s)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 transition-colors hover:text-white"
                          aria-label="Toggle password"
                        >
                          {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>
                      </div>
                    </Field>
                    {isSignup && (
                      <Field label="Confirm password" icon={<Lock size={16} />} error={errors.confirm}>
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={confirm}
                          onChange={(e) => setConfirm(e.target.value)}
                          placeholder="••••••••"
                          className="auth-input"
                        />
                      </Field>
                    )}

                    {!isSignup && (
                      <div className="flex items-center justify-between">
                        <label className="flex cursor-pointer items-center gap-2 text-[13px] text-slate-400">
                          <input
                            type="checkbox"
                            checked={remember}
                            onChange={(e) => setRemember(e.target.checked)}
                            className="h-4 w-4 rounded border-white/10 bg-ink-800 accent-brand-500"
                          />
                          Remember me
                        </label>
                        <button
                          type="button"
                          onClick={() => toast({ title: 'Reset link sent', description: 'Check your inbox (simulated).', variant: 'info' })}
                          className="text-[13px] text-brand-300 transition-colors hover:text-brand-200"
                        >
                          Forgot password?
                        </button>
                      </div>
                    )}

                    <Button type="submit" fullWidth size="lg" loading={loading} rightIcon={!loading ? <ArrowRight size={16} /> : undefined}>
                      {isSignup ? 'Create account' : 'Sign in'}
                    </Button>
                  </form>

                  <p className="mt-5 text-center text-[12.5px] text-slate-500">
                    {isSignup ? 'Already have an account? ' : "Don't have an account? "}
                    <button
                      onClick={() => navigate(isSignup ? 'login' : 'signup')}
                      className="font-medium text-brand-300 hover:text-brand-200"
                    >
                      {isSignup ? 'Sign in' : 'Sign up'}
                    </button>
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .auth-input {
          width: 100%;
          height: 44px;
          padding-left: 2.5rem;
          padding-right: 0.75rem;
          border-radius: 12px;
          border: 1px solid rgba(255,255,255,0.06);
          background: #111a2e;
          color: #e2e8f0;
          font-size: 13.5px;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .auth-input::placeholder { color: #64748b; }
        .auth-input:focus {
          outline: none;
          border-color: rgba(59,150,255,0.4);
          box-shadow: 0 0 0 3px rgba(27,123,246,0.15);
        }
      `}</style>
    </div>
  );
}

function Field({ label, icon, error, children }: { label: string; icon: React.ReactNode; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-[12.5px] font-medium text-slate-300">{label}</label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">{icon}</span>
        {children}
      </div>
      {error && (
        <p className="mt-1.5 flex items-center gap-1.5 text-[12px] text-bad-400 animate-fade-in-fast">
          <AlertCircle size={12} /> {error}
        </p>
      )}
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}
