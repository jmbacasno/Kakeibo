import { FormEvent, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, BookOpen } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import ThemeSwitcher from '../features/theme/components/ThemeSwitcher';
import { clearAuthError, loginUser, registerUser } from '../features/auth/authSlice';

type AuthMode = 'login' | 'register';

export default function AuthPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, loading, error } = useAppSelector((state) => state.auth);

  const [mode, setMode] = useState<AuthMode>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const switchMode = (nextMode: AuthMode) => {
    setMode(nextMode);
    setFormError('');
    dispatch(clearAuthError());
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (mode === 'register' && name.trim().length < 2) {
      setFormError('Please enter your name (at least 2 characters).');
      return;
    }
    if (mode === 'register' && (!email.trim() || !email.includes('@'))) {
      setFormError('Please enter a valid email address.');
      return;
    }
    if (mode === 'login' && !email.trim()) {
      setFormError('Please enter your email or username.');
      return;
    }
    if (mode === 'register' && password.length < 8) {
      setFormError('Password must be at least 8 characters long.');
      return;
    }
    if (mode === 'login' && !password) {
      setFormError('Please enter your password.');
      return;
    }

    if (mode === 'register') {
      const res = await dispatch(
        registerUser({ name: name.trim(), email: email.trim(), password })
      );
      if (registerUser.fulfilled.match(res)) {
        navigate('/', { replace: true });
      }
    } else {
      const res = await dispatch(loginUser({ email: email.trim(), password }));
      if (loginUser.fulfilled.match(res)) {
        navigate('/', { replace: true });
      }
    }
  };

  const displayError = formError || error;

  return (
    <div className="min-h-screen bg-canvas flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl w-full mx-auto mb-4 flex justify-end">
        <ThemeSwitcher />
      </div>

      <div className="max-w-4xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        {/* Left: Calm Kakeibo Philosophy Panel */}
        <div className="lg:col-span-5 bg-surface border border-line rounded-xl p-8 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2.5 text-accent-text mb-6">
              <BookOpen className="w-5 h-5" />
              <span className="text-xs font-medium tracking-wide">家計簿 · Mindful Ledger</span>
            </div>

            <h1 className="font-serif text-3xl font-semibold text-ink leading-tight">
              Kakeibo Personal Finance Journal
            </h1>
            <p className="mt-3 text-sm text-ink-secondary leading-relaxed">
              A quiet workspace modeled on the traditional Japanese household ledger—designed to bring clarity and intention to every month.
            </p>
          </div>

          <div className="mt-8 pt-6 border-t border-line space-y-4">
            <div>
              <p className="text-xs font-semibold text-ink">01. Plan the month</p>
              <p className="text-xs text-ink-muted mt-0.5">
                Set expected income, savings goals, and calm category limits.
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold text-ink">02. Track daily flow</p>
              <p className="text-xs text-ink-muted mt-0.5">
                Record income and expenses across Needs, Wants, Culture, and Unexpected.
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold text-ink">03. Review &amp; reflect</p>
              <p className="text-xs text-ink-muted mt-0.5">
                Keep personal notes and write an honest end-of-month reflection.
              </p>
            </div>
          </div>
        </div>

        {/* Right: Auth Form Card */}
        <div className="lg:col-span-7 bg-surface border border-line rounded-xl p-8 flex flex-col justify-center">
          <div className="flex items-center gap-1 p-1 bg-subtle rounded-lg w-fit mb-6">
            <button
              type="button"
              onClick={() => switchMode('login')}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${
                mode === 'login'
                  ? 'bg-surface text-ink shadow-xs'
                  : 'text-ink-muted hover:text-ink'
              }`}
            >
              Sign in
            </button>
            <button
              type="button"
              onClick={() => switchMode('register')}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${
                mode === 'register'
                  ? 'bg-surface text-ink shadow-xs'
                  : 'text-ink-muted hover:text-ink'
              }`}
            >
              Create account
            </button>
          </div>

          <h2 className="text-xl font-semibold text-ink">
            {mode === 'login' ? 'Welcome back to your journal' : 'Start your Kakeibo journal'}
          </h2>
          <p className="text-sm text-ink-muted mt-1">
            {mode === 'login'
              ? 'Enter your credentials to view your monthly plans and records.'
              : 'Your account comes ready with default Kakeibo income and expense categories.'}
          </p>

          {displayError && (
            <div
              role="alert"
              className="mt-5 rounded-lg bg-danger-bg border border-danger-line px-4 py-3 text-sm text-danger"
            >
              {displayError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
            {mode === 'register' && (
              <div>
                <label htmlFor="auth-name" className="block text-xs font-medium text-ink-secondary mb-1.5">
                  Full name
                </label>
                <input
                  id="auth-name"
                  type="text"
                  autoComplete="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Haruki Sato"
                  className="w-full px-3.5 py-2.5 text-sm bg-surface border border-line-strong rounded-lg text-ink placeholder:text-ink-placeholder focus:outline-none focus:border-accent-text focus:ring-2 focus:ring-accent/15"
                />
              </div>
            )}

            <div>
              <label htmlFor="auth-email" className="block text-xs font-medium text-ink-secondary mb-1.5">
                {mode === 'login' ? 'Email or username' : 'Email address'}
              </label>
              <input
                id="auth-email"
                type={mode === 'login' ? 'text' : 'email'}
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={mode === 'login' ? 'you@example.com or admin' : 'you@example.com'}
                className="w-full px-3.5 py-2.5 text-sm bg-surface border border-line-strong rounded-lg text-ink placeholder:text-ink-placeholder focus:outline-none focus:border-accent-text focus:ring-2 focus:ring-accent/15"
              />
            </div>

            <div>
              <label htmlFor="auth-password" className="block text-xs font-medium text-ink-secondary mb-1.5">
                Password
              </label>
              <input
                id="auth-password"
                type="password"
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={mode === 'register' ? 'Minimum 8 characters' : 'Enter your password'}
                className="w-full px-3.5 py-2.5 text-sm bg-surface border border-line-strong rounded-lg text-ink placeholder:text-ink-placeholder focus:outline-none focus:border-accent-text focus:ring-2 focus:ring-accent/15"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-accent hover:bg-accent-hover text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-60 whitespace-nowrap"
            >
              <span>
                {loading
                  ? mode === 'login'
                    ? 'Signing in...'
                    : 'Creating account...'
                  : mode === 'login'
                  ? 'Sign in'
                  : 'Create account'}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
