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
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
  Palette,
  ChevronDown,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { DEFAULT_DASHBOARD_CARDS } from '../../utils/initialData';
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
import { SectionType } from '../../types';

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
    rolloverOverdueTasks,
    activityLogs,
    getSectionTitle,
    customization,
    updateCustomization,
    setIsAIAssistantOpen,
  } = useApp();

  const isCardHidden = (id: string) => (customization.hiddenDashboardCards || []).includes(id);

  const [showConfigModal, setShowConfigModal] = useState(false);
  const [showNewHabitModal, setShowNewHabitModal] = useState(false);
  const [showMoreDetails, setShowMoreDetails] = useState(false);
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
          color: cell?.color || sub?.color || '#0284C7',
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
        subtitle: 'برنامه‌ریز روزانه',
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
  const schoolMinutes = isSchoolDay ? 360 : 0;
  const wakingMinutes = 16 * 60;
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
      {/* Calm, Minimal Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-1">
            <CalendarIcon className="w-3.5 h-3.5" />
            <span>{formatJalaliFull(today)}</span>
            <span aria-hidden="true">·</span>
            <span>{getIranianDayName(today)}</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            {greeting}، {profile.name || 'کاربر عزیز'}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {toPersianDigits(todayPriorities.length)} اولویت کاری برای امروز داری · {toPersianDigits(weeklyGoals.length)} هدف هفتگی فعال
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setIsAIAssistantOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700 rounded-lg transition-colors cursor-pointer"
            title="دستیار هوشمند برنامه‌ریزی"
          >
            <Sparkles className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
            <span>دستیار هوشمند</span>
          </button>

          <button
            onClick={() => setShowConfigModal(true)}
            className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700 rounded-lg transition-colors cursor-pointer"
            title="تنظیم کارت‌های داشبورد"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>

          <button
            onClick={onOpenQuickAdd}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 text-xs font-semibold rounded-lg transition-colors cursor-pointer shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>ثبت سریع</span>
          </button>
        </div>
      </div>

      {/* Spaced Review Notification (Only if due) */}
      {dueReviews.length > 0 && (
        <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <RotateCcw className="w-4 h-4 text-slate-600 dark:text-slate-300 shrink-0" />
            <div className="text-xs font-medium text-slate-800 dark:text-slate-200">
              {toPersianDigits(dueReviews.length)} مبحث آماده مرور فاصله‌دار است.
            </div>
          </div>
          <button
            onClick={() => onNavigate('reviews')}
            className="px-3 py-1.5 text-xs font-semibold bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-900 dark:text-white rounded-lg border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer text-center shrink-0"
          >
            شروع مرور
          </button>
        </div>
      )}

      {/* 4 Pillars Unified Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Pillar 1: School */}
        <div
          onClick={() => onNavigate('school')}
          className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-colors cursor-pointer group"
        >
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-2">
            <span>{getSectionTitle('school')}</span>
            <GraduationCap className="w-4 h-4 text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200 transition-colors" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-white">
              {toPersianDigits(pendingHomeworks.length)}
            </span>
            <span className="text-xs text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 flex items-center gap-0.5">
              ورود <ChevronLeft className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
            <span>تکالیف در دست انجام</span>
            {overdueHomeworks.length > 0 ? (
              <span className="text-rose-600 dark:text-rose-400 font-medium">
                {toPersianDigits(overdueHomeworks.length)} عقب‌افتاده
              </span>
            ) : (
              <span className="text-emerald-600 dark:text-emerald-400">به‌روز</span>
            )}
          </div>
        </div>

        {/* Pillar 2: Skills */}
        <div
          onClick={() => onNavigate('skills')}
          className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-colors cursor-pointer group"
        >
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-2">
            <span>{getSectionTitle('skills')}</span>
            <Sparkles className="w-4 h-4 text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200 transition-colors" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-white">
              {toPersianDigits(activeSkillsCount)}
            </span>
            <span className="text-xs text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 flex items-center gap-0.5">
              نقشه‌راه <ChevronLeft className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
            <span>میانگین پیشرفت</span>
            <span className="font-mono tabular-nums font-semibold text-slate-700 dark:text-slate-300">
              {toPersianDigits(avgSkillProgress)}٪
            </span>
          </div>
        </div>

        {/* Pillar 3: Projects */}
        <div
          onClick={() => onNavigate('projects')}
          className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-colors cursor-pointer group"
        >
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-2">
            <span>{getSectionTitle('projects')}</span>
            <FolderGit2 className="w-4 h-4 text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200 transition-colors" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-white">
              {toPersianDigits(activeProjects.length)}
            </span>
            <span className="text-xs text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 flex items-center gap-0.5">
              کانبان <ChevronLeft className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
            <span>پیشرفت پروژه‌ها</span>
            <span className="font-mono tabular-nums font-semibold text-slate-700 dark:text-slate-300">
              {toPersianDigits(avgProjectProgress)}٪
            </span>
          </div>
        </div>

        {/* Pillar 4: Competitions */}
        <div
          onClick={() => onNavigate('competitions')}
          className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-colors cursor-pointer group"
        >
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-2">
            <span>{getSectionTitle('competitions')}</span>
            <Trophy className="w-4 h-4 text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200 transition-colors" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-white">
              {daysToNextCompetition !== null ? `${toPersianDigits(daysToNextCompetition)} روز` : '—'}
            </span>
            <span className="text-xs text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 flex items-center gap-0.5">
              رویدادها <ChevronLeft className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800/80 truncate">
            <span className="truncate">{nextCompetition ? nextCompetition.title : 'رویداد پیش‌رو'}</span>
          </div>
        </div>
      </div>

      {/* Main Two-Column Working Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Right Area (8 cols on lg): Today's Priorities & Habit Check-in */}
        <div className="lg:col-span-7 space-y-6">
          {/* Today's Priorities */}
          {!isCardHidden('today_priority') && widgetConfig.showTodayPriority && (
            <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 mb-4 border-b border-slate-100 dark:border-slate-800 gap-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-slate-600 dark:text-slate-300" />
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    اولویت‌های امروز
                  </h3>
                  <span className="text-xs text-slate-400 font-mono tabular-nums">
                    ({toPersianDigits(todayPriorities.length)} کار · {toPersianDigits(totalRequiredHours)} ساعت)
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {overdueHomeworks.length > 0 && (
                    <button
                      onClick={rolloverOverdueTasks}
                      className="flex items-center gap-1 text-xs text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                      title="انتقال کارهای عقب‌افتاده به موعد امروز"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>انتقال عقب‌افتاده‌ها</span>
                    </button>
                  )}
                  <span className="text-xs text-slate-400">
                    زمان آزاد: <strong className="text-slate-700 dark:text-slate-300 font-mono tabular-nums">{toPersianDigits(freeHoursRemaining)}h</strong>
                  </span>
                </div>
              </div>

              {/* Overload Alert (Subtle) */}
              {isOverloaded && (
                <div className="mb-4 p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 rounded-lg flex items-start gap-2.5 text-xs text-amber-800 dark:text-amber-300">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-500" />
                  <div className="leading-relaxed">
                    حجم کاری امروز بیش از {toPersianDigits(totalRequiredHours)} ساعت است؛ می‌توانید اولویت‌های عادی را به روزهای بعد موکول کنید.
                  </div>
                </div>
              )}

              {/* Task list */}
              <div className="space-y-2">
                {todayPriorities.length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-400 dark:text-slate-500">
                    همه کارهای امروز با موفقیت انجام شده‌اند.
                  </div>
                ) : (
                  todayPriorities.map((item) => (
                    <div
                      key={item.id}
                      className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                        item.isOverdue
                          ? 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/40'
                          : 'bg-slate-50/60 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
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
                          className="w-4 h-4 text-slate-900 dark:text-slate-100 rounded border-slate-300 dark:border-slate-600 cursor-pointer accent-slate-800 dark:accent-slate-200"
                        />
                        <div className="min-w-0">
                          <p className={`text-xs font-medium truncate ${item.completed ? 'line-through text-slate-400' : 'text-slate-800 dark:text-slate-200'}`}>
                            {item.title}
                          </p>
                          <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                            <span>{item.subtitle}</span>
                            <span aria-hidden="true">·</span>
                            <span className="font-mono tabular-nums">{toPersianDigits(item.estimatedMin)} دقیقه</span>
                            {item.isOverdue && (
                              <>
                                <span aria-hidden="true">·</span>
                                <span className="text-rose-600 dark:text-rose-400 font-medium">عقب‌افتاده</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`text-[10px] font-medium px-2 py-0.5 rounded ${
                          item.priority === 'high'
                            ? 'bg-rose-100 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300'
                            : item.priority === 'medium'
                            ? 'bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
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

          {/* Today's Habits Tracker */}
          {widgetConfig.showHabits && (
            <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <Flame className="w-4 h-4 text-amber-500" />
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    پیگیری عادت‌های امروز
                  </h3>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setShowNewHabitModal(true)}
                    className="text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>عادت جدید</span>
                  </button>
                  <button
                    onClick={() => onNavigate('habits')}
                    className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 flex items-center gap-0.5 cursor-pointer"
                  >
                    مشاهده همه <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {habits.length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-400 dark:text-slate-500">
                  هنوز عادتی ثبت نشده است.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {habits.map((habit) => {
                    const isDoneToday = habit.completedDates.includes(todayIso);
                    return (
                      <div
                        key={habit.id}
                        className={`p-2.5 rounded-lg border transition-colors flex items-center justify-between ${
                          isDoneToday
                            ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/40'
                            : 'bg-slate-50/60 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <button
                            onClick={() => toggleHabitToday(habit.id)}
                            className={`w-5 h-5 rounded flex items-center justify-center transition-colors shrink-0 cursor-pointer ${
                              isDoneToday
                                ? 'bg-emerald-600 text-white'
                                : 'border border-slate-300 dark:border-slate-600 hover:border-slate-400 text-transparent'
                            }`}
                          >
                            <Check className="w-3 h-3 stroke-[2.5]" />
                          </button>
                          <div className="min-w-0">
                            <p className={`text-xs font-medium truncate ${isDoneToday ? 'line-through text-slate-400' : 'text-slate-800 dark:text-slate-200'}`}>
                              {habit.title}
                            </p>
                            <span className="text-[10px] text-slate-400 font-mono tabular-nums">
                              {toPersianDigits(habit.streak)} روز استمرار
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Left Area (5 cols on lg): Today's Schedule & 7-Day Trend */}
        <div className="lg:col-span-5 space-y-6">
          {/* Today's School Schedule */}
          {widgetConfig.showTodaySchedule && (
            <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-slate-600 dark:text-slate-300" />
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    برنامه مدرسه امروز ({getIranianDayName(today)})
                  </h3>
                </div>
                <button
                  onClick={() => onNavigate('school')}
                  className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 flex items-center gap-0.5 cursor-pointer"
                >
                  جدول کامل <ChevronLeft className="w-3.5 h-3.5" />
                </button>
              </div>

              {isSchoolDay ? (
                <div className="space-y-2">
                  {todayBells.map((bell) => (
                    <div
                      key={bell.period}
                      className="p-2.5 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="w-6 h-6 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono text-[11px] font-semibold flex items-center justify-center shrink-0">
                          {toPersianDigits(bell.period)}
                        </span>
                        <div className="truncate">
                          <span className="font-medium text-slate-800 dark:text-slate-200 truncate block">
                            {bell.subjectName || '— بدون درس —'}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono tabular-nums">
                            {toPersianDigits(bell.bellTime.startTime)} تا {toPersianDigits(bell.bellTime.endTime)}
                          </span>
                        </div>
                      </div>
                      <span className="text-[11px] text-slate-400 shrink-0">
                        {bell.room || 'کلاس'}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-6 text-center text-xs text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-900/40 rounded-lg">
                  امروز تعطیل یا بدون کلاس است.
                </div>
              )}
            </div>
          )}

          {/* 7-day study trend (Minimalist bars) */}
          {widgetConfig.showStudyHoursChart && (
            <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-slate-600 dark:text-slate-300" />
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    ساعت مطالعه ۷ روز اخیر
                  </h3>
                </div>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-mono tabular-nums">
                  مجموع: <strong className="text-slate-800 dark:text-slate-200">{toPersianDigits(totalRecentHours)}h</strong>
                </span>
              </div>

              <div className="flex items-end justify-between gap-2 h-28 pt-2 px-1">
                {last7DaysChart.map((d, idx) => {
                  const heightPercent = Math.round((d.hours / maxChartHours) * 100);
                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
                      <span className="text-[9px] font-mono tabular-nums text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                        {toPersianDigits(d.hours)}h
                      </span>
                      <div className="w-full max-w-[24px] bg-slate-100 dark:bg-slate-800 rounded-t overflow-hidden flex items-end h-16">
                        <div
                          className="w-full bg-slate-700 dark:bg-slate-300 hover:opacity-80 transition-all rounded-t"
                          style={{ height: `${Math.max(6, heightPercent)}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                        {d.dayName.slice(0, 3)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quick Stats Ribbon */}
          {!isCardHidden('quick_stats') && (
            <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <span className="text-[11px] text-slate-400 block mb-1">اهداف هفتگی</span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200 tabular-nums">
                  {toPersianDigits(weeklyGoalsPercent)}٪ ({toPersianDigits(completedWeeklyGoals)}/{toPersianDigits(weeklyGoals.length)})
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <span className="text-[11px] text-slate-400 block mb-1">استمرار روزانه</span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200 tabular-nums">
                  {toPersianDigits(maxStreak)} روز متوالی
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Collapsible Secondary Details Area (Clean and Optional) */}
      <div className="pt-2">
        <button
          onClick={() => setShowMoreDetails((prev) => !prev)}
          className="w-full py-2.5 px-4 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
        >
          <span>{showMoreDetails ? 'بستن تقویم و گزارش فعالیت‌ها' : 'مشاهده تقویم ماه و فعالیت‌های اخیر'}</span>
          <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showMoreDetails ? 'rotate-180' : ''}`} />
        </button>

        {showMoreDetails && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4 animate-in fade-in duration-200">
            {/* Mini Shamsi Calendar */}
            <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 dark:border-slate-800">
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  تقویم {monthName} {toPersianDigits(todayJalali.jy)}
                </span>
                <button
                  onClick={() => onNavigate('calendar')}
                  className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center gap-0.5 cursor-pointer"
                >
                  تقویم کامل <ChevronLeft className="w-3 h-3" />
                </button>
              </div>

              <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-medium text-slate-400 mb-2">
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
                      className={`h-7 flex items-center justify-center rounded font-mono tabular-nums text-[11px] transition-colors ${
                        isCurrent
                          ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-bold'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      {toPersianDigits(dayNum)}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Recent Activity Logs */}
            <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-slate-500" />
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    فعالیت‌های اخیر
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                {activityLogs.length === 0 ? (
                  <div className="py-6 text-center text-xs text-slate-400">
                    هنوز فعالیتی ثبت نشده است.
                  </div>
                ) : (
                  activityLogs.slice(0, 5).map((log) => (
                    <div key={log.id} className="text-xs flex items-start gap-2 py-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-slate-600 mt-1.5 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-slate-700 dark:text-slate-300 text-[11px] leading-relaxed">
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
          </div>
        )}
      </div>

      {/* Widget Customization Modal */}
      {showConfigModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                شخصی‌سازی کارت‌های داشبورد
              </h3>
              <button
                onClick={() => setShowConfigModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center justify-between pb-1">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                چینش و نمایش کارت‌های داشبورد:
              </p>
              <button
                onClick={() => {
                  setShowConfigModal(false);
                  onNavigate('settings');
                  setTimeout(() => {
                    window.dispatchEvent(new CustomEvent('pathly_open_customization'));
                  }, 50);
                }}
                className="text-[11px] font-medium text-slate-600 dark:text-slate-300 hover:underline flex items-center gap-1 cursor-pointer whitespace-nowrap"
              >
                <Palette className="w-3.5 h-3.5" />
                <span>شخصی‌سازی پیشرفته</span>
              </button>
            </div>

            {/* Column Selector */}
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs">
              <span className="font-medium text-slate-700 dark:text-slate-300">چیدمان ستون‌ها:</span>
              <div className="flex items-center gap-1">
                {(['auto', '1', '2'] as const).map((col) => (
                  <button
                    key={col}
                    type="button"
                    onClick={() => updateCustomization({ dashboardColumns: col })}
                    className={`px-2.5 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${
                      (customization.dashboardColumns || 'auto') === col
                        ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-semibold'
                        : 'text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {col === 'auto' ? 'خودکار' : `${toPersianDigits(col)} ستونه`}
                  </button>
                ))}
              </div>
            </div>

            {/* Cards List with Up/Down and Eye Toggle */}
            <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
              {customization.dashboardCardsOrder.map((cardId, index) => {
                const cardDef = DEFAULT_DASHBOARD_CARDS.find((c) => c.id === cardId) || {
                  id: cardId,
                  label: cardId,
                  category: 'عمومی',
                };
                const isHidden = (customization.hiddenDashboardCards || []).includes(cardId);

                return (
                  <div
                    key={cardId}
                    className={`flex items-center justify-between p-2.5 rounded-lg border transition-colors ${
                      isHidden
                        ? 'bg-slate-50 dark:bg-slate-950/40 border-dashed border-slate-200 dark:border-slate-800 opacity-60'
                        : 'bg-white dark:bg-slate-800/40 border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="w-5 h-5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 text-[10px] font-mono font-bold flex items-center justify-center shrink-0">
                        {toPersianDigits(index + 1)}
                      </span>
                      <span className={`text-xs font-medium truncate ${isHidden ? 'line-through text-slate-400' : 'text-slate-800 dark:text-slate-200'}`}>
                        {cardDef.label}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        disabled={index === 0}
                        onClick={() => {
                          const newOrder = [...customization.dashboardCardsOrder];
                          const temp = newOrder[index];
                          newOrder[index] = newOrder[index - 1];
                          newOrder[index - 1] = temp;
                          updateCustomization({ dashboardCardsOrder: newOrder });
                        }}
                        className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 disabled:opacity-20 rounded cursor-pointer"
                        title="بالا"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        disabled={index === customization.dashboardCardsOrder.length - 1}
                        onClick={() => {
                          const newOrder = [...customization.dashboardCardsOrder];
                          const temp = newOrder[index];
                          newOrder[index] = newOrder[index + 1];
                          newOrder[index + 1] = temp;
                          updateCustomization({ dashboardCardsOrder: newOrder });
                        }}
                        className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 disabled:opacity-20 rounded cursor-pointer"
                        title="پایین"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          const currentHidden = customization.hiddenDashboardCards || [];
                          const nextHidden = isHidden
                            ? currentHidden.filter((id) => id !== cardId)
                            : [...currentHidden, cardId];
                          updateCustomization({ hiddenDashboardCards: nextHidden });
                        }}
                        className={`p-1 rounded cursor-pointer ${
                          isHidden ? 'text-slate-400 hover:text-emerald-500' : 'text-slate-600 dark:text-slate-400'
                        }`}
                        title={isHidden ? 'نمایش مجدد' : 'مخفی کردن'}
                      >
                        {isHidden ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-2 flex items-center justify-between border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => updateCustomization({ dashboardCardsOrder: DEFAULT_DASHBOARD_CARDS.map((c) => c.id), hiddenDashboardCards: [] })}
                className="text-xs text-rose-500 hover:underline cursor-pointer flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                <span>بازنشانی چیدمان</span>
              </button>

              <button
                onClick={() => setShowConfigModal(false)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 text-xs font-semibold rounded-lg cursor-pointer"
              >
                تأیید و بستن
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Habit Modal */}
      {showNewHabitModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-sm w-full p-6 border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
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
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-slate-400"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  دسته‌بندی مرتبط:
                </label>
                <select
                  value={newHabitCategory}
                  onChange={(e) => setNewHabitCategory(e.target.value as SectionType)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-slate-400"
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
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-slate-400"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowNewHabitModal(false)}
                  className="px-3 py-2 rounded-lg text-xs text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 text-xs font-semibold rounded-lg cursor-pointer shadow-xs"
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
