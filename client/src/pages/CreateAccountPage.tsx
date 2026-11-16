import { FormEvent, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, BookOpen } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import ThemeSwitcher from '../features/theme/components/ThemeSwitcher';
import { clearAuthError, registerUser } from '../features/auth/authSlice';

export default function CreateAccountPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, loading, error } = useAppSelector((state) => state.auth);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [repeatPassword, setRepeatPassword] = useState('');
  const [formError, setFormError] = useState('');

  useEffect(() => {
    dispatch(clearAuthError());
  }, [dispatch]);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!firstName.trim()) {
      setFormError('Please enter your first name.');
      return;
    }
    if (!lastName.trim()) {
      setFormError('Please enter your last name.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setFormError('Please enter a valid email address.');
      return;
    }
    if (password.length < 8) {
      setFormError('Password must be at least 8 characters long.');
      return;
    }
    if (password !== repeatPassword) {
      setFormError('Passwords do not match.');
      return;
    }

    const res = await dispatch(
      registerUser({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        password,
        repeatPassword,
      })
    );
    if (registerUser.fulfilled.match(res)) {
      navigate('/dashboard', { replace: true });
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
              Start your Kakeibo journal
            </h1>
            <p className="mt-3 text-sm text-ink-secondary leading-relaxed">
              Create your personal finance workspace with default income and expense categories ready on day one.
            </p>
          </div>

          <div className="mt-8 pt-6 border-t border-line space-y-4">
            <div>
              <p className="text-xs font-semibold text-ink">Ready-to-use categories</p>
              <p className="text-xs text-ink-muted mt-0.5">
                Begins with Needs, Wants, Culture, and Unexpected plus income sources—customize or remove any anytime.
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold text-ink">Private monthly ledgers</p>
              <p className="text-xs text-ink-muted mt-0.5">
                Track category budgets, transactions, journal notes, and reflections in one calm place.
              </p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-7 bg-surface border border-line rounded-xl p-8 flex flex-col justify-center">
          <h2 className="text-xl font-semibold text-ink">Create account</h2>
          <p className="text-sm text-ink-muted mt-1">
            Fill in your details below to begin your monthly planning.
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="register-first-name"
                  className="block text-xs font-medium text-ink-secondary mb-1.5"
                >
                  First name
                </label>
                <input
                  id="register-first-name"
                  type="text"
                  autoComplete="given-name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Joe"
                  className="w-full px-3.5 py-2.5 text-sm bg-surface border border-line-strong rounded-lg text-ink placeholder:text-ink-placeholder focus:outline-none focus:border-accent-text focus:ring-2 focus:ring-accent/15"
                />
              </div>

              <div>
                <label
                  htmlFor="register-last-name"
                  className="block text-xs font-medium text-ink-secondary mb-1.5"
                >
                  Last name
                </label>
                <input
                  id="register-last-name"
                  type="text"
                  autoComplete="family-name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Doe"
                  className="w-full px-3.5 py-2.5 text-sm bg-surface border border-line-strong rounded-lg text-ink placeholder:text-ink-placeholder focus:outline-none focus:border-accent-text focus:ring-2 focus:ring-accent/15"
                />
              </div>
            </div>

            <div>
              <label htmlFor="register-email" className="block text-xs font-medium text-ink-secondary mb-1.5">
                Email address
              </label>
              <input
                id="register-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="johndoe@gmail.com"
                className="w-full px-3.5 py-2.5 text-sm bg-surface border border-line-strong rounded-lg text-ink placeholder:text-ink-placeholder focus:outline-none focus:border-accent-text focus:ring-2 focus:ring-accent/15"
              />
            </div>

            <div>
              <label htmlFor="register-password" className="block text-xs font-medium text-ink-secondary mb-1.5">
                Password
              </label>
              <input
                id="register-password"
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="johndoe123"
                className="w-full px-3.5 py-2.5 text-sm bg-surface border border-line-strong rounded-lg text-ink placeholder:text-ink-placeholder focus:outline-none focus:border-accent-text focus:ring-2 focus:ring-accent/15"
              />
            </div>

            <div>
              <label
                htmlFor="register-repeat-password"
                className="block text-xs font-medium text-ink-secondary mb-1.5"
              >
                Repeat password
              </label>
              <input
                id="register-repeat-password"
                type="password"
                autoComplete="new-password"
                value={repeatPassword}
                onChange={(e) => setRepeatPassword(e.target.value)}
                placeholder="johndoe123"
                className="w-full px-3.5 py-2.5 text-sm bg-surface border border-line-strong rounded-lg text-ink placeholder:text-ink-placeholder focus:outline-none focus:border-accent-text focus:ring-2 focus:ring-accent/15"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-accent hover:bg-accent-hover text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-60 whitespace-nowrap"
            >
              <span>{loading ? 'Creating account...' : 'Create account'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <p className="mt-6 pt-5 border-t border-line text-sm text-ink-muted">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-accent-text hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
