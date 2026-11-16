import { FormEvent, useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, BookOpen } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import ThemeSwitcher from '../features/theme/components/ThemeSwitcher';
import { clearAuthError, loginUser } from '../features/auth/authSlice';

export default function SignInPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, loading, error } = useAppSelector((state) => state.auth);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState('');

  const redirectTo =
    (location.state as { from?: { pathname?: string } } | null)?.from?.pathname || '/dashboard';

  useEffect(() => {
    dispatch(clearAuthError());
  }, [dispatch]);

  useEffect(() => {
    if (isAuthenticated) {
      navigate(redirectTo, { replace: true });
    }
  }, [isAuthenticated, navigate, redirectTo]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!email.trim()) {
      setFormError('Please enter your email address.');
      return;
    }
    if (!password) {
      setFormError('Please enter your password.');
      return;
    }

    const res = await dispatch(loginUser({ email: email.trim(), password }));
    if (loginUser.fulfilled.match(res)) {
      navigate(redirectTo, { replace: true });
    }
  };

  const displayError = formError || error;

  return (
    <div className="min-h-screen bg-canvas flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl w-full mx-auto mb-6 flex items-center justify-between gap-4">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs font-medium text-ink-secondary hover:text-ink transition-colors whitespace-nowrap"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to home</span>
        </Link>
        <ThemeSwitcher />
      </div>

      <div className="max-w-4xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        <div className="lg:col-span-5 bg-surface border border-line rounded-xl p-8 flex flex-col justify-between">
          <div>
            <Link to="/" className="inline-flex items-center gap-2 text-accent-text mb-6">
              <BookOpen className="w-5 h-5" />
              <span className="font-serif text-lg font-semibold text-ink">Kakeibo</span>
            </Link>

            <h1 className="font-serif text-3xl font-semibold text-ink leading-tight">
              Welcome back to your journal
            </h1>
            <p className="mt-3 text-sm text-ink-secondary leading-relaxed">
              Sign in to review this month&apos;s income plan, track daily spending, and write your month-end reflection.
            </p>
          </div>

          <div className="mt-8 pt-6 border-t border-line space-y-4">
            <div>
              <p className="text-xs font-semibold text-ink">01. Plan monthly capacity</p>
              <p className="text-xs text-ink-muted mt-0.5">
                Set expected income, savings goals, and category limits.
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold text-ink">02. Track daily flow</p>
              <p className="text-xs text-ink-muted mt-0.5">
                Log expenses across Needs, Wants, Culture, Unexpected, or custom categories.
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold text-ink">03. Close with reflection</p>
              <p className="text-xs text-ink-muted mt-0.5">
                Compare planned targets against actual savings every month.
              </p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-7 bg-surface border border-line rounded-xl p-8 flex flex-col justify-center">
          <h2 className="text-xl font-semibold text-ink">Sign in</h2>
          <p className="text-sm text-ink-muted mt-1">
            Enter your email and password to open your ledger.
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
            <div>
              <label htmlFor="signin-email" className="block text-xs font-medium text-ink-secondary mb-1.5">
                Email address
              </label>
              <input
                id="signin-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="johndoe@gmail.com"
                className="w-full px-3.5 py-2.5 text-sm bg-surface border border-line-strong rounded-lg text-ink placeholder:text-ink-placeholder focus:outline-none focus:border-accent-text focus:ring-2 focus:ring-accent/15"
              />
            </div>

            <div>
              <label htmlFor="signin-password" className="block text-xs font-medium text-ink-secondary mb-1.5">
                Password
              </label>
              <input
                id="signin-password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="johndoe123"
                className="w-full px-3.5 py-2.5 text-sm bg-surface border border-line-strong rounded-lg text-ink placeholder:text-ink-placeholder focus:outline-none focus:border-accent-text focus:ring-2 focus:ring-accent/15"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-accent hover:bg-accent-hover text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-60 whitespace-nowrap"
            >
              <span>{loading ? 'Signing in...' : 'Sign in'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <p className="mt-6 pt-5 border-t border-line text-sm text-ink-muted">
            New to Kakeibo?{' '}
            <Link to="/register" className="font-medium text-accent-text hover:underline">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
