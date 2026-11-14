import { BookOpen, Moon, Sun } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { updateSettings } from '../../settings/settingsSlice';
import { setTheme, ThemeMode } from '../themeSlice';

const THEME_OPTIONS: Array<{ id: ThemeMode; label: string; icon: typeof Sun }> = [
  { id: 'light', label: 'Light', icon: Sun },
  { id: 'paper', label: 'Paper', icon: BookOpen },
  { id: 'dark', label: 'Dark', icon: Moon },
];

export default function ThemeSwitcher({ className = '' }: { className?: string }) {
  const dispatch = useAppDispatch();
  const theme = useAppSelector((state) => state.theme.mode);
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  const handleSelectTheme = (mode: ThemeMode) => {
    dispatch(setTheme(mode));
    if (isAuthenticated) {
      dispatch(updateSettings({ theme: mode }));
    }
  };

  return (
    <div
      role="group"
      aria-label="Color theme"
      className={`grid grid-cols-3 gap-1 p-1 bg-subtle rounded-lg border border-line ${className}`}
    >
      {THEME_OPTIONS.map(({ id, label, icon: Icon }) => {
        const active = theme === id;
        return (
          <button
            key={id}
            type="button"
            onClick={() => handleSelectTheme(id)}
            aria-pressed={active}
            className={`inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-accent-text ${
              active
                ? 'bg-surface text-ink shadow-xs'
                : 'text-ink-muted hover:text-ink'
            }`}
          >
            <Icon className="w-3.5 h-3.5 shrink-0" />
            <span>{label}</span>
          </button>
        );
      })}
    </div>
  );
}
