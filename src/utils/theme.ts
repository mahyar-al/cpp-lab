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
    label: 'کهربایی و طلایی',
    englishLabel: 'Sunset Gold / Warm Amber',
    description: 'تمرکز، هوشیاری و انرژی متوازن با رنگ کهربایی طلایی گرم و کلاسیک',
    hex: '#F59E0B',
    darkHex: '#F59E0B',
    lightHex: '#D97706',
    gradient: 'from-amber-500 to-amber-600',
    previewClass: 'bg-amber-500',
    badgeClass: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30',
  },
  {
    id: 'violet',
    themeModeEquivalent: 'cyber-purple',
    label: 'بنفش سایبری',
    englishLabel: 'Cyber Purple / Royal Violet',
    description: 'طراحی مدرن، خلاقانه و مینیمال با رنگ ارغوانی سلطنتی و یاسمنی',
    hex: '#8B5CF6',
    darkHex: '#A78BFA',
    lightHex: '#7C3AED',
    gradient: 'from-violet-500 to-purple-600',
    previewClass: 'bg-violet-500',
    badgeClass: 'bg-violet-500/15 text-violet-600 dark:text-violet-400 border-violet-500/30',
  },
  {
    id: 'emerald',
    themeModeEquivalent: 'emerald-matrix',
    label: 'سبز زمردی',
    englishLabel: 'Emerald Matrix / Forest Green',
    description: 'طراوت، آرامش عمیق و انگیزه یادگیری الهام‌گرفته از طبیعت و استمرار',
    hex: '#10B981',
    darkHex: '#10B981',
    lightHex: '#059669',
    gradient: 'from-emerald-500 to-teal-600',
    previewClass: 'bg-emerald-500',
    badgeClass: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
  },
  {
    id: 'blue',
    themeModeEquivalent: 'ocean-deep',
    label: 'آبی اقیانوسی',
    englishLabel: 'Ocean Deep / Sapphire Blue',
    description: 'پایداری، وضوح و منطق تحلیلی با ترکیب آبی لاجوردی و یاقوتی',
    hex: '#3B82F6',
    darkHex: '#60A5FA',
    lightHex: '#2563EB',
    gradient: 'from-blue-500 to-indigo-600',
    previewClass: 'bg-blue-500',
    badgeClass: 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30',
  },
  {
    id: 'rose',
    themeModeEquivalent: 'rose-quartz',
    label: 'سرخ مرجانی',
    englishLabel: 'Rose Quartz / Crimson Coral',
    description: 'شور و حرارت دستیابی به اهداف و پیروزی در چالش‌ها و مسابقات',
    hex: '#F43F5E',
    darkHex: '#FB7185',
    lightHex: '#E11D48',
    gradient: 'from-rose-500 to-pink-600',
    previewClass: 'bg-rose-500',
    badgeClass: 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30',
  },
  {
    id: 'cyan',
    themeModeEquivalent: 'cyan-matrix' as any,
    label: 'فیروزه‌ای مدرن',
    englishLabel: 'Cyan Matrix / Vibrant Teal',
    description: 'شفافیت فکری، نشاط علمی و سرعت عمل با فیروزه‌ای چشم‌نواز',
    hex: '#06B6D4',
    darkHex: '#22D3EE',
    lightHex: '#0891B2',
    gradient: 'from-cyan-500 to-teal-500',
    previewClass: 'bg-cyan-500',
    badgeClass: 'bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border-cyan-500/30',
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
