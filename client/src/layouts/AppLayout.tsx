import { useEffect, useRef, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  ArrowLeftRight,
  BookOpenCheck,
  CalendarRange,
  ChevronDown,
  LayoutDashboard,
  LogOut,
  LucideIcon,
  Menu,
  NotebookPen,
  Settings,
  Tags,
  User,
  UserCircle,
  X,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import MonthYearPicker from '../components/MonthYearPicker';
import ThemeSwitcher from '../features/theme/components/ThemeSwitcher';
import { logoutUser } from '../features/auth/authSlice';
import { setSelectedPeriod } from '../features/plans/planSlice';

interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  end?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/plan', label: 'Monthly Plan', icon: CalendarRange },
  { to: '/transactions', label: 'Transactions', icon: ArrowLeftRight },
  { to: '/categories', label: 'Categories', icon: Tags },
  { to: '/notes', label: 'Notes', icon: NotebookPen },
  { to: '/reflections', label: 'Reflections', icon: BookOpenCheck },
  { to: '/account', label: 'Account', icon: UserCircle },
  { to: '/settings', label: 'Settings', icon: Settings },
];

const ROUTE_TITLES: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/plan': 'Monthly Plan',
  '/transactions': 'Transactions',
  '/categories': 'Categories',
  '/notes': 'Personal Notes',
  '/reflections': 'Monthly Reflections',
  '/account': 'Account',
  '/settings': 'Settings',
};

export default function AppLayout() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const { user } = useAppSelector((state) => state.auth);
  const { selectedMonth, selectedYear } = useAppSelector((state) => state.plans);
  const userSettings = useAppSelector((state) => state.settings.data);
  const formattingKey = `${userSettings?.currency ?? 'USD'}-${userSettings?.language ?? 'en'}-${userSettings?.dateFormat ?? 'MMM D, YYYY'}`;

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setProfileMenuOpen(false);
    await dispatch(logoutUser());
    navigate('/login');
  };

  const pageTitle = ROUTE_TITLES[location.pathname] || 'Kakeibo';

  return (
    <div className="min-h-screen bg-canvas text-ink flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-60 lg:shrink-0 bg-surface border-r border-line sticky top-0 h-screen">
        <div className="px-6 py-5 border-b border-line">
          <NavLink to="/dashboard" className="block">
            <span className="font-serif text-xl font-semibold tracking-tight text-ink">
              Kakeibo
            </span>
            <span className="ml-2 text-xs text-ink-muted font-normal">家計簿</span>
          </NavLink>
        </div>

        <nav aria-label="Main navigation" className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                  isActive
                    ? 'bg-accent-soft text-accent-text'
                    : 'text-ink-secondary hover:bg-subtle hover:text-ink'
                }`
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="px-4 py-4 border-t border-line space-y-3">
          <ThemeSwitcher />
          <p className="text-xs text-ink-muted leading-relaxed px-1">
            Plan · Track · Review · Reflect
          </p>
        </div>
      </aside>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden bg-scrim"
          onClick={() => setMobileMenuOpen(false)}
        >
          <aside
            className="w-64 h-full bg-surface border-r border-line flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-line">
              <div>
                <span className="font-serif text-lg font-semibold text-ink">Kakeibo</span>
                <span className="ml-2 text-xs text-ink-muted">家計簿</span>
              </div>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Close navigation menu"
                className="p-1.5 rounded-lg text-ink-muted hover:bg-subtle"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <nav aria-label="Mobile navigation" className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
              {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                      isActive
                        ? 'bg-accent-soft text-accent-text'
                        : 'text-ink-secondary hover:bg-subtle hover:text-ink'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{label}</span>
                </NavLink>
              ))}
            </nav>
            <div className="px-4 py-4 border-t border-line">
              <ThemeSwitcher />
            </div>
          </aside>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-30 bg-canvas/95 backdrop-blur-sm border-b border-line px-4 sm:px-6 lg:px-8 py-3">
          <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(true)}
                aria-label="Open navigation menu"
                className="lg:hidden p-2 rounded-lg bg-surface border border-line-strong text-ink-secondary hover:bg-subtle"
              >
                <Menu className="w-4 h-4" />
              </button>
              <h1 className="text-base sm:text-lg font-semibold text-ink truncate">
                {pageTitle}
              </h1>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <MonthYearPicker
                month={selectedMonth}
                year={selectedYear}
                onChange={(period) => dispatch(setSelectedPeriod(period))}
              />

              <div className="relative" ref={profileRef}>
                <button
                  type="button"
                  onClick={() => setProfileMenuOpen((v) => !v)}
                  aria-expanded={profileMenuOpen}
                  aria-haspopup="menu"
                  className="inline-flex items-center gap-2 px-3 py-2 bg-surface border border-line-strong rounded-lg text-sm font-medium text-ink hover:bg-subtle transition-colors whitespace-nowrap"
                >
                  <User className="w-4 h-4 text-ink-muted" />
                  <span className="hidden sm:inline max-w-[140px] truncate">
                    {user ? `${user.firstName} ${user.lastName}` : 'Account'}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-ink-muted" />
                </button>

                {profileMenuOpen && (
                  <div
                    role="menu"
                    className="absolute right-0 mt-2 w-56 rounded-xl bg-surface border border-line shadow-lg py-2 z-40"
                  >
                    <div className="px-4 py-2 border-b border-line">
                      <p className="text-sm font-semibold text-ink truncate">
                        {user ? `${user.firstName} ${user.lastName}` : 'Account'}
                      </p>
                      <p className="text-xs text-ink-muted truncate">{user?.email}</p>
                    </div>
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        setProfileMenuOpen(false);
                        navigate('/account');
                      }}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-left text-sm text-ink-secondary hover:bg-subtle hover:text-ink transition-colors"
                    >
                      <UserCircle className="w-4 h-4" />
                      <span>Account</span>
                    </button>
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        setProfileMenuOpen(false);
                        navigate('/settings');
                      }}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-left text-sm text-ink-secondary hover:bg-subtle hover:text-ink transition-colors"
                    >
                      <Settings className="w-4 h-4" />
                      <span>Preferences</span>
                    </button>
                    <button
                      type="button"
                      role="menuitem"
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-left text-sm text-danger hover:bg-danger-bg transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign out</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6">
          <div key={formattingKey} className="max-w-6xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
