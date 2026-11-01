import React, { useState } from 'react';
import {
  Sparkles,
  Clock,
  GraduationCap,
  Sparkle,
  FolderGit2,
  Trophy,
  Flame,
  Zap,
  BookOpen,
  CalendarDays,
  Target,
  FileText,
  BarChart3,
  Settings,
  ArrowLeft,
  CheckCircle2,
  Compass,
  ShieldCheck,
  Brain,
  ChevronLeft,
  Play,
  RotateCcw,
  Check,
  Star,
  Layers,
  Award,
  TrendingUp,
  LayoutDashboard,
  Bell,
  Sun,
  Moon,
  LifeBuoy,
  FlameKindling,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { toPersianDigits, formatJalaliFull } from '../../utils/jalali';
import { NavTab } from '../../types';
import { getBrand } from '../../utils/brand';

interface HomeViewProps {
  onNavigate: (tab: NavTab) => void;
  onOpenQuickAdd?: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({ onNavigate, onOpenQuickAdd }) => {
  const {
    profile,
    rpg,
    habits,
    skills,
    goals,
    homeworks,
    dayData,
    reviews,
    studySessions,
    setIsRescueModalOpen,
    resolvedTheme,
  } = useApp();

  const brand = getBrand();
  const [activePillar, setActivePillar] = useState<number>(0);

  // Derived user live metrics
  const currentIranianDayIdx = (() => {
    const d = new Date().getDay();
    return d === 6 ? 0 : d + 1; // 0: Sat ... 4: Wed
  })();

  const todayTasks = dayData[currentIranianDayIdx]?.postSchoolTasks || [];
  const completedTodayTasks = todayTasks.filter((t) => t.completed).length;
  const pendingHw = homeworks.filter((h) => !h.completed).length;

  const allStreaks = [
    ...(skills || []).map((s) => s.streak || 0),
    ...(habits || []).map((h) => h.streak || 0),
  ];
  const maxStreak = Math.max(0, ...allStreaks);

  const completedGoalsCount = (goals || []).filter((g) => g.status === 'completed').length;
  const totalGoals = goals?.length || 0;
  const goalPercent = totalGoals > 0 ? Math.round((completedGoalsCount / totalGoals) * 100) : 0;

  const todayIso = new Date().toISOString().slice(0, 10);
  const dueReviewsCount = (reviews || []).filter((r) => r.nextReviewDate <= todayIso).length;

  // 6 Core Pillars data
  const pillars = [
    {
      id: 'planner',
      targetTab: 'daily_planner' as NavTab,
      number: '۰۱',
      title: 'برنامه‌ریز روزانه و حالت نجات (Rescue Mode)',
      tagline: 'مدیریت زمان بدون استرس با اولویت‌بندی واقعی و شبیه‌سازی فشار کاری',
      icon: Clock,
      color: 'from-amber-500/20 to-orange-500/20 border-amber-500/30 text-amber-500',
      badge: 'هوشمند و انعطاف‌پذیر',
      highlights: [
        'دسته‌بندی وظایف به کارهای قبل و بعد از مدرسه با زیرمجموعه‌ها (Subtasks)',
        'تخمین دقیق دقایق هر فعالیت و تحلیل تطابق زمانی با روز',
        'دکمه اضطراری حالت نجات (۱۵ دقیقه، ۱ ساعت، بازسازی روز) برای بازیابی تمرکز در روزهای شلوغ',
        'انتقال هوشمند کارهای انجام‌نشده (Rollover) بدون سرزنش یا گم‌شدن برنامه‌ها',
      ],
      quickStats: `${toPersianDigits(todayTasks.length)} وظیفه امروز · ${toPersianDigits(completedTodayTasks)} انجام شده`,
      cta: 'ورود به برنامه‌ریز روزانه',
    },
    {
      id: 'school',
      targetTab: 'school' as NavTab,
      number: '۰۲',
      title: 'مدرسه، زنگ‌ها و کارنامه پویا',
      tagline: 'نظم تمام‌عیار در درس‌ها، دفاتر تکالیف و تقویم امتحانات با ضرایب وزنی',
      icon: GraduationCap,
      color: 'from-blue-500/20 to-indigo-500/20 border-blue-500/30 text-blue-500',
      badge: 'منطبق بر نظام آموزشی',
      highlights: [
        'جدول هفتگی ۵ زنگه شنبه تا چهارشنبه با رنگ و نام مدرس اختصاصی هر درس',
        'دفترچه هوشمند تکالیف با اولویت‌بندی، زمان تخمینی و هشدار مهلت تحویل',
        'ثبت نمرات مستمر و پایانی و محاسبه خودکار معدل وزنی کل',
        'تقویم امتحانات نزدیک با محدوده مطالعه و برنامه مرور قبل از آزمون',
      ],
      quickStats: `${toPersianDigits(pendingHw)} تکلیف در انتظار انجام`,
      cta: 'مشاهده برنامه مدرسه و درس‌ها',
    },
    {
      id: 'projects_skills',
      targetTab: 'projects' as NavTab,
      number: '۰۳',
      title: 'میز ۳D پروژه‌ها و ماتریس مهارت‌ها',
      tagline: 'سازمان‌دهی ایده‌ها در میز تعاملی شیشه‌ای ۳D و نقشه راه تسلط بر مهارت‌ها',
      icon: FolderGit2,
      color: 'from-purple-500/20 to-pink-500/20 border-purple-500/30 text-purple-500',
      badge: 'معماری مدرن سه‌بعدی',
      highlights: [
        'میز کار ۳D با کارت‌های شیشه‌ای زاویه‌دار (Glass Folder Cards) و حرکت طبیعی فیزیک',
        'ردیابی مراحل پروژه (طراحی، توسعه، بازبینی) همراه با ثبت اشکالات و وظایف',
        'نقشه راه مهارت‌ها (Roadmap) از سطح نوآموز تا فوق‌تخصص با محاسبه ساعات تمرین',
        'بخش اختصاصی آمادگی مسابقات، المپیادها و چالش‌های علمی با شمارنده مسائل حل‌شده',
      ],
      quickStats: `${toPersianDigits(skills.length)} مهارت فعال · ${toPersianDigits(maxStreak)} روز استمرار تمرین`,
      cta: 'مشاهده میز ۳D پروژه‌ها',
    },
    {
      id: 'rpg',
      targetTab: 'dashboard' as NavTab,
      number: '۰۴',
      title: 'سیستم بازی‌وارسازی زندگی (Life RPG)',
      tagline: 'پیشرفت واقعی خود را مانند یک بازی مهیج ارتقا دهید و افتخار کسب کنید',
      icon: Trophy,
      color: 'from-emerald-500/20 to-teal-500/20 border-emerald-500/30 text-emerald-500',
      badge: 'انگیزه بی‌پایان',
      highlights: [
        'تبدیل هر تکلیف، ساعت مطالعه و عادت روزانه به امتیاز تجربه واقعی (XP)',
        'ارتقای لول و باز شدن عناوین افتخارآمیز (پوینده متمرکز، استاد بهره‌وری، اسطوره پیشرفت)',
        'کوئست‌های روزانه و هفتگی با پاداش‌های معنادار برای حفظ نظم فردی',
        'مدال‌های دستاورد برنزی، نقره‌ای، طلایی و استادی بر اساس تداوم و رکوردها',
      ],
      quickStats: `سطح ${toPersianDigits(rpg.level)} · ${rpg.title} · ${toPersianDigits(rpg.xp)} XP`,
      cta: 'مشاهده تابلوی ماموریت‌های RPG',
    },
    {
      id: 'focus_leitner',
      targetTab: 'focus_timer' as NavTab,
      number: '۰۵',
      title: 'تایمر تمرکز عمیق و مرور فاصله‌دار لایتنر',
      tagline: 'ورود به وضعیت جریان ذهنی (Flow) و تثبیت ماندگار آموخته‌ها در حافظه بلندمدت',
      icon: Zap,
      color: 'from-cyan-500/20 to-blue-500/20 border-cyan-500/30 text-cyan-500',
      badge: 'روانشناسی یادگیری',
      highlights: [
        'تایمر تمرکز پومودورو با بازه‌های کار متمرکز ۲۵ دقیقه‌ای و استراحت‌های علمی',
        'الگوریتم مرور فاصله‌دار (Spaced Repetition) منطبق بر منحنی فراموشی ابینگهاوس',
        'آزمودن مباحث سخت و زمان‌بندی مرور خودکار برای ۱، ۲، ۴، ۸ و ۱۶ روز بعد',
        'سیستم پایش عادت‌های پایدار با زنجیره‌های آتشین (Habit Streaks)',
      ],
      quickStats: `${toPersianDigits(dueReviewsCount)} مبحث آماده مرور دوره‌ای`,
      cta: 'شروع تایمر تمرکز عمیق',
    },
    {
      id: 'analytics_cloud',
      targetTab: 'analytics' as NavTab,
      number: '۰۶',
      title: 'بنتو آمار، تقویم جلالی و همگام‌سازی ابری',
      tagline: 'بینش دقیق از عملکرد تحصیلی همراه با تقویم جامع شمسی و پایگاه داده امن',
      icon: BarChart3,
      color: 'from-rose-500/20 to-red-500/20 border-rose-500/30 text-rose-500',
      badge: 'امنیت و استقلال کامل',
      highlights: [
        'کارت‌های تحلیلی بنتو (Analytics Bento) برای پایش ساعات مطالعه، توزیع دروس و بهره‌وری',
        'تقویم ماهانه و هفتگی شمسی با رویدادهای ملی، امتحانات و یادداشت‌های روز',
        'ذخیره‌سازی محلی سریع بدون وابستگی به اینترنت همراه با پشتیبان‌گیری ابری و خروجی CSV',
        'سطل بازیافت هوشمند با قابلیت بازگردانی تمام موارد حذف‌شده تا ۱۰۰ رکورد',
      ],
      quickStats: `${toPersianDigits(studySessions.length)} سشن مطالعه ثبت‌شده`,
      cta: 'مشاهده آمار و گزارش‌های عملکرد',
    },
  ];

  // Daily Routine steps
  const routineSteps = [
    {
      time: 'صبحگاه',
      icon: Sun,
      color: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
      title: 'شروع شفاف و متمرکز',
      action: 'تنظیم اولویت‌ها',
      desc: 'نگاه سریع به زنگ‌های کلاسی مدرسه، مشخص کردن ۲ اولویت طلایی در برنامه‌ریز و شروع روز با آرامش ذهنی.',
      tab: 'daily_planner' as NavTab,
    },
    {
      time: 'ظهر و عصر',
      icon: Zap,
      color: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
      title: 'یادگیری و اجرای عمیق',
      action: 'تمرکز پومودورو',
      desc: 'ثبت تکالیف جدید، راه‌اندازی تایمر ۲۵ دقیقه‌ای برای مطالعه دروس سخت و پیشبرد گام‌های نقشه راه مهارت‌ها.',
      tab: 'focus_timer' as NavTab,
    },
    {
      time: 'شامگاه',
      icon: Moon,
      color: 'text-purple-500 bg-purple-500/10 border-purple-500/20',
      title: 'بازتاب، پاداش و استراحت',
      action: 'ثبت امتیاز و مرور',
      desc: 'تیک زدن عادات روزانه، ارزیابی کیفیت روز، دریافت امتیاز تجربه (XP) و خوابیدن با خیال راحت برای فردا.',
      tab: 'habits' as NavTab,
    },
  ];

  // All 15 Quick Links grid
  const allModules = [
    { id: 'dashboard', label: 'داشبورد جامع', desc: 'نمای کلی پیشرفت، کوئست‌ها و ابزارک‌ها', icon: LayoutDashboard },
    { id: 'daily_planner', label: 'برنامه‌ریز روزانه', desc: 'کارهای روز، تخمین زمان و شبیه‌ساز فشار', icon: Clock },
    { id: 'school', label: 'مدرسه و درس‌ها', desc: 'جدول زنگ‌ها، مشق‌ها و کارنامه نمرات', icon: GraduationCap },
    { id: 'skills', label: 'توسعه مهارت‌ها', desc: 'نقشه راه مهارت‌ها و لاگ تمرین روزانه', icon: Sparkles },
    { id: 'projects', label: 'مدیریت پروژه‌ها', desc: 'میز سه‌بعدی کارت‌های شیشه‌ای پوشه‌ها', icon: FolderGit2 },
    { id: 'competitions', label: 'مسابقات و المپیاد', desc: 'آمادگی المپیاد و شمارش مسائل حل‌شده', icon: Trophy },
    { id: 'habits', label: 'عادت‌ها و استمرار', desc: 'ردیابی زنجیره استمرار و زنجیره آتشین', icon: Flame },
    { id: 'reviews', label: 'مرور فاصله‌دار', desc: 'جعبه لایتنر ابینگهاوس برای حافظه دائم', icon: Brain },
    { id: 'focus_timer', label: 'تایمر تمرکز', desc: 'سشن‌های پومودورو با امتیاز و ارزیابی', icon: Zap },
    { id: 'resources', label: 'کتابخانه منابع', desc: 'مرجع جزوات، کتاب‌ها و دوره‌های کاربردی', icon: BookOpen },
    { id: 'calendar', label: 'تقویم رویدادها', desc: 'تقویم کامل جلالی با رویدادها و امتحانات', icon: CalendarDays },
    { id: 'goals', label: 'اهداف و مرورها', desc: 'اهداف هفتگی، ماهانه و فصلی با اهرم‌بندی', icon: Target },
    { id: 'notes', label: 'یادداشت‌ها و وقایع', desc: 'ثبت ایده‌ها، مقالات و یادداشت‌های سنجاق‌شده', icon: FileText },
    { id: 'analytics', label: 'آمار و عملکرد', desc: 'بنتو چارت‌های تحلیل بازدهی و زمان مطالعه', icon: BarChart3 },
    { id: 'settings', label: 'تنظیمات و حساب', desc: 'شخصی‌سازی تم، فونت، بکاپ و حساب کاربری', icon: Settings },
  ];

  const currentPillarData = pillars[activePillar];

  return (
    <div className="w-full max-w-6xl mx-auto space-y-12 sm:space-y-16 animate-in fade-in duration-300" dir="rtl">
      {/* ----------------- 1. HERO SECTION ----------------- */}
      <section className="relative overflow-hidden rounded-[32px] p-6 sm:p-10 md:p-12 glass-strong border border-line shadow-2xl">
        {/* Decorative background glows */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-8">
          {/* Top Editorial Kicker */}
          <div className="flex flex-wrap items-center gap-3 text-xs text-muted">
            <span className="flex items-center gap-1.5 font-bold text-fg">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              سامانه الف (Alef Plans)
            </span>
            <span aria-hidden="true">·</span>
            <span>نسخه جامع تحصیلی و برنامه‌ریزی</span>
            <span aria-hidden="true">·</span>
            <span>تقویم خورشیدی {formatJalaliFull()}</span>
          </div>

          {/* Main Headline & Prose */}
          <div className="max-w-3xl space-y-4">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-fg tracking-tight leading-[1.25]">
              از <span className="text-amber-500 font-black">الف</span> آغاز کن؛
              <br />
              معمار روزها، درس‌ها و مهارت‌های خود باش.
            </h1>
            <p className="text-sm sm:text-base md:text-lg text-muted leading-relaxed font-normal">
              سامانه الف یک دستیار یکپارچه، هوشمند و منظم برای دانش‌آموزان و دانشجویان نخبه و افراد هدفمند است. ترکیب جدول زنگ‌ها و تکالیف، برنامه‌ریز روزانه با شبیه‌ساز فشار کاری، میز سه‌بعدی پروژه‌ها، گیمیفیکیشن Life RPG و تایمر تمرکز عمیق؛ تا بدون سردرگمی، هر روز یک گام به موفقیت نزدیک‌تر شوید.
            </p>
          </div>

          {/* Primary Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => onNavigate('daily_planner')}
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-fg text-bg font-bold text-sm shadow-lg hover:opacity-90 active:scale-95 transition-all cursor-pointer"
            >
              <Clock className="w-4 h-4" />
              <span>ورود به برنامه‌ریز روزانه</span>
              <ArrowLeft className="w-4 h-4" />
            </button>

            <button
              onClick={() => onNavigate('dashboard')}
              className="inline-flex items-center gap-2 px-5 py-3.5 rounded-2xl bg-surface hover:bg-chip border border-line text-fg font-semibold text-sm transition-all cursor-pointer active:scale-95 shadow-xs"
            >
              <LayoutDashboard className="w-4 h-4 text-blue-500" />
              <span>مشاهده داشبورد زنده</span>
            </button>

            <button
              onClick={() => onNavigate('projects')}
              className="inline-flex items-center gap-2 px-5 py-3.5 rounded-2xl bg-surface hover:bg-chip border border-line text-fg font-semibold text-sm transition-all cursor-pointer active:scale-95 shadow-xs"
            >
              <FolderGit2 className="w-4 h-4 text-purple-500" />
              <span>میز ۳D پروژه‌ها</span>
            </button>

            <button
              onClick={() => setIsRescueModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-3.5 rounded-2xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 font-semibold text-sm transition-all cursor-pointer active:scale-95"
              title="برای روزهای فشرده و بازسازی سریع برنامه"
            >
              <LifeBuoy className="w-4 h-4 text-amber-500" />
              <span>حالت اضطراری نجات روز</span>
            </button>
          </div>

          {/* Real Live Snapshot Bar */}
          <div className="pt-6 border-t border-line grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-3.5 rounded-2xl bg-surface/60 border border-line/60">
              <span className="text-[11px] font-medium text-muted block mb-1">لول و پیشرفت RPG</span>
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-bold text-fg">سطح {toPersianDigits(rpg.level)}</span>
                <span className="text-xs text-amber-500 font-semibold truncate">{rpg.title}</span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-surface/60 border border-line/60">
              <span className="text-[11px] font-medium text-muted block mb-1">تکالیف در انتظار</span>
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-bold text-fg">{toPersianDigits(pendingHw)}</span>
                <span className="text-xs text-muted">مورد برای انجام</span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-surface/60 border border-line/60">
              <span className="text-[11px] font-medium text-muted block mb-1">بیشترین استمرار تمرین</span>
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-bold text-fg">{toPersianDigits(maxStreak)}</span>
                <span className="text-xs text-emerald-500 font-semibold">روز متوالی 🔥</span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-surface/60 border border-line/60">
              <span className="text-[11px] font-medium text-muted block mb-1">تحقق اهداف من</span>
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-bold text-fg">{toPersianDigits(goalPercent)}٪</span>
                <span className="text-xs text-muted">{toPersianDigits(completedGoalsCount)} از {toPersianDigits(totalGoals)}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ----------------- 2. INTERACTIVE 6 PILLARS SHOWCASE ----------------- */}
      <section className="space-y-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-500">
            <Sparkles className="w-4 h-4" />
            <span>معماری شش‌گانه الف</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-fg tracking-tight">
            ویترین تعاملی ارکان الف؛ ابزارهای ساختاریافته برای هر نیاز
          </h2>
          <p className="text-sm text-muted max-w-2xl">
            برای بررسی عمیق هر بخش، روی کارت‌های زیر کلیک کنید و مستقیماً وارد ماژول‌های فعال برنامه شوید.
          </p>
        </div>

        {/* Tab Buttons (Horizontal scroll on mobile) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {pillars.map((p, idx) => {
            const IconComponent = p.icon;
            const isActive = activePillar === idx;
            return (
              <button
                key={p.id}
                onClick={() => setActivePillar(idx)}
                className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all cursor-pointer border ${
                  isActive
                    ? 'bg-fg text-bg border-fg shadow-md'
                    : 'bg-surface hover:bg-chip border-line text-muted hover:text-fg'
                }`}
              >
                <IconComponent className={`w-4 h-4 ${isActive ? 'text-bg' : 'text-muted'}`} />
                <span>{p.title.split(' ')[0]} {p.title.split(' ')[1] || ''}</span>
              </button>
            );
          })}
        </div>

        {/* Active Pillar Showcase Card */}
        <div className="p-6 sm:p-8 md:p-10 rounded-[28px] glass border border-line relative overflow-hidden transition-all duration-300">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
            <div className="space-y-6 flex-1 min-w-0">
              <div className="space-y-2">
                <div className="flex items-center gap-3 text-xs text-muted">
                  <span className="font-mono font-bold text-fg text-sm">{currentPillarData.number}</span>
                  <span aria-hidden="true">·</span>
                  <span className="font-semibold text-fg">{currentPillarData.badge}</span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-bold text-fg leading-tight">
                  {currentPillarData.title}
                </h3>
                <p className="text-sm sm:text-base text-muted leading-relaxed">
                  {currentPillarData.tagline}
                </p>
              </div>

              {/* Checklist of highlights */}
              <ul className="space-y-2.5">
                {currentPillarData.highlights.map((h, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-fg/90">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>{h}</span>
                  </li>
                ))}
              </ul>

              {/* Status and Action */}
              <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-line">
                <button
                  onClick={() => onNavigate(currentPillarData.targetTab)}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-fg text-bg font-bold text-sm shadow-md hover:opacity-90 active:scale-95 transition-all cursor-pointer"
                >
                  <span>{currentPillarData.cta}</span>
                  <ArrowLeft className="w-4 h-4" />
                </button>

                <div className="text-xs text-muted flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-fg" />
                  <span>وضعیت زنده شما: <strong className="text-fg font-semibold">{currentPillarData.quickStats}</strong></span>
                </div>
              </div>
            </div>

            {/* Visual Icon Badge */}
            <div className="hidden lg:flex flex-col items-center justify-center p-8 rounded-3xl bg-surface border border-line w-64 h-64 shrink-0 shadow-inner">
              {React.createElement(currentPillarData.icon, {
                className: 'w-24 h-24 text-fg stroke-[1.25] mb-4',
              })}
              <span className="text-xs font-semibold text-muted text-center">
                ماژول فعال در نسخه الف
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ----------------- 3. A DAY IN THE LIFE WITH ALEF ----------------- */}
      <section className="space-y-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-500">
            <Compass className="w-4 h-4" />
            <span>گردش کار روزانه</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-fg tracking-tight">
            یک روز ایده‌آل و منظم با الف چگونه پیش می‌رود؟
          </h2>
          <p className="text-sm text-muted max-w-2xl">
            ساده‌ترین و کارآمدترین روال روزانه برای رسیدن به اوج بهره‌وری و کاهش خستگی ذهنی.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {routineSteps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={idx}
                className="p-6 rounded-2xl glass border border-line flex flex-col justify-between space-y-4 hover:border-fg/40 transition-all group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-muted">{step.time}</span>
                    <div className={`p-2.5 rounded-xl border ${step.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-fg group-hover:text-amber-500 transition-colors">
                    {step.title}
                  </h3>
                  <p className="text-xs text-muted leading-relaxed">
                    {step.desc}
                  </p>
                </div>

                <button
                  onClick={() => onNavigate(step.tab)}
                  className="w-full inline-flex items-center justify-between px-4 py-2.5 rounded-xl bg-surface hover:bg-chip border border-line text-xs font-semibold text-fg transition-all cursor-pointer"
                >
                  <span>{step.action}</span>
                  <ArrowLeft className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* ----------------- 4. ALL 15 MODULES DIRECT ACCESS ----------------- */}
      <section className="space-y-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-purple-500">
            <Layers className="w-4 h-4" />
            <span>تمام امکانات در یک نگاه</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-fg tracking-tight">
            دسترسی سریع به تمام ۱۵ بخش سامانه الف
          </h2>
          <p className="text-sm text-muted max-w-2xl">
            هر ماژول به صورت مستقل و هماهنگ طراحی شده تا هیچ بخشی از زندگی تحصیلی و رشد فردی شما بی‌پاسخ نماند.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {allModules.map((m) => {
            const ModuleIcon = m.icon;
            return (
              <div
                key={m.id}
                onClick={() => onNavigate(m.id as NavTab)}
                className="p-4.5 rounded-2xl glass hover:bg-surface/90 border border-line hover:border-fg/40 transition-all cursor-pointer group flex items-start gap-3.5 active:scale-98"
              >
                <div className="p-2.5 rounded-xl bg-surface border border-line text-fg group-hover:scale-105 group-hover:bg-fg group-hover:text-bg transition-all shrink-0">
                  <ModuleIcon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-sm font-bold text-fg group-hover:text-amber-500 transition-colors truncate">
                      {m.label}
                    </h3>
                    <ChevronLeft className="w-4 h-4 text-muted group-hover:text-fg group-hover:-translate-x-1 transition-all shrink-0" />
                  </div>
                  <p className="text-xs text-muted leading-relaxed line-clamp-2 font-normal">
                    {m.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ----------------- 5. PHILOSOPHY & WHY ALEF ----------------- */}
      <section className="p-8 sm:p-10 rounded-[28px] glass border border-line space-y-6">
        <div className="space-y-2">
          <span className="text-xs font-bold text-muted">فلسفه طراحی</span>
          <h2 className="text-2xl font-bold text-fg">چرا نام این سامانه «الف» است؟</h2>
          <p className="text-sm text-muted leading-relaxed max-w-3xl">
            «الف» نخستین گام در هر یادگیری و آغازگر هر مسیر بزرگ است. این سامانه با هدف حذف سردرگمی‌ها، ایجاد انضباط فردی واقعی، ارزش‌گذاری به زمان گرانبهای دانش‌آموزان و دانشجویان، و تبدیل فرایند خسته‌کننده برنامه‌ریزی به یک سفر لذت‌بخش و ملموس خلق شده است.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-line text-xs">
          <div className="space-y-1.5">
            <strong className="text-fg font-bold block text-sm">۱. عملکرد بدون پیچیدگی</strong>
            <p className="text-muted leading-relaxed">
              تمام ابزارها بر اساس نیاز واقعی ساخته شده‌اند؛ بدون منوهای زائد و تبلیغات اضافه.
            </p>
          </div>
          <div className="space-y-1.5">
            <strong className="text-fg font-bold block text-sm">۲. بومی‌سازی واقعی با تقویم شمسی</strong>
            <p className="text-muted leading-relaxed">
              جدول زنگ‌ها، روزهای شنبه تا چهارشنبه، تعطیلات رسمی و ماه‌های خورشیدی بدون باگ‌های تاریخ میلادی.
            </p>
          </div>
          <div className="space-y-1.5">
            <strong className="text-fg font-bold block text-sm">۳. حریم خصوصی و ذخیره دائمی</strong>
            <p className="text-muted leading-relaxed">
              داده‌های شما هم در مرورگر به صورت آفلاین محفوظ می‌مانند و هم با حساب کاربری در پایگاه داده امن ذخیره می‌شوند.
            </p>
          </div>
        </div>
      </section>

      {/* ----------------- 6. INSPIRING FINAL CTA ----------------- */}
      <section className="p-8 sm:p-10 rounded-[30px] bg-gradient-to-br from-amber-500/10 via-surface to-blue-500/10 border border-line text-center space-y-6 shadow-xl">
        <div className="max-w-xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface border border-line text-xs font-semibold text-fg">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>آماده شروع یک روز منظم و پر از دستاورد؟</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-fg tracking-tight">
            برنامه‌ریزی امروز را از همین حالا آغاز کنید
          </h2>
          <p className="text-sm text-muted">
            کارهای مهم امروز را ثبت کنید، سشن تمرکز خود را بسنجید و با هر اقدام کوچک، امتیاز و پیشرفت کسب کنید.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={() => onNavigate('daily_planner')}
            className="px-6 py-3.5 rounded-2xl bg-fg text-bg font-bold text-sm shadow-lg hover:opacity-90 active:scale-95 transition-all cursor-pointer flex items-center gap-2"
          >
            <Clock className="w-4 h-4" />
            <span>شروع برنامه‌ریزی امروز</span>
            <ArrowLeft className="w-4 h-4" />
          </button>

          <button
            onClick={() => onNavigate('dashboard')}
            className="px-5 py-3.5 rounded-2xl bg-surface hover:bg-chip border border-line text-fg font-semibold text-sm transition-all cursor-pointer active:scale-95 shadow-xs"
          >
            <span>بازگشت به داشبورد</span>
          </button>
        </div>
      </section>
    </div>
  );
};
