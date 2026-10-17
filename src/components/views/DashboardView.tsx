import React, { useState, useMemo } from 'react';
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
  RotateCcw,
  SlidersHorizontal,
  Plus,
  Activity,
  Check,
  X,
  BookOpen,
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
  Star,
  Pin,
  Bell,
  Trash2,
  Edit2,
  ChevronDown,
  ChevronUp,
  ListTodo,
  FileText,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import {
  formatJalaliFull,
  getIranianDayOfWeek,
  getIranianDayName,
  toPersianDigits,
  getRelativeTimeString,
} from '../../utils/jalali';
import { NavTab } from '../layout/Sidebar';
import { Priority, SectionType } from '../../types';

interface DashboardViewProps {
  onNavigate: (tab: NavTab) => void;
  onOpenQuickAdd: () => void;
}

export type DashboardSectionId =
  | 'today_tasks'
  | 'quick_pillars'
  | 'upcoming_deadlines'
  | 'active_goals'
  | 'quick_notes'
  | 'today_habits'
  | 'school_timetable';

interface SectionMeta {
  id: DashboardSectionId;
  label: string;
  category: string;
  defaultVisible: boolean;
}

const DASHBOARD_SECTIONS: SectionMeta[] = [
  { id: 'today_tasks', label: 'برنامه و وظایف امروز (محور اصلی)', category: 'امروز', defaultVisible: true },
  { id: 'quick_pillars', label: 'دسترسی سریع به ۴ بخش اصلی', category: 'ناوبری', defaultVisible: true },
  { id: 'upcoming_deadlines', label: 'تقویم و موعدهای پیش‌رو', category: 'زمانبندی', defaultVisible: true },
  { id: 'active_goals', label: 'پیشرفت و اهداف فعال', category: 'اهداف', defaultVisible: true },
  { id: 'quick_notes', label: 'یادداشت‌ها و یادآوری‌ها', category: 'یادداشت', defaultVisible: true },
  { id: 'today_habits', label: 'عادت‌ها و استمرار روزانه', category: 'عادت‌ها', defaultVisible: true },
  { id: 'school_timetable', label: 'برنامه زنگ‌های کلاسی مدرسه', category: 'مدرسه', defaultVisible: false },
];

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigate, onOpenQuickAdd }) => {
  const {
    currentUser,
    profile,
    subjects,
    weeklyCells,
    dayData,
    togglePostSchoolTask,
    togglePreSchoolTask,
    addPostSchoolTask,
    deletePostSchoolTask,
    updatePlannedTask,
    homeworks,
    toggleHomework,
    updateHomework,
    deleteHomework,
    skills,
    projects,
    updateProjectTaskStatus,
    competitions,
    goals,
    addGoal,
    habits,
    toggleHabitToday,
    calendarEvents,
    addCalendarEvent,
    exams,
    notes,
    addNote,
    toggleNotePinned,
    notifications,
    clearNotification,
    activityLogs,
    customization,
    updateCustomization,
  } = useApp();

  // Local UI State
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [showSecondaryDetails, setShowSecondaryDetails] = useState(false);
  const [designatedMitId, setDesignatedMitId] = useState<string | null>(null);

  // Filter for today's tasks: 'all' | 'pending' | 'completed'
  const [taskFilter, setTaskFilter] = useState<'all' | 'pending' | 'completed'>('all');

  // Compact Inline Quick Add Task for Today
  const [showInlineTaskInput, setShowInlineTaskInput] = useState(false);
  const [quickTaskTitle, setQuickTaskTitle] = useState('');
  const [quickTaskTime, setQuickTaskTime] = useState('');
  const [quickTaskPriority, setQuickTaskPriority] = useState<Priority>('medium');

  // Task Editing State
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editingTaskTitle, setEditingTaskTitle] = useState('');
  const [editingTaskTime, setEditingTaskTime] = useState('');
  const [editingTaskPriority, setEditingTaskPriority] = useState<Priority>('medium');

  // Quick Note inline state
  const [showQuickNoteForm, setShowQuickNoteForm] = useState(false);
  const [quickNoteTitle, setQuickNoteTitle] = useState('');
  const [quickNoteContent, setQuickNoteContent] = useState('');

  // Quick Goal inline state
  const [showQuickGoalForm, setShowQuickGoalForm] = useState(false);
  const [quickGoalTitle, setQuickGoalTitle] = useState('');
  const [quickGoalCategory, setQuickGoalCategory] = useState<SectionType>('general');

  // Quick Event inline state
  const [showQuickEventForm, setShowQuickEventForm] = useState(false);
  const [quickEventTitle, setQuickEventTitle] = useState('');
  const [quickEventDate, setQuickEventDate] = useState('');
  const [quickEventTime, setQuickEventTime] = useState('');

  // Current Date & Day Calculation
  const today = new Date();
  const todayIso = today.toISOString().slice(0, 10);
  const currentIranianDayIdx = getIranianDayOfWeek(today);
  const isSchoolDay = currentIranianDayIdx >= 0 && currentIranianDayIdx <= 4;

  // 1. Time-of-day greeting (peaceful and warm)
  const hour = today.getHours();
  const greeting =
    hour >= 5 && hour < 12
      ? 'صبح بخیر'
      : hour >= 12 && hour < 17
      ? 'بعدازظهر بخیر'
      : hour >= 17 && hour < 22
      ? 'عصر بخیر'
      : 'شب بخیر';

  const userName = currentUser?.name || profile.name || 'همراه گرامی';

  // 2. Today's Tasks
  const currentDayData = dayData[currentIranianDayIdx] || { preSchoolTasks: [], postSchoolTasks: [], notes: '' };

  const todayPostTasks = (currentDayData.postSchoolTasks || []).map((t) => ({
    id: t.id,
    title: t.title,
    time: t.dueTime || '',
    priority: t.priority || 'medium',
    completed: t.completed,
    source: 'برنامه روزانه',
    type: 'postSchool' as const,
  }));

  const todayPreTasks = (currentDayData.preSchoolTasks || []).map((t) => ({
    id: t.id,
    title: t.title,
    time: t.dueTime || '',
    priority: t.priority || 'medium',
    completed: t.completed,
    source: 'برنامه صبحگاهی',
    type: 'preSchool' as const,
  }));

  const todayHomeworkTasks = homeworks
    .filter((h) => h.dueDate <= todayIso)
    .map((h) => ({
      id: h.id,
      title: h.title,
      time: h.estimatedMinutes ? `${toPersianDigits(h.estimatedMinutes)} دقیقه` : '',
      priority: h.priority,
      completed: h.completed,
      source: `${h.subjectName} · تکلیف`,
      isOverdue: h.dueDate < todayIso && !h.completed,
      type: 'homework' as const,
    }));

  const highPriorityProjectTasks = projects.flatMap((p) =>
    p.tasks
      .filter((t) => t.status !== 'completed' && t.priority === 'high')
      .slice(0, 2)
      .map((t) => ({
        id: t.id,
        projectId: p.id,
        title: t.title,
        time: t.estimatedHours ? `${toPersianDigits(t.estimatedHours)} ساعت` : '',
        priority: t.priority,
        completed: false,
        source: `${p.title} · پروژه`,
        type: 'project' as const,
      }))
  );

  // Unified sorted tasks for today
  const allTodayTasks = useMemo(() => {
    const list = [...todayHomeworkTasks, ...todayPreTasks, ...todayPostTasks, ...highPriorityProjectTasks];
    const priorityWeight: Record<Priority, number> = { high: 3, medium: 2, low: 1 };

    return list.sort((a, b) => {
      if ((a as any).isOverdue && !(b as any).isOverdue) return -1;
      if (!(a as any).isOverdue && (b as any).isOverdue) return 1;

      const weightDiff = (priorityWeight[b.priority] || 2) - (priorityWeight[a.priority] || 2);
      if (weightDiff !== 0) return weightDiff;

      if (a.time && b.time) return a.time.localeCompare(b.time);
      return 0;
    });
  }, [todayHomeworkTasks, todayPreTasks, todayPostTasks, highPriorityProjectTasks]);

  const totalTasksCount = allTodayTasks.length;
  const completedTasksCount = allTodayTasks.filter((t) => t.completed).length;
  const remainingTasksCount = totalTasksCount - completedTasksCount;

  // Filtered tasks based on active filter
  const filteredTasks = useMemo(() => {
    if (taskFilter === 'pending') return allTodayTasks.filter((t) => !t.completed);
    if (taskFilter === 'completed') return allTodayTasks.filter((t) => t.completed);
    return allTodayTasks;
  }, [allTodayTasks, taskFilter]);

  // Most Important Task (MIT / مهم‌ترین کار روز)
  const mostImportantTask = useMemo(() => {
    if (allTodayTasks.length === 0) return null;
    if (designatedMitId) {
      const found = allTodayTasks.find((t) => t.id === designatedMitId);
      if (found) return found;
    }
    const uncompletedHigh = allTodayTasks.find((t) => !t.completed && (t.priority === 'high' || (t as any).isOverdue));
    if (uncompletedHigh) return uncompletedHigh;
    const firstUncompleted = allTodayTasks.find((t) => !t.completed);
    return firstUncompleted || allTodayTasks[0];
  }, [allTodayTasks, designatedMitId]);

  // Handle Task Completion Toggle
  const handleToggleTask = (task: typeof allTodayTasks[0]) => {
    if (task.type === 'homework') {
      toggleHomework(task.id);
    } else if (task.type === 'postSchool') {
      togglePostSchoolTask(currentIranianDayIdx, task.id);
    } else if (task.type === 'preSchool') {
      togglePreSchoolTask(currentIranianDayIdx, task.id);
    } else if (task.type === 'project' && (task as any).projectId) {
      updateProjectTaskStatus((task as any).projectId, task.id, task.completed ? 'todo' : 'completed');
    }
  };

  // Handle Task Deletion
  const handleDeleteTask = (task: typeof allTodayTasks[0]) => {
    if (task.type === 'postSchool') {
      deletePostSchoolTask(currentIranianDayIdx, task.id);
    } else if (task.type === 'homework') {
      deleteHomework(task.id);
    }
  };

  // Start Editing Task
  const handleStartEditTask = (task: typeof allTodayTasks[0]) => {
    setEditingTaskId(task.id);
    setEditingTaskTitle(task.title);
    setEditingTaskTime(task.time || '');
    setEditingTaskPriority(task.priority);
  };

  // Save Edited Task
  const handleSaveEditTask = (task: typeof allTodayTasks[0]) => {
    if (!editingTaskTitle.trim()) return;

    if (task.type === 'postSchool') {
      updatePlannedTask(task.id, currentIranianDayIdx, {
        title: editingTaskTitle.trim(),
        dueTime: editingTaskTime.trim(),
        priority: editingTaskPriority,
      });
    } else if (task.type === 'homework') {
      updateHomework(task.id, {
        title: editingTaskTitle.trim(),
        priority: editingTaskPriority,
      });
    }

    setEditingTaskId(null);
  };

  // Handle Quick Add Task for Today
  const handleAddTodayTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTaskTitle.trim()) return;
    addPostSchoolTask(currentIranianDayIdx, quickTaskTitle.trim(), quickTaskPriority, quickTaskTime.trim());
    setQuickTaskTitle('');
    setQuickTaskTime('');
    setQuickTaskPriority('medium');
    setShowInlineTaskInput(false);
  };

  // 3. 4 Pillars Overview Data
  const pendingHomeworks = homeworks.filter((h) => !h.completed);
  const overdueHomeworks = homeworks.filter((h) => !h.completed && h.dueDate < todayIso);
  const activeProjects = projects.filter((p) => p.status !== 'completed');

  const nextCompetition = competitions
    .filter((c) => c.readinessStatus !== 'completed')
    .slice()
    .sort((a, b) => new Date(a.registrationDeadline).getTime() - new Date(b.registrationDeadline).getTime())[0];

  const daysToNextComp = nextCompetition
    ? Math.max(0, Math.ceil((new Date(nextCompetition.registrationDeadline).getTime() - today.getTime()) / (1000 * 60 * 60 * 24)))
    : null;

  // 4. Upcoming Deadlines & Schedule (Exams, Events, Future Homeworks)
  const upcomingDeadlines = useMemo(() => {
    const list: Array<{
      id: string;
      title: string;
      subtitle: string;
      date: string;
      time?: string;
      type: 'exam' | 'event' | 'homework';
      priority: Priority;
    }> = [];

    // Next Exams
    exams
      .filter((e) => !e.completed && e.date >= todayIso)
      .forEach((e) => {
        list.push({
          id: `exam_${e.id}`,
          title: e.title,
          subtitle: `${e.subjectName} · امتحان`,
          date: e.date,
          time: e.time,
          type: 'exam',
          priority: e.priority,
        });
      });

    // Calendar Events
    calendarEvents
      .filter((c) => !c.completed && c.date >= todayIso)
      .forEach((c) => {
        list.push({
          id: `cal_${c.id}`,
          title: c.title,
          subtitle: 'رویداد تقویم',
          date: c.date,
          time: c.startTime,
          type: 'event',
          priority: c.priority,
        });
      });

    // Future Homeworks
    homeworks
      .filter((h) => !h.completed && h.dueDate > todayIso)
      .forEach((h) => {
        list.push({
          id: `hw_${h.id}`,
          title: h.title,
          subtitle: `${h.subjectName} · موعد تحویل`,
          date: h.dueDate,
          type: 'homework',
          priority: h.priority,
        });
      });

    return list.sort((a, b) => a.date.localeCompare(b.date)).slice(0, 4);
  }, [exams, calendarEvents, homeworks, todayIso]);

  // Handle Quick Event Add
  const handleCreateQuickEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickEventTitle.trim()) return;
    const targetDate = quickEventDate || todayIso;
    addCalendarEvent({
      title: quickEventTitle.trim(),
      date: targetDate,
      startTime: quickEventTime.trim() || undefined,
      section: 'general',
      priority: 'medium',
      completed: false,
    });
    setQuickEventTitle('');
    setQuickEventDate('');
    setQuickEventTime('');
    setShowQuickEventForm(false);
  };

  // 5. Active Goals
  const activeGoals = useMemo(() => {
    return goals
      .filter((g) => g.status !== 'completed')
      .sort((a, b) => (a.priority === 'high' ? -1 : 1))
      .slice(0, 3);
  }, [goals]);

  const completedGoalsCount = goals.filter((g) => g.status === 'completed').length;

  // Handle Quick Goal Add
  const handleCreateQuickGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickGoalTitle.trim()) return;
    addGoal({
      title: quickGoalTitle.trim(),
      description: '',
      level: 'weekly',
      category: quickGoalCategory,
      startDate: todayIso,
      deadline: todayIso,
      priority: 'medium',
      measurementMetric: 'درصد پیشرفت',
      status: 'in_progress',
      progressPercentage: 0,
      milestones: [],
    });
    setQuickGoalTitle('');
    setShowQuickGoalForm(false);
  };

  // 6. Notes & Reminders
  const importantNotes = useMemo(() => {
    const pinned = notes.filter((n) => n.pinned);
    if (pinned.length >= 3) return pinned.slice(0, 3);
    const unpinned = notes.filter((n) => !n.pinned);
    return [...pinned, ...unpinned].slice(0, 3);
  }, [notes]);

  const activeNotifications = notifications.filter((n) => !n.isRead).slice(0, 2);

  const handleCreateQuickNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickNoteTitle.trim()) return;
    addNote({
      title: quickNoteTitle.trim(),
      content: quickNoteContent.trim(),
      category: 'general',
      tags: ['داشبورد'],
      pinned: false,
    });
    setQuickNoteTitle('');
    setQuickNoteContent('');
    setShowQuickNoteForm(false);
  };

  // 7. School Timetable for Today
  const todayBells = isSchoolDay
    ? [1, 2, 3, 4, 5].map((period) => {
        const cell = weeklyCells.find((c) => c.dayIndex === currentIranianDayIdx && c.period === period);
        const sub = subjects.find((s) => s.id === cell?.subjectId);
        const bellTime = profile.bellTimes.find((b) => b.period === period);
        return {
          period,
          bellTime: bellTime || { startTime: '08:00', endTime: '09:00', title: `زنگ ${period}` },
          subjectName: cell?.customSubjectName || sub?.name,
          room: cell?.room || sub?.room,
        };
      })
    : [];

  // Customization & Section Order
  const savedOrder = customization.dashboardCardsOrder || [];
  const hiddenCards = customization.hiddenDashboardCards || [];

  const activeSections = useMemo(() => {
    const defaultIds: DashboardSectionId[] = [
      'today_tasks',
      'quick_pillars',
      'upcoming_deadlines',
      'active_goals',
      'quick_notes',
      'today_habits',
      'school_timetable',
    ];

    const order = savedOrder.length > 0 ? savedOrder.filter((id): id is DashboardSectionId => defaultIds.includes(id as any)) : defaultIds;
    defaultIds.forEach((id) => {
      if (!order.includes(id)) order.push(id);
    });

    return order;
  }, [savedOrder]);

  const isSectionVisible = (id: DashboardSectionId) => {
    return !hiddenCards.includes(id);
  };

  const handleToggleSectionVisibility = (id: string) => {
    const isHidden = hiddenCards.includes(id);
    const updated = isHidden ? hiddenCards.filter((x) => x !== id) : [...hiddenCards, id];
    updateCustomization({ hiddenDashboardCards: updated });
  };

  const handleMoveSection = (index: number, direction: 'up' | 'down') => {
    const newOrder = [...activeSections];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newOrder.length) return;
    const temp = newOrder[index];
    newOrder[index] = newOrder[targetIndex];
    newOrder[targetIndex] = temp;
    updateCustomization({ dashboardCardsOrder: newOrder });
  };

  const handleResetLayout = () => {
    updateCustomization({
      dashboardCardsOrder: DASHBOARD_SECTIONS.map((s) => s.id),
      hiddenDashboardCards: ['school_timetable'],
    });
  };

  return (
    <div className="space-y-6 w-full min-w-0" dir="rtl">
      {/* =========================================================================
          1. MINIMAL, WARM & CALMING HEADER
          ========================================================================= */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 pb-4 border-b border-stone-200/80 dark:border-stone-800">
        <div>
          {/* Persian Date & Weekday */}
          <div className="flex items-center gap-2 text-xs text-stone-500 dark:text-stone-400 mb-1 font-medium">
            <CalendarIcon className="w-3.5 h-3.5 text-[var(--accent-primary)] opacity-90" />
            <span>{formatJalaliFull(today)}</span>
            <span aria-hidden="true" className="opacity-40">·</span>
            <span>{getIranianDayName(today)}</span>
          </div>

          {/* Personal Greeting & Calm Status Subtitle */}
          <div className="flex items-baseline gap-2.5 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
              {greeting}، {userName}
            </h1>

            <span className="text-xs text-stone-500 dark:text-stone-400 font-normal">
              {totalTasksCount === 0
                ? 'امروز زمان آرامی داری؛ کاری در صف انتظار نیست.'
                : remainingTasksCount === 0
                ? 'تمام کارهای امروز با موفقیت تکمیل شده‌اند.'
                : `${toPersianDigits(remainingTasksCount)} کار برای امروز باقی‌مانده است.`}
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Dashboard Section Customizer */}
          <button
            type="button"
            onClick={() => setShowConfigModal(true)}
            className="p-2 text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-200 bg-white dark:bg-[#121316] hover:bg-stone-50 dark:hover:bg-stone-800/80 border border-stone-200/80 dark:border-stone-800 rounded-xl transition-all cursor-pointer shadow-2xs"
            title="شخصی‌سازی چیدمان داشبورد"
            aria-label="تنظیمات چیدمان"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>

          {/* Quick Note Fast Toggle */}
          <button
            type="button"
            onClick={() => {
              setShowQuickNoteForm((prev) => !prev);
              setShowInlineTaskInput(false);
            }}
            className="hidden sm:flex items-center gap-1.5 px-3 py-2 text-stone-700 dark:text-stone-300 bg-white dark:bg-[#121316] hover:bg-stone-50 dark:hover:bg-stone-800/80 border border-stone-200/80 dark:border-stone-800 rounded-xl text-xs font-medium transition-all cursor-pointer shadow-2xs"
            title="ثبت سریع یادداشت"
          >
            <FileText className="w-3.5 h-3.5 text-stone-400" />
            <span>یادداشت سریع</span>
          </button>

          {/* Primary Quick Task Add Button */}
          <button
            type="button"
            onClick={() => {
              setShowInlineTaskInput((prev) => !prev);
              setShowQuickNoteForm(false);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-stone-900 hover:bg-stone-800 dark:bg-stone-100 dark:hover:bg-white text-white dark:text-stone-900 text-xs font-semibold rounded-xl transition-all cursor-pointer shadow-xs active:scale-[0.99]"
          >
            <Plus className="w-4 h-4" />
            <span>ثبت کار امروز</span>
          </button>
        </div>
      </header>

      {/* Floating Notifications (if any) */}
      {activeNotifications.length > 0 && (
        <div className="space-y-2">
          {activeNotifications.map((n) => (
            <div
              key={n.id}
              className="p-3 bg-stone-50 dark:bg-stone-900/60 border border-stone-200/80 dark:border-stone-800 rounded-xl flex items-center justify-between gap-3 text-xs text-stone-800 dark:text-stone-200"
            >
              <div className="flex items-center gap-2 min-w-0">
                <Bell className="w-4 h-4 text-[var(--accent-primary)] shrink-0" />
                <span className="font-semibold">{n.title}:</span>
                <span className="truncate text-stone-600 dark:text-stone-400">{n.message}</span>
              </div>
              <button
                type="button"
                onClick={() => clearNotification(n.id)}
                className="text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 p-1 rounded-md cursor-pointer"
                title="بستن اعلان"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* =========================================================================
          2. THE 4 PILLARS (مدرسه، مهارت‌ها، پروژه‌ها، مسابقات)
          ========================================================================= */}
      {isSectionVisible('quick_pillars') && (
        <section aria-label="بخش‌های اصلی">
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {/* Pillar 1: School */}
            <div
              onClick={() => onNavigate('school')}
              className="group p-4 bg-white dark:bg-[#121316] rounded-2xl border border-stone-200/80 dark:border-stone-800 hover:border-stone-400 dark:hover:border-stone-700 transition-all cursor-pointer shadow-2xs"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-stone-800 dark:text-stone-200">مدرسه و درس‌ها</span>
                <div className="w-7 h-7 rounded-lg bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 flex items-center justify-center">
                  <GraduationCap className="w-4 h-4" />
                </div>
              </div>
              <div className="text-base sm:text-lg font-bold font-mono tabular-nums text-stone-900 dark:text-stone-100">
                {toPersianDigits(pendingHomeworks.length)}
                <span className="text-xs font-normal text-stone-500 dark:text-stone-400 mr-1.5">تکلیف در انتظار</span>
              </div>
              {overdueHomeworks.length > 0 ? (
                <p className="text-[11px] text-rose-600 dark:text-rose-400 font-medium mt-1">
                  {toPersianDigits(overdueHomeworks.length)} تکلیف عقب‌افتاده
                </p>
              ) : (
                <p className="text-[11px] text-stone-400 dark:text-stone-500 mt-1 flex items-center justify-between">
                  <span>تکالیف به‌روز</span>
                  <ChevronLeft className="w-3 h-3 text-stone-400 group-hover:-translate-x-0.5 transition-transform" />
                </p>
              )}
            </div>

            {/* Pillar 2: Skills */}
            <div
              onClick={() => onNavigate('skills')}
              className="group p-4 bg-white dark:bg-[#121316] rounded-2xl border border-stone-200/80 dark:border-stone-800 hover:border-stone-400 dark:hover:border-stone-700 transition-all cursor-pointer shadow-2xs"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-stone-800 dark:text-stone-200">توسعه مهارت‌ها</span>
                <div className="w-7 h-7 rounded-lg bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
              </div>
              <div className="text-base sm:text-lg font-bold font-mono tabular-nums text-stone-900 dark:text-stone-100">
                {toPersianDigits(skills.length)}
                <span className="text-xs font-normal text-stone-500 dark:text-stone-400 mr-1.5">مهارت فعال</span>
              </div>
              <p className="text-[11px] text-stone-400 dark:text-stone-500 mt-1 flex items-center justify-between">
                <span>نقشه‌راه و تمرین‌ها</span>
                <ChevronLeft className="w-3 h-3 text-stone-400 group-hover:-translate-x-0.5 transition-transform" />
              </p>
            </div>

            {/* Pillar 3: Projects */}
            <div
              onClick={() => onNavigate('projects')}
              className="group p-4 bg-white dark:bg-[#121316] rounded-2xl border border-stone-200/80 dark:border-stone-800 hover:border-stone-400 dark:hover:border-stone-700 transition-all cursor-pointer shadow-2xs"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-stone-800 dark:text-stone-200">مدیریت پروژه‌ها</span>
                <div className="w-7 h-7 rounded-lg bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 flex items-center justify-center">
                  <FolderGit2 className="w-4 h-4" />
                </div>
              </div>
              <div className="text-base sm:text-lg font-bold font-mono tabular-nums text-stone-900 dark:text-stone-100">
                {toPersianDigits(activeProjects.length)}
                <span className="text-xs font-normal text-stone-500 dark:text-stone-400 mr-1.5">پروژه در جریان</span>
              </div>
              <p className="text-[11px] text-stone-400 dark:text-stone-500 mt-1 flex items-center justify-between">
                <span>تخته وظایف کانبان</span>
                <ChevronLeft className="w-3 h-3 text-stone-400 group-hover:-translate-x-0.5 transition-transform" />
              </p>
            </div>

            {/* Pillar 4: Competitions */}
            <div
              onClick={() => onNavigate('competitions')}
              className="group p-4 bg-white dark:bg-[#121316] rounded-2xl border border-stone-200/80 dark:border-stone-800 hover:border-stone-400 dark:hover:border-stone-700 transition-all cursor-pointer shadow-2xs"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-stone-800 dark:text-stone-200">مسابقات و المپیاد</span>
                <div className="w-7 h-7 rounded-lg bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 flex items-center justify-center">
                  <Trophy className="w-4 h-4" />
                </div>
              </div>
              <div className="text-base sm:text-lg font-bold font-mono tabular-nums text-stone-900 dark:text-stone-100 truncate">
                {daysToNextComp !== null ? `${toPersianDigits(daysToNextComp)} روز` : toPersianDigits(competitions.length)}
                <span className="text-xs font-normal text-stone-500 dark:text-stone-400 mr-1.5">
                  {daysToNextComp !== null ? 'تا موعد بعدی' : 'رویداد ثبت‌شده'}
                </span>
              </div>
              <p className="text-[11px] text-stone-400 dark:text-stone-500 mt-1 truncate">
                {nextCompetition ? nextCompetition.title : 'آماده‌سازی آزمون'}
              </p>
            </div>
          </div>
        </section>
      )}

      {/* =========================================================================
          3. MAIN 2-COLUMN BALANCED WORKSPACE
          Right: Today's Tasks & MIT (Focal Centerpiece)
          Left: Upcoming Deadlines + Goals + Notes
          ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6 items-start">
        {/* RIGHT COLUMN (7 cols on lg, 8 on 2xl): Today's Tasks */}
        <div className="lg:col-span-7 xl:col-span-7 2xl:col-span-8 space-y-6 min-w-0">
          {/* Section: Today's Tasks */}
          {isSectionVisible('today_tasks') && (
            <section className="bg-white dark:bg-[#121316] rounded-2xl p-5 sm:p-6 border border-stone-200/80 dark:border-stone-800 shadow-xs">
              {/* Header with Title and Filter Tabs */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3.5 mb-4 border-b border-stone-100 dark:border-stone-800/80 gap-2.5">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[var(--accent-primary)]" />
                  <h2 className="text-sm font-bold text-stone-900 dark:text-stone-100">
                    کارهای امروز
                  </h2>
                  <span className="text-xs text-stone-400 dark:text-stone-500 font-mono tabular-nums">
                    ({toPersianDigits(remainingTasksCount)} در انتظار · {toPersianDigits(completedTasksCount)} انجام‌شده)
                  </span>
                </div>

                {/* Filter Tabs */}
                <div className="flex items-center gap-1 bg-stone-100/70 dark:bg-stone-900/80 p-0.5 rounded-xl border border-stone-200/60 dark:border-stone-800/80">
                  {(['all', 'pending', 'completed'] as const).map((filterKey) => (
                    <button
                      key={filterKey}
                      type="button"
                      onClick={() => setTaskFilter(filterKey)}
                      className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-all cursor-pointer ${
                        taskFilter === filterKey
                          ? 'bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 shadow-2xs font-semibold'
                          : 'text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-200'
                      }`}
                    >
                      {filterKey === 'all' ? 'همه' : filterKey === 'pending' ? 'در انتظار' : 'انجام‌شده'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Compact Inline Quick-Add Task Form */}
              {showInlineTaskInput && (
                <form
                  onSubmit={handleAddTodayTask}
                  className="mb-4 p-3 bg-stone-50/80 dark:bg-stone-900/60 border border-stone-200/80 dark:border-stone-800 rounded-xl space-y-2 animate-in fade-in duration-150"
                >
                  <input
                    type="text"
                    value={quickTaskTitle}
                    onChange={(e) => setQuickTaskTitle(e.target.value)}
                    placeholder="عنوان کار جدید برای امروز..."
                    autoFocus
                    required
                    className="w-full px-3 py-2 text-xs rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 placeholder:text-stone-400 focus:outline-none focus:border-[var(--accent-primary)]"
                  />

                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2">
                      <input
                        type="time"
                        value={quickTaskTime}
                        onChange={(e) => setQuickTaskTime(e.target.value)}
                        className="px-2 py-1 text-xs rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-stone-800 dark:text-stone-200 font-mono"
                        title="ساعت انجام"
                      />

                      <select
                        value={quickTaskPriority}
                        onChange={(e) => setQuickTaskPriority(e.target.value as Priority)}
                        className="px-2 py-1 text-xs rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-stone-800 dark:text-stone-200"
                      >
                        <option value="high">اولویت بالا</option>
                        <option value="medium">اولویت متوسط</option>
                        <option value="low">اولویت عادی</option>
                      </select>
                    </div>

                    <div className="flex items-center gap-2 mr-auto">
                      <button
                        type="button"
                        onClick={() => setShowInlineTaskInput(false)}
                        className="px-2.5 py-1 text-xs text-stone-500 hover:text-stone-800 dark:text-stone-400 cursor-pointer"
                      >
                        انصراف
                      </button>
                      <button
                        type="submit"
                        className="px-3 py-1 bg-stone-900 hover:bg-stone-800 dark:bg-stone-100 dark:hover:bg-white text-white dark:text-stone-900 text-xs font-semibold rounded-lg cursor-pointer"
                      >
                        افزودن
                      </button>
                    </div>
                  </div>
                </form>
              )}

              {/* HIGHLIGHTED: Most Important Task (MIT) */}
              {mostImportantTask && taskFilter !== 'completed' && !mostImportantTask.completed && (
                <div className="mb-4 p-3.5 rounded-xl border border-stone-200/90 dark:border-stone-800 bg-stone-50/60 dark:bg-stone-900/40 flex items-start justify-between gap-3 transition-all">
                  <div className="flex items-start gap-3 min-w-0">
                    <button
                      type="button"
                      onClick={() => handleToggleTask(mostImportantTask)}
                      className={`w-5 h-5 rounded-md flex items-center justify-center transition-all shrink-0 mt-0.5 cursor-pointer ${
                        mostImportantTask.completed
                          ? 'bg-[var(--accent-primary)] text-white'
                          : 'border border-stone-400 dark:border-stone-600 hover:border-stone-800 dark:hover:border-stone-300'
                      }`}
                      title="علامت به عنوان انجام‌شده"
                    >
                      {mostImportantTask.completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </button>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[var(--accent-primary)]">
                          <Star className="w-3.5 h-3.5 fill-current" />
                          <span>تمرکز اصلی امروز</span>
                        </span>
                        {mostImportantTask.time && (
                          <span className="text-[11px] font-mono tabular-nums text-stone-500 dark:text-stone-400">
                            · {toPersianDigits(mostImportantTask.time)}
                          </span>
                        )}
                      </div>

                      <p className="text-sm font-semibold text-stone-900 dark:text-stone-100">
                        {mostImportantTask.title}
                      </p>

                      <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">
                        {mostImportantTask.source}
                      </p>
                    </div>
                  </div>

                  <span className="text-[10px] text-stone-500 dark:text-stone-400 px-2 py-0.5 rounded bg-stone-200/50 dark:bg-stone-800/50 shrink-0">
                    اولویت اصلی
                  </span>
                </div>
              )}

              {/* Task Items List */}
              <div className="space-y-2">
                {filteredTasks.length === 0 ? (
                  /* Calm, Graceful Empty State */
                  <div className="py-8 text-center px-4 rounded-xl border border-dashed border-stone-200/80 dark:border-stone-800 bg-stone-50/40 dark:bg-stone-900/30">
                    <CheckCircle2 className="w-7 h-7 text-stone-400 dark:text-stone-500 mx-auto mb-2 opacity-60" />
                    <p className="text-xs font-semibold text-stone-800 dark:text-stone-200">
                      {taskFilter === 'completed'
                        ? 'هنوز کاری تکمیل نشده است.'
                        : taskFilter === 'pending'
                        ? 'کاری در صف انتظار وجود ندارد.'
                        : 'امروز هیچ کاری ثبت نشده است.'}
                    </p>
                    <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-1 max-w-sm mx-auto">
                      {taskFilter === 'all'
                        ? 'می‌توانی روز را با افزودن یک کار کوچک یا ثبت یادداشت روزانه آغاز کنی.'
                        : 'از تب‌های بالا برای بررسی سایر وضعیت‌ها استفاده کن.'}
                    </p>
                    {taskFilter === 'all' && (
                      <button
                        type="button"
                        onClick={() => setShowInlineTaskInput(true)}
                        className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-800 dark:text-stone-200 hover:bg-stone-50 transition-colors cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>افزودن اولین کار امروز</span>
                      </button>
                    )}
                  </div>
                ) : (
                  filteredTasks.map((task) => {
                    const isMit = mostImportantTask?.id === task.id;
                    const isEditing = editingTaskId === task.id;

                    if (isEditing) {
                      return (
                        <div
                          key={task.id}
                          className="p-3 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-900/80 space-y-2"
                        >
                          <input
                            type="text"
                            value={editingTaskTitle}
                            onChange={(e) => setEditingTaskTitle(e.target.value)}
                            className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 focus:outline-none"
                            placeholder="عنوان کار..."
                            autoFocus
                          />
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <input
                                type="time"
                                value={editingTaskTime}
                                onChange={(e) => setEditingTaskTime(e.target.value)}
                                className="px-2 py-1 text-xs rounded border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-stone-800 dark:text-stone-200"
                              />
                              <select
                                value={editingTaskPriority}
                                onChange={(e) => setEditingTaskPriority(e.target.value as Priority)}
                                className="px-2 py-1 text-xs rounded border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-stone-800 dark:text-stone-200"
                              >
                                <option value="high">بالا</option>
                                <option value="medium">متوسط</option>
                                <option value="low">عادی</option>
                              </select>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => setEditingTaskId(null)}
                                className="px-2 py-1 text-xs text-stone-500 hover:text-stone-800 dark:text-stone-400"
                              >
                                لغو
                              </button>
                              <button
                                type="button"
                                onClick={() => handleSaveEditTask(task)}
                                className="px-2.5 py-1 text-xs bg-stone-900 hover:bg-stone-800 dark:bg-stone-100 dark:hover:bg-white text-white dark:text-stone-900 font-semibold rounded"
                              >
                                ذخیره
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div
                        key={task.id}
                        className={`group flex items-center justify-between p-3 rounded-xl border transition-all ${
                          task.completed
                            ? 'bg-stone-50/40 dark:bg-stone-900/30 border-stone-200/50 dark:border-stone-800/50 opacity-60'
                            : (task as any).isOverdue
                            ? 'bg-rose-50/30 dark:bg-rose-950/20 border-rose-200/60 dark:border-rose-900/40'
                            : 'bg-stone-50/70 dark:bg-stone-900/60 border-stone-200/70 dark:border-stone-800/70 hover:border-stone-300 dark:hover:border-stone-700'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {/* Checkbox */}
                          <button
                            type="button"
                            onClick={() => handleToggleTask(task)}
                            className={`w-4 h-4 rounded flex items-center justify-center transition-all shrink-0 cursor-pointer ${
                              task.completed
                                ? 'bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900'
                                : 'border border-stone-300 dark:border-stone-600 hover:border-stone-800 dark:hover:border-stone-200'
                            }`}
                            aria-label={task.completed ? 'علامت به عنوان انجام‌نشده' : 'علامت به عنوان انجام‌شده'}
                          >
                            {task.completed && <Check className="w-3 h-3 stroke-[3]" />}
                          </button>

                          <div className="min-w-0">
                            <p
                              className={`text-xs font-medium truncate ${
                                task.completed
                                  ? 'line-through text-stone-400 dark:text-stone-500'
                                  : 'text-stone-800 dark:text-stone-200'
                              }`}
                            >
                              {task.title}
                            </p>
                            <div className="flex items-center gap-2 text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">
                              <span>{task.source}</span>
                              {task.time && (
                                <>
                                  <span aria-hidden="true" className="opacity-40">·</span>
                                  <span className="font-mono tabular-nums">{toPersianDigits(task.time)}</span>
                                </>
                              )}
                              {(task as any).isOverdue && (
                                <>
                                  <span aria-hidden="true" className="opacity-40">·</span>
                                  <span className="text-rose-600 dark:text-rose-400 font-medium">عقب‌افتاده</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          {/* Priority Indicator */}
                          <span
                            className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
                              task.priority === 'high'
                                ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-300'
                                : task.priority === 'medium'
                                ? 'bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-300'
                                : 'text-stone-400 dark:text-stone-500'
                            }`}
                          >
                            {task.priority === 'high' ? 'بالا' : task.priority === 'medium' ? 'متوسط' : 'عادی'}
                          </span>

                          {/* Set as MIT toggle */}
                          <button
                            type="button"
                            onClick={() => setDesignatedMitId(isMit ? null : task.id)}
                            className={`p-1 rounded cursor-pointer transition-colors ${
                              isMit
                                ? 'text-[var(--accent-primary)]'
                                : 'text-stone-400 hover:text-[var(--accent-primary)] opacity-0 group-hover:opacity-100'
                            }`}
                            title={isMit ? 'تمرکز اصلی روز' : 'انتخاب به عنوان تمرکز اصلی'}
                          >
                            <Star className={`w-3.5 h-3.5 ${isMit ? 'fill-current' : ''}`} />
                          </button>

                          {/* Edit button */}
                          {(task.type === 'postSchool' || task.type === 'homework') && (
                            <button
                              type="button"
                              onClick={() => handleStartEditTask(task)}
                              className="p-1 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 opacity-0 group-hover:opacity-100 transition-opacity rounded cursor-pointer"
                              title="ویرایش"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* Delete task */}
                          {(task.type === 'postSchool' || task.type === 'homework') && (
                            <button
                              type="button"
                              onClick={() => handleDeleteTask(task)}
                              className="p-1 text-stone-400 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity rounded cursor-pointer"
                              title="حذف"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </section>
          )}

          {/* Section: Today's Habits (if habits exist) */}
          {isSectionVisible('today_habits') && habits.length > 0 && (
            <div className="bg-white dark:bg-[#121316] rounded-2xl p-5 border border-stone-200/80 dark:border-stone-800 shadow-xs">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-stone-100 dark:border-stone-800/80">
                <div className="flex items-center gap-2">
                  <Flame className="w-4 h-4 text-[var(--accent-primary)]" />
                  <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100">
                    عادت‌ها و استمرار روزانه
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => onNavigate('habits')}
                  className="text-xs text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-200 flex items-center gap-0.5 cursor-pointer"
                >
                  مشاهده همه <ChevronLeft className="w-3 h-3" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {habits.slice(0, 4).map((h) => {
                  const isDoneToday = h.completedDates.includes(todayIso);
                  return (
                    <div
                      key={h.id}
                      className={`p-2.5 rounded-xl border flex items-center justify-between transition-colors ${
                        isDoneToday
                          ? 'bg-stone-50/90 dark:bg-stone-900/80 border-stone-200/90 dark:border-stone-750'
                          : 'bg-stone-50/50 dark:bg-stone-900/40 border-stone-200/60 dark:border-stone-800'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <button
                          type="button"
                          onClick={() => toggleHabitToday(h.id)}
                          className={`w-4 h-4 rounded flex items-center justify-center transition-all shrink-0 cursor-pointer ${
                            isDoneToday
                              ? 'bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900'
                              : 'border border-stone-300 dark:border-stone-600'
                          }`}
                        >
                          {isDoneToday && <Check className="w-3 h-3 stroke-[3]" />}
                        </button>
                        <div className="min-w-0">
                          <p
                            className={`text-xs font-medium truncate ${
                              isDoneToday ? 'line-through text-stone-400 dark:text-stone-500' : 'text-stone-800 dark:text-stone-200'
                            }`}
                          >
                            {h.title}
                          </p>
                          <span className="text-[10px] text-stone-400 dark:text-stone-500 font-mono tabular-nums">
                            {toPersianDigits(h.streak)} روز استمرار
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* LEFT COLUMN (5 cols on lg, 4 on 2xl): Deadlines, Goals & Notes */}
        <div className="lg:col-span-5 xl:col-span-5 2xl:col-span-4 space-y-6 min-w-0">
          {/* Section: Upcoming Deadlines */}
          {isSectionVisible('upcoming_deadlines') && (
            <section className="bg-white dark:bg-[#121316] rounded-2xl p-5 border border-stone-200/80 dark:border-stone-800 shadow-xs">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-stone-100 dark:border-stone-800/80">
                <div className="flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4 text-[var(--accent-primary)]" />
                  <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100">
                    تقویم و موعدهای پیش‌رو
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowQuickEventForm((prev) => !prev)}
                    className="text-xs text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white cursor-pointer flex items-center gap-0.5"
                  >
                    <Plus className="w-3 h-3" />
                    <span>رویداد</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onNavigate('calendar')}
                    className="text-xs text-stone-400 hover:text-stone-700 dark:hover:text-stone-300 flex items-center gap-0.5 cursor-pointer"
                  >
                    تقویم <ChevronLeft className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Inline Quick Event Form */}
              {showQuickEventForm && (
                <form
                  onSubmit={handleCreateQuickEvent}
                  className="mb-3 p-3 bg-stone-50/80 dark:bg-stone-900/60 rounded-xl border border-stone-200 dark:border-stone-800 space-y-2 animate-in fade-in duration-150"
                >
                  <input
                    type="text"
                    value={quickEventTitle}
                    onChange={(e) => setQuickEventTitle(e.target.value)}
                    placeholder="عنوان رویداد..."
                    required
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 focus:outline-none"
                  />
                  <div className="flex items-center gap-2">
                    <input
                      type="date"
                      value={quickEventDate}
                      onChange={(e) => setQuickEventDate(e.target.value)}
                      className="px-2 py-1 text-xs rounded border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-stone-800 dark:text-stone-200"
                    />
                    <input
                      type="time"
                      value={quickEventTime}
                      onChange={(e) => setQuickEventTime(e.target.value)}
                      className="px-2 py-1 text-xs rounded border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-stone-800 dark:text-stone-200"
                    />
                  </div>
                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowQuickEventForm(false)}
                      className="px-2 py-1 text-xs text-stone-500 dark:text-stone-400"
                    >
                      لغو
                    </button>
                    <button
                      type="submit"
                      className="px-3 py-1 bg-stone-900 hover:bg-stone-800 dark:bg-stone-100 dark:hover:bg-white text-white dark:text-stone-900 text-xs font-semibold rounded"
                    >
                      ثبت رویداد
                    </button>
                  </div>
                </form>
              )}

              <div className="space-y-2">
                {upcomingDeadlines.length === 0 ? (
                  <div className="py-5 text-center text-xs text-stone-400 dark:text-stone-500">
                    رویداد یا موعد فوری در روزهای آینده ثبت نشده است.
                  </div>
                ) : (
                  upcomingDeadlines.map((item) => (
                    <div
                      key={item.id}
                      className="p-2.5 rounded-xl bg-stone-50/60 dark:bg-stone-900/50 border border-stone-200/70 dark:border-stone-800/70 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="min-w-0">
                        <p className="font-medium text-stone-800 dark:text-stone-200 truncate">{item.title}</p>
                        <div className="flex items-center gap-1.5 text-[11px] text-stone-400 dark:text-stone-500 mt-0.5">
                          <span>{item.subtitle}</span>
                          {item.time && (
                            <>
                              <span aria-hidden="true" className="opacity-40">·</span>
                              <span className="font-mono tabular-nums">{toPersianDigits(item.time)}</span>
                            </>
                          )}
                        </div>
                      </div>

                      <span className="text-[10px] text-stone-600 dark:text-stone-400 px-2 py-0.5 rounded bg-white dark:bg-stone-800 border border-stone-200/60 dark:border-stone-700/60 shrink-0">
                        {getRelativeTimeString(item.date)}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </section>
          )}

          {/* Section: Active Goals */}
          {isSectionVisible('active_goals') && (
            <section className="bg-white dark:bg-[#121316] rounded-2xl p-5 border border-stone-200/80 dark:border-stone-800 shadow-xs">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-stone-100 dark:border-stone-800/80">
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-[var(--accent-primary)]" />
                  <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100">
                    اهداف فعال
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowQuickGoalForm((prev) => !prev)}
                    className="text-xs text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white cursor-pointer flex items-center gap-0.5"
                  >
                    <Plus className="w-3 h-3" />
                    <span>هدف</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onNavigate('goals')}
                    className="text-xs text-stone-400 hover:text-stone-700 dark:hover:text-stone-300 flex items-center gap-0.5 cursor-pointer"
                  >
                    همه ({toPersianDigits(completedGoalsCount)} انجام‌شده) <ChevronLeft className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Inline Quick Goal Form */}
              {showQuickGoalForm && (
                <form
                  onSubmit={handleCreateQuickGoal}
                  className="mb-3 p-3 bg-stone-50/80 dark:bg-stone-900/60 rounded-xl border border-stone-200 dark:border-stone-800 space-y-2 animate-in fade-in duration-150"
                >
                  <input
                    type="text"
                    value={quickGoalTitle}
                    onChange={(e) => setQuickGoalTitle(e.target.value)}
                    placeholder="عنوان هدف جدید..."
                    required
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 focus:outline-none"
                  />
                  <div className="flex items-center justify-between gap-2">
                    <select
                      value={quickGoalCategory}
                      onChange={(e) => setQuickGoalCategory(e.target.value as SectionType)}
                      className="px-2 py-1 text-xs rounded border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-stone-800 dark:text-stone-200"
                    >
                      <option value="general">عمومی</option>
                      <option value="school">مدرسه</option>
                      <option value="skill">مهارت</option>
                      <option value="project">پروژه</option>
                      <option value="competition">مسابقه</option>
                    </select>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setShowQuickGoalForm(false)}
                        className="px-2 py-1 text-xs text-stone-500 dark:text-stone-400"
                      >
                        لغو
                      </button>
                      <button
                        type="submit"
                        className="px-3 py-1 bg-stone-900 hover:bg-stone-800 dark:bg-stone-100 dark:hover:bg-white text-white dark:text-stone-900 text-xs font-semibold rounded"
                      >
                        ثبت هدف
                      </button>
                    </div>
                  </div>
                </form>
              )}

              <div className="space-y-3">
                {activeGoals.length === 0 ? (
                  <div className="py-5 text-center text-xs text-stone-400 dark:text-stone-500">
                    هدف فعالی ثبت نشده است.
                  </div>
                ) : (
                  activeGoals.map((goal) => {
                    const pct = Math.max(0, Math.min(100, goal.progressPercentage || 0));
                    return (
                      <div key={goal.id} className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-medium text-stone-800 dark:text-stone-200 truncate">{goal.title}</span>
                          <span className="font-mono tabular-nums text-[11px] text-stone-500 dark:text-stone-400">
                            {toPersianDigits(pct)}٪
                          </span>
                        </div>
                        <div className="h-1.5 w-full bg-stone-100 dark:bg-stone-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[var(--accent-primary)] rounded-full transition-all duration-300"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </section>
          )}

          {/* Section: Quick Notes */}
          {isSectionVisible('quick_notes') && (
            <section className="bg-white dark:bg-[#121316] rounded-2xl p-5 border border-stone-200/80 dark:border-stone-800 shadow-xs">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-stone-100 dark:border-stone-800/80">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-[var(--accent-primary)]" />
                  <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100">
                    یادداشت‌های مهم
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowQuickNoteForm((prev) => !prev)}
                    className="text-xs text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white cursor-pointer flex items-center gap-0.5"
                  >
                    <Plus className="w-3 h-3" />
                    <span>یادداشت</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onNavigate('notes')}
                    className="text-xs text-stone-400 hover:text-stone-700 dark:hover:text-stone-300 flex items-center gap-0.5 cursor-pointer"
                  >
                    همه <ChevronLeft className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Inline Quick Note Form */}
              {showQuickNoteForm && (
                <form
                  onSubmit={handleCreateQuickNote}
                  className="mb-3 p-3 bg-stone-50/80 dark:bg-stone-900/60 rounded-xl border border-stone-200 dark:border-stone-800 space-y-2 animate-in fade-in duration-150"
                >
                  <input
                    type="text"
                    value={quickNoteTitle}
                    onChange={(e) => setQuickNoteTitle(e.target.value)}
                    placeholder="عنوان یادداشت..."
                    required
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 focus:outline-none"
                  />
                  <textarea
                    value={quickNoteContent}
                    onChange={(e) => setQuickNoteContent(e.target.value)}
                    placeholder="متن یادداشت..."
                    rows={2}
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 focus:outline-none"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowQuickNoteForm(false)}
                      className="px-2.5 py-1 text-xs text-stone-500 dark:text-stone-400 cursor-pointer"
                    >
                      انصراف
                    </button>
                    <button
                      type="submit"
                      className="px-3 py-1 bg-stone-900 hover:bg-stone-800 dark:bg-stone-100 dark:hover:bg-white text-white dark:text-stone-900 text-xs font-semibold rounded cursor-pointer"
                    >
                      ذخیره
                    </button>
                  </div>
                </form>
              )}

              <div className="space-y-2">
                {importantNotes.length === 0 ? (
                  <div className="py-5 text-center text-xs text-stone-400 dark:text-stone-500">
                    یادداشتی ثبت نشده است.
                  </div>
                ) : (
                  importantNotes.map((note) => (
                    <div
                      key={note.id}
                      className="p-2.5 rounded-xl bg-stone-50/60 dark:bg-stone-900/50 border border-stone-200/70 dark:border-stone-800/70 text-xs flex items-start justify-between gap-2"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          {note.pinned && <Pin className="w-3 h-3 text-[var(--accent-primary)] shrink-0" />}
                          <p className="font-semibold text-stone-800 dark:text-stone-200 truncate">{note.title}</p>
                        </div>
                        {note.content && (
                          <p className="text-[11px] text-stone-500 dark:text-stone-400 line-clamp-1 mt-0.5">
                            {note.content}
                          </p>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => toggleNotePinned(note.id)}
                        className={`p-1 rounded cursor-pointer ${
                          note.pinned ? 'text-[var(--accent-primary)]' : 'text-stone-400 hover:text-stone-600'
                        }`}
                        title={note.pinned ? 'برداشتن پین' : 'پین کردن'}
                      >
                        <Pin className="w-3 h-3" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </section>
          )}
        </div>
      </div>

      {/* =========================================================================
          4. COLLAPSIBLE SECONDARY DETAILS (School Bells & Activity Logs)
          ========================================================================= */}
      <div className="pt-2">
        <button
          type="button"
          onClick={() => setShowSecondaryDetails((prev) => !prev)}
          className="w-full py-2.5 px-4 rounded-xl border border-dashed border-stone-200/80 dark:border-stone-800 hover:border-stone-400 dark:hover:border-stone-700 text-xs font-medium text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
        >
          <span>{showSecondaryDetails ? 'بستن زنگ‌های مدرسه و وقایع' : 'مشاهده برنامه زنگ‌های مدرسه و گزارش وقایع'}</span>
          {showSecondaryDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>

        {showSecondaryDetails && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-4 animate-in fade-in duration-150">
            {/* School Bells */}
            <div className="bg-white dark:bg-[#121316] rounded-2xl p-5 border border-stone-200/80 dark:border-stone-800">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-stone-100 dark:border-stone-800/80">
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-stone-400" />
                  <span className="text-xs font-bold text-stone-800 dark:text-stone-200">
                    زنگ‌های مدرسه امروز ({getIranianDayName(today)})
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => onNavigate('school')}
                  className="text-xs text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-200 flex items-center gap-0.5 cursor-pointer"
                >
                  برنامه هفتگی <ChevronLeft className="w-3 h-3" />
                </button>
              </div>

              {isSchoolDay ? (
                <div className="space-y-2">
                  {todayBells.map((bell) => (
                    <div
                      key={bell.period}
                      className="p-2 rounded-xl bg-stone-50/60 dark:bg-stone-900/50 border border-stone-200/60 dark:border-stone-800/60 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="w-5 h-5 rounded bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-300 text-[10px] font-mono font-bold flex items-center justify-center shrink-0">
                          {toPersianDigits(bell.period)}
                        </span>
                        <span className="font-medium text-stone-800 dark:text-stone-200 truncate">
                          {bell.subjectName || '— بدون درس —'}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono tabular-nums text-stone-400 dark:text-stone-500">
                        {toPersianDigits(bell.bellTime.startTime)} تا {toPersianDigits(bell.bellTime.endTime)}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-5 text-center text-xs text-stone-400 dark:text-stone-500">
                  امروز روز تعطیل یا بدون کلاس است.
                </div>
              )}
            </div>

            {/* Recent Activity Log */}
            <div className="bg-white dark:bg-[#121316] rounded-2xl p-5 border border-stone-200/80 dark:border-stone-800">
              <div className="flex items-center gap-2 pb-3 mb-3 border-b border-stone-100 dark:border-stone-800/80">
                <Activity className="w-4 h-4 text-stone-400" />
                <span className="text-xs font-bold text-stone-800 dark:text-stone-200">
                  گزارش فعالیت‌های اخیر
                </span>
              </div>

              <div className="space-y-2">
                {activityLogs.length === 0 ? (
                  <div className="py-5 text-center text-xs text-stone-400 dark:text-stone-500">
                    هنوز فعالیتی ثبت نشده است.
                  </div>
                ) : (
                  activityLogs.slice(0, 5).map((log) => (
                    <div key={log.id} className="text-xs flex items-start gap-2 py-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-primary)] mt-1.5 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-stone-700 dark:text-stone-300 text-[11px] leading-relaxed">
                          {log.description}
                        </p>
                        <span className="text-[10px] text-stone-400 dark:text-stone-500 font-mono tabular-nums">
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

      {/* =========================================================================
          5. MODAL: DASHBOARD LAYOUT & SECTION REORDERING
          ========================================================================= */}
      {showConfigModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="شخصی‌سازی چیدمان داشبورد"
          className="fixed inset-0 z-50 bg-stone-900/40 dark:bg-black/75 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-150"
        >
          <div className="bg-white dark:bg-[#121316] rounded-2xl max-w-md w-full p-5 sm:p-6 border border-stone-200 dark:border-stone-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800/80 pb-3">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-[var(--accent-primary)]" />
                <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100">
                  شخصی‌سازی چیدمان داشبورد
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowConfigModal(false)}
                className="p-1 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 rounded-lg cursor-pointer"
                aria-label="بستن"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed">
              می‌توانی ترتیب بخش‌های داشبورد را تغییر داده یا بخش‌های اختیاری را پنهان کنی. تنظیمات شما ذخیره می‌شود.
            </p>

            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {activeSections.map((secId, index) => {
                const meta = DASHBOARD_SECTIONS.find((s) => s.id === secId) || {
                  id: secId,
                  label: secId,
                  category: 'عمومی',
                  defaultVisible: true,
                };
                const visible = isSectionVisible(secId);

                return (
                  <div
                    key={secId}
                    className={`flex items-center justify-between p-2.5 rounded-xl border transition-colors ${
                      !visible
                        ? 'bg-stone-50/40 dark:bg-stone-900/30 border-dashed border-stone-200 dark:border-stone-800 opacity-50'
                        : 'bg-stone-50/80 dark:bg-stone-900/60 border-stone-200/80 dark:border-stone-800'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="w-5 h-5 rounded bg-white dark:bg-stone-800 text-stone-500 dark:text-stone-400 text-[10px] font-mono font-bold flex items-center justify-center shrink-0">
                        {toPersianDigits(index + 1)}
                      </span>
                      <span
                        className={`text-xs font-medium truncate ${
                          !visible ? 'line-through text-stone-400' : 'text-stone-800 dark:text-stone-200'
                        }`}
                      >
                        {meta.label}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        disabled={index === 0}
                        onClick={() => handleMoveSection(index, 'up')}
                        className="p-1 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 disabled:opacity-20 rounded cursor-pointer"
                        title="انتقال به بالا"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        disabled={index === activeSections.length - 1}
                        onClick={() => handleMoveSection(index, 'down')}
                        className="p-1 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 disabled:opacity-20 rounded cursor-pointer"
                        title="انتقال به پایین"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleToggleSectionVisibility(secId)}
                        className={`p-1 rounded cursor-pointer ${
                          !visible
                            ? 'text-stone-400 hover:text-stone-700'
                            : 'text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100'
                        }`}
                        title={!visible ? 'نمایش مجدد' : 'مخفی کردن'}
                      >
                        {!visible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-2 flex items-center justify-between border-t border-stone-100 dark:border-stone-800/80">
              <button
                type="button"
                onClick={handleResetLayout}
                className="text-xs text-rose-600 dark:text-rose-400 hover:underline cursor-pointer flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                <span>بازنشانی پیش‌فرض</span>
              </button>

              <button
                type="button"
                onClick={() => setShowConfigModal(false)}
                className="px-4 py-2 bg-stone-900 hover:bg-stone-800 dark:bg-stone-100 dark:hover:bg-white text-white dark:text-stone-900 text-xs font-semibold rounded-xl cursor-pointer"
              >
                تأیید و بازگشت
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
