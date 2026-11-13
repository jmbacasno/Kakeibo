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
];

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
];

export const KAKEIBO_PILLAR_META = {
  Needs: { jp: '必要なもの', description: 'Essential living expenses' },
  Wants: { jp: '欲しいもの', description: 'Discretionary purchases' },
  Culture: { jp: '文化', description: 'Learning, books, and personal growth' },
  Unexpected: { jp: '予備費', description: 'Unplanned or emergency expenses' },
};

export function formatCurrency(amount) {
  const num = Number(amount || 0);
  const absFormatted = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Math.abs(num));

  return num < 0 ? `-${absFormatted}` : absFormatted;
}

export function formatMonthYear(month, year) {
  const idx = Number(month) - 1;
  return `${MONTH_NAMES[idx] || month} ${year}`;
}

export function formatDateDisplay(isoDateStr) {
  if (!isoDateStr) return '';
  const clean = String(isoDateStr).slice(0, 10);
  const [y, m, d] = clean.split('-').map(Number);
  if (!y || !m || !d) return clean;
  return `${SHORT_MONTH_NAMES[m - 1]} ${d}, ${y}`;
}

export function formatDateTimeDisplay(dateInput) {
  if (!dateInput) return '';
  const d = new Date(dateInput);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function getDefaultDateForMonth(month, year) {
  const now = new Date();
  const isCurrent = now.getMonth() + 1 === Number(month) && now.getFullYear() === Number(year);
  const day = isCurrent ? now.getDate() : 1;
  const mm = String(month).padStart(2, '0');
  const dd = String(day).padStart(2, '0');
  return `${year}-${mm}-${dd}`;
}

export function getMonthDateBounds(month, year) {
  const mm = String(month).padStart(2, '0');
  const lastDay = new Date(Number(year), Number(month), 0).getDate();
  return {
    min: `${year}-${mm}-01`,
    max: `${year}-${mm}-${String(lastDay).padStart(2, '0')}`,
  };
}
