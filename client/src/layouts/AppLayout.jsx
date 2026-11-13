import { useState, useRef, useEffect } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  LayoutDashboard,
  CalendarRange,
  ArrowLeftRight,
  Tags,
  NotebookPen,
  BookOpenCheck,
  LogOut,
  Menu,
  X,
  ChevronDown,
  User,
} from 'lucide-react';
import { logoutUser } from '../features/auth/authSlice.js';
import { setSelectedPeriod } from '../features/plans/planSlice.js';
import MonthYearPicker from '../components/MonthYearPicker.jsx';

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/plan', label: 'Monthly Plan', icon: CalendarRange },
  { to: '/transactions', label: 'Transactions', icon: ArrowLeftRight },
  { to: '/categories', label: 'Categories', icon: Tags },
  { to: '/notes', label: 'Notes', icon: NotebookPen },
  { to: '/reflections', label: 'Reflections', icon: BookOpenCheck },
];

const ROUTE_TITLES = {
  '/': 'Dashboard',
  '/plan': 'Monthly Plan',
  '/transactions': 'Transactions',
  '/categories': 'Categories',
  '/notes': 'Personal Notes',
  '/reflections': 'Monthly Reflections',
};

export default function AppLayout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const { user } = useSelector((state) => state.auth);
  const { selectedMonth, selectedYear } = useSelector((state) => state.plans);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const profileRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
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
    <div className="min-h-screen bg-[#F8F7F4] text-[#1C1B18] flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-60 lg:shrink-0 bg-white border-r border-[#E5E2DC] sticky top-0 h-screen">
        <div className="px-6 py-5 border-b border-[#E5E2DC]">
          <NavLink to="/" className="block">
            <span className="font-serif text-xl font-semibold tracking-tight text-[#1C1B18]">
              Kakeibo
            </span>
            <span className="ml-2 text-xs text-[#6B675E] font-normal">家計簿</span>
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
                    ? 'bg-[#EEF2F7] text-[#29436A]'
                    : 'text-[#4A4740] hover:bg-[#F4F2ED] hover:text-[#1C1B18]'
                }`
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="px-5 py-4 border-t border-[#E5E2DC]">
          <p className="text-xs text-[#6B675E] leading-relaxed">
            Plan · Track · Review · Reflect
          </p>
        </div>
      </aside>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden bg-[#1C1B18]/40"
          onClick={() => setMobileMenuOpen(false)}
        >
          <aside
            className="w-64 h-full bg-white border-r border-[#E5E2DC] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#E5E2DC]">
              <div>
                <span className="font-serif text-lg font-semibold text-[#1C1B18]">Kakeibo</span>
                <span className="ml-2 text-xs text-[#6B675E]">家計簿</span>
              </div>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Close navigation menu"
                className="p-1.5 rounded-lg text-[#6B675E] hover:bg-[#F1EFEA]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <nav aria-label="Mobile navigation" className="flex-1 px-3 py-4 space-y-1">
              {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                      isActive
                        ? 'bg-[#EEF2F7] text-[#29436A]'
                        : 'text-[#4A4740] hover:bg-[#F4F2ED] hover:text-[#1C1B18]'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{label}</span>
                </NavLink>
              ))}
            </nav>
          </aside>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-30 bg-[#F8F7F4]/95 backdrop-blur-sm border-b border-[#E5E2DC] px-4 sm:px-6 lg:px-8 py-3">
          <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(true)}
                aria-label="Open navigation menu"
                className="lg:hidden p-2 rounded-lg bg-white border border-[#D8D4CC] text-[#4A4740] hover:bg-[#F1EFEA]"
              >
                <Menu className="w-4 h-4" />
              </button>
              <h1 className="text-base sm:text-lg font-semibold text-[#1C1B18] truncate">
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
                  className="inline-flex items-center gap-2 px-3 py-2 bg-white border border-[#D8D4CC] rounded-lg text-sm font-medium text-[#1C1B18] hover:bg-[#F1EFEA] transition-colors whitespace-nowrap"
                >
                  <User className="w-4 h-4 text-[#6B675E]" />
                  <span className="hidden sm:inline max-w-[120px] truncate">
                    {user?.name || 'Account'}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-[#6B675E]" />
                </button>

                {profileMenuOpen && (
                  <div
                    role="menu"
                    className="absolute right-0 mt-2 w-56 rounded-xl bg-white border border-[#E5E2DC] shadow-lg py-2 z-40"
                  >
                    <div className="px-4 py-2 border-b border-[#E5E2DC]">
                      <p className="text-sm font-semibold text-[#1C1B18] truncate">
                        {user?.name}
                      </p>
                      <p className="text-xs text-[#6B675E] truncate">{user?.email}</p>
                    </div>
                    <button
                      type="button"
                      role="menuitem"
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-left text-sm text-[#B83B3B] hover:bg-[#FDF6F6] transition-colors"
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
          <div className="max-w-6xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
