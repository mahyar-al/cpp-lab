import React, { useState, useEffect } from 'react';
import {
  Palette,
  Layout,
  Type,
  Grid,
  Eye,
  EyeOff,
  ArrowUp,
  ArrowDown,
  RotateCcw,
  Save,
  Check,
  Sparkles,
  SlidersHorizontal,
  Monitor,
  Smartphone,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Undo2,
  Layers,
  ChevronDown,
  Flame,
  Clock,
  GraduationCap,
  FolderGit2,
  Trophy,
  RotateCw,
  Sun,
  Moon,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import {
  NavTab,
  UserCustomization,
  ThemeMode,
  AccentColor,
  FontSize,
  LayoutDensity,
  BorderRadius,
  GlowIntensity,
  DashboardColumns,
} from '../../types';
import {
  DEFAULT_SECTION_NAMES,
  DEFAULT_NAV_ORDER,
  DEFAULT_DASHBOARD_CARDS,
  initialCustomization,
} from '../../utils/initialData';
import { toPersianDigits } from '../../utils/jalali';

interface CustomizationViewProps {
  onBack?: () => void;
}

export const CustomizationView: React.FC<CustomizationViewProps> = ({ onBack }) => {
  const {
    customization,
    updateCustomization,
    resetCustomization,
    currentUser,
    syncWithServer,
    syncStatus,
    showToast,
  } = useApp();

  // Local draft state for live editing before explicit save
  const [draft, setDraft] = useState<UserCustomization>(() => ({
    ...customization,
    sectionNames: { ...customization.sectionNames },
    hiddenSections: [...customization.hiddenSections],
    navOrder: [...customization.navOrder],
    dashboardCardsOrder: [...customization.dashboardCardsOrder],
    hiddenDashboardCards: [...customization.hiddenDashboardCards],
  }));

  const [activeCategory, setActiveCategory] = useState<'names' | 'appearance' | 'layout' | 'dashboard' | 'nav'>('names');
  const [isLivePreviewActive, setIsLivePreviewActive] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [resetTarget, setResetTarget] = useState<'all' | 'names' | 'appearance' | 'dashboard' | 'nav'>('all');
  const [hasChanges, setHasChanges] = useState(false);

  // Sync draft when server or context changes externally (if user hasn't made dirty edits)
  useEffect(() => {
    if (!hasChanges) {
      setDraft({
        ...customization,
        sectionNames: { ...customization.sectionNames },
        hiddenSections: [...customization.hiddenSections],
        navOrder: [...customization.navOrder],
        dashboardCardsOrder: [...customization.dashboardCardsOrder],
        hiddenDashboardCards: [...customization.hiddenDashboardCards],
      });
    }
  }, [customization, hasChanges]);

  // Check if draft differs from saved customization
  useEffect(() => {
    const isDifferent =
      JSON.stringify(draft) !== JSON.stringify(customization);
    setHasChanges(isDifferent);

    // If live preview is active, apply theme and typography immediately to documentElement
    if (isLivePreviewActive) {
      const isSystemDark = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      const isDark = draft.themeMode === 'system' ? isSystemDark : draft.themeMode !== 'light';
      if (isDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      document.documentElement.setAttribute('data-theme', draft.themeMode);
      document.documentElement.setAttribute('data-resolved-theme', isDark ? 'dark' : 'light');
      document.documentElement.setAttribute('data-accent', draft.accentColor);
      document.documentElement.setAttribute('data-secondary-accent', draft.secondaryAccent || 'violet');
      document.documentElement.setAttribute('data-border-radius', draft.borderRadius || 'medium');
      document.documentElement.setAttribute('data-glow', draft.glowIntensity || 'subtle');
      document.documentElement.setAttribute('data-font-size', draft.fontSize);
      document.documentElement.setAttribute('data-density', draft.density);
    }
  }, [draft, customization, isLivePreviewActive]);

  // Cleanup on unmount: if not saved, revert DOM attributes to saved customization
  useEffect(() => {
    return () => {
      const isSystemDark = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      const isDark = customization.themeMode === 'system' ? isSystemDark : customization.themeMode !== 'light';
      if (isDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      document.documentElement.setAttribute('data-theme', customization.themeMode);
      document.documentElement.setAttribute('data-resolved-theme', isDark ? 'dark' : 'light');
      document.documentElement.setAttribute('data-accent', customization.accentColor);
      document.documentElement.setAttribute('data-secondary-accent', customization.secondaryAccent || 'violet');
      document.documentElement.setAttribute('data-border-radius', customization.borderRadius || 'medium');
      document.documentElement.setAttribute('data-glow', customization.glowIntensity || 'subtle');
      document.documentElement.setAttribute('data-font-size', customization.fontSize);
      document.documentElement.setAttribute('data-density', customization.density);
    };
  }, [customization]);

  // Save handler
  const handleSave = async () => {
    setIsSaving(true);
    try {
      updateCustomization(draft, false);
      if (currentUser) {
        await syncWithServer();
      }
      setHasChanges(false);
      showToast('تنظیمات شخصی‌سازی با موفقیت روی حساب کاربری شما ذخیره شد.');
    } catch (err: any) {
      showToast(err?.message || 'خطا در ذخیره‌سازی اطلاعات روی سرور');
    } finally {
      setIsSaving(false);
    }
  };

  // Cancel / Revert handler
  const handleCancel = () => {
    setDraft({
      ...customization,
      sectionNames: { ...customization.sectionNames },
      hiddenSections: [...customization.hiddenSections],
      navOrder: [...customization.navOrder],
      dashboardCardsOrder: [...customization.dashboardCardsOrder],
      hiddenDashboardCards: [...customization.hiddenDashboardCards],
    });
    setHasChanges(false);
    showToast('تغییرات لغو شد و تنظیمات قبلی بازیابی گردید.');
  };

  // Section Name updater
  const handleSectionNameChange = (tab: NavTab, val: string) => {
    // Validate length: max 30 characters
    if (val.length > 30) return;
    setDraft((prev) => ({
      ...prev,
      sectionNames: {
        ...prev.sectionNames,
        [tab]: val,
      },
    }));
  };

  // Reset single section name to default
  const handleResetSingleName = (tab: NavTab) => {
    setDraft((prev) => {
      const nextNames = { ...prev.sectionNames };
      delete nextNames[tab];
      return {
        ...prev,
        sectionNames: nextNames,
      };
    });
  };

  // Reorder Dashboard Cards
  const moveDashboardCard = (index: number, direction: 'up' | 'down') => {
    const newOrder = [...draft.dashboardCardsOrder];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newOrder.length) return;
    const temp = newOrder[index];
    newOrder[index] = newOrder[targetIndex];
    newOrder[targetIndex] = temp;
    setDraft((prev) => ({ ...prev, dashboardCardsOrder: newOrder }));
  };

  // Toggle Dashboard Card Visibility
  const toggleDashboardCardVisibility = (cardId: string) => {
    setDraft((prev) => {
      const isHidden = prev.hiddenDashboardCards.includes(cardId);
      const nextHidden = isHidden
        ? prev.hiddenDashboardCards.filter((id) => id !== cardId)
        : [...prev.hiddenDashboardCards, cardId];
      return { ...prev, hiddenDashboardCards: nextHidden };
    });
  };

  // Reorder Nav Items
  const moveNavItem = (index: number, direction: 'up' | 'down') => {
    const newOrder = [...draft.navOrder];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newOrder.length) return;
    const temp = newOrder[index];
    newOrder[index] = newOrder[targetIndex];
    newOrder[targetIndex] = temp;
    setDraft((prev) => ({ ...prev, navOrder: newOrder }));
  };

  // Toggle Nav Item Visibility
  const toggleNavVisibility = (tab: NavTab) => {
    if (tab === 'settings') {
      showToast('بخش تنظیمات همیشه جهت جلوگیری از قفل شدن فعال می‌ماند.');
      return;
    }
    setDraft((prev) => {
      const isHidden = prev.hiddenSections.includes(tab);
      const nextHidden = isHidden
        ? prev.hiddenSections.filter((t) => t !== tab)
        : [...prev.hiddenSections, tab];
      return { ...prev, hiddenSections: nextHidden };
    });
  };

  // Perform Reset Confirmation
  const confirmReset = () => {
    resetCustomization(resetTarget);
    setDraft((prev) => {
      if (resetTarget === 'all') {
        return {
          ...initialCustomization,
          sectionNames: { ...DEFAULT_SECTION_NAMES },
          navOrder: [...initialCustomization.navOrder],
          dashboardCardsOrder: [...initialCustomization.dashboardCardsOrder],
        };
      }
      if (resetTarget === 'names') {
        return {
          ...prev,
          sectionNames: { ...DEFAULT_SECTION_NAMES },
        };
      }
      if (resetTarget === 'appearance') {
        return {
          ...prev,
          themeMode: initialCustomization.themeMode,
          accentColor: initialCustomization.accentColor,
          secondaryAccent: initialCustomization.secondaryAccent,
          borderRadius: initialCustomization.borderRadius,
          glowIntensity: initialCustomization.glowIntensity,
          fontSize: initialCustomization.fontSize,
          density: initialCustomization.density,
        };
      }
      if (resetTarget === 'dashboard') {
        return {
          ...prev,
          dashboardCardsOrder: [...initialCustomization.dashboardCardsOrder],
          hiddenDashboardCards: [],
          dashboardColumns: initialCustomization.dashboardColumns,
        };
      }
      if (resetTarget === 'nav') {
        return {
          ...prev,
          navOrder: [...initialCustomization.navOrder],
          hiddenSections: [],
        };
      }
      return prev;
    });
    setShowResetConfirm(false);
    setHasChanges(true);
  };

  // Available Theme presets
  const THEME_OPTIONS: Array<{ id: ThemeMode; label: string; desc: string; bgClass: string; badgeClass: string }> = [
    {
      id: 'system',
      label: 'هماهنگ با سیستم (System Auto)',
      desc: 'تنظیم هوشمند بر اساس رنگ و تم فعال سیستم‌عامل (ویندوز / مک / اندروید / لینوکس)',
      bgClass: 'bg-indigo-50/70 dark:bg-[#0D1225] border-indigo-300 dark:border-indigo-500/50 text-indigo-700 dark:text-indigo-400',
      badgeClass: 'bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border-indigo-500/30',
    },
    {
      id: 'dark',
      label: 'نئون سایبر (Dark Neon)',
      desc: 'تم مشکی ژرف با خطوط فیروزه‌ای و پرتوهای الکتریکی نئون (پیش‌فرض)',
      bgClass: 'bg-[#080B14] border-cyan-500/50 text-cyan-400',
      badgeClass: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
    },
    {
      id: 'light',
      label: 'مدرن و روشن (Light Modern)',
      desc: 'تم روشن شیشه‌ای با کنتراست بالا و مناسب محیط‌های پرنور روز',
      bgClass: 'bg-slate-100 border-slate-300 text-slate-800',
      badgeClass: 'bg-indigo-100 text-indigo-700 border-indigo-200',
    },
    {
      id: 'cyber-purple',
      label: 'سحابی بنفش (Cyber Purple)',
      desc: 'پس‌زمینه بنفش کهکشانی با هاله نئونی ارغوانی و جذاب',
      bgClass: 'bg-[#0A0614] border-purple-500/50 text-purple-400',
      badgeClass: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    },
    {
      id: 'emerald-matrix',
      label: 'ماتریس زمرد (Emerald Matrix)',
      desc: 'فضای هکری و تک با مشکی خالص و درخشش سبز فسفری زمردی',
      bgClass: 'bg-[#040F09] border-emerald-500/50 text-emerald-400',
      badgeClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    },
    {
      id: 'ocean-deep',
      label: 'اقیانوس لاجوردی (Ocean Deep)',
      desc: 'آبی تیره اقیانوسی با کنتراست ملایم و آرامش‌بخش چشم',
      bgClass: 'bg-[#050E1B] border-blue-500/50 text-blue-400',
      badgeClass: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    },
    {
      id: 'sunset-gold',
      label: 'غروب کهربایی (Sunset Gold)',
      desc: 'رنگ‌های گرم شبانه با رگه‌های خورشیدی و طلایی دلنشین',
      bgClass: 'bg-[#120904] border-amber-500/50 text-amber-400',
      badgeClass: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    },
    {
      id: 'rose-quartz',
      label: 'یاقوت رز (Rose Quartz)',
      desc: 'پس‌زمینه مخملی تیره با تأکیدهای سرخ و صورتی نئونی چشم‌نواز',
      bgClass: 'bg-[#14050B] border-rose-500/50 text-rose-400',
      badgeClass: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
    },
  ];

  // Accent Colors
  const ACCENT_OPTIONS: Array<{ id: AccentColor; label: string; hex: string; bg: string }> = [
    { id: 'cyan', label: 'فیروزه‌ای نئون', hex: '#00F5FF', bg: 'bg-[#00F5FF]' },
    { id: 'emerald', label: 'سبز زمردی', hex: '#10B981', bg: 'bg-[#10B981]' },
    { id: 'violet', label: 'ارغوانی نئون', hex: '#A855F7', bg: 'bg-[#A855F7]' },
    { id: 'rose', label: 'سرخ رز', hex: '#F43F5E', bg: 'bg-[#F43F5E]' },
    { id: 'amber', label: 'طلایی کهربایی', hex: '#F59E0B', bg: 'bg-[#F59E0B]' },
    { id: 'blue', label: 'آبی آسمانی', hex: '#3B82F6', bg: 'bg-[#3B82F6]' },
  ];

  // All 15 section tabs to customize
  const ALL_SECTIONS: NavTab[] = [
    'school',
    'skills',
    'projects',
    'competitions',
    'daily_planner',
    'habits',
    'reviews',
    'focus_timer',
    'resources',
    'calendar',
    'goals',
    'notes',
    'analytics',
    'dashboard',
    'settings',
  ];

  return (
    <div className="space-y-6 pb-20 animate-in fade-in duration-200">
      {/* Top Header & Overview */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-white/80 dark:bg-[#0D1222]/80 backdrop-blur-xl border border-slate-200 dark:border-[#263247] shadow-sm">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-slate-950 shadow-[0_0_15px_rgba(0,245,255,0.35)] shrink-0">
            <Palette className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-black text-slate-900 dark:text-white">
                شخصی‌سازی جامع سایت و رابط کاربری
              </h2>
              {currentUser && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400">
                  حساب کاربری: {currentUser.name}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              نام بخش‌ها، رنگ‌های تأکیدی، تم‌ها، چیدمان داشبورد و ترتیب منو را به سلیقه خود تغییر دهید. کلیه تنظیمات اختصاصی در سرور ذخیره می‌شوند.
            </p>
          </div>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-2 self-end md:self-center shrink-0">
          {hasChanges && (
            <button
              onClick={handleCancel}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-[#172033] dark:hover:bg-[#1f2b45] rounded-xl transition-all cursor-pointer"
              title="انصراف از تغییرات و بازگردانی تنظیمات ذخیره شده"
            >
              <Undo2 className="w-4 h-4 text-slate-400" />
              <span>لغو</span>
            </button>
          )}

          <button
            onClick={() => {
              setResetTarget('all');
              setShowResetConfirm(true);
            }}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/25 rounded-xl transition-all cursor-pointer"
            title="بازنشانی کل شخصی‌سازی‌ها به حالت اولیه"
          >
            <RotateCcw className="w-4 h-4" />
            <span className="hidden sm:inline">بازنشانی پیش‌فرض</span>
          </button>

          <button
            onClick={handleSave}
            disabled={isSaving || !hasChanges}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-black rounded-xl transition-all cursor-pointer ${
              hasChanges
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 shadow-[0_0_15px_rgba(0,245,255,0.4)] active:scale-95'
                : 'bg-slate-200 dark:bg-[#172033] text-slate-400 dark:text-slate-500 cursor-not-allowed opacity-70'
            }`}
          >
            {isSaving ? (
              <>
                <RotateCw className="w-4 h-4 animate-spin" />
                <span>در حال ذخیره...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>ذخیره تغییرات</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Changes Alert Banner */}
      {hasChanges && (
        <div className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300 text-xs">
          <div className="flex items-center gap-2 font-medium">
            <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
            <span>شما تغییراتی در ظاهر و تنظیمات داده‌اید که پیش‌نمایش آن فعال است. برای دائمی شدن، روی «ذخیره تغییرات» کلیک کنید.</span>
          </div>
          <button
            onClick={handleSave}
            className="px-3 py-1 bg-amber-500 text-slate-950 text-xs font-bold rounded-lg hover:bg-amber-400 transition-colors shrink-0 cursor-pointer"
          >
            ذخیره فوری
          </button>
        </div>
      )}

      {/* Tabs navigation for categories */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 cyber-scrollbar border-b border-slate-200 dark:border-[#263247]">
        <button
          onClick={() => setActiveCategory('names')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all whitespace-nowrap cursor-pointer border-b-2 ${
            activeCategory === 'names'
              ? 'text-cyan-600 dark:text-cyan-400 border-cyan-500 bg-cyan-500/10'
              : 'text-slate-600 dark:text-slate-400 border-transparent hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Type className="w-4 h-4" />
          <span>نام بخش‌های سایت</span>
        </button>

        <button
          onClick={() => setActiveCategory('appearance')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all whitespace-nowrap cursor-pointer border-b-2 ${
            activeCategory === 'appearance'
              ? 'text-cyan-600 dark:text-cyan-400 border-cyan-500 bg-cyan-500/10'
              : 'text-slate-600 dark:text-slate-400 border-transparent hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Palette className="w-4 h-4" />
          <span>تم و رنگ‌های ظاهری</span>
        </button>

        <button
          onClick={() => setActiveCategory('layout')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all whitespace-nowrap cursor-pointer border-b-2 ${
            activeCategory === 'layout'
              ? 'text-cyan-600 dark:text-cyan-400 border-cyan-500 bg-cyan-500/10'
              : 'text-slate-600 dark:text-slate-400 border-transparent hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span>اندازه متن، گوشه‌ها و فشردگی</span>
        </button>

        <button
          onClick={() => setActiveCategory('dashboard')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all whitespace-nowrap cursor-pointer border-b-2 ${
            activeCategory === 'dashboard'
              ? 'text-cyan-600 dark:text-cyan-400 border-cyan-500 bg-cyan-500/10'
              : 'text-slate-600 dark:text-slate-400 border-transparent hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Grid className="w-4 h-4" />
          <span>چیدمان و کارت‌های داشبورد</span>
        </button>

        <button
          onClick={() => setActiveCategory('nav')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all whitespace-nowrap cursor-pointer border-b-2 ${
            activeCategory === 'nav'
              ? 'text-cyan-600 dark:text-cyan-400 border-cyan-500 bg-cyan-500/10'
              : 'text-slate-600 dark:text-slate-400 border-transparent hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Layout className="w-4 h-4" />
          <span>بخش‌های منوی اصلی و دیدبانی</span>
        </button>
      </div>

      {/* Main Content Area by Category */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Settings Controls */}
        <div className="lg:col-span-2 space-y-6">
          {/* CATEGORY 1: Section Names */}
          {activeCategory === 'names' && (
            <div className="p-5 rounded-2xl bg-white dark:bg-[#0D1222] border border-slate-200 dark:border-[#263247] shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#263247] pb-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Type className="w-4 h-4 text-cyan-500" />
                    <span>شخصی‌سازی عناوین بخش‌های سامانه</span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    نام دلخواه خود را برای هر بخش بنویسید (مثلاً: «مدرسه» ← «درس و مشق»، «مهارت» ← «مسیر یادگیری»)
                  </p>
                </div>
                <button
                  onClick={() => {
                    setResetTarget('names');
                    setShowResetConfirm(true);
                  }}
                  className="text-xs text-slate-400 hover:text-rose-500 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>پیش‌فرض عناوین</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                {ALL_SECTIONS.map((tab) => {
                  const defaultLabel = DEFAULT_SECTION_NAMES[tab];
                  const currentVal = draft.sectionNames[tab] || '';
                  const hasCustom = currentVal.trim() && currentVal.trim() !== defaultLabel;

                  return (
                    <div
                      key={tab}
                      className={`p-3 rounded-xl border transition-all ${
                        hasCustom
                          ? 'bg-cyan-500/5 dark:bg-cyan-500/10 border-cyan-500/40 ring-1 ring-cyan-500/20'
                          : 'bg-slate-50 dark:bg-[#111827] border-slate-200 dark:border-[#263247]'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                          نام پیش‌فرض: {defaultLabel}
                        </span>
                        {hasCustom && (
                          <button
                            onClick={() => handleResetSingleName(tab)}
                            className="text-[10px] text-cyan-600 dark:text-cyan-400 hover:underline cursor-pointer"
                            title="بازگشت به نام اصلی"
                          >
                            بازگردانی
                          </button>
                        )}
                      </div>

                      <div className="relative">
                        <input
                          type="text"
                          value={currentVal}
                          placeholder={defaultLabel}
                          onChange={(e) => handleSectionNameChange(tab, e.target.value)}
                          maxLength={30}
                          className="w-full px-3 py-1.5 text-xs bg-white dark:bg-[#080B14] rounded-lg border border-slate-200 dark:border-[#263247] text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-cyan-500 transition-colors"
                        />
                        <span className="absolute left-2.5 top-2 text-[9px] text-slate-400 font-mono">
                          {toPersianDigits(currentVal.length)}/۳۰
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* CATEGORY 2: Themes & Appearance */}
          {activeCategory === 'appearance' && (
            <div className="space-y-6">
              {/* Themes Grid */}
              <div className="p-5 rounded-2xl bg-white dark:bg-[#0D1222] border border-slate-200 dark:border-[#263247] shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#263247] pb-3">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <Palette className="w-4 h-4 text-cyan-500" />
                      <span>انتخاب تم و فضای کاربری</span>
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      رنگ‌بندی پایه و فضای محیط کاربری خود را انتخاب کنید
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  {THEME_OPTIONS.map((theme) => {
                    const isSelected = draft.themeMode === theme.id;
                    return (
                      <button
                        key={theme.id}
                        type="button"
                        onClick={() => setDraft((prev) => ({ ...prev, themeMode: theme.id }))}
                        className={`p-3.5 rounded-xl border text-right transition-all cursor-pointer relative overflow-hidden ${
                          isSelected
                            ? 'ring-2 ring-cyan-500 border-cyan-500 shadow-md scale-[1.01]'
                            : 'border-slate-200 dark:border-[#263247] hover:border-slate-300 dark:hover:border-slate-600'
                        } ${theme.bgClass}`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs font-bold text-slate-900 dark:text-white">
                            {theme.label}
                          </span>
                          {isSelected && (
                            <span className="w-4 h-4 rounded-full bg-cyan-500 text-slate-950 flex items-center justify-center text-[10px] font-black">
                              ✓
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-600 dark:text-slate-300 line-clamp-2">
                          {theme.desc}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Accent Color Selection */}
              <div className="p-5 rounded-2xl bg-white dark:bg-[#0D1222] border border-slate-200 dark:border-[#263247] shadow-sm space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-cyan-500" />
                    <span>رنگ تأکیدی اصلی (Primary Accent)</span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    رنگ دکمه‌ها، نشانگرهای فعال، نمودارها و هایلایت‌های مهم
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {ACCENT_OPTIONS.map((acc) => {
                    const isSelected = draft.accentColor === acc.id;
                    return (
                      <button
                        key={acc.id}
                        type="button"
                        onClick={() => setDraft((prev) => ({ ...prev, accentColor: acc.id }))}
                        className={`flex items-center gap-2.5 p-2.5 rounded-xl border transition-all cursor-pointer ${
                          isSelected
                            ? 'border-cyan-500 bg-slate-100 dark:bg-[#172033] ring-1 ring-cyan-400 shadow-xs'
                            : 'border-slate-200 dark:border-[#263247] bg-white dark:bg-[#080B14] hover:bg-slate-50 dark:hover:bg-[#111827]'
                        }`}
                      >
                        <span className={`w-4 h-4 rounded-full ${acc.bg} ring-2 ring-white dark:ring-[#263247] shrink-0 shadow-xs`} />
                        <span className={`text-xs font-semibold ${isSelected ? 'text-cyan-600 dark:text-cyan-400 font-bold' : 'text-slate-700 dark:text-slate-300'}`}>
                          {acc.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Secondary Accent */}
              <div className="p-5 rounded-2xl bg-white dark:bg-[#0D1222] border border-slate-200 dark:border-[#263247] shadow-sm space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Layers className="w-4 h-4 text-purple-400" />
                    <span>رنگ تأکیدی ثانویه (Secondary Accent)</span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    رنگ مدال‌ها، کارت‌های کمکی، گرادیان‌ها و نوارهای پیشرفت
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {ACCENT_OPTIONS.map((acc) => {
                    const isSelected = (draft.secondaryAccent || 'violet') === acc.id;
                    return (
                      <button
                        key={acc.id}
                        type="button"
                        onClick={() => setDraft((prev) => ({ ...prev, secondaryAccent: acc.id }))}
                        className={`flex items-center gap-2.5 p-2.5 rounded-xl border transition-all cursor-pointer ${
                          isSelected
                            ? 'border-purple-500 bg-slate-100 dark:bg-[#172033] ring-1 ring-purple-400 shadow-xs'
                            : 'border-slate-200 dark:border-[#263247] bg-white dark:bg-[#080B14] hover:bg-slate-50 dark:hover:bg-[#111827]'
                        }`}
                      >
                        <span className={`w-4 h-4 rounded-full ${acc.bg} ring-2 ring-white dark:ring-[#263247] shrink-0 shadow-xs`} />
                        <span className={`text-xs font-semibold ${isSelected ? 'text-purple-600 dark:text-purple-400 font-bold' : 'text-slate-700 dark:text-slate-300'}`}>
                          {acc.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* CATEGORY 3: Layout, Font Scale, Density, Glow */}
          {activeCategory === 'layout' && (
            <div className="space-y-6">
              {/* Font Scale */}
              <div className="p-5 rounded-2xl bg-white dark:bg-[#0D1222] border border-slate-200 dark:border-[#263247] shadow-sm space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Type className="w-4 h-4 text-cyan-500" />
                    <span>اندازه قلم و متون سامانه (Font Scale)</span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    اندازه پایه تایپوگرافی را متناسب با اندازه مانیتور یا چشمان خود تنظیم کنید
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'small' as FontSize, label: 'ریز و فشرده', desc: 'مناسب نمایش حجم اطلاعات بیشتر' },
                    { id: 'normal' as FontSize, label: 'استاندارد', desc: 'اندازه متوازن و بهینه (پیش‌فرض)' },
                    { id: 'large' as FontSize, label: 'درشت و خوانا', desc: 'راحتی مطالعه و وضوح بالاتر' },
                  ].map((f) => {
                    const isSelected = draft.fontSize === f.id;
                    return (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => setDraft((prev) => ({ ...prev, fontSize: f.id }))}
                        className={`p-3 rounded-xl border text-right transition-all cursor-pointer ${
                          isSelected
                            ? 'border-cyan-500 bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 ring-1 ring-cyan-400 font-bold'
                            : 'border-slate-200 dark:border-[#263247] hover:bg-slate-50 dark:hover:bg-[#111827] text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <div className="text-xs font-bold">{f.label}</div>
                        <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 line-clamp-1">{f.desc}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Layout Density */}
              <div className="p-5 rounded-2xl bg-white dark:bg-[#0D1222] border border-slate-200 dark:border-[#263247] shadow-sm space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <SlidersHorizontal className="w-4 h-4 text-cyan-500" />
                    <span>میزان فشردگی چیدمان (Layout Density)</span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    فاصله بین بخش‌ها و اندازه حاشیه‌های داخلی کارت‌ها
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'compact' as LayoutDensity, label: 'فشرده (Compact)', desc: 'پدینگ کمتر، مشاهده سریع‌تر' },
                    { id: 'comfortable' as LayoutDensity, label: 'معمولی (Comfortable)', desc: 'چیدمان ارگونومیک پیش‌فرض' },
                    { id: 'spacious' as LayoutDensity, label: 'باز و جادار (Spacious)', desc: 'فاصله‌های بازتر و آرامش‌بخش' },
                  ].map((d) => {
                    const isSelected = draft.density === d.id;
                    return (
                      <button
                        key={d.id}
                        type="button"
                        onClick={() => setDraft((prev) => ({ ...prev, density: d.id }))}
                        className={`p-3 rounded-xl border text-right transition-all cursor-pointer ${
                          isSelected
                            ? 'border-cyan-500 bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 ring-1 ring-cyan-400 font-bold'
                            : 'border-slate-200 dark:border-[#263247] hover:bg-slate-50 dark:hover:bg-[#111827] text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <div className="text-xs font-bold">{d.label}</div>
                        <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 line-clamp-1">{d.desc}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Border Radius & Glow */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Border Radius */}
                <div className="p-5 rounded-2xl bg-white dark:bg-[#0D1222] border border-slate-200 dark:border-[#263247] shadow-sm space-y-4">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <Grid className="w-4 h-4 text-cyan-500" />
                      <span>گردی گوشه‌های کارت‌ها</span>
                    </h3>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'subtle' as BorderRadius, label: 'کم (8px)' },
                      { id: 'medium' as BorderRadius, label: 'متوسط (16px)' },
                      { id: 'rounded' as BorderRadius, label: 'زیاد (24px)' },
                    ].map((b) => {
                      const isSelected = (draft.borderRadius || 'medium') === b.id;
                      return (
                        <button
                          key={b.id}
                          type="button"
                          onClick={() => setDraft((prev) => ({ ...prev, borderRadius: b.id }))}
                          className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer text-xs ${
                            isSelected
                              ? 'border-cyan-500 bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 font-bold'
                              : 'border-slate-200 dark:border-[#263247] text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          {b.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Glow Intensity */}
                <div className="p-5 rounded-2xl bg-white dark:bg-[#0D1222] border border-slate-200 dark:border-[#263247] shadow-sm space-y-4">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-cyan-500" />
                      <span>شدت افکت‌های Glow و نئون</span>
                    </h3>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'none' as GlowIntensity, label: 'خاموش' },
                      { id: 'subtle' as GlowIntensity, label: 'ملایم' },
                      { id: 'high' as GlowIntensity, label: 'شدید' },
                    ].map((g) => {
                      const isSelected = (draft.glowIntensity || 'subtle') === g.id;
                      return (
                        <button
                          key={g.id}
                          type="button"
                          onClick={() => setDraft((prev) => ({ ...prev, glowIntensity: g.id }))}
                          className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer text-xs ${
                            isSelected
                              ? 'border-cyan-500 bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 font-bold'
                              : 'border-slate-200 dark:border-[#263247] text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          {g.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* CATEGORY 4: Dashboard Cards Order and Visibility */}
          {activeCategory === 'dashboard' && (
            <div className="p-5 rounded-2xl bg-white dark:bg-[#0D1222] border border-slate-200 dark:border-[#263247] shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 dark:border-[#263247] pb-3 gap-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Grid className="w-4 h-4 text-cyan-500" />
                    <span>مدیریت و اولویت‌بندی کارت‌های داشبورد</span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    ترتیب کارت‌ها را با دکمه‌های بالا و پایین جابجا کنید، یا کارت‌های غیرضروری را موقتاً مخفی نمایید
                  </p>
                </div>

                {/* Dashboard Columns Control */}
                <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-[#111827] p-1 rounded-xl border border-slate-200 dark:border-[#263247]">
                  <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 px-1.5">ستون‌ها:</span>
                  {[
                    { id: 'auto' as DashboardColumns, label: 'خودکار' },
                    { id: '1' as DashboardColumns, label: '۱ ستون' },
                    { id: '2' as DashboardColumns, label: '۲ ستون' },
                    { id: '3' as DashboardColumns, label: '۳ ستون' },
                  ].map((col) => (
                    <button
                      key={col.id}
                      type="button"
                      onClick={() => setDraft((prev) => ({ ...prev, dashboardColumns: col.id }))}
                      className={`px-2 py-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
                        (draft.dashboardColumns || 'auto') === col.id
                          ? 'bg-white dark:bg-[#172033] text-cyan-600 dark:text-cyan-400 shadow-xs'
                          : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                      }`}
                    >
                      {col.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Cards List */}
              <div className="space-y-2 pt-1">
                {draft.dashboardCardsOrder.map((cardId, index) => {
                  const cardDef = DEFAULT_DASHBOARD_CARDS.find((c) => c.id === cardId) || {
                    id: cardId,
                    label: cardId,
                    category: 'عمومی',
                  };
                  const isHidden = draft.hiddenDashboardCards.includes(cardId);

                  return (
                    <div
                      key={cardId}
                      className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                        isHidden
                          ? 'bg-slate-100/50 dark:bg-[#0B0F19]/50 border-dashed border-slate-300 dark:border-[#1E293B] opacity-60'
                          : 'bg-slate-50 dark:bg-[#111827] border-slate-200 dark:border-[#263247]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-lg bg-slate-200 dark:bg-[#172033] text-slate-600 dark:text-slate-400 text-xs font-mono font-bold flex items-center justify-center shrink-0">
                          {toPersianDigits(index + 1)}
                        </span>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className={`text-xs font-bold ${isHidden ? 'line-through text-slate-400' : 'text-slate-900 dark:text-white'}`}>
                              {cardDef.label}
                            </span>
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-200/60 dark:bg-[#172033] text-slate-500 dark:text-slate-400">
                              {cardDef.category}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Controls: Move Up, Move Down, Toggle Eye */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => moveDashboardCard(index, 'up')}
                          disabled={index === 0}
                          className="p-1.5 text-slate-400 hover:text-cyan-500 disabled:opacity-30 disabled:hover:text-slate-400 rounded-lg hover:bg-slate-200 dark:hover:bg-[#172033] transition-colors cursor-pointer"
                          title="انتقال به بالا"
                        >
                          <ArrowUp className="w-4 h-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => moveDashboardCard(index, 'down')}
                          disabled={index === draft.dashboardCardsOrder.length - 1}
                          className="p-1.5 text-slate-400 hover:text-cyan-500 disabled:opacity-30 disabled:hover:text-slate-400 rounded-lg hover:bg-slate-200 dark:hover:bg-[#172033] transition-colors cursor-pointer"
                          title="انتقال به پایین"
                        >
                          <ArrowDown className="w-4 h-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => toggleDashboardCardVisibility(cardId)}
                          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                            isHidden
                              ? 'text-slate-400 hover:text-emerald-500 hover:bg-emerald-500/10'
                              : 'text-cyan-600 dark:text-cyan-400 hover:bg-cyan-500/10'
                          }`}
                          title={isHidden ? 'نمایش مجدد کارت' : 'مخفی کردن کارت'}
                        >
                          {isHidden ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* CATEGORY 5: Navigation Menu Ordering & Visibility */}
          {activeCategory === 'nav' && (
            <div className="p-5 rounded-2xl bg-white dark:bg-[#0D1222] border border-slate-200 dark:border-[#263247] shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#263247] pb-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Layout className="w-4 h-4 text-cyan-500" />
                    <span>شخصی‌سازی آیتم‌های منوی اصلی (سایدبار)</span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    بخش‌های کم‌استفاده را از منو پنهان کنید یا ترتیب دسترسی آنها را تغییر دهید
                  </p>
                </div>
              </div>

              <div className="space-y-2 pt-1">
                {draft.navOrder.map((tab, index) => {
                  const defaultLabel = DEFAULT_SECTION_NAMES[tab];
                  const customLabel = draft.sectionNames[tab] || defaultLabel;
                  const isHidden = draft.hiddenSections.includes(tab);
                  const isLocked = tab === 'settings';

                  return (
                    <div
                      key={tab}
                      className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                        isHidden
                          ? 'bg-slate-100/50 dark:bg-[#0B0F19]/50 border-dashed border-slate-300 dark:border-[#1E293B] opacity-60'
                          : 'bg-slate-50 dark:bg-[#111827] border-slate-200 dark:border-[#263247]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-lg bg-slate-200 dark:bg-[#172033] text-slate-600 dark:text-slate-400 text-xs font-mono font-bold flex items-center justify-center shrink-0">
                          {toPersianDigits(index + 1)}
                        </span>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className={`text-xs font-bold ${isHidden ? 'line-through text-slate-400' : 'text-slate-900 dark:text-white'}`}>
                              {customLabel}
                            </span>
                            {customLabel !== defaultLabel && (
                              <span className="text-[10px] text-slate-400">({defaultLabel})</span>
                            )}
                            {isLocked && (
                              <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-500 border border-amber-500/20">
                                همواره فعال
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Controls */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => moveNavItem(index, 'up')}
                          disabled={index === 0}
                          className="p-1.5 text-slate-400 hover:text-cyan-500 disabled:opacity-30 disabled:hover:text-slate-400 rounded-lg hover:bg-slate-200 dark:hover:bg-[#172033] transition-colors cursor-pointer"
                          title="انتقال به بالا"
                        >
                          <ArrowUp className="w-4 h-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => moveNavItem(index, 'down')}
                          disabled={index === draft.navOrder.length - 1}
                          className="p-1.5 text-slate-400 hover:text-cyan-500 disabled:opacity-30 disabled:hover:text-slate-400 rounded-lg hover:bg-slate-200 dark:hover:bg-[#172033] transition-colors cursor-pointer"
                          title="انتقال به پایین"
                        >
                          <ArrowDown className="w-4 h-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => toggleNavVisibility(tab)}
                          disabled={isLocked}
                          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                            isLocked
                              ? 'text-slate-300 dark:text-slate-600 cursor-not-allowed'
                              : isHidden
                              ? 'text-slate-400 hover:text-emerald-500 hover:bg-emerald-500/10'
                              : 'text-cyan-600 dark:text-cyan-400 hover:bg-cyan-500/10'
                          }`}
                          title={isLocked ? 'بخش تنظیمات همواره فعال است' : isHidden ? 'نمایش مجدد در منو' : 'مخفی کردن از منو'}
                        >
                          {isHidden ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right 1 Col: Interactive Live Preview Card */}
        <div className="space-y-4">
          <div className="sticky top-20 space-y-4">
            <div className="p-4 rounded-2xl bg-white dark:bg-[#0D1222] border border-slate-200 dark:border-[#263247] shadow-sm space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-[#263247]">
                <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  <span>پیش‌نمایش زنده ظاهر</span>
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-500 border border-cyan-500/20 font-bold">
                  Live Preview
                </span>
              </div>

              {/* Sample Mini Header */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#080B14] border border-slate-200 dark:border-[#263247] space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-cyan-400 to-blue-600 flex items-center justify-center text-slate-950 font-bold text-[10px]">
                      P
                    </div>
                    <span className="text-xs font-black text-slate-900 dark:text-white">
                      {draft.sectionNames.school || DEFAULT_SECTION_NAMES.school}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400">۲۴ مهر ۱۴۰۵</span>
                </div>
              </div>

              {/* Sample Mini Card with selected Border Radius & Density */}
              <div
                className={`p-3.5 futuristic-card border text-right space-y-2 relative overflow-hidden transition-all ${
                  draft.borderRadius === 'subtle'
                    ? 'rounded-lg'
                    : draft.borderRadius === 'rounded'
                    ? 'rounded-2xl'
                    : 'rounded-xl'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    {draft.sectionNames.daily_planner || DEFAULT_SECTION_NAMES.daily_planner}
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/15 text-cyan-400 font-bold">
                    فعال
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  نمونه کارت با تم <strong className="text-cyan-400 font-bold">{draft.themeMode}</strong> و رنگ تأکیدی{' '}
                  <strong className="text-cyan-400 font-bold">{draft.accentColor}</strong>.
                </p>
                <div className="pt-1 flex items-center gap-1.5 flex-wrap">
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 dark:bg-[#172033] text-slate-700 dark:text-slate-300">
                    {draft.sectionNames.projects || DEFAULT_SECTION_NAMES.projects}
                  </span>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 dark:bg-[#172033] text-slate-700 dark:text-slate-300">
                    {draft.sectionNames.competitions || DEFAULT_SECTION_NAMES.competitions}
                  </span>
                </div>
              </div>

              {/* Quick Summary Pill */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#111827] text-[11px] space-y-1 text-slate-600 dark:text-slate-400">
                <div className="flex justify-between">
                  <span>تم فعال:</span>
                  <span className="font-bold text-slate-900 dark:text-white">{draft.themeMode}</span>
                </div>
                <div className="flex justify-between">
                  <span>اندازه قلم:</span>
                  <span className="font-bold text-slate-900 dark:text-white">{draft.fontSize}</span>
                </div>
                <div className="flex justify-between">
                  <span>فشردگی:</span>
                  <span className="font-bold text-slate-900 dark:text-white">{draft.density}</span>
                </div>
                <div className="flex justify-between">
                  <span>بخش‌های مخفی:</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {toPersianDigits(draft.hiddenSections.length)} از ۱۵
                  </span>
                </div>
              </div>

              {/* Save Button in preview card */}
              <button
                onClick={handleSave}
                disabled={isSaving || !hasChanges}
                className={`w-full py-2.5 px-4 text-xs font-black rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  hasChanges
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 shadow-[0_0_15px_rgba(0,245,255,0.35)]'
                    : 'bg-slate-200 dark:bg-[#172033] text-slate-400 cursor-not-allowed opacity-70'
                }`}
              >
                {isSaving ? <RotateCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                <span>{hasChanges ? 'ذخیره دائمی تنظیمات' : 'تنظیمات ذخیره هستند'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white dark:bg-[#111827] rounded-2xl p-6 border border-slate-200 dark:border-[#263247] shadow-2xl text-right space-y-4">
            <div className="flex items-center gap-3 text-rose-500">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center">
                <AlertCircle className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-slate-900 dark:text-white">
                تأیید بازگردانی تنظیمات به پیش‌فرض
              </h4>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              آیا مطمئن هستید که می‌خواهید{' '}
              {resetTarget === 'all'
                ? 'کلیه تنظیمات شخصی‌سازی (عناوین، تم‌ها، رنگ‌ها و چیدمان)'
                : resetTarget === 'names'
                ? 'نام تمامی بخش‌ها'
                : resetTarget === 'appearance'
                ? 'تنظیمات تم و رنگ‌ها'
                : resetTarget === 'dashboard'
                ? 'ترتیب و کارت‌های داشبورد'
                : 'ترتیب و وضعیت منوی اصلی'}{' '}
              را به حالت پیش‌فرض سامانه بازگردانید؟
              <br />
              <strong className="text-cyan-500 mt-1 block">
                توجه: این اقدام هیچ‌یک از پروژه‌ها، درس‌ها، یادداشت‌ها یا سوابق تحصیلی شما را حذف نخواهد کرد.
              </strong>
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#172033] dark:hover:bg-[#1f2b45] text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
              >
                انصراف
              </button>
              <button
                type="button"
                onClick={confirmReset}
                className="px-4 py-2 text-xs font-bold rounded-xl bg-rose-600 hover:bg-rose-500 text-white shadow-md transition-colors cursor-pointer"
              >
                بله، بازنشانی شود
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
