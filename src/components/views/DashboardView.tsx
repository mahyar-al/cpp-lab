import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  CheckCircle2,
  Clock,
  GraduationCap,
  Sparkles,
  FolderGit2,
  Trophy,
  Target,
  ChevronLeft,
  Flame,
  AlertTriangle,
  RotateCcw,
  SlidersHorizontal,
  Plus,
  Activity,
  Check,
  X,
  BookOpen,
  Zap,
  BookMarked,
  Layers,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import {
  formatJalaliFull,
  getIranianDayOfWeek,
  getIranianDayName,
  toPersianDigits,
  getRelativeTimeString,
  toJalali,
  getJalaliMonthDays,
  getPersianMonthName,
} from '../../utils/jalali';
import { NavTab } from '../layout/Sidebar';
import { Habit, Priority, SectionType } from '../../types';

interface DashboardViewProps {
  onNavigate: (tab: NavTab) => void;
  onOpenQuickAdd: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigate, onOpenQuickAdd }) => {
  const {
    profile,
    subjects,
    weeklyCells,
    dayData,
    togglePostSchoolTask,
    homeworks,
    toggleHomework,
    studySessions,
    skills,
    projects,
    updateProjectTaskStatus,
    competitions,
    goals,
    habits,
    toggleHabitToday,
    addHabit,
    reviews,
    widgetConfig,
    updateWidgetConfig,
    rolloverOverdueTasks,
    activityLogs,
  } = useApp();

  const [showConfigModal, setShowConfigModal] = useState(false);
  const [showNewHabitModal, setShowNewHabitModal] = useState(false);
  const [newHabitTitle, setNewHabitTitle] = useState('');
  const [newHabitCategory, setNewHabitCategory] = useState<SectionType>('school');
  const [newHabitDays, setNewHabitDays] = useState(5);

  const today = new Date();
  const todayIso = today.toISOString().slice(0, 10);
  const currentIranianDayIdx = getIranianDayOfWeek(today);
  const isSchoolDay = currentIranianDayIdx >= 0 && currentIranianDayIdx <= 4;

  const todayBells = isSchoolDay
    ? [1, 2, 3, 4, 5].map((period) => {
        const cell = weeklyCells.find((c) => c.dayIndex === currentIranianDayIdx && c.period === period);
        const sub = subjects.find((s) => s.id === cell?.subjectId);
        const bellTime = profile.bellTimes.find((b) => b.period === period);
        return {
          period,
          bellTime: bellTime || { startTime: '08:00', endTime: '09:00', title: `زنگ ${period}` },
          subject: sub,
          subjectName: cell?.customSubjectName || sub?.name,
          room: cell?.room || sub?.room,
          color: cell?.color || sub?.color || '#00F5FF',
          notes: cell?.notes,
        };
      })
    : [];

  const overdueHomeworks = homeworks.filter((h) => !h.completed && h.dueDate < todayIso);
  const pendingHomeworks = homeworks.filter((h) => !h.completed);
  const dueReviews = reviews.filter((r) => r.nextReviewDate <= todayIso);

  // Today's Priority items
  const todayPriorities = [
    ...homeworks
      .filter((h) => !h.completed && h.dueDate <= todayIso)
      .map((h) => ({
        id: h.id,
        title: h.title,
        subtitle: `${h.subjectName} · تکلیف مدرسه`,
        estimatedMin: h.estimatedMinutes || 45,
        priority: h.priority,
        isOverdue: h.dueDate < todayIso,
        type: 'homework' as const,
        completed: h.completed,
      })),
    ...((dayData[currentIranianDayIdx]?.postSchoolTasks || [])
      .filter((t) => !t.completed)
      .map((t) => ({
        id: t.id,
        title: t.title,
        subtitle: 'برنامه برنامه‌ریز روزانه',
        estimatedMin: t.estimatedMinutes || 30,
        priority: t.priority,
        isOverdue: false,
        type: 'postSchoolTask' as const,
        completed: t.completed,
      }))),
    ...(projects.flatMap((p) =>
      p.tasks
        .filter((t) => t.status !== 'completed' && t.priority === 'high')
        .slice(0, 2)
        .map((t) => ({
          id: t.id,
          projectId: p.id,
          title: t.title,
          subtitle: `${p.title} · تسک پروژه`,
          estimatedMin: (t.estimatedHours || 2) * 60,
          priority: t.priority,
          isOverdue: false,
          type: 'projectTask' as const,
          completed: t.status === 'completed',
        }))
    )),
  ].sort((a, b) => (a.isOverdue ? -1 : b.isOverdue ? 1 : a.priority === 'high' ? -1 : 1));

  // Time metrics
  const totalRequiredMinutes = todayPriorities.reduce((acc, curr) => acc + curr.estimatedMin, 0);
  const totalRequiredHours = (totalRequiredMinutes / 60).toFixed(1);
  const schoolMinutes = isSchoolDay ? 360 : 0; // 6 hours school
  const wakingMinutes = 16 * 60; // 16 waking hours
  const freeMinutesRemaining = Math.max(0, wakingMinutes - schoolMinutes - totalRequiredMinutes);
  const freeHoursRemaining = (freeMinutesRemaining / 60).toFixed(1);
  const isOverloaded = totalRequiredMinutes > 360;

  // 7-day study chart
  const last7DaysChart = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const iso = d.toISOString().slice(0, 10);
    const dayName = getIranianDayName(d);
    const mins = studySessions.filter((s) => s.date === iso).reduce((acc, s) => acc + s.actualDurationMin, 0);
    return {
      dayName,
      date: iso,
      hours: +(mins / 60).toFixed(1),
      mins,
    };
  });
  const totalRecentMinutes = last7DaysChart.reduce((acc, d) => acc + d.mins, 0);
  const totalRecentHours = (totalRecentMinutes / 60).toFixed(1);
  const maxChartHours = Math.max(1, ...last7DaysChart.map((d) => d.hours));

  // Goals metric
  const weeklyGoals = goals.filter((g) => g.level === 'weekly');
  const completedWeeklyGoals = weeklyGoals.filter((g) => g.status === 'completed').length;
  const weeklyGoalsPercent = weeklyGoals.length > 0 ? Math.round((completedWeeklyGoals / weeklyGoals.length) * 100) : 0;

  // Next Competition
  const nextCompetition = competitions.slice().sort((a, b) => new Date(a.registrationDeadline).getTime() - new Date(b.registrationDeadline).getTime())[0];
  const daysToNextCompetition = nextCompetition
    ? Math.max(0, Math.ceil((new Date(nextCompetition.registrationDeadline).getTime() - today.getTime()) / (1000 * 60 * 60 * 24)))
    : null;

  // Jalali month
  const todayJalali = toJalali(today);
  const daysInCurrentJalaliMonth = getJalaliMonthDays(todayJalali.jy, todayJalali.jm);
  const monthName = getPersianMonthName(todayJalali.jm);

  // 4 Pillars Key Data Calculations
  const activeSkillsCount = skills.length;
  const totalSkillPracticeMinutes = skills.reduce(
    (sum, s) => sum + (s.practiceLogs || []).reduce((acc, p) => acc + (p.minutes || 0), 0),
    0
  );
  const totalSkillPracticeHours = (totalSkillPracticeMinutes / 60).toFixed(1);
  const avgSkillProgress =
    skills.length > 0
      ? Math.round(
          skills.reduce((sum, s) => {
            const total = s.roadmap.length || 1;
            const done = s.roadmap.filter((r) => r.completed).length;
            return sum + (done / total) * 100;
          }, 0) / skills.length
        )
      : 0;

  const activeProjects = projects.filter((p) => p.status !== 'completed');
  const pendingProjectTasks = projects.flatMap((p) => p.tasks).filter((t) => t.status !== 'completed').length;
  const avgProjectProgress =
    projects.length > 0
      ? Math.round(projects.reduce((acc, p) => acc + p.progressPercentage, 0) / projects.length)
      : 0;

  const allStreaks = [...(skills || []).map((s) => s.streak || 0), ...(habits || []).map((h) => h.streak || 0)];
  const maxStreak = Math.max(0, ...allStreaks);

  const hour = today.getHours();
  const greeting = hour < 12 ? 'صبح بخیر' : hour < 17 ? 'بعدازظهر بخیر' : 'عصر بخیر';

  const handleCreateHabit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHabitTitle.trim()) return;
    addHabit({
      title: newHabitTitle.trim(),
      category: newHabitCategory,
      targetDaysPerWeek: Number(newHabitDays) || 5,
    });
    setNewHabitTitle('');
    setShowNewHabitModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Futuristic Command Center Strip */}
      <div className="bg-white dark:bg-[#111827] rounded-2xl p-4 sm:p-6 border border-slate-200 dark:border-[#263247] shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-32 bg-cyan-500/5 dark:bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-32 bg-purple-500/5 dark:bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5 text-xs text-slate-500 dark:text-slate-400">
              <CalendarIcon className="w-3.5 h-3.5 text-cyan-500" />
              <span>{formatJalaliFull(today)}</span>
              <span aria-hidden="true">·</span>
              <span>روز {getIranianDayName(today)}</span>
              <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-mono bg-cyan-500/10 text-cyan-600 dark:text-[#00F5FF] border border-cyan-500/30">
                مرکز کنترل فعال
              </span>
            </div>
            <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-[#F1F5F9]">
              {greeting}، {profile.name || 'کاربر عزیز'}
            </h2>
            <p className="mt-1 text-xs md:text-sm text-slate-600 dark:text-[#94A3B8] max-w-xl leading-relaxed">
              مرکز فرماندهی هوشمند؛ {toPersianDigits(todayPriorities.length)} اولویت کاری برای امروز،{' '}
              {toPersianDigits(overdueHomeworks.length)} مورد نیازمند پیگیری و{' '}
              {toPersianDigits(weeklyGoals.length)} هدف هفتگی فعال ثبت شده است.
            </p>
          </div>

          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0 flex-wrap">
            <button
              onClick={() => setShowConfigModal(true)}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-[#172033] hover:bg-slate-200 dark:hover:bg-[#1f2b45] border border-slate-200 dark:border-[#263247] rounded-xl transition-all cursor-pointer whitespace-nowrap"
              title="شخصی‌سازی ویجت‌های داشبورد"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500 dark:text-cyan-400" />
              <span className="hidden sm:inline">تنظیم ویجت‌ها</span>
            </button>
            <button
              onClick={onOpenQuickAdd}
              className="flex items-center gap-1.5 px-3.5 sm:px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs rounded-xl shadow-[0_0_15px_rgba(0,245,255,0.35)] transition-all cursor-pointer whitespace-nowrap"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>+ ثبت سریع رویداد</span>
            </button>
          </div>
        </div>

        {/* Quick Launch Station Strip */}
        <div className="mt-5 pt-4 border-t border-slate-100 dark:border-[#263247] grid grid-cols-2 sm:grid-cols-5 gap-2 sm:gap-2.5">
          <button
            onClick={() => onNavigate('daily_planner')}
            className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-[#0D1220]/80 hover:bg-cyan-500/10 dark:hover:bg-[#172033] border border-slate-200 dark:border-[#263247] hover:border-cyan-500/40 text-slate-700 dark:text-slate-300 transition-all cursor-pointer group"
          >
            <div className="w-7 h-7 rounded-lg bg-cyan-500/15 text-cyan-600 dark:text-[#00F5FF] flex items-center justify-center shrink-0">
              <Clock className="w-3.5 h-3.5" />
            </div>
            <div className="text-right truncate">
              <div className="text-[11px] font-bold truncate group-hover:text-cyan-500 dark:group-hover:text-[#00F5FF]">برنامه‌ریز روزانه</div>
              <div className="text-[9px] text-slate-400">زمان‌بندی دقیق</div>
            </div>
          </button>

          <button
            onClick={() => onNavigate('focus_timer')}
            className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-[#0D1220]/80 hover:bg-cyan-500/10 dark:hover:bg-[#172033] border border-slate-200 dark:border-[#263247] hover:border-cyan-500/40 text-slate-700 dark:text-slate-300 transition-all cursor-pointer group"
          >
            <div className="w-7 h-7 rounded-lg bg-cyan-500/15 text-cyan-600 dark:text-[#00F5FF] flex items-center justify-center shrink-0">
              <Zap className="w-3.5 h-3.5" />
            </div>
            <div className="text-right truncate">
              <div className="text-[11px] font-bold truncate group-hover:text-cyan-500 dark:group-hover:text-[#00F5FF]">تایمر تمرکز</div>
              <div className="text-[9px] text-slate-400">پومودورو نئون</div>
            </div>
          </button>

          <button
            onClick={() => onNavigate('habits')}
            className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-[#0D1220]/80 hover:bg-amber-500/10 dark:hover:bg-[#172033] border border-slate-200 dark:border-[#263247] hover:border-amber-500/40 text-slate-700 dark:text-slate-300 transition-all cursor-pointer group"
          >
            <div className="w-7 h-7 rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <Flame className="w-3.5 h-3.5" />
            </div>
            <div className="text-right truncate">
              <div className="text-[11px] font-bold truncate group-hover:text-amber-500">سیستم عادت‌ها</div>
              <div className="text-[9px] text-slate-400">{toPersianDigits(habits.length)} عادت تعریف‌شده</div>
            </div>
          </button>

          <button
            onClick={() => onNavigate('reviews')}
            className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-[#0D1220]/80 hover:bg-indigo-500/10 dark:hover:bg-[#172033] border border-slate-200 dark:border-[#263247] hover:border-indigo-500/40 text-slate-700 dark:text-slate-300 transition-all cursor-pointer group"
          >
            <div className="w-7 h-7 rounded-lg bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
              <RotateCcw className="w-3.5 h-3.5" />
            </div>
            <div className="text-right truncate">
              <div className="text-[11px] font-bold truncate group-hover:text-indigo-400">مرور فاصله‌دار</div>
              <div className="text-[9px] text-slate-400">{dueReviews.length > 0 ? `${toPersianDigits(dueReviews.length)} موعد امروز` : 'به‌روز'}</div>
            </div>
          </button>

          <button
            onClick={() => onNavigate('resources')}
            className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-[#0D1220]/80 hover:bg-teal-500/10 dark:hover:bg-[#172033] border border-slate-200 dark:border-[#263247] hover:border-teal-500/40 text-slate-700 dark:text-slate-300 transition-all cursor-pointer group col-span-2 sm:col-span-1"
          >
            <div className="w-7 h-7 rounded-lg bg-teal-500/15 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0">
              <BookOpen className="w-3.5 h-3.5" />
            </div>
            <div className="text-right truncate">
              <div className="text-[11px] font-bold truncate group-hover:text-teal-400">کتابخانه منابع</div>
              <div className="text-[9px] text-slate-400">کتب و دوره‌ها</div>
            </div>
          </button>
        </div>
      </div>

      {/* Due Spaced Repetitions Prompt Banner if any */}
      {dueReviews.length > 0 && (
        <div className="p-3.5 sm:p-4 rounded-xl bg-indigo-500/10 dark:bg-indigo-950/30 border border-indigo-500/30 dark:border-indigo-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 shadow-[0_0_15px_-3px_rgba(99,102,241,0.25)]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
              <RotateCcw className="w-4 h-4 animate-spin" style={{ animationDuration: '6s' }} />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900 dark:text-indigo-200">
                {toPersianDigits(dueReviews.length)} مبحث آموزشی به موعد مرور تکرار فاصله‌دار (Spaced Repetition) رسیده‌اند
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                تثبیت حافظه بلندمدت با مرور به موقع بازدهی یادگیری شما را چندین برابر می‌کند.
              </div>
            </div>
          </div>
          <button
            onClick={() => onNavigate('reviews')}
            className="px-3.5 py-2 sm:py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shrink-0 cursor-pointer shadow-sm text-center"
          >
            ورود به مرورها
          </button>
        </div>
      )}

      {/* 4 Core Pillars KPI Cards — School, Skills, Projects, Competitions */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Pillar 1: School (مدرسه و درس‌ها) — Electric Cyan */}
        <div
          onClick={() => onNavigate('school')}
          className="relative p-4 bg-white dark:bg-[#0D1222] rounded-2xl border border-slate-200 dark:border-cyan-500/20 hover:border-cyan-500/50 hover:shadow-[0_0_25px_-5px_rgba(6,182,212,0.3)] transition-all duration-200 cursor-pointer group overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 dark:bg-cyan-500/10 rounded-full blur-xl pointer-events-none" />
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-2.5">
            <span className="font-medium">مدرسه و درس‌ها</span>
            <div className="p-2 rounded-xl bg-cyan-500/10 dark:bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.25)]">
              <GraduationCap className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-black font-mono tabular-nums text-slate-900 dark:text-white">
              {toPersianDigits(pendingHomeworks.length)}
            </span>
            <span className="text-xs text-cyan-600 dark:text-cyan-400 font-bold flex items-center gap-0.5 group-hover:-translate-x-1 transition-transform">
              ورود <ChevronLeft className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800/80">
            <span>تکالیف در دست انجام</span>
            {overdueHomeworks.length > 0 ? (
              <span className="text-rose-500 font-bold font-mono tabular-nums">
                {toPersianDigits(overdueHomeworks.length)} عقب‌افتاده
              </span>
            ) : (
              <span className="text-emerald-500 dark:text-emerald-400 font-medium">به‌روز</span>
            )}
          </div>
        </div>

        {/* Pillar 2: Skills (توسعه مهارت‌ها) — Radiant Violet */}
        <div
          onClick={() => onNavigate('skills')}
          className="relative p-4 bg-white dark:bg-[#0D1222] rounded-2xl border border-slate-200 dark:border-purple-500/20 hover:border-purple-500/50 hover:shadow-[0_0_25px_-5px_rgba(168,85,247,0.3)] transition-all duration-200 cursor-pointer group overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 dark:bg-purple-500/10 rounded-full blur-xl pointer-events-none" />
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-2.5">
            <span className="font-medium">توسعه مهارت‌ها</span>
            <div className="p-2 rounded-xl bg-purple-500/10 dark:bg-purple-500/15 text-purple-600 dark:text-purple-400 shadow-[0_0_12px_rgba(168,85,247,0.25)]">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-black font-mono tabular-nums text-slate-900 dark:text-white">
              {toPersianDigits(activeSkillsCount)}
            </span>
            <span className="text-xs text-purple-600 dark:text-purple-400 font-bold flex items-center gap-0.5 group-hover:-translate-x-1 transition-transform">
              نقشه‌راه <ChevronLeft className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800/80">
            <span>میانگین پیشرفت: <strong className="font-mono tabular-nums text-purple-400">{toPersianDigits(avgSkillProgress)}٪</strong></span>
            <span className="font-mono tabular-nums">{toPersianDigits(totalSkillPracticeHours)}h تمرین</span>
          </div>
        </div>

        {/* Pillar 3: Projects (پروژه‌ها و کانبان) — Electric Blue */}
        <div
          onClick={() => onNavigate('projects')}
          className="relative p-4 bg-white dark:bg-[#0D1222] rounded-2xl border border-slate-200 dark:border-blue-500/20 hover:border-blue-500/50 hover:shadow-[0_0_25px_-5px_rgba(59,130,246,0.3)] transition-all duration-200 cursor-pointer group overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 dark:bg-blue-500/10 rounded-full blur-xl pointer-events-none" />
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-2.5">
            <span className="font-medium">پروژه‌ها و کانبان</span>
            <div className="p-2 rounded-xl bg-blue-500/10 dark:bg-blue-500/15 text-blue-600 dark:text-blue-400 shadow-[0_0_12px_rgba(59,130,246,0.25)]">
              <FolderGit2 className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-black font-mono tabular-nums text-slate-900 dark:text-white">
              {toPersianDigits(activeProjects.length)}
            </span>
            <span className="text-xs text-blue-600 dark:text-blue-400 font-bold flex items-center gap-0.5 group-hover:-translate-x-1 transition-transform">
              کانبان <ChevronLeft className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800/80">
            <span>پیشرفت کل: <strong className="font-mono tabular-nums text-blue-400">{toPersianDigits(avgProjectProgress)}٪</strong></span>
            <span className="font-mono tabular-nums">{toPersianDigits(pendingProjectTasks)} تسک فعال</span>
          </div>
        </div>

        {/* Pillar 4: Competitions (مسابقات و المپیاد) — Neon Amber */}
        <div
          onClick={() => onNavigate('competitions')}
          className="relative p-4 bg-white dark:bg-[#0D1222] rounded-2xl border border-slate-200 dark:border-amber-500/20 hover:border-amber-500/50 hover:shadow-[0_0_25px_-5px_rgba(245,158,11,0.3)] transition-all duration-200 cursor-pointer group overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 dark:bg-amber-500/10 rounded-full blur-xl pointer-events-none" />
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-2.5">
            <span className="font-medium">مسابقات و المپیاد</span>
            <div className="p-2 rounded-xl bg-amber-500/10 dark:bg-amber-500/15 text-amber-600 dark:text-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.25)]">
              <Trophy className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-black font-mono tabular-nums text-slate-900 dark:text-white">
              {daysToNextCompetition !== null ? `${toPersianDigits(daysToNextCompetition)} روز` : '—'}
            </span>
            <span className="text-xs text-amber-600 dark:text-amber-400 font-bold flex items-center gap-0.5 group-hover:-translate-x-1 transition-transform">
              آمادگی <ChevronLeft className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800/80 truncate">
            <span className="truncate">{nextCompetition ? nextCompetition.title : 'رویداد ثبت‌شده'}</span>
            <span className="font-mono tabular-nums text-amber-500 shrink-0">موعد بعدی</span>
          </div>
        </div>
      </div>

      {/* Secondary Performance Telemetry Ribbon */}
      <div className="p-3 bg-white/80 dark:bg-[#0D1222]/80 backdrop-blur-md rounded-2xl border border-slate-200 dark:border-slate-800/80 grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
        <div className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-50 dark:bg-[#121829] border border-slate-100 dark:border-slate-800/60">
          <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 shrink-0">
            <Target className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">تحقق اهداف هفتگی</div>
            <div className="font-mono font-bold text-slate-900 dark:text-emerald-400 tabular-nums">
              {toPersianDigits(weeklyGoalsPercent)}٪ ({toPersianDigits(completedWeeklyGoals)} از {toPersianDigits(weeklyGoals.length)})
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-50 dark:bg-[#121829] border border-slate-100 dark:border-slate-800/60">
          <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-500 dark:text-purple-400 shrink-0">
            <Clock className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">ساعت مطالعه ۷ روز اخیر</div>
            <div className="font-mono font-bold text-slate-900 dark:text-purple-400 tabular-nums">
              {toPersianDigits(totalRecentHours)} ساعت تمرکزی
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-50 dark:bg-[#121829] border border-slate-100 dark:border-slate-800/60">
          <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-500 dark:text-amber-400 shrink-0">
            <Flame className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">استمرار یادگیری متوالی</div>
            <div className="font-mono font-bold text-slate-900 dark:text-amber-400 tabular-nums">
              {toPersianDigits(maxStreak)} روز متوالی
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-50 dark:bg-[#121829] border border-slate-100 dark:border-slate-800/60">
          <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-500 dark:text-cyan-400 shrink-0">
            <Zap className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">زمان آزاد باقیمانده امروز</div>
            <div className="font-mono font-bold text-slate-900 dark:text-cyan-400 tabular-nums">
              {toPersianDigits(freeHoursRemaining)} ساعت آزاد
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Left 2 Cols (Tasks, Schedule & Habits), Right 1 Col (Calendar & Snapshots) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* 1. Today's Priority Section (اولویت امروز) */}
          {widgetConfig.showTodayPriority && (
            <div className="bg-white dark:bg-[#111827] rounded-xl p-5 border border-slate-200 dark:border-[#263247] shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 mb-4 border-b border-slate-100 dark:border-[#263247] gap-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-cyan-500 dark:text-[#00F5FF]" />
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    اولویت‌های امروز (وظایف کلیدی)
                  </h3>
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-mono tabular-nums">
                    ({toPersianDigits(todayPriorities.length)} مورد · تخمین {toPersianDigits(totalRequiredHours)} ساعت)
                  </span>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {overdueHomeworks.length > 0 && (
                    <button
                      onClick={rolloverOverdueTasks}
                      className="flex items-center gap-1 text-xs text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2.5 py-1 rounded-lg border border-amber-200 dark:border-amber-900/50 hover:bg-amber-100 dark:hover:bg-amber-900/60 transition-colors cursor-pointer"
                      title="انتقال کارهای عقب‌افتاده به موعد امروز"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>انتقال عقب‌افتاده‌ها</span>
                    </button>
                  )}
                  <span className="text-xs text-slate-400 dark:text-slate-400">
                    زمان آزاد روز: <span className="font-mono tabular-nums text-slate-700 dark:text-slate-200 font-bold">{toPersianDigits(freeHoursRemaining)} ساعت</span>
                  </span>
                </div>
              </div>

              {/* Overload Alert */}
              {isOverloaded && (
                <div className="mb-4 p-3 bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-lg flex items-start gap-2.5 text-xs text-amber-800 dark:text-amber-300">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-500" />
                  <div className="leading-relaxed">
                    برنامه امروز شما بیش از {toPersianDigits(totalRequiredHours)} ساعت کار تمرکزی دارد. برای پیشگیری از خستگی، می‌توانید کارهای کم‌اهمیت‌تر را به روزهای بعد موکول کنید.
                  </div>
                </div>
              )}

              {/* Task Items */}
              <div className="space-y-2">
                {todayPriorities.length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-400 dark:text-slate-500">
                    عالی است! هیچ وظیفه یا تکلیف معوقه‌ای برای امروز ندارید. از دکمه «+ ثبت سریع» می‌توانید وظیفه جدید بیفزایید.
                  </div>
                ) : (
                  todayPriorities.map((item) => (
                    <div
                      key={item.id}
                      className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                        item.isOverdue
                          ? 'bg-rose-50/40 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/50'
                          : 'bg-white dark:bg-[#172033]/60 border-slate-200 dark:border-[#263247] hover:border-slate-300 dark:hover:border-cyan-500/30'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <input
                          type="checkbox"
                          checked={item.completed}
                          onChange={() => {
                            if (item.type === 'homework') {
                              toggleHomework(item.id);
                            } else if (item.type === 'postSchoolTask') {
                              togglePostSchoolTask(currentIranianDayIdx, item.id);
                            } else if (item.type === 'projectTask' && (item as any).projectId) {
                              updateProjectTaskStatus(
                                (item as any).projectId,
                                item.id,
                                item.completed ? 'todo' : 'completed'
                              );
                            }
                          }}
                          className="w-4 h-4 text-cyan-500 rounded border-slate-300 dark:border-slate-600 cursor-pointer accent-cyan-500"
                        />
                        <div className="min-w-0">
                          <p className={`text-xs font-semibold truncate ${item.completed ? 'line-through text-slate-400 dark:text-slate-500' : 'text-slate-800 dark:text-[#F1F5F9]'}`}>
                            {item.title}
                          </p>
                          <div className="flex items-center gap-2 text-[11px] text-slate-400 dark:text-slate-400 mt-0.5">
                            <span>{item.subtitle}</span>
                            <span aria-hidden="true">·</span>
                            <span className="font-mono tabular-nums">تخمین: {toPersianDigits(item.estimatedMin)} دقیقه</span>
                            {item.isOverdue && (
                              <>
                                <span aria-hidden="true">·</span>
                                <span className="text-rose-500 dark:text-rose-400 font-bold">عقب‌افتاده</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`text-[11px] font-medium px-2 py-0.5 rounded-md ${
                          item.priority === 'high'
                            ? 'bg-rose-500/10 text-rose-500 border border-rose-500/30'
                            : item.priority === 'medium'
                            ? 'bg-amber-500/10 text-amber-500 border border-amber-500/30'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                        }`}>
                          {item.priority === 'high' ? 'فوری' : item.priority === 'medium' ? 'متوسط' : 'عادی'}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* 2. Today's School Schedule */}
          {widgetConfig.showTodaySchedule && (
            <div className="bg-white dark:bg-[#111827] rounded-xl p-5 border border-slate-200 dark:border-[#263247] shadow-sm">
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100 dark:border-[#263247]">
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-blue-500" />
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    برنامه زنگ‌های مدرسه امروز ({getIranianDayName(today)})
                  </h3>
                </div>
                <button
                  onClick={() => onNavigate('school')}
                  className="text-xs text-cyan-600 dark:text-[#00F5FF] hover:underline flex items-center gap-0.5 cursor-pointer"
                >
                  جدول هفتگی مدرسه <ChevronLeft className="w-3.5 h-3.5" />
                </button>
              </div>

              {isSchoolDay ? (
                <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5">
                  {todayBells.map((bell) => (
                    <div
                      key={bell.period}
                      className="p-3 rounded-xl border border-slate-100 dark:border-[#263247] bg-slate-50/70 dark:bg-[#172033]/60 flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                          <span>زنگ {toPersianDigits(bell.period)}</span>
                          <span className="font-mono tabular-nums text-[10px]">{toPersianDigits(bell.bellTime.startTime)}</span>
                        </div>
                        <div className="font-bold text-xs text-slate-800 dark:text-slate-100 truncate">
                          {bell.subjectName || '— بدون درس —'}
                        </div>
                      </div>
                      <div className="mt-2 pt-2 border-t border-slate-200/50 dark:border-[#263247] flex items-center justify-between text-[10px] text-slate-400">
                        <span>{bell.room || 'کلاس'}</span>
                        <span className="w-2 h-2 rounded-full shadow-[0_0_8px_currentColor]" style={{ backgroundColor: bell.color, color: bell.color }} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-6 text-center text-xs text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-[#172033]/30 rounded-xl">
                  امروز روز تعطیل است. زمان مناسبی برای مطالعه عمیق، استراحت یا پیگیری پروژه‌های مهارتی است.
                </div>
              )}
            </div>
          )}

          {/* 3. Habit Tracker Widget (پیگیری عادت‌ها) */}
          {widgetConfig.showHabits && (
            <div className="bg-white dark:bg-[#111827] rounded-xl p-5 border border-slate-200 dark:border-[#263247] shadow-sm">
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100 dark:border-[#263247]">
                <div className="flex items-center gap-2">
                  <Flame className="w-4 h-4 text-amber-500" />
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    پیگیری عادت‌های امروز
                  </h3>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setShowNewHabitModal(true)}
                    className="text-xs text-cyan-600 dark:text-[#00F5FF] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>عادت جدید</span>
                  </button>
                  <button
                    onClick={() => onNavigate('habits')}
                    className="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 flex items-center gap-0.5 cursor-pointer"
                  >
                    نمای کامل <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {habits.length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-400 dark:text-slate-500">
                  هنوز عادتی تعریف نشده است. با دکمه «+ عادت جدید» عادت‌هایی مثل مطالعه روزانه، کدنویسی یا ورزش را ثبت کنید.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {habits.map((habit) => {
                    const isDoneToday = habit.completedDates.includes(todayIso);
                    return (
                      <div
                        key={habit.id}
                        className={`p-3 rounded-xl border transition-all flex items-center justify-between ${
                          isDoneToday
                            ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-900/50'
                            : 'bg-white dark:bg-[#172033]/50 border-slate-200 dark:border-[#263247]'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <button
                            onClick={() => toggleHabitToday(habit.id)}
                            className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all shrink-0 cursor-pointer ${
                              isDoneToday
                                ? 'bg-emerald-500 text-slate-950 shadow-[0_0_10px_rgba(57,255,136,0.4)]'
                                : 'border border-slate-300 dark:border-slate-600 text-transparent hover:border-cyan-400'
                            }`}
                          >
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          </button>
                          <div className="min-w-0">
                            <p className={`text-xs font-semibold truncate ${isDoneToday ? 'line-through text-slate-400 dark:text-slate-500' : 'text-slate-800 dark:text-[#F1F5F9]'}`}>
                              {habit.title}
                            </p>
                            <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                              <span>هدف: {toPersianDigits(habit.targetDaysPerWeek)} روز/هفته</span>
                              <span aria-hidden="true">·</span>
                              <span className="flex items-center gap-0.5 text-amber-500 font-mono tabular-nums font-bold">
                                <Flame className="w-3 h-3" /> {toPersianDigits(habit.streak)} روز استمرار
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* 4. Weekly Study Hours Graph */}
          {widgetConfig.showStudyHoursChart && (
            <div className="bg-white dark:bg-[#111827] rounded-xl p-5 border border-slate-200 dark:border-[#263247] shadow-sm">
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100 dark:border-[#263247]">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-purple-400" />
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    روند ساعت مطالعه در ۷ روز اخیر
                  </h3>
                </div>
                <span className="text-xs text-slate-400 font-mono tabular-nums">
                  مجموع: <span className="text-purple-400 font-bold">{toPersianDigits(totalRecentHours)}</span> ساعت
                </span>
              </div>

              <div className="flex items-end justify-between gap-2 h-36 pt-4 px-2">
                {last7DaysChart.map((d, idx) => {
                  const heightPercent = Math.round((d.hours / maxChartHours) * 100);
                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                      <span className="text-[10px] font-mono tabular-nums text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                        {toPersianDigits(d.hours)}h
                      </span>
                      <div className="w-full max-w-[32px] bg-slate-100 dark:bg-[#172033] rounded-t-lg overflow-hidden flex items-end h-24">
                        <div
                          className="w-full bg-gradient-to-t from-blue-600 via-cyan-500 to-[#00F5FF] hover:brightness-110 transition-all rounded-t-lg shadow-[0_0_10px_rgba(0,245,255,0.3)]"
                          style={{ height: `${Math.max(6, heightPercent)}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 truncate max-w-full">
                        {d.dayName.slice(0, 3)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Mini Calendar, Skills & Projects Snapshots, Recent Activity */}
        <div className="space-y-6">
          {/* Mini Shamsi Calendar */}
          {widgetConfig.showMiniCalendar && (
            <div className="bg-white dark:bg-[#111827] rounded-xl p-5 border border-slate-200 dark:border-[#263247] shadow-sm">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 dark:border-[#263247]">
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  تقویم {monthName} {toPersianDigits(todayJalali.jy)}
                </span>
                <button
                  onClick={() => onNavigate('calendar')}
                  className="text-xs text-cyan-600 dark:text-[#00F5FF] hover:underline flex items-center gap-0.5 cursor-pointer"
                >
                  تقویم کامل <ChevronLeft className="w-3 h-3" />
                </button>
              </div>

              <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-semibold text-slate-400 mb-2">
                <span>ش</span>
                <span>ی</span>
                <span>د</span>
                <span>س</span>
                <span>چ</span>
                <span>پ</span>
                <span>ج</span>
              </div>

              <div className="grid grid-cols-7 gap-1 text-center text-xs">
                {Array.from({ length: daysInCurrentJalaliMonth }).map((_, i) => {
                  const dayNum = i + 1;
                  const isCurrent = dayNum === todayJalali.jd;
                  return (
                    <div
                      key={dayNum}
                      className={`h-7 flex items-center justify-center rounded-lg font-mono tabular-nums text-[11px] transition-colors ${
                        isCurrent
                          ? 'bg-gradient-to-tr from-cyan-500 to-blue-600 text-slate-950 font-bold shadow-[0_0_10px_rgba(0,245,255,0.4)]'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#172033]'
                      }`}
                    >
                      {toPersianDigits(dayNum)}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 4 Pillars Snapshot */}
          {widgetConfig.showSectionProgress && (
            <>
              {/* Active Skills Snapshot */}
              <div className="bg-white dark:bg-[#111827] rounded-xl p-5 border border-slate-200 dark:border-[#263247] shadow-sm">
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 dark:border-[#263247]">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-[#39FF88]" />
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      مسیر یادگیری مهارت‌ها
                    </span>
                  </div>
                  <button
                    onClick={() => onNavigate('skills')}
                    className="text-xs text-cyan-600 dark:text-[#00F5FF] hover:underline cursor-pointer"
                  >
                    تمام مهارت‌ها
                  </button>
                </div>

                <div className="space-y-3">
                  {skills.length === 0 ? (
                    <div className="py-4 text-center text-xs text-slate-400 dark:text-slate-500">
                      هنوز مهارتی تعریف نشده است.
                    </div>
                  ) : (
                    skills.slice(0, 3).map((skill) => {
                      const totalSteps = skill.roadmap.length;
                      const doneSteps = skill.roadmap.filter((r) => r.completed).length;
                      const percent = totalSteps > 0 ? Math.round((doneSteps / totalSteps) * 100) : 0;
                      return (
                        <div key={skill.id} className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                              {skill.name}
                            </span>
                            <span className="font-mono tabular-nums text-slate-400 text-[11px] font-bold">
                              {toPersianDigits(percent)}٪
                            </span>
                          </div>
                          <div className="w-full bg-slate-100 dark:bg-[#172033] h-1.5 rounded-full overflow-hidden">
                            <div
                              className="bg-emerald-500 h-full rounded-full shadow-[0_0_8px_rgba(57,255,136,0.3)]"
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Active Projects Snapshot */}
              <div className="bg-white dark:bg-[#111827] rounded-xl p-5 border border-slate-200 dark:border-[#263247] shadow-sm">
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 dark:border-[#263247]">
                  <div className="flex items-center gap-1.5">
                    <FolderGit2 className="w-4 h-4 text-purple-400" />
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      وضعیت پروژه‌های فعال
                    </span>
                  </div>
                  <button
                    onClick={() => onNavigate('projects')}
                    className="text-xs text-cyan-600 dark:text-[#00F5FF] hover:underline cursor-pointer"
                  >
                    برد کانبان
                  </button>
                </div>

                <div className="space-y-3">
                  {projects.length === 0 ? (
                    <div className="py-4 text-center text-xs text-slate-400 dark:text-slate-500">
                      هنوز پروژه‌ای ثبت نشده است.
                    </div>
                  ) : (
                    projects.slice(0, 2).map((proj) => (
                      <div
                        key={proj.id}
                        onClick={() => onNavigate('projects')}
                        className="p-3 rounded-xl border border-slate-100 dark:border-[#263247] bg-slate-50/50 dark:bg-[#172033]/50 hover:border-purple-500/40 cursor-pointer transition-all"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                            {proj.title}
                          </span>
                          <span className="text-[10px] font-mono tabular-nums text-purple-500 dark:text-[#C084FC] font-bold">
                            {toPersianDigits(proj.progressPercentage)}٪
                          </span>
                        </div>
                        <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-purple-500 h-full rounded-full shadow-[0_0_8px_rgba(168,85,247,0.3)]"
                            style={{ width: `${proj.progressPercentage}%` }}
                          />
                        </div>
                        <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400">
                          <span className="font-mono tabular-nums">{toPersianDigits(proj.tasks.length)} وظیفه</span>
                          <span>موعد: {getRelativeTimeString(proj.deadline)}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>
          )}

          {/* Recent Activity Feed */}
          {widgetConfig.showRecentActivity && (
            <div className="bg-white dark:bg-[#111827] rounded-xl p-5 border border-slate-200 dark:border-[#263247] shadow-sm">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 dark:border-[#263247]">
                <div className="flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-cyan-400" />
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    فعالیت‌های اخیر
                  </span>
                </div>
              </div>

              <div className="space-y-2.5">
                {activityLogs.length === 0 ? (
                  <div className="py-4 text-center text-xs text-slate-400 dark:text-slate-500">
                    هنوز فعالیتی ثبت نشده است.
                  </div>
                ) : (
                  activityLogs.slice(0, 5).map((log) => (
                    <div key={log.id} className="text-xs flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 shrink-0 shadow-[0_0_6px_rgba(0,245,255,0.6)]" />
                      <div className="min-w-0">
                        <p className="text-slate-700 dark:text-[#94A3B8] text-[11px] leading-relaxed">
                          {log.description}
                        </p>
                        <span className="text-[10px] text-slate-400 font-mono tabular-nums">
                          {new Date(log.timestamp).toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Widget Customization Modal */}
      {showConfigModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#111827] rounded-2xl max-w-md w-full p-6 border border-slate-200 dark:border-[#263247] shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#263247] pb-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                شخصی‌سازی ویجت‌های داشبورد
              </h3>
              <button
                onClick={() => setShowConfigModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              ویجت‌هایی را که مایلید در صفحه اصلی داشبورد نمایش داده شوند، فعال یا غیرفعال کنید:
            </p>

            <div className="space-y-2.5">
              <label className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 dark:border-[#263247] hover:bg-slate-50 dark:hover:bg-[#172033]/50 cursor-pointer">
                <span className="text-xs font-medium text-slate-800 dark:text-slate-200">
                  اولویت‌های کلیدی امروز (وظایف و مهلت‌ها)
                </span>
                <input
                  type="checkbox"
                  checked={widgetConfig.showTodayPriority}
                  onChange={(e) => updateWidgetConfig({ showTodayPriority: e.target.checked })}
                  className="w-4 h-4 text-cyan-500 rounded accent-cyan-500"
                />
              </label>

              <label className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 dark:border-[#263247] hover:bg-slate-50 dark:hover:bg-[#172033]/50 cursor-pointer">
                <span className="text-xs font-medium text-slate-800 dark:text-slate-200">
                  برنامه زنگ‌های روز مدرسه
                </span>
                <input
                  type="checkbox"
                  checked={widgetConfig.showTodaySchedule}
                  onChange={(e) => updateWidgetConfig({ showTodaySchedule: e.target.checked })}
                  className="w-4 h-4 text-cyan-500 rounded accent-cyan-500"
                />
              </label>

              <label className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 dark:border-[#263247] hover:bg-slate-50 dark:hover:bg-[#172033]/50 cursor-pointer">
                <span className="text-xs font-medium text-slate-800 dark:text-slate-200">
                  پیگیری عادت‌ها و استریک‌های روزانه
                </span>
                <input
                  type="checkbox"
                  checked={widgetConfig.showHabits}
                  onChange={(e) => updateWidgetConfig({ showHabits: e.target.checked })}
                  className="w-4 h-4 text-cyan-500 rounded accent-cyan-500"
                />
              </label>

              <label className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 dark:border-[#263247] hover:bg-slate-50 dark:hover:bg-[#172033]/50 cursor-pointer">
                <span className="text-xs font-medium text-slate-800 dark:text-slate-200">
                  نمودار ساعات مطالعه ۷ روز اخیر
                </span>
                <input
                  type="checkbox"
                  checked={widgetConfig.showStudyHoursChart}
                  onChange={(e) => updateWidgetConfig({ showStudyHoursChart: e.target.checked })}
                  className="w-4 h-4 text-cyan-500 rounded accent-cyan-500"
                />
              </label>

              <label className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 dark:border-[#263247] hover:bg-slate-50 dark:hover:bg-[#172033]/50 cursor-pointer">
                <span className="text-xs font-medium text-slate-800 dark:text-slate-200">
                  تقویمچه شمسی کوچک
                </span>
                <input
                  type="checkbox"
                  checked={widgetConfig.showMiniCalendar}
                  onChange={(e) => updateWidgetConfig({ showMiniCalendar: e.target.checked })}
                  className="w-4 h-4 text-cyan-500 rounded accent-cyan-500"
                />
              </label>

              <label className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 dark:border-[#263247] hover:bg-slate-50 dark:hover:bg-[#172033]/50 cursor-pointer">
                <span className="text-xs font-medium text-slate-800 dark:text-slate-200">
                  وضعیت پیشرفت مهارت‌ها و پروژه‌ها
                </span>
                <input
                  type="checkbox"
                  checked={widgetConfig.showSectionProgress}
                  onChange={(e) => updateWidgetConfig({ showSectionProgress: e.target.checked })}
                  className="w-4 h-4 text-cyan-500 rounded accent-cyan-500"
                />
              </label>

              <label className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 dark:border-[#263247] hover:bg-slate-50 dark:hover:bg-[#172033]/50 cursor-pointer">
                <span className="text-xs font-medium text-slate-800 dark:text-slate-200">
                  گزارش فعالیت‌های اخیر
                </span>
                <input
                  type="checkbox"
                  checked={widgetConfig.showRecentActivity}
                  onChange={(e) => updateWidgetConfig({ showRecentActivity: e.target.checked })}
                  className="w-4 h-4 text-cyan-500 rounded accent-cyan-500"
                />
              </label>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShowConfigModal(false)}
                className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 text-xs font-bold rounded-xl cursor-pointer shadow-sm"
              >
                تأیید و ذخیره
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Habit Modal */}
      {showNewHabitModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#111827] rounded-2xl max-w-sm w-full p-6 border border-slate-200 dark:border-[#263247] shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#263247] pb-3">
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-amber-500" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  تعریف عادت مثبت جدید
                </h3>
              </div>
              <button
                onClick={() => setShowNewHabitModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateHabit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  عنوان عادت:
                </label>
                <input
                  type="text"
                  value={newHabitTitle}
                  onChange={(e) => setNewHabitTitle(e.target.value)}
                  placeholder="مثال: ۳۰ دقیقه مطالعه تخصصی"
                  required
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-[#263247] bg-white dark:bg-[#172033] text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  دسته‌بندی مرتبط:
                </label>
                <select
                  value={newHabitCategory}
                  onChange={(e) => setNewHabitCategory(e.target.value as SectionType)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-[#263247] bg-white dark:bg-[#172033] text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
                >
                  <option value="school">مدرسه و درس‌ها</option>
                  <option value="skill">توسعه مهارت‌ها</option>
                  <option value="project">پروژه‌ها</option>
                  <option value="competition">مسابقات</option>
                  <option value="general">توسعه فردی عمومی</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  تعداد روزهای هدف در هفته:
                </label>
                <input
                  type="number"
                  min="1"
                  max="7"
                  value={newHabitDays}
                  onChange={(e) => setNewHabitDays(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-[#263247] bg-white dark:bg-[#172033] text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowNewHabitModal(false)}
                  className="px-3 py-2 rounded-xl text-xs text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 text-xs font-bold rounded-xl cursor-pointer shadow-sm"
                >
                  ثبت عادت
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
