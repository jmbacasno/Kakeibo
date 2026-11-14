import type {
  FirstDayOfWeek,
  SupportedCurrency,
  SupportedDateFormat,
  SupportedLanguage,
} from '../types/models';

export const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
] as const;

export const SHORT_MONTH_NAMES = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
] as const;

export interface PillarMeta {
  jp: string;
  description: string;
}

export const KAKEIBO_PILLAR_META: Record<string, PillarMeta> = {
  Needs: { jp: '必要なもの', description: 'Essential living expenses' },
  Wants: { jp: '欲しいもの', description: 'Discretionary purchases' },
  Culture: { jp: '文化', description: 'Learning, books, and personal growth' },
  Unexpected: { jp: '予備費', description: 'Unplanned or emergency expenses' },
};

interface FormattingPreferences {
  currency: SupportedCurrency;
  language: SupportedLanguage;
  dateFormat: SupportedDateFormat;
}

const DEFAULT_FORMATTING_PREFERENCES: FormattingPreferences = {
  currency: 'USD',
  language: 'en',
  dateFormat: 'MMM D, YYYY',
};

let activePreferences: FormattingPreferences = { ...DEFAULT_FORMATTING_PREFERENCES };

const ZERO_DECIMAL_CURRENCIES = new Set<SupportedCurrency>(['JPY']);

export function setFormattingPreferences(prefs: Partial<FormattingPreferences>): void {
  activePreferences = {
    currency: prefs.currency ?? activePreferences.currency,
    language: prefs.language ?? activePreferences.language,
    dateFormat: prefs.dateFormat ?? activePreferences.dateFormat,
  };
}

export function resetFormattingPreferences(): void {
  activePreferences = { ...DEFAULT_FORMATTING_PREFERENCES };
}

export function getActiveCurrency(): SupportedCurrency {
  return activePreferences.currency;
}

export function getActiveLanguage(): SupportedLanguage {
  return activePreferences.language;
}

export function getActiveDateFormat(): SupportedDateFormat {
  return activePreferences.dateFormat;
}

function getLocaleForLanguage(language: SupportedLanguage): string {
  return language === 'ja' ? 'ja-JP' : 'en-US';
}

export function getCurrencyFractionDigits(currency: SupportedCurrency = activePreferences.currency): number {
  return ZERO_DECIMAL_CURRENCIES.has(currency) ? 0 : 2;
}

export function formatCurrency(
  amount: number | string | null | undefined,
  currencyOverride?: SupportedCurrency,
  languageOverride?: SupportedLanguage
): string {
  const num = Number(amount || 0);
  const currency = currencyOverride ?? activePreferences.currency;
  const language = languageOverride ?? activePreferences.language;
  const digits = getCurrencyFractionDigits(currency);

  const absFormatted = new Intl.NumberFormat(getLocaleForLanguage(language), {
    style: 'currency',
    currency,
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(Math.abs(num));

  return num < 0 ? `-${absFormatted}` : absFormatted;
}

export function formatMonthYear(month: number | string, year: number | string): string {
  const idx = Number(month) - 1;
  return `${MONTH_NAMES[idx] || month} ${year}`;
}

export function formatDateDisplay(
  isoDateStr: string | null | undefined,
  formatOverride?: SupportedDateFormat,
  languageOverride?: SupportedLanguage
): string {
  if (!isoDateStr) return '';
  const clean = String(isoDateStr).slice(0, 10);
  const [y, m, d] = clean.split('-').map(Number);
  if (!y || !m || !d) return clean;

  const format = formatOverride ?? activePreferences.dateFormat;
  const language = languageOverride ?? activePreferences.language;
  const mm = String(m).padStart(2, '0');
  const dd = String(d).padStart(2, '0');

  switch (format) {
    case 'YYYY-MM-DD':
      return `${y}-${mm}-${dd}`;
    case 'MM/DD/YYYY':
      return `${mm}/${dd}/${y}`;
    case 'DD/MM/YYYY':
      return `${dd}/${mm}/${y}`;
    case 'MMM D, YYYY':
    default:
      if (language === 'ja') {
        return `${y}年${m}月${d}日`;
      }
      return `${SHORT_MONTH_NAMES[m - 1]} ${d}, ${y}`;
  }
}

export function formatDateTimeDisplay(
  dateInput: string | Date | null | undefined,
  formatOverride?: SupportedDateFormat,
  languageOverride?: SupportedLanguage
): string {
  if (!dateInput) return '';
  const d = new Date(dateInput);
  if (Number.isNaN(d.getTime())) return '';

  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return formatDateDisplay(`${yyyy}-${mm}-${dd}`, formatOverride, languageOverride);
}

export function getOrderedWeekdays(
  firstDayOfWeek: FirstDayOfWeek,
  language: SupportedLanguage = activePreferences.language
): string[] {
  const days =
    language === 'ja'
      ? ['日', '月', '火', '水', '木', '金', '土']
      : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return firstDayOfWeek === 1 ? [...days.slice(1), days[0]] : days;
}

export function getDefaultDateForMonth(month: number, year: number): string {
  const now = new Date();
  const isCurrent = now.getMonth() + 1 === Number(month) && now.getFullYear() === Number(year);
  const day = isCurrent ? now.getDate() : 1;
  const mm = String(month).padStart(2, '0');
  const dd = String(day).padStart(2, '0');
  return `${year}-${mm}-${dd}`;
}

export function getMonthDateBounds(month: number, year: number): { min: string; max: string } {
  const mm = String(month).padStart(2, '0');
  const lastDay = new Date(Number(year), Number(month), 0).getDate();
  return {
    min: `${year}-${mm}-01`,
    max: `${year}-${mm}-${String(lastDay).padStart(2, '0')}`,
  };
}
