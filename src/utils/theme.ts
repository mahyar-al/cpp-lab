import { AccentColor, ThemeMode } from '../types';

export interface SiteColorTheme {
  id: AccentColor;
  themeModeEquivalent: ThemeMode;
  label: string;
  englishLabel: string;
  description: string;
  hex: string;
  darkHex: string;
  lightHex: string;
  gradient: string;
  previewClass: string;
  badgeClass: string;
}

export const SITE_COLOR_THEMES: SiteColorTheme[] = [
  {
    id: 'amber',
    themeModeEquivalent: 'sunset-gold',
    label: 'تک‌رنگ متوازن',
    englishLabel: 'Monochrome Balanced',
    description: 'کنتراست استاندارد و مینیمال بر پایه پالت خالص خاکستری',
    hex: 'var(--text)',
    darkHex: '#fafafa',
    lightHex: '#0a0a0a',
    gradient: 'from-neutral-700 to-neutral-900',
    previewClass: 'bg-fg',
    badgeClass: 'bg-chip text-fg border border-line',
  },
  {
    id: 'violet',
    themeModeEquivalent: 'cyber-purple',
    label: 'خاکستری تیره',
    englishLabel: 'Deep Charcoal',
    description: 'طراحی تیره و عمیق با سطوح مات مینیمال',
    hex: 'var(--text)',
    darkHex: '#fafafa',
    lightHex: '#0a0a0a',
    gradient: 'from-neutral-800 to-black',
    previewClass: 'bg-fg',
    badgeClass: 'bg-chip text-fg border border-line',
  },
  {
    id: 'emerald',
    themeModeEquivalent: 'emerald-matrix',
    label: 'کربن مینیمال',
    englishLabel: 'Minimal Carbon',
    description: 'تمرکز عمیق بدون رنگ اضافه و حواس‌پرتی',
    hex: 'var(--text)',
    darkHex: '#fafafa',
    lightHex: '#0a0a0a',
    gradient: 'from-neutral-700 to-neutral-950',
    previewClass: 'bg-fg',
    badgeClass: 'bg-chip text-fg border border-line',
  },
  {
    id: 'blue',
    themeModeEquivalent: 'ocean-deep',
    label: 'گرافیت کلاسیک',
    englishLabel: 'Classic Graphite',
    description: 'پایداری، وضوح و نظم ساختاریافته',
    hex: 'var(--text)',
    darkHex: '#fafafa',
    lightHex: '#0a0a0a',
    gradient: 'from-neutral-600 to-neutral-900',
    previewClass: 'bg-fg',
    badgeClass: 'bg-chip text-fg border border-line',
  },
  {
    id: 'rose',
    themeModeEquivalent: 'rose-quartz',
    label: 'پلاتینیوم روشن',
    englishLabel: 'Platinum High Contrast',
    description: 'کنتراست بالا با خطوط ظریف و خوانایی حداکثری',
    hex: 'var(--text)',
    darkHex: '#fafafa',
    lightHex: '#0a0a0a',
    gradient: 'from-neutral-500 to-neutral-800',
    previewClass: 'bg-fg',
    badgeClass: 'bg-chip text-fg border border-line',
  },
  {
    id: 'cyan',
    themeModeEquivalent: 'cyan-matrix' as any,
    label: 'مات مدرن',
    englishLabel: 'Matte Monochrome',
    description: 'شفافیت فکری و سادگی ساختاری خالص',
    hex: 'var(--text)',
    darkHex: '#fafafa',
    lightHex: '#0a0a0a',
    gradient: 'from-neutral-700 to-neutral-900',
    previewClass: 'bg-fg',
    badgeClass: 'bg-chip text-fg border border-line',
  },
];

export const THEME_BACKGROUND_OPTIONS: Array<{
  id: 'dark' | 'light' | 'system';
  label: string;
  description: string;
}> = [
  {
    id: 'dark',
    label: 'مشکی واقعی (Pure Black)',
    description: 'مشکی خالص (#000000) با سطوح عمیق و ضد خستگی چشم در شب',
  },
  {
    id: 'light',
    label: 'سفید ملایم (Soft White)',
    description: 'پس‌زمینه خاکستری ملایم (#F5F4F1) و کارت‌های سفید (#FFFFFF)',
  },
  {
    id: 'system',
    label: 'هماهنگ با سیستم (System Auto)',
    description: 'تطبیق خودکار با تنظیمات روشنایی سیستم‌عامل کاربر',
  },
];
