import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen } from 'lucide-react';
import { useAppSelector } from '../app/hooks';
import heroLedgerImg from '../assets/images/hero_kakeibo_ledger_1794840135935.jpg';
import monthlyReviewImg from '../assets/images/kakeibo_monthly_review_1794840135359.jpg';

const KAKEIBO_STEPS = [
  {
    index: '01.',
    title: 'Set your monthly income and savings intention first',
    detail:
      'Start every month by recording expected income and deciding how much you intend to set aside before allocating a single expense.',
  },
  {
    index: '02.',
    title: 'Allocate budgets across the categories you actually use',
    detail:
      'Add spending limits for Needs, Wants, Culture, Unexpected, or custom categories—keeping your plan focused only on what matters this month.',
  },
  {
    index: '03.',
    title: 'Record daily cash flow without clutter',
    detail:
      'Log transactions against the active month, search historical records, and monitor budget utilization in real time.',
  },
  {
    index: '04.',
    title: 'Pair numbers with personal notes and reflections',
    detail:
      'Capture spending observations mid-month and close with a dedicated reflection reviewing how closely actual results matched your plan.',
  },
];

const SAMPLE_CATEGORIES = [
  { name: 'Needs', note: 'Essential living expenses', allocated: '$1,950.00', spent: '$1,820.00' },
  { name: 'Wants', note: 'Discretionary purchases', allocated: '$600.00', spent: '$485.00' },
  { name: 'Culture', note: 'Learning, books, and personal growth', allocated: '$240.00', spent: '$190.00' },
  { name: 'Unexpected', note: 'Unplanned or emergency expenses', allocated: '$350.00', spent: '$120.00' },
];

