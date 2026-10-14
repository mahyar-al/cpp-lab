/**
 * Jalali (Solar Hijri) Calendar Conversion & Utility Functions
 * Accurate conversion algorithm based on astronomical calculations
 */

export interface JalaliDate {
  jy: number; // Jalali year
  jm: number; // Jalali month (1-12)
  jd: number; // Jalali day (1-31)
}

export interface GregorianDate {
  gy: number;
  gm: number;
  gd: number;
}

const PERSIAN_MONTH_NAMES = [
  'فروردین',
  'اردیبهشت',
  'خرداد',
  'تیر',
  'مرداد',
  'شهریور',
  'مهر',
  'آبان',
  'آذر',
  'دی',
  'بهمن',
  'اسفند',
];

const PERSIAN_WEEK_DAYS = [
  'شنبه',
  'یکشنبه',
  'دوشنبه',
  'سه‌شنبه',
  'چهارشنبه',
  'پنج‌شنبه',
  'جمعه',
];

const PERSIAN_DIGITS = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];

/**
 * Converts English digits to Persian digits
 */
export function toPersianDigits(str: string | number): string {
  if (str === null || str === undefined) return '';
  return String(str).replace(/[0-9]/g, (w) => PERSIAN_DIGITS[+w]);
}

/**
 * Checks if a Jalali year is a leap year
 */
export function isJalaliLeapYear(jy: number): boolean {
  const breaks = [-61, 9, 38, 199, 426, 686, 756, 818, 1111, 1181, 1210, 1635, 2060, 2097, 2192, 2262, 2324, 2394, 2456, 3178];
  let jp = breaks[0];
  let jump = 0;
  for (let j = 1; j < breaks.length; j++) {
    const jm = breaks[j];
    jump = jm - jp;
    if (jy < jm) break;
    jp = jm;
  }
  let n = jy - jp;
  if (jump - n < 6) n = n - jump + (Math.floor(jump / 33) * 33) + 3;
  let leap = ((n + 1) % 33) - 1;
  if (leap === -1) leap = 32;
  return leap % 4 === 0 && leap !== 32;
}

/**
 * Returns number of days in a given Jalali month
 */
export function getJalaliMonthDays(jy: number, jm: number): number {
  if (jm <= 6) return 31;
  if (jm <= 11) return 30;
  return isJalaliLeapYear(jy) ? 30 : 29;
}

/**
 * Converts Gregorian Date to Jalali Date
 */
export function gregorianToJalali(gy: number, gm: number, gd: number): JalaliDate {
  const g_d_m = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
  let jy: number;
  let gy2 = gm > 2 ? gy + 1 : gy;
  let days =
    355666 +
    365 * gy +
    Math.floor((gy2 + 3) / 4) -
    Math.floor((gy2 + 99) / 100) +
    Math.floor((gy2 + 399) / 400) +
    gd +
    g_d_m[gm - 1];
  jy = -1595 + 33 * Math.floor(days / 12053);
  days %= 12053;
  jy += 4 * Math.floor(days / 1461);
  days %= 1461;
  if (days > 365) {
    jy += Math.floor((days - 1) / 365);
    days = (days - 1) % 365;
  }
  let jm =
    days < 186
      ? 1 + Math.floor(days / 31)
      : 7 + Math.floor((days - 186) / 30);
  let jd = 1 + (days < 186 ? days % 31 : (days - 186) % 30);
  return { jy, jm, jd };
}

/**
 * Converts Jalali Date to Gregorian Date
 */
export function jalaliToGregorian(jy: number, jm: number, jd: number): GregorianDate {
  jy = jy - 979;
  jm = jm - 1;
  jd = jd - 1;

  let j_day_no =
    365 * jy +
    Math.floor(jy / 33) * 8 +
    Math.floor(((jy % 33) + 3) / 4);
  for (let i = 0; i < jm; ++i) {
    j_day_no += i < 6 ? 31 : 30;
  }
  j_day_no += jd;

  let g_day_no = j_day_no + 79;

  let gy =
    1600 +
    400 * Math.floor(g_day_no / 146097);
  g_day_no = g_day_no % 146097;

  let leap = true;
  if (g_day_no >= 36525) {
    g_day_no--;
    gy += 100 * Math.floor(g_day_no / 36524);
    g_day_no = g_day_no % 36524;

    if (g_day_no >= 365) {
      g_day_no++;
    } else {
      leap = false;
    }
  }

  gy += 4 * Math.floor(g_day_no / 1461);
  g_day_no %= 1461;

  if (g_day_no >= 366) {
    leap = false;
    g_day_no--;
    gy += Math.floor(g_day_no / 365);
    g_day_no = g_day_no % 365;
  }

  const g_days_in_month = [
    31,
    (gy % 4 === 0 && gy % 100 !== 0) || gy % 400 === 0 ? 29 : 28,
    31,
    30,
    31,
    30,
    31,
    31,
    30,
    31,
    30,
    31,
  ];

  let gm = 0;
  while (g_day_no >= g_days_in_month[gm]) {
    g_day_no -= g_days_in_month[gm];
    gm++;
  }
  let gd = g_day_no + 1;
  return { gy, gm: gm + 1, gd };
}

/**
 * Safely parses a Date object or YYYY-MM-DD / ISO string to local year, month, day, and day-of-week
 * preventing UTC midnight timezone back-shifts.
 */
