import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Monitor, Moon, RotateCcw, Save, Sun } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { CardSkeleton } from '../components/LoadingSkeleton';
import { useToast } from '../components/ToastProvider';
import { fetchSettings, updateSettings } from '../features/settings/settingsSlice';
import {
  FirstDayOfWeek,
  SupportedCurrency,
  SupportedDateFormat,
  SupportedLanguage,
  SupportedTheme,
  User,
  UserSettings,
} from '../types/models';
import {
  formatCurrency,
  formatDateDisplay,
  formatDateTimeDisplay,
  getOrderedWeekdays,
} from '../utils/formatters';

const DEFAULT_PREFERENCES = {
  currency: 'USD' as SupportedCurrency,
  language: 'en' as SupportedLanguage,
  theme: 'system' as SupportedTheme,
  dateFormat: 'MMM D, YYYY' as SupportedDateFormat,
  firstDayOfWeek: 0 as FirstDayOfWeek,
};

const CURRENCY_OPTIONS: Array<{ value: SupportedCurrency; label: string }> = [
  { value: 'USD', label: 'USD — US Dollar ($)' },
  { value: 'JPY', label: 'JPY — Japanese Yen (¥)' },
  { value: 'EUR', label: 'EUR — Euro (€)' },
  { value: 'GBP', label: 'GBP — British Pound (£)' },
  { value: 'PHP', label: 'PHP — Philippine Peso (₱)' },
  { value: 'CAD', label: 'CAD — Canadian Dollar (CA$)' },
  { value: 'AUD', label: 'AUD — Australian Dollar (A$)' },
  { value: 'SGD', label: 'SGD — Singapore Dollar (S$)' },
];

const LANGUAGE_OPTIONS: Array<{ value: SupportedLanguage; label: string }> = [
  { value: 'en', label: 'English (en)' },
  { value: 'ja', label: '日本語 / Japanese (ja)' },
];

