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
  Code,
  Languages,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import {
  formatJalaliFull,
  formatJalaliShort,
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
    widgetConfig,
    updateWidgetConfig,
    rolloverOverdueTasks,
    activityLogs,
    calendarEvents,
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
          color: cell?.color || sub?.color || '#6366f1',
          notes: cell?.notes,
        };
      })
    : [];

  const overdueHomeworks = homeworks.filter((h) => !h.completed && h.dueDate < todayIso);
  const pendingHomeworks = homeworks.filter((h) => !h.completed);

  // Today's Priority items:
  // Combined list of:
  // 1. Overdue homeworks
  // 2. Homeworks due today or tomorrow
  // 3. Pre/Post-school tasks for today
  // 4. High-priority project tasks due soon
  const todayPriorities = [
    ...homeworks
      .filter((h) => !h.completed && h.dueDate <= todayIso)
      .map((h) => ({
        id: h.id,
        title: h.title,
        subtitle: `${h.subjectName} · تکلیف`,
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
        subtitle: 'برنامه بعد از مدرسه',
        estimatedMin: 30,
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
  const isOverloaded = totalRequiredMinutes > 360; // > 6 hours outside school is overloaded

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
      {/* Top Banner & Control Strip */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 transition-colors shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5 text-xs text-slate-500 dark:text-slate-400">
              <CalendarIcon className="w-3.5 h-3.5 text-indigo-500" />
              <span>{formatJalaliFull(today)}</span>
              <span aria-hidden="true">·</span>
              <span>روز {getIranianDayName(today)}</span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              {greeting}، {profile.name}
            </h2>
            <p className="mt-1 text-xs md:text-sm text-slate-600 dark:text-slate-300 max-w-xl leading-relaxed">
              مرکز کنترل و پایش شخصی؛ {toPersianDigits(todayPriorities.length)} اولویت کاری برای امروز،{' '}
              {toPersianDigits(overdueHomeworks.length)} کار نیازمند پیگیری و{' '}
              {toPersianDigits(weeklyGoals.length)} هدف هفتگی در دست اقدام دارید.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
            <button
              onClick={() => setShowConfigModal(true)}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors whitespace-nowrap"
              title="شخصی‌سازی نمایش ویجت‌ها"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">تنظیم ویجت‌ها</span>
            </button>
            <button
              onClick={onOpenQuickAdd}
              className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              <span>ثبت سریع</span>
            </button>
          </div>
        </div>
      </div>

      {/* Primary KPI Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          onClick={() => onNavigate('school')}
          className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-colors cursor-pointer group"
        >
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-2">
            <span>تکالیف در دست انجام</span>
            <GraduationCap className="w-4 h-4 text-blue-500" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-white">
              {toPersianDigits(pendingHomeworks.length)}
            </span>
            <span className="text-xs text-blue-600 dark:text-blue-400 flex items-center group-hover:translate-x-[-2px] transition-transform">
              مدرسه <ChevronLeft className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="mt-1 text-xs text-slate-500">
            {overdueHomeworks.length > 0 ? (
              <span className="text-rose-600 dark:text-rose-400 font-medium">
                {toPersianDigits(overdueHomeworks.length)} کار عقب‌افتاده
              </span>
            ) : (
              <span>بدون کار عقب‌افتاده</span>
            )}
          </div>
        </div>

        <div
          onClick={() => onNavigate('goals')}
          className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-colors cursor-pointer group"
        >
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-2">
            <span>تحقق اهداف هفتگی</span>
            <Target className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-white">
              {toPersianDigits(weeklyGoalsPercent)}٪
            </span>
            <span className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center group-hover:translate-x-[-2px] transition-transform">
              اهداف <ChevronLeft className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="mt-1 text-xs text-slate-500">
            {toPersianDigits(completedWeeklyGoals)} از {toPersianDigits(weeklyGoals.length)} هدف کامل شده
          </div>
        </div>

        <div
          onClick={() => onNavigate('school')}
          className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-colors cursor-pointer group"
        >
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-2">
            <span>مطالعه ۷ روز اخیر</span>
            <Clock className="w-4 h-4 text-purple-500" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-white">
              {toPersianDigits(totalRecentHours)} <span className="text-xs font-normal">ساعت</span>
            </span>
            <span className="text-xs text-purple-600 dark:text-purple-400 flex items-center group-hover:translate-x-[-2px] transition-transform">
              تایمر <ChevronLeft className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="mt-1 text-xs text-slate-500">
            هدف روزانه: {toPersianDigits(profile.studyTargetDailyHours || 4)} ساعت
          </div>
        </div>

        <div
          onClick={() => onNavigate('competitions')}
          className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-colors cursor-pointer group"
        >
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-2">
            <span>موعد مسابقه بعدی</span>
            <Trophy className="w-4 h-4 text-amber-500" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-white">
              {daysToNextCompetition !== null ? `${toPersianDigits(daysToNextCompetition)} روز` : '—'}
            </span>
            <span className="text-xs text-amber-600 dark:text-amber-400 flex items-center group-hover:translate-x-[-2px] transition-transform">
              مسابقات <ChevronLeft className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="mt-1 text-xs text-slate-500 truncate">
            {nextCompetition ? nextCompetition.title : 'مسابقه‌ای ثبت نشده'}
          </div>
        </div>
      </div>

      {/* Main Grid: Left 2 Cols (Schedule & Priority & Habits), Right 1 Col (Calendar & Snapshot) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* 1. Today's Priority Section (اولویت امروز) */}
          {widgetConfig.showTodayPriority && (
            <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 mb-4 border-b border-slate-100 dark:border-slate-800 gap-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    اولویت امروز (وظایف کلیدی)
                  </h3>
                  <span className="text-xs text-slate-500 font-mono tabular-nums">
                    ({toPersianDigits(todayPriorities.length)} مورد · تخمین {toPersianDigits(totalRequiredHours)} ساعت)
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {overdueHomeworks.length > 0 && (
                    <button
                      onClick={rolloverOverdueTasks}
                      className="flex items-center gap-1 text-xs text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2.5 py-1 rounded-lg border border-amber-200 dark:border-amber-900/40 hover:bg-amber-100 transition-colors"
                      title="انتقال کارهای عقب‌افتاده به موعد امروز"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>انتقال عقب‌افتاده‌ها</span>
                    </button>
                  )}
                  <span className="text-xs text-slate-400">
                    زمان آزاد روز: <span className="font-mono tabular-nums text-slate-700 dark:text-slate-200">{toPersianDigits(freeHoursRemaining)} ساعت</span>
                  </span>
                </div>
              </div>

              {/* Overload Alert if totalRequiredMinutes > 360 */}
              {isOverloaded && (
                <div className="mb-4 p-3 bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-lg flex items-start gap-2.5 text-xs text-amber-800 dark:text-amber-300">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
                  <div className="leading-relaxed">
                    برنامه امروز شما بیش از {toPersianDigits(totalRequiredHours)} ساعت کار تمرکزی دارد. برای پیشگیری از خستگی، می‌توانید کارهای کم‌اهمیت‌تر را با دکمه انتقال به روز بعد موکول کنید.
                  </div>
                </div>
              )}

              {/* Task Items */}
              <div className="space-y-2">
                {todayPriorities.length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-400">
                    عالی است! هیچ وظیفه یا تکلیف معوقه‌ای برای امروز ندارید. از دکمه «+ ثبت سریع» می‌توانید وظیفه جدید بیفزایید.
                  </div>
                ) : (
                  todayPriorities.map((item) => (
                    <div
                      key={item.id}
                      className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
                        item.isOverdue
                          ? 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/40'
                          : 'bg-white dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 hover:border-slate-300'
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
                          className="w-4 h-4 text-indigo-600 rounded border-slate-300 dark:border-slate-700 cursor-pointer"
                        />
                        <div className="min-w-0">
                          <p className={`text-xs font-semibold truncate ${item.completed ? 'line-through text-slate-400' : 'text-slate-800 dark:text-slate-100'}`}>
                            {item.title}
                          </p>
                          <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                            <span>{item.subtitle}</span>
                            <span aria-hidden="true">·</span>
                            <span className="font-mono tabular-nums">تخمین: {toPersianDigits(item.estimatedMin)} دقیقه</span>
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
                        <span className="text-[11px] text-slate-500 dark:text-slate-400">
                          {item.priority === 'high' ? 'اولویت بالا' : item.priority === 'medium' ? 'متوسط' : 'عادی'}
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
            <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    برنامه زنگ‌های مدرسه امروز ({getIranianDayName(today)})
                  </h3>
                </div>
                <button
                  onClick={() => onNavigate('school')}
                  className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-0.5"
                >
                  جدول کامل هفتگی <ChevronLeft className="w-3.5 h-3.5" />
                </button>
              </div>

              {isSchoolDay ? (
                <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5">
                  {todayBells.map((bell) => (
                    <div
                      key={bell.period}
                      className="p-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 flex flex-col justify-between"
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
                      <div className="mt-2 pt-2 border-t border-slate-200/50 dark:border-slate-700/50 flex items-center justify-between text-[10px] text-slate-500">
                        <span>{bell.room || 'کلاس'}</span>
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: bell.color }} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-6 text-center text-xs text-slate-400 bg-slate-50 dark:bg-slate-800/30 rounded-lg">
                  امروز روز تعطیل است. زمان مناسبی برای مطالعه عمیق، استراحت یا پیگیری پروژه‌های مهارتی است.
                </div>
              )}
            </div>
          )}

          {/* 3. Habit Tracker Widget (پیگیری عادت‌ها) */}
          {widgetConfig.showHabits && (
            <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <Flame className="w-4 h-4 text-amber-500" />
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    پیگیری عادت‌های امروز
                  </h3>
                </div>
                <button
                  onClick={() => setShowNewHabitModal(true)}
                  className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>عادت جدید</span>
                </button>
              </div>

              {habits.length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-400">
                  هنوز عادتی تعریف نشده است. با دکمه «+ عادت جدید» عادت‌هایی مثل مطالعه روزانه، کدنویسی یا ورزش را ثبت کنید.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {habits.map((habit) => {
                    const isDoneToday = habit.completedDates.includes(todayIso);
                    return (
                      <div
                        key={habit.id}
                        className={`p-3 rounded-lg border transition-all flex items-center justify-between ${
                          isDoneToday
                            ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/40'
                            : 'bg-white dark:bg-slate-800/40 border-slate-200 dark:border-slate-800'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <button
                            onClick={() => toggleHabitToday(habit.id)}
                            className={`w-6 h-6 rounded-md flex items-center justify-center transition-colors shrink-0 ${
                              isDoneToday
                                ? 'bg-emerald-600 text-white'
                                : 'border border-slate-300 dark:border-slate-600 text-transparent hover:border-slate-400'
                            }`}
                          >
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          </button>
                          <div className="min-w-0">
                            <p className={`text-xs font-semibold truncate ${isDoneToday ? 'line-through text-slate-500' : 'text-slate-800 dark:text-slate-100'}`}>
                              {habit.title}
                            </p>
                            <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                              <span>هدف: {toPersianDigits(habit.targetDaysPerWeek)} روز در هفته</span>
                              <span aria-hidden="true">·</span>
                              <span className="flex items-center gap-0.5 text-amber-600 dark:text-amber-400 font-mono tabular-nums">
                                <Flame className="w-3 h-3" /> {toPersianDigits(habit.streak)} روز پیوسته
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
            <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    روند ساعت مطالعه در ۷ روز اخیر
                  </h3>
                </div>
                <span className="text-xs text-slate-500 font-mono tabular-nums">
                  مجموع: {toPersianDigits(totalRecentHours)} ساعت
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
                      <div className="w-full max-w-[32px] bg-slate-100 dark:bg-slate-800 rounded-t-lg overflow-hidden flex items-end h-24">
                        <div
                          className="w-full bg-indigo-500 hover:bg-indigo-600 transition-all rounded-t-lg"
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
            <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 dark:border-slate-800">
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  تقویم {monthName} {toPersianDigits(todayJalali.jy)}
                </span>
                <button
                  onClick={() => onNavigate('calendar')}
                  className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-0.5"
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
                          ? 'bg-indigo-600 text-white font-bold'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
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
              <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-emerald-500" />
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      مسیر یادگیری مهارت‌ها
                    </span>
                  </div>
                  <button
                    onClick={() => onNavigate('skills')}
                    className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    تمام مهارت‌ها
                  </button>
                </div>

                <div className="space-y-3">
                  {skills.length === 0 ? (
                    <div className="py-4 text-center text-xs text-slate-400">
                      هنوز مهارتی تعریف نشده است.
                    </div>
                  ) : (
                    skills.map((skill) => {
                      const totalSteps = skill.roadmap.length;
                      const doneSteps = skill.roadmap.filter((r) => r.completed).length;
                      const percent = totalSteps > 0 ? Math.round((doneSteps / totalSteps) * 100) : 0;
                      return (
                        <div key={skill.id} className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                              {skill.name}
                            </span>
                            <span className="font-mono tabular-nums text-slate-500 text-[11px]">
                              {toPersianDigits(percent)}٪
                            </span>
                          </div>
                          <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                            <div
                              className="bg-emerald-500 h-full rounded-full"
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
              <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-1.5">
                    <FolderGit2 className="w-4 h-4 text-purple-500" />
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      وضعیت پروژه‌های فعال
                    </span>
                  </div>
                  <button
                    onClick={() => onNavigate('projects')}
                    className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    برد کانبان
                  </button>
                </div>

                <div className="space-y-3">
                  {projects.length === 0 ? (
                    <div className="py-4 text-center text-xs text-slate-400">
                      هنوز پروژه‌ای ثبت نشده است.
                    </div>
                  ) : (
                    projects.map((proj) => (
                      <div
                        key={proj.id}
                        onClick={() => onNavigate('projects')}
                        className="p-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:border-slate-200 cursor-pointer transition-all"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                            {proj.title}
                          </span>
                          <span className="text-[10px] font-mono tabular-nums text-purple-600 dark:text-purple-400 font-bold">
                            {toPersianDigits(proj.progressPercentage)}٪
                          </span>
                        </div>
                        <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-purple-600 h-full rounded-full"
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
            <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-blue-500" />
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    فعالیت‌های اخیر
                  </span>
                </div>
              </div>

              <div className="space-y-2.5">
                {activityLogs.length === 0 ? (
                  <div className="py-4 text-center text-xs text-slate-400">
                    هنوز فعالیتی ثبت نشده است.
                  </div>
                ) : (
                  activityLogs.slice(0, 5).map((log) => (
                    <div key={log.id} className="text-xs flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
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
          )}
        </div>
      </div>

      {/* Widget Customization Modal */}
      {showConfigModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                شخصی‌سازی ویجت‌های داشبورد
              </h3>
              <button
                onClick={() => setShowConfigModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              ویجت‌هایی را که مایلید در صفحه اصلی داشبورد نمایش داده شوند، فعال یا غیرفعال کنید:
            </p>

            <div className="space-y-3">
              <label className="flex items-center justify-between p-2.5 rounded-lg border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer">
                <span className="text-xs font-medium text-slate-800 dark:text-slate-200">
                  اولویت‌های کلیدی امروز (وظایف و مهلت‌ها)
                </span>
                <input
                  type="checkbox"
                  checked={widgetConfig.showTodayPriority}
                  onChange={(e) => updateWidgetConfig({ showTodayPriority: e.target.checked })}
                  className="w-4 h-4 text-indigo-600 rounded"
                />
              </label>

              <label className="flex items-center justify-between p-2.5 rounded-lg border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer">
                <span className="text-xs font-medium text-slate-800 dark:text-slate-200">
                  برنامه زنگ‌های روز مدرسه
                </span>
                <input
                  type="checkbox"
                  checked={widgetConfig.showTodaySchedule}
                  onChange={(e) => updateWidgetConfig({ showTodaySchedule: e.target.checked })}
                  className="w-4 h-4 text-indigo-600 rounded"
                />
              </label>

              <label className="flex items-center justify-between p-2.5 rounded-lg border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer">
                <span className="text-xs font-medium text-slate-800 dark:text-slate-200">
                  پیگیری عادت‌ها و استریک‌های روزانه
                </span>
                <input
                  type="checkbox"
                  checked={widgetConfig.showHabits}
                  onChange={(e) => updateWidgetConfig({ showHabits: e.target.checked })}
                  className="w-4 h-4 text-indigo-600 rounded"
                />
              </label>

              <label className="flex items-center justify-between p-2.5 rounded-lg border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer">
                <span className="text-xs font-medium text-slate-800 dark:text-slate-200">
                  نمودار ساعات مطالعه ۷ روز اخیر
                </span>
                <input
                  type="checkbox"
                  checked={widgetConfig.showStudyHoursChart}
                  onChange={(e) => updateWidgetConfig({ showStudyHoursChart: e.target.checked })}
                  className="w-4 h-4 text-indigo-600 rounded"
                />
              </label>

              <label className="flex items-center justify-between p-2.5 rounded-lg border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer">
                <span className="text-xs font-medium text-slate-800 dark:text-slate-200">
                  تقویمچه شمسی کوچک
                </span>
                <input
                  type="checkbox"
                  checked={widgetConfig.showMiniCalendar}
                  onChange={(e) => updateWidgetConfig({ showMiniCalendar: e.target.checked })}
                  className="w-4 h-4 text-indigo-600 rounded"
                />
              </label>

              <label className="flex items-center justify-between p-2.5 rounded-lg border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer">
                <span className="text-xs font-medium text-slate-800 dark:text-slate-200">
                  وضعیت پیشرفت مهارت‌ها و پروژه‌ها
                </span>
                <input
                  type="checkbox"
                  checked={widgetConfig.showSectionProgress}
                  onChange={(e) => updateWidgetConfig({ showSectionProgress: e.target.checked })}
                  className="w-4 h-4 text-indigo-600 rounded"
                />
              </label>

              <label className="flex items-center justify-between p-2.5 rounded-lg border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer">
                <span className="text-xs font-medium text-slate-800 dark:text-slate-200">
                  گزارش فعالیت‌های اخیر
                </span>
                <input
                  type="checkbox"
                  checked={widgetConfig.showRecentActivity}
                  onChange={(e) => updateWidgetConfig({ showRecentActivity: e.target.checked })}
                  className="w-4 h-4 text-indigo-600 rounded"
                />
              </label>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShowConfigModal(false)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg"
              >
                ذخیره و بستن
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Habit Modal */}
      {showNewHabitModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-amber-500" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  تعریف عادت جدید
                </h3>
              </div>
              <button
                onClick={() => setShowNewHabitModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateHabit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  عنوان عادت *
                </label>
                <input
                  type="text"
                  required
                  placeholder="مثلاً: حل ۲ مسئله الگوریتمی یا ۲۰ دقیقه مطالعه زبان"
                  value={newHabitTitle}
                  onChange={(e) => setNewHabitTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    بخش مرتبط
                  </label>
                  <select
                    value={newHabitCategory}
                    onChange={(e) => setNewHabitCategory(e.target.value as SectionType)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="school">مدرسه</option>
                    <option value="skill">مهارت</option>
                    <option value="project">پروژه</option>
                    <option value="competition">مسابقات</option>
                    <option value="general">رشد فردی / عمومی</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    هدف هفتگی (چند روز در هفته)
                  </label>
                  <select
                    value={newHabitDays}
                    onChange={(e) => setNewHabitDays(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono tabular-nums"
                  >
                    <option value={3}>۳ روز در هفته</option>
                    <option value={4}>۴ روز در هفته</option>
                    <option value={5}>۵ روز در هفته</option>
                    <option value={6}>۶ روز در هفته</option>
                    <option value={7}>هر روز (۷ روز هفته)</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowNewHabitModal(false)}
                  className="px-3.5 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-xs"
                >
                  ایجاد عادت
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