export function parseDateSafe(dateInput: string | Date = new Date()): {
  gy: number;
  gm: number;
  gd: number;
  dayOfWeek: number;
  localDate: Date;
} {
  if (dateInput instanceof Date) {
    return {
      gy: dateInput.getFullYear(),
      gm: dateInput.getMonth() + 1,
      gd: dateInput.getDate(),
      dayOfWeek: dateInput.getDay(),
      localDate: dateInput,
    };
  }

  const str = String(dateInput).trim();
  // If string begins with YYYY-MM-DD
  const match = str.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (match) {
    const gy = parseInt(match[1], 10);
    const gm = parseInt(match[2], 10);
    const gd = parseInt(match[3], 10);
    const localDate = new Date(gy, gm - 1, gd, 12, 0, 0);
    return {
      gy,
      gm,
      gd,
      dayOfWeek: localDate.getDay(),
      localDate,
    };
  }

  const fallback = new Date(dateInput);
  return {
    gy: fallback.getFullYear(),
    gm: fallback.getMonth() + 1,
    gd: fallback.getDate(),
    dayOfWeek: fallback.getDay(),
    localDate: fallback,
  };
}

/**
 * Parses date string (YYYY-MM-DD) or Date object to Jalali
 */
export function toJalali(dateInput: string | Date = new Date()): JalaliDate {
  const { gy, gm, gd } = parseDateSafe(dateInput);
  return gregorianToJalali(gy, gm, gd);
}

/**
 * Formats a Date to full Persian string, e.g. "چهارشنبه ۲۳ مهر ۱۴۰۵"
 */
export function formatJalaliFull(dateInput: string | Date = new Date()): string {
  const { dayOfWeek } = parseDateSafe(dateInput);
  const { jy, jm, jd } = toJalali(dateInput);
  const dayOfWeekIndex = (dayOfWeek + 1) % 7; // Saturday = 0, Sunday = 1, ... Friday = 6
  const weekDayName = PERSIAN_WEEK_DAYS[dayOfWeekIndex];
  const monthName = PERSIAN_MONTH_NAMES[jm - 1];
  return `${weekDayName} ${toPersianDigits(jd)} ${monthName} ${toPersianDigits(jy)}`;
}

/**
 * Formats date to short Shamsi representation: ۱۴۰۵/۰۷/۲۳
 */
export function formatJalaliShort(dateInput: string | Date = new Date()): string {
  const { jy, jm, jd } = toJalali(dateInput);
  const mm = jm < 10 ? `۰${jm}` : `${jm}`;
  const dd = jd < 10 ? `۰${jd}` : `${jd}`;
  return `${toPersianDigits(jy)}/${toPersianDigits(mm)}/${toPersianDigits(dd)}`;
}

/**
 * Returns Persian month name by month number (1-12)
 */
export function getPersianMonthName(monthNumber: number): string {
  return PERSIAN_MONTH_NAMES[Math.max(0, Math.min(11, monthNumber - 1))];
}

/**
 * Returns day of week index in Iranian calendar (0 for شنبه, 6 for جمعه)
 */
export function getIranianDayOfWeek(dateInput: string | Date = new Date()): number {
  const { dayOfWeek } = parseDateSafe(dateInput);
  return (dayOfWeek + 1) % 7;
}

/**
 * Returns Iranian day of week name (accepts day index 0-6 or Date or date string)
 */
export function getIranianDayName(dateOrIndex: string | Date | number = new Date()): string {
  if (typeof dateOrIndex === 'number' && dateOrIndex >= 0 && dateOrIndex <= 6) {
    return PERSIAN_WEEK_DAYS[dateOrIndex];
  }
  const idx = getIranianDayOfWeek(dateOrIndex as string | Date);
  return PERSIAN_WEEK_DAYS[idx];
}

/**
 * Gets ISO string YYYY-MM-DD from Jalali date
 */
export function jalaliToISODate(jy: number, jm: number, jd: number): string {
  const { gy, gm, gd } = jalaliToGregorian(jy, jm, jd);
  const mm = gm < 10 ? `0${gm}` : `${gm}`;
  const dd = gd < 10 ? `0${gd}` : `${gd}`;
  return `${gy}-${mm}-${dd}`;
}

/**
 * Formats relative time in Persian
 */
export function getRelativeTimeString(dateStr: string): string {
  if (!dateStr) return '—';
  const { gy, gm, gd } = parseDateSafe(dateStr);
  const target = new Date(gy, gm - 1, gd);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);

  const diffTime = target.getTime() - today.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'امروز';
  if (diffDays === 1) return 'فردا';
  if (diffDays === 2) return 'پس‌فردا';
  if (diffDays === -1) return 'دیروز';
  if (diffDays < -1) return `${toPersianDigits(Math.abs(diffDays))} روز پیش`;
  return `${toPersianDigits(diffDays)} روز مانده`;
}

/**
 * Calculates remaining days from now until target date string
 */
export function getDaysRemaining(dateStr: string): number {
  if (!dateStr) return 0;
  const { gy, gm, gd } = parseDateSafe(dateStr);
  const target = new Date(gy, gm - 1, gd);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);
  const diffTime = target.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export const toGregorian = jalaliToGregorian;