export default function LandingPage() {
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const [heroImgFailed, setHeroImgFailed] = useState(false);
  const [reviewImgFailed, setReviewImgFailed] = useState(false);

  return (
    <div className="min-h-screen bg-canvas text-ink flex flex-col">
      {/* Top Navigation — 3-Zone Contract */}
      <header className="border-b border-line bg-canvas/95 backdrop-blur-sm sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
          <Link
            to="/"
            className="font-serif text-xl font-semibold tracking-tight text-ink whitespace-nowrap shrink-0"
          >
            Kakeibo
          </Link>

          <nav
            aria-label="Landing navigation"
            className="hidden md:flex items-center gap-6 text-sm font-medium text-ink-secondary"
          >
            <a
              href="#method"
              className="hover:text-ink hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              Method
            </a>
            <a
              href="#planning"
              className="hover:text-ink hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              Planning
            </a>
            <a
              href="#ledger"
              className="hover:text-ink hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              Ledger
            </a>
            <a
              href="#reflections"
              className="hover:text-ink hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              Reflections
            </a>
            {!isAuthenticated && (
              <Link
                to="/login"
                className="hover:text-ink hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
              >
                Sign in
              </Link>
            )}
          </nav>

          <div className="flex items-center gap-3 shrink-0">
            <Link
              to={isAuthenticated ? '/dashboard' : '/register'}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-white bg-accent hover:bg-accent-hover rounded-lg transition-colors whitespace-nowrap shrink-0"
            >
              <span>{isAuthenticated ? 'Open dashboard' : 'Create account'}</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Split Section */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-stretch">
            <div className="lg:col-span-6 flex flex-col justify-center">
              <p className="text-xs font-medium text-ink-muted tracking-wide">
                Personal Finance Journal
              </p>
              <h1
                className="mt-3 font-serif font-semibold tracking-tight text-ink leading-[1.08] text-balance"
                style={{ fontSize: 'clamp(2.25rem, 4vw, 3.5rem)' }}
              >
                Intentional monthly budgeting, modeled on Kakeibo.
              </h1>
              <p className="mt-5 text-base text-ink-secondary leading-relaxed max-w-xl">
                Plan your expected income and savings target before the month begins, allocate limits across the categories you choose, track daily cash flow, and finish with a written reflection.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-5">
                <Link
                  to={isAuthenticated ? '/dashboard' : '/register'}
                  className="inline-flex items-center gap-2 px-5 py-3 text-sm font-medium text-white bg-accent hover:bg-accent-hover rounded-lg transition-colors whitespace-nowrap shrink-0"
                >
                  <span>{isAuthenticated ? 'Go to dashboard' : 'Create free account'}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                {!isAuthenticated && (
                  <Link
                    to="/login"
                    className="text-sm font-medium text-ink-secondary hover:text-ink underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
                  >
                    Sign in to existing journal
                  </Link>
                )}
              </div>

              <div className="mt-10 pt-6 border-t border-line flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-ink-muted">
                <span>Monthly income plans</span>
                <span aria-hidden="true">·</span>
                <span>Category budget tracking</span>
                <span aria-hidden="true">·</span>
                <span>Notes &amp; end-of-month reflections</span>
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="h-full min-h-[300px] lg:min-h-[420px] rounded-xl overflow-hidden border border-line bg-surface">
                {!heroImgFailed ? (
                  <img
                    src={heroLedgerImg}
                    alt="Minimalist oak study desk with an open linen-bound Kakeibo ledger notebook and fountain pen"
                    referrerPolicy="no-referrer"
                    onError={() => setHeroImgFailed(true)}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center p-10 bg-subtle text-center">
                    <BookOpen className="w-8 h-8 text-accent-text mb-3" />
                    <p className="font-serif text-lg font-semibold text-ink">
                      Kakeibo Financial Ledger
                    </p>
                    <p className="text-xs text-ink-muted mt-1 max-w-xs">
                      Monthly plans, category budgets, transactions, and reflections in one quiet workspace.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Numbered 4-Part Method */}
        <section id="method" className="border-t border-line bg-surface">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
              <div className="lg:col-span-4">
                <p className="text-xs font-medium text-ink-muted">The Kakeibo Cycle</p>
                <h2 className="mt-2 font-serif text-3xl font-semibold text-ink leading-tight text-balance">
                  Four deliberate habits repeated every month.
                </h2>
                <p className="mt-3 text-sm text-ink-secondary leading-relaxed">
                  Instead of passive bank feeds, Kakeibo asks four concrete questions: how much is coming in, how much would you like to save, how much are you spending, and what can improve next month.
                </p>
              </div>

              <div className="lg:col-span-8 divide-y divide-line border-t border-b border-line">
                {KAKEIBO_STEPS.map((step) => (
                  <div
                    key={step.index}
                    className="py-5 grid grid-cols-1 sm:grid-cols-12 gap-3 sm:gap-6 items-baseline"
                  >
                    <div className="sm:col-span-2 font-mono tabular-nums text-xs font-semibold text-accent-text">
                      {step.index}
                    </div>
                    <div className="sm:col-span-10">
                      <h3 className="text-base font-semibold text-ink">{step.title}</h3>
                      <p className="mt-1.5 text-sm text-ink-secondary leading-relaxed">
                        {step.detail}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Asymmetric Ledger Preview + Editorial Review */}
        <section id="planning" className="border-t border-line">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20 space-y-8">
            <div className="max-w-2xl">
              <p className="text-xs font-medium text-ink-muted">Inside the Workspace</p>
              <h2 className="mt-2 font-serif text-3xl font-semibold text-ink leading-tight text-balance">
                Clear numbers paired with personal context.
              </h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              {/* Ledger Sample Card */}
              <div
                id="ledger"
                className="lg:col-span-7 bg-surface border border-line rounded-xl p-6 sm:p-8 flex flex-col justify-between"
              >
                <div>
                  <div className="flex flex-wrap items-baseline justify-between gap-2 pb-4 border-b border-line">
                    <div>
                      <h3 className="text-base font-semibold text-ink">
                        Sample Monthly Budget Ledger
                      </h3>
                      <p className="text-xs text-ink-muted mt-0.5">
                        Example monthly intention and category allocation split
                      </p>
                    </div>
                    <span className="text-xs font-mono tabular-nums text-ink-muted">
                      November 2026
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-4 py-5 border-b border-line">
                    <div>
                      <p className="text-xs text-ink-muted">Planned income</p>
                      <p className="mt-1 text-base font-mono tabular-nums font-semibold text-ink">
                        $4,800.00
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-ink-muted">Savings goal</p>
                      <p className="mt-1 text-base font-mono tabular-nums font-semibold text-success-accent">
                        $960.00
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-ink-muted">Allocated</p>
                      <p className="mt-1 text-base font-mono tabular-nums font-semibold text-ink">
                        $3,140.00
                      </p>
                    </div>
                  </div>

                  <div className="divide-y divide-line">
                    {SAMPLE_CATEGORIES.map((row) => (
                      <div
                        key={row.name}
                        className="py-3.5 flex items-center justify-between gap-4"
                      >
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-ink">{row.name}</p>
                          <p className="text-xs text-ink-muted truncate">{row.note}</p>
                        </div>
                        <div className="text-right font-mono tabular-nums shrink-0">
                          <p className="text-sm font-medium text-ink">{row.spent}</p>
                          <p className="text-xs text-ink-muted">of {row.allocated}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Reflection & Notes Spotlight */}
              <div
                id="reflections"
                className="lg:col-span-5 bg-surface border border-line rounded-xl overflow-hidden flex flex-col"
              >
                <div className="aspect-[4/3] w-full bg-subtle border-b border-line overflow-hidden">
                  {!reviewImgFailed ? (
                    <img
                      src={monthlyReviewImg}
                      alt="Structured monthly budgeting journal with fountain pen and ruler on limestone surface"
                      referrerPolicy="no-referrer"
                      onError={() => setReviewImgFailed(true)}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center p-6 text-center">
                      <p className="font-serif text-base text-ink-secondary">
                        Monthly Reflection Journal
                      </p>
                    </div>
                  )}
                </div>

                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <h3 className="text-base font-semibold text-ink">
                      Notes &amp; End-of-Month Reflections
                    </h3>
                    <p className="mt-2 text-sm text-ink-secondary leading-relaxed">
                      Every monthly plan includes space for running observations and a dedicated retrospective, helping you carry realistic habits into the next month.
                    </p>
                  </div>

                  <div className="pt-4 border-t border-line flex items-center justify-between text-xs text-ink-muted">
                    <span>Multi-currency · Light &amp; dark themes</span>
                    <Link
                      to={isAuthenticated ? '/dashboard' : '/register'}
                      className="font-medium text-accent-text hover:underline whitespace-nowrap"
                    >
                      {isAuthenticated ? 'Open dashboard' : 'Get started'}
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Closing Call to Action */}
        <section className="border-t border-line bg-surface">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div>
              <h2 className="font-serif text-2xl font-semibold text-ink">
                Begin this month&apos;s financial ledger
              </h2>
              <p className="text-sm text-ink-secondary mt-1">
                Create an account in seconds or sign in to continue planning.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              {isAuthenticated ? (
                <Link
                  to="/dashboard"
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-accent hover:bg-accent-hover rounded-lg transition-colors whitespace-nowrap"
                >
                  <span>Open dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="px-4 py-2.5 text-sm font-medium text-ink-secondary bg-surface border border-line-strong rounded-lg hover:bg-subtle transition-colors whitespace-nowrap"
                  >
                    Sign in
                  </Link>
                  <Link
                    to="/register"
                    className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-accent hover:bg-accent-hover rounded-lg transition-colors whitespace-nowrap"
                  >
                    <span>Create account</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </>
              )}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-line bg-canvas">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-wrap items-center justify-between gap-4 text-xs text-ink-muted">
          <span className="font-serif text-sm font-semibold text-ink">Kakeibo</span>
          <div className="flex items-center gap-5">
            <Link to="/login" className="hover:text-ink transition-colors">
              Sign in
            </Link>
            <Link to="/register" className="hover:text-ink transition-colors">
              Create account
            </Link>
            <span>Personal Finance Journal</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
