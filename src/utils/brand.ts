/**
 * Brand constants and localized configuration for Alef Plans
 */

export interface BrandInfo {
  name: string;
  logoLetter: string;
  tagline: string;
}

export const BRAND_TRANSLATIONS: Record<'fa' | 'en', BrandInfo> = {
  fa: {
    name: 'الف پلنز',
    logoLetter: 'ا',
    tagline: 'مسیر پیشرفت من',
  },
  en: {
    name: 'Alef Plans',
    logoLetter: 'A',
    tagline: 'مسیر پیشرفت من',
  },
};

export const BRAND_NAME = BRAND_TRANSLATIONS.fa.name; // 'الف پلنز'
export const BRAND_NAME_EN = BRAND_TRANSLATIONS.en.name; // 'Alef Plans'
export const BRAND_LOGO_LETTER = BRAND_TRANSLATIONS.fa.logoLetter; // 'ا'
export const BRAND_TAGLINE = 'مسیر پیشرفت من';

/**
 * Returns brand metadata based on the current active language or document language.
 * Default is Persian (fa), returning "الف پلنز" and logo letter "ا".
 * When English (en), returns "Alef Plans" and logo letter "A".
 */
export function getBrand(lang?: string): BrandInfo {
  const currentLang = (
    lang ||
    (typeof document !== 'undefined' ? document.documentElement.lang : 'fa')
  ).toLowerCase();

  return currentLang === 'en' ? BRAND_TRANSLATIONS.en : BRAND_TRANSLATIONS.fa;
}