const DATE_FORMAT_OPTIONS: Array<{ value: SupportedDateFormat; label: string }> = [
  { value: 'MMM D, YYYY', label: 'MMM D, YYYY (e.g., Nov 13, 2026)' },
  { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD (e.g., 2026-11-13)' },
  { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY (e.g., 11/13/2026)' },
  { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY (e.g., 13/11/2026)' },
];

const THEME_OPTIONS: Array<{
  id: SupportedTheme;
  label: string;
  description: string;
  icon: typeof Sun;
}> = [
  {
    id: 'system',
    label: 'System',
    description: 'Follows your device or OS light and dark appearance automatically.',
    icon: Monitor,
  },
  {
    id: 'light',
    label: 'Light',
    description: 'Crisp daylight white and cool slate ink contrast.',
    icon: Sun,
  },
  {
    id: 'dark',
    label: 'Dark',
    description: 'Low-glare charcoal surface tuned for evening planning.',
    icon: Moon,
  },
];

interface SettingsFormProps {
  settings: UserSettings;
  user: User | null;
  saving: boolean;
}

function SettingsForm({ settings, user, saving }: SettingsFormProps) {
  const dispatch = useAppDispatch();
  const toast = useToast();

  const [currency, setCurrency] = useState<SupportedCurrency>(settings.currency);
  const [language, setLanguage] = useState<SupportedLanguage>(settings.language);
  const [theme, setTheme] = useState<SupportedTheme>(settings.theme);
  const [dateFormat, setDateFormat] = useState<SupportedDateFormat>(settings.dateFormat);
  const [firstDayOfWeek, setFirstDayOfWeek] = useState<FirstDayOfWeek>(settings.firstDayOfWeek);
  const [formError, setFormError] = useState('');

  const isDirty = useMemo(
    () =>
      currency !== settings.currency ||
      language !== settings.language ||
      theme !== settings.theme ||
      dateFormat !== settings.dateFormat ||
      firstDayOfWeek !== settings.firstDayOfWeek,
    [currency, language, theme, dateFormat, firstDayOfWeek, settings]
  );

  const isAlreadyDefault = useMemo(
    () =>
      currency === DEFAULT_PREFERENCES.currency &&
      language === DEFAULT_PREFERENCES.language &&
      theme === DEFAULT_PREFERENCES.theme &&
      dateFormat === DEFAULT_PREFERENCES.dateFormat &&
      firstDayOfWeek === DEFAULT_PREFERENCES.firstDayOfWeek,
    [currency, language, theme, dateFormat, firstDayOfWeek]
  );

  const sampleAmount = currency === 'JPY' ? 245000 : 2450.75;
  const sampleDate = '2026-11-13';
  const orderedWeekdays = useMemo(
    () => getOrderedWeekdays(firstDayOfWeek, language),
    [firstDayOfWeek, language]
  );

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    setFormError('');

    const res = await dispatch(
      updateSettings({
        currency,
        language,
        theme,
        dateFormat,
        firstDayOfWeek,
      })
    );

    if (updateSettings.fulfilled.match(res)) {
      toast.success('Preferences saved.');
    } else {
      setFormError(res.payload || 'Unable to save preferences.');
    }
  };

  const handleResetDefaults = () => {
    setFormError('');
    setCurrency(DEFAULT_PREFERENCES.currency);
    setLanguage(DEFAULT_PREFERENCES.language);
    setTheme(DEFAULT_PREFERENCES.theme);
    setDateFormat(DEFAULT_PREFERENCES.dateFormat);
    setFirstDayOfWeek(DEFAULT_PREFERENCES.firstDayOfWeek);
  };

  return (
    <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-12 gap-6" noValidate>
      <div className="lg:col-span-8 space-y-6">
        {formError && (
          <div
            role="alert"
            className="rounded-lg bg-danger-bg border border-danger-line px-4 py-3 text-sm text-danger"
          >
            {formError}
          </div>
        )}

        <section className="bg-surface border border-line rounded-xl p-6 space-y-5">
          <div className="border-b border-line pb-4">
            <h3 className="text-sm font-semibold text-ink">01. Appearance &amp; Theme</h3>
            <p className="text-xs text-ink-muted mt-0.5">
              Choose the surface tone applied across your account when you sign in.
            </p>
          </div>

          <div
            role="radiogroup"
            aria-label="Theme preference"
            className="grid grid-cols-1 sm:grid-cols-3 gap-3"
          >
            {THEME_OPTIONS.map(({ id, label, description, icon: Icon }) => {
              const selected = theme === id;
              return (
                <button
                  key={id}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  onClick={() => setTheme(id)}
                  className={`text-left p-4 rounded-xl border transition-colors ${
                    selected
                      ? 'bg-accent-soft border-accent-text text-ink'
                      : 'bg-canvas border-line-strong text-ink-secondary hover:bg-subtle'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="inline-flex items-center gap-2 text-sm font-semibold text-ink">
                      <Icon className="w-4 h-4 shrink-0" />
                      <span>{label}</span>
                    </span>
                    {selected && (
                      <span className="text-[11px] font-medium text-accent-text whitespace-nowrap shrink-0">
                        Selected
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-ink-muted leading-relaxed">{description}</p>
                </button>
              );
            })}
          </div>
        </section>

        <section className="bg-surface border border-line rounded-xl p-6 space-y-5">
          <div className="border-b border-line pb-4">
            <h3 className="text-sm font-semibold text-ink">02. Regional &amp; Ledger Formatting</h3>
            <p className="text-xs text-ink-muted mt-0.5">
              Configure currency display, language, date formatting, and week-start alignment.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label
                htmlFor="settings-currency"
                className="block text-xs font-medium text-ink-secondary mb-1.5"
              >
                Currency
              </label>
              <select
                id="settings-currency"
                value={currency}
                onChange={(e) => setCurrency(e.target.value as SupportedCurrency)}
                className="w-full px-3.5 py-2.5 text-sm bg-surface border border-line-strong rounded-lg text-ink focus:outline-none focus:border-accent-text focus:ring-2 focus:ring-accent/15"
              >
                {CURRENCY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="settings-language"
                className="block text-xs font-medium text-ink-secondary mb-1.5"
              >
                Language
              </label>
              <select
                id="settings-language"
                value={language}
                onChange={(e) => setLanguage(e.target.value as SupportedLanguage)}
                className="w-full px-3.5 py-2.5 text-sm bg-surface border border-line-strong rounded-lg text-ink focus:outline-none focus:border-accent-text focus:ring-2 focus:ring-accent/15"
              >
                {LANGUAGE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="settings-date-format"
                className="block text-xs font-medium text-ink-secondary mb-1.5"
              >
                Date format
              </label>
              <select
                id="settings-date-format"
                value={dateFormat}
                onChange={(e) => setDateFormat(e.target.value as SupportedDateFormat)}
                className="w-full px-3.5 py-2.5 text-sm bg-surface border border-line-strong rounded-lg text-ink focus:outline-none focus:border-accent-text focus:ring-2 focus:ring-accent/15"
              >
                {DATE_FORMAT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <span className="block text-xs font-medium text-ink-secondary mb-1.5">
                First day of week
              </span>
              <div
                role="radiogroup"
                aria-label="First day of week"
                className="grid grid-cols-2 gap-1 p-1 bg-subtle rounded-lg border border-line"
              >
                <button
                  type="button"
                  role="radio"
                  aria-checked={firstDayOfWeek === 0}
                  onClick={() => setFirstDayOfWeek(0)}
                  className={`py-2 px-3 text-sm font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                    firstDayOfWeek === 0
                      ? 'bg-surface text-ink shadow-xs'
                      : 'text-ink-muted hover:text-ink'
                  }`}
                >
                  Sunday
                </button>
                <button
                  type="button"
                  role="radio"
                  aria-checked={firstDayOfWeek === 1}
                  onClick={() => setFirstDayOfWeek(1)}
                  className={`py-2 px-3 text-sm font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                    firstDayOfWeek === 1
                      ? 'bg-surface text-ink shadow-xs'
                      : 'text-ink-muted hover:text-ink'
                  }`}
                >
                  Monday
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>

      <div className="lg:col-span-4 space-y-6">
        <section className="bg-surface border border-line rounded-xl p-6 space-y-5 sticky top-20">
          <div>
            <h3 className="text-sm font-semibold text-ink">03. Live Preview</h3>
            <p className="text-xs text-ink-muted mt-0.5">
              Preview how numbers, dates, and weekly order will appear across your ledger.
            </p>
          </div>

          <div className="space-y-3.5 text-sm border-t border-b border-line py-4">
            <div className="flex items-center justify-between gap-3">
              <span className="text-ink-muted">Sample amount</span>
              <span className="font-mono tabular-nums font-semibold text-ink">
                {formatCurrency(sampleAmount, currency, language)}
              </span>
            </div>

            <div className="flex items-center justify-between gap-3">
              <span className="text-ink-muted">Sample date</span>
              <span className="font-mono tabular-nums font-medium text-ink">
                {formatDateDisplay(sampleDate, dateFormat, language)}
              </span>
            </div>

            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between gap-3">
                <span className="text-ink-muted">Week sequence</span>
                <span className="text-xs text-ink-secondary">
                  Starts {firstDayOfWeek === 1 ? 'Monday' : 'Sunday'}
                </span>
              </div>
              <div className="grid grid-cols-7 gap-1 pt-1">
                {orderedWeekdays.map((day, idx) => (
                  <div
                    key={day}
                    className={`py-1.5 text-center text-xs rounded-md ${
                      idx === 0
                        ? 'bg-accent-soft text-accent-text font-semibold'
                        : 'bg-subtle text-ink-secondary'
                    }`}
                  >
                    {day}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-1 text-xs text-ink-muted">
            <p className="text-ink-secondary font-medium truncate">
              {user ? `${user.name} · ${user.email}` : 'Signed-in account'}
            </p>
            <p>
              {settings.updatedAt
                ? `Last saved ${formatDateTimeDisplay(settings.updatedAt, dateFormat, language)}`
                : 'Default preferences active'}
            </p>
          </div>

          <div className="space-y-2.5 pt-1">
            <button
              type="submit"
              disabled={saving || !isDirty}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-accent hover:bg-accent-hover text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 whitespace-nowrap shrink-0"
            >
              <Save className="w-4 h-4 shrink-0" />
              <span>{saving ? 'Saving preferences...' : 'Save preferences'}</span>
            </button>

            <button
              type="button"
              onClick={handleResetDefaults}
              disabled={saving || isAlreadyDefault}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-medium text-ink-secondary bg-canvas border border-line-strong rounded-lg hover:bg-subtle transition-colors disabled:opacity-50 whitespace-nowrap shrink-0"
            >
              <RotateCcw className="w-3.5 h-3.5 shrink-0" />
              <span>Reset to defaults</span>
            </button>
          </div>
        </section>
      </div>
    </form>
  );
}

export default function SettingsPage() {
  const dispatch = useAppDispatch();
  const { data: settings, loading, saving, error } = useAppSelector((state) => state.settings);
  const user = useAppSelector((state) => state.auth.user);

  useEffect(() => {
    if (!settings && !loading) {
      dispatch(fetchSettings());
    }
  }, [dispatch, settings, loading]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif text-2xl font-semibold text-ink">Personal Preferences</h2>
        <p className="text-xs text-ink-muted mt-1">
          Manage your 1-on-1 application settings for currency, language, theme, and calendar display.
        </p>
      </div>

      {error && !settings && (
        <div
          role="alert"
          className="rounded-lg bg-danger-bg border border-danger-line px-4 py-3 text-sm text-danger flex items-center justify-between gap-4"
        >
          <span>{error}</span>
          <button
            type="button"
            onClick={() => dispatch(fetchSettings())}
            className="px-3 py-1.5 text-xs font-medium bg-surface border border-line-strong rounded-lg text-ink hover:bg-subtle whitespace-nowrap shrink-0"
          >
            Retry
          </button>
        </div>
      )}

      {loading && !settings ? (
        <CardSkeleton rows={5} />
      ) : settings ? (
        <SettingsForm
          key={`${settings.id}-${settings.updatedAt ?? ''}`}
          settings={settings}
          user={user}
          saving={saving}
        />
      ) : null}
    </div>
  );
}
