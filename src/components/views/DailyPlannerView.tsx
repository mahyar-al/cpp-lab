import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  Clock,
  Plus,
  CheckCircle2,
  Circle,
  AlertTriangle,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  ListTodo,
  Sparkles,
  Coffee,
  ArrowRightLeft,
  Trash2,
  Edit2,
  Check,
  X,
  Layers,
  Flame,
  Info,
  Play,
  LifeBuoy,
  Zap,
  TrendingUp,
  BrainCircuit,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import {
  getIranianDayOfWeek,
  getIranianDayName,
  formatJalaliFull,
  toPersianDigits,
} from '../../utils/jalali';
import { Priority, SectionType, TaskItem, TaskSubtask } from '../../types';

export const DailyPlannerView: React.FC = () => {
  const {
    dayData,
    addPlannedTask,
    updatePlannedTask,
    deletePlannedTask,
    toggleTaskSubtask,
    addTaskSubtask,
    rescheduleTask,
    profile,
    subjects,
    weeklyCells,
    homeworks,
    rolloverOverdueTasks,
    showToast,
    generateSmartSchedule,
    applyProposedSchedule,
    simulateSchedule,
    smartSchedule,
    setIsRescueModalOpen,
    startActiveFocus,
  } = useApp();

  const today = new Date();
  const currentIranianDayIdx = getIranianDayOfWeek(today);
  const [selectedDayIdx, setSelectedDayIdx] = useState<number>(
    currentIranianDayIdx >= 0 && currentIranianDayIdx <= 4 ? currentIranianDayIdx : 0
  );

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskSection, setTaskSection] = useState<SectionType>('school');
  const [taskPriority, setTaskPriority] = useState<Priority>('medium');
  const [taskStartTime, setTaskStartTime] = useState('16:00');
  const [taskEndTime, setTaskEndTime] = useState('17:00');
  const [taskEstMinutes, setTaskEstMinutes] = useState(60);
  const [taskNotes, setTaskNotes] = useState('');
  const [taskEnergy, setTaskEnergy] = useState<'low' | 'medium' | 'high'>('medium');
  const [taskImportance, setTaskImportance] = useState<'critical' | 'high' | 'medium' | 'low'>('medium');
  const [taskDependsOn, setTaskDependsOn] = useState<string>('');
  const [taskIsFixed, setTaskIsFixed] = useState(false);

  // Smart & Adaptive Planning states
  const [isSmartPlannerModalOpen, setIsSmartPlannerModalOpen] = useState(false);
  const [smartAvailMinutes, setSmartAvailMinutes] = useState(240);
  const [smartStartTime, setSmartStartTime] = useState('16:00');
  const [smartFocusGoal, setSmartFocusGoal] = useState('');
  const [isSmartPlanLoading, setIsSmartPlanLoading] = useState(false);
  const [proposedSchedule, setProposedSchedule] = useState<any[] | null>(null);
  const [proposedAdvice, setProposedAdvice] = useState<string>('');
  const [showAdaptiveModal, setShowAdaptiveModal] = useState(false);
  const [delayMinutes, setDelayMinutes] = useState<number>(90);

  // Reschedule state
  const [rescheduleTaskId, setRescheduleTaskId] = useState<string | null>(null);
  const [rescheduleTargetDay, setRescheduleTargetDay] = useState<number>(
    (selectedDayIdx + 1) % 5
  );

  // Subtask input state
  const [activeSubtaskTaskId, setActiveSubtaskTaskId] = useState<string | null>(null);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');

  // Actual time editing state
  const [editingActualTaskId, setEditingActualTaskId] = useState<string | null>(null);
  const [actualMinutesInput, setActualMinutesInput] = useState<number>(0);

  const dayInfo = dayData[selectedDayIdx] || {
    dayIndex: selectedDayIdx,
    overallRating: null,
    preSchoolTasks: [],
    postSchoolTasks: [],
    notes: '',
    reflectionReport: '',
  };

  const tasks = dayInfo.postSchoolTasks || [];

  // Calculate total planned minutes
  const totalPlannedMinutes = tasks.reduce(
    (sum, t) => sum + (t.estimatedMinutes || 45),
    0
  );

  const totalActualMinutes = tasks.reduce(
    (sum, t) => sum + (t.actualMinutes || 0),
    0
  );

  const completedCount = tasks.filter((t) => t.completed).length;

  // School bells for the selected day
  const dayBells = [1, 2, 3, 4, 5].map((period) => {
    const cell = weeklyCells.find((c) => c.dayIndex === selectedDayIdx && c.period === period);
    const sub = subjects.find((s) => s.id === cell?.subjectId);
    const bellTime = profile.bellTimes.find((b) => b.period === period);
    return {
      period,
      bellTime: bellTime || { startTime: '08:00', endTime: '09:00', title: `زنگ ${period}` },
      subjectName: cell?.customSubjectName || sub?.name,
      color: cell?.color || sub?.color || 'var(--text)',
    };
  }).filter((b) => !!b.subjectName);

  // Time conflict detection algorithm
  const detectConflicts = (items: TaskItem[]) => {
    const conflicts: { task1: TaskItem; task2: TaskItem }[] = [];
    const timed = items.filter((t) => t.startTime && t.endTime);
    for (let i = 0; i < timed.length; i++) {
      for (let j = i + 1; j < timed.length; j++) {
        const a = timed[i];
        const b = timed[j];
        if (a.startTime! < b.endTime! && a.endTime! > b.startTime!) {
          conflicts.push({ task1: a, task2: b });
        }
      }
    }
    return conflicts;
  };

  const conflicts = detectConflicts(tasks);

  // Overcrowded schedule warning (more than 6 hours of post-school tasks)
  const isOvercrowded = totalPlannedMinutes > 360;

  // Available free time calculation (assuming 16 waking hours = 960 mins)
  // School takes ~360 mins, planned tasks take totalPlannedMinutes
  const schoolMinutes = dayBells.length * 80;
  const estimatedFreeMinutes = Math.max(0, 960 - schoolMinutes - totalPlannedMinutes);

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;

    addPlannedTask(
      {
        title: taskTitle.trim(),
        completed: false,
        priority: taskPriority,
        section: taskSection,
        startTime: taskStartTime,
        endTime: taskEndTime,
        estimatedMinutes: Number(taskEstMinutes) || 45,
        actualMinutes: 0,
        notes: taskNotes.trim() || undefined,
        energyLevel: taskEnergy,
        importance: taskImportance,
        dependsOnTaskId: taskDependsOn || undefined,
        isFixedTime: taskIsFixed,
        subtasks: [],
      },
      selectedDayIdx
    );

    setTaskTitle('');
    setTaskNotes('');
    setTaskDependsOn('');
    setTaskIsFixed(false);
    setIsAddModalOpen(false);
  };

  const handleAddSubtaskSubmit = (taskId: string) => {
    if (!newSubtaskTitle.trim()) return;
    addTaskSubtask(selectedDayIdx, taskId, newSubtaskTitle.trim());
    setNewSubtaskTitle('');
    setActiveSubtaskTaskId(null);
  };

  const handleSaveActualMinutes = (taskId: string) => {
    updatePlannedTask(taskId, selectedDayIdx, { actualMinutes: actualMinutesInput });
    setEditingActualTaskId(null);
  };

  const handleExecuteReschedule = () => {
    if (!rescheduleTaskId) return;
    rescheduleTask(rescheduleTaskId, selectedDayIdx, rescheduleTargetDay);
    setRescheduleTaskId(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Date Selector */}
      <div className="glass p-5 sm:p-6 rounded-[24px] shadow-xs relative">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <span className="p-2 rounded-xl bg-chip text-fg">
                <ListTodo className="w-5 h-5" />
              </span>
              <h1 className="text-xl font-bold text-fg">
                برنامه‌ریز هوشمند روزانه
              </h1>
            </div>
            <p className="text-xs text-muted">
              مدیریت زمان، اولویت‌ها و فعالیت‌های روزانه
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setIsRescueModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 btn-secondary text-xs rounded-[14px] transition-colors cursor-pointer active:scale-98"
              title="کاهش استرس و بازسازی کارهای امروز"
            >
              <LifeBuoy className="w-3.5 h-3.5 text-muted" />
              <span>نجات روز</span>
            </button>

            <button
              onClick={() => setIsSmartPlannerModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 btn-secondary text-xs rounded-[14px] transition-colors cursor-pointer active:scale-98"
              title="چینش خودکار فعالیت‌ها بر اساس اولویت"
            >
              <Sparkles className="w-3.5 h-3.5 text-muted" />
              <span>چینش خودکار</span>
            </button>

            <button
              onClick={() => rolloverOverdueTasks()}
              className="flex items-center gap-1.5 px-3 py-1.5 btn-secondary text-xs rounded-[14px] transition-colors cursor-pointer active:scale-98"
              title="انتقال کارهای عقب‌افتاده"
            >
              <RotateCcw className="w-3.5 h-3.5 text-muted" />
              <span>انتقال معوقه‌ها</span>
            </button>

            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 btn-primary font-semibold rounded-[14px] text-xs transition-colors cursor-pointer shadow-xs active:scale-98"
            >
              <Plus className="w-4 h-4" />
              <span>افزودن فعالیت</span>
            </button>
          </div>
        </div>

        {/* Day of Week Selector */}
        <div className="grid grid-cols-5 gap-1 sm:gap-2 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
          {[0, 1, 2, 3, 4].map((dIdx) => {
            const isSelected = selectedDayIdx === dIdx;
            const isToday = currentIranianDayIdx === dIdx;
            const dayTasks = dayData[dIdx]?.postSchoolTasks || [];
            const dayCompleted = dayTasks.filter((t) => t.completed).length;

            return (
              <button
                key={dIdx}
                onClick={() => setSelectedDayIdx(dIdx)}
                className={`flex flex-col items-center justify-center p-2 rounded-lg border transition-colors cursor-pointer min-w-0 ${
                  isSelected
                    ? 'bg-slate-900 dark:bg-slate-100 border-slate-900 dark:border-slate-100 text-white dark:text-slate-900 font-semibold shadow-xs'
                    : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-600 dark:text-slate-300'
                }`}
              >
                <div className="flex items-center gap-1 min-w-0">
                  <span className="text-[11px] sm:text-xs truncate">{getIranianDayName(dIdx)}</span>
                  {isToday && (
                    <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${isSelected ? 'bg-white dark:bg-slate-900' : 'bg-slate-900 dark:bg-slate-100'}`} />
                  )}
                </div>
                <span className="text-[9px] sm:text-[10px] text-slate-400 dark:text-slate-400 font-mono mt-0.5 truncate">
                  {toPersianDigits(dayCompleted)}/{toPersianDigits(dayTasks.length)}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Analytical Metrics Bar for the day */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass p-4 rounded-[20px] shadow-xs">
          <span className="text-xs text-muted block mb-1">زمان برنامه‌ریزی‌شده:</span>
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-bold font-mono text-fg">
              {toPersianDigits(Math.floor(totalPlannedMinutes / 60))} ساعت و {toPersianDigits(totalPlannedMinutes % 60)} دقیقه
            </span>
          </div>
        </div>

        <div className="glass p-4 rounded-[20px] shadow-xs">
          <span className="text-xs text-muted block mb-1">زمان ثبت‌شده واقعی:</span>
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-bold font-mono text-fg">
              {toPersianDigits(Math.floor(totalActualMinutes / 60))} ساعت و {toPersianDigits(totalActualMinutes % 60)} دقیقه
            </span>
          </div>
        </div>

        <div className="glass p-4 rounded-[20px] shadow-xs">
          <span className="text-xs text-muted block mb-1">فرصت آزاد تخمینی:</span>
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-bold font-mono text-fg">
              {toPersianDigits(Math.floor(estimatedFreeMinutes / 60))} ساعت
            </span>
            <span className="text-[10px] text-muted">و {toPersianDigits(estimatedFreeMinutes % 60)} دقیقه</span>
          </div>
        </div>

        <div className="glass p-4 rounded-[20px] shadow-xs">
          <span className="text-xs text-muted block mb-1">میزان پیشرفت روز:</span>
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-bold font-mono text-fg">
              {toPersianDigits(tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0)}٪
            </span>
            <span className="text-[10px] text-muted">({toPersianDigits(completedCount)} از {toPersianDigits(tasks.length)})</span>
          </div>
        </div>
      </div>

      {/* Warnings & Suggestions */}
      {conflicts.length > 0 && (
        <div className="p-4 rounded-xl bg-chip border border-line text-fg text-xs flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <div className="flex-1">
            <span className="font-bold block mb-0.5">هشدار تداخل زمانی در برنامه:</span>
            <span>
              بین «{conflicts[0].task1.title}» و «{conflicts[0].task2.title}» همپوشانی زمانی وجود دارد. لطفاً ساعت شروع یا پایان را تنظیم کنید.
            </span>
          </div>
        </div>
      )}

      {isOvercrowded && (
        <div className="p-4 rounded-xl bg-chip border border-line text-fg text-xs flex items-center gap-3">
          <Info className="w-5 h-5 shrink-0" />
          <div className="flex-1">
            <span className="font-bold block mb-0.5">برنامه بیش از حد فشرده است:</span>
            <span>
              مجموع فعالیت‌های برنامه‌ریزی‌شده بیش از ۶ ساعت است. برای جلوگیری از فرسودگی، انتقال بخشی از کارهای غیرضروری به روزهای بعد پیشنهاد می‌شود.
            </span>
          </div>
        </div>
      )}

      {/* Main Content Split: School Morning Bells + Planned Tasks Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6 items-start w-full">
        {/* School Bells for this day */}
        <div className="lg:col-span-4 xl:col-span-3 2xl:col-span-3 glass p-5 rounded-[24px] shadow-sm h-fit">
          <div className="flex items-center justify-between pb-3 border-b border-line/60 mb-3">
            <h2 className="text-sm font-bold text-fg flex items-center gap-2">
              <Clock className="w-4 h-4 text-muted" />
              زنگ‌های مدرسه ({getIranianDayName(selectedDayIdx)})
            </h2>
          </div>

          {dayBells.length === 0 ? (
            <div className="py-8 text-center text-xs text-muted">
              درسی برای این روز در برنامه هفتگی ثبت نشده است.
            </div>
          ) : (
            <div className="space-y-2.5">
              {dayBells.map((bell) => (
                <div
                  key={bell.period}
                  className="p-2.5 rounded-xl bg-surface border border-line flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0 bg-fg" />
                    <div className="flex flex-col min-w-0">
                      <span className="font-bold text-fg truncate">
                        {bell.subjectName}
                      </span>
                      <span className="text-[10px] text-muted">
                        {bell.bellTime.title}
                      </span>
                    </div>
                  </div>
                  <span className="font-mono text-[11px] text-muted shrink-0">
                    {bell.bellTime.startTime} - {bell.bellTime.endTime}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Buffer / Break Advice */}
          <div className="mt-4 p-3 rounded-xl bg-chip border border-line text-xs space-y-1">
            <span className="font-bold text-fg flex items-center gap-1 text-[11px]">
              <Coffee className="w-3.5 h-3.5 text-muted" />
              پیشنهاد استراحت هوشمند:
            </span>
            <p className="text-[11px] text-muted leading-relaxed">
              پس از پایان مدرسه، اختصاص حداقل ۴۵ دقیقه برای ناهار و استراحت پیش از شروع اولین فعالیت بعدازظهر توصیه می‌شود.
            </p>
          </div>
        </div>

        {/* Post-School Tasks Timeline */}
        <div className="lg:col-span-8 xl:col-span-9 2xl:col-span-9 space-y-4 min-w-0">
          <div className="glass p-5 rounded-[24px] shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-line/60 mb-4">
              <h2 className="text-sm font-bold text-fg flex items-center gap-2">
                <ListTodo className="w-4 h-4 text-muted" />
                وظایف و فعالیت‌های زمان‌بندی‌شده
              </h2>
              <span className="text-xs font-mono text-muted">
                {toPersianDigits(completedCount)}/{toPersianDigits(tasks.length)} انجام‌شده
              </span>
            </div>

            {tasks.length === 0 ? (
              <div className="py-12 text-center text-xs text-muted space-y-3">
                <p>هیچ فعالیتی برای بعدازظهر این روز ثبت نشده است.</p>
                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="px-4 py-2 bg-chip text-fg border border-line rounded-xl font-bold hover:bg-surface transition-all cursor-pointer"
                >
                  + افزودن اولین فعالیت
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {tasks.map((task, idx) => {
                  const subtasks = task.subtasks || [];
                  const subDone = subtasks.filter((s) => s.completed).length;
                  const isOver = task.actualMinutes && task.estimatedMinutes && task.actualMinutes > task.estimatedMinutes;

                  return (
                    <div
                      key={task.id}
                      className={`p-4 rounded-xl border transition-all text-right ${
                        task.completed
                          ? 'bg-chip/50 border-line opacity-80'
                          : 'bg-surface border border-line hover:border-fg/40 shadow-xs'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 min-w-0">
                          <button
                            onClick={() =>
                              updatePlannedTask(task.id, selectedDayIdx, {
                                completed: !task.completed,
                              })
                            }
                            className="mt-0.5 text-muted hover:text-fg transition-colors cursor-pointer"
                          >
                            {task.completed ? (
                              <CheckCircle2 className="w-5 h-5 text-fg" />
                            ) : (
                              <Circle className="w-5 h-5 text-muted" />
                            )}
                          </button>

                          <div className="flex flex-col min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span
                                className={`text-sm font-bold ${
                                  task.completed
                                    ? 'line-through text-muted'
                                    : 'text-fg'
                                }`}
                              >
                                {task.title}
                              </span>
                              {task.isRollover && (
                                <span className="text-[10px] px-1.5 py-0.5 bg-chip text-fg border border-line rounded-md">
                                  منتقل‌شده
                                </span>
                              )}
                              <span
                                className="text-[10px] px-1.5 py-0.5 rounded-md font-semibold bg-chip text-fg border border-line"
                              >
                                {task.priority === 'high' ? 'ضروری' : task.priority === 'medium' ? 'متوسط' : 'عادی'}
                              </span>

                              {task.importance && task.importance !== 'medium' && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded-md font-medium bg-chip text-fg border border-line">
                                  {task.importance === 'critical' ? '🔥 بحرانی' : '★ بااهمیت'}
                                </span>
                              )}

                              {task.energyLevel && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-chip text-fg border border-line font-mono">
                                  ⚡ {task.energyLevel === 'high' ? 'انرژی بالا' : task.energyLevel === 'low' ? 'انرژی کم' : 'انرژی متوسط'}
                                </span>
                              )}

                              {task.isFixedTime && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-chip text-fg border border-line">
                                  🔒 ساعت ثابت
                                </span>
                              )}

                              {task.dependsOnTaskId && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-chip text-fg border border-line truncate max-w-[120px]" title="وابسته به انجام تسک قبلی">
                                  🔗 وابسته
                                </span>
                              )}
                            </div>

                            {/* Time & Duration comparison */}
                            <div className="flex items-center gap-3 text-xs text-muted mt-1.5 flex-wrap">
                              {task.startTime && task.endTime && (
                                <span className="flex items-center gap-1 font-mono">
                                  <Clock className="w-3.5 h-3.5 text-muted" />
                                  {task.startTime} تا {task.endTime}
                                </span>
                              )}

                              <span className="font-mono">
                                تخمین: {toPersianDigits(task.estimatedMinutes || 45)} دقیقه
                              </span>

                              {/* Actual Time Badge / Button */}
                              {editingActualTaskId === task.id ? (
                                <div className="flex items-center gap-1">
                                  <input
                                    type="number"
                                    min="0"
                                    value={actualMinutesInput}
                                    onChange={(e) => setActualMinutesInput(Number(e.target.value))}
                                    className="w-16 px-1.5 py-0.5 bg-surface border border-line text-fg rounded text-xs font-mono"
                                  />
                                  <button
                                    onClick={() => handleSaveActualMinutes(task.id)}
                                    className="p-1 text-fg hover:text-muted"
                                  >
                                    <Check className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => setEditingActualTaskId(null)}
                                    className="p-1 text-muted hover:text-fg"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => {
                                    setEditingActualTaskId(task.id);
                                    setActualMinutesInput(task.actualMinutes || 0);
                                  }}
                                  className={`flex items-center gap-1 text-[11px] font-mono px-1.5 py-0.5 rounded cursor-pointer ${
                                    isOver
                                      ? 'text-fg bg-chip border border-line'
                                      : 'text-muted hover:text-fg'
                                  }`}
                                  title="کلیک برای ثبت زمان واقعی انجام"
                                >
                                  <span>واقعی: {toPersianDigits(task.actualMinutes || 0)} دقیقه</span>
                                  <Edit2 className="w-3 h-3 opacity-60" />
                                </button>
                              )}
                            </div>

                            {task.notes && (
                              <p className="text-xs text-muted mt-1">
                                {task.notes}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Task Actions */}
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={() => {
                              startActiveFocus({
                                taskId: task.id,
                                taskTitle: task.title,
                                section: task.section || 'school',
                                targetMinutes: task.estimatedMinutes || 25,
                                mode: 'work',
                              });
                            }}
                            className="p-1.5 text-muted hover:text-fg rounded-lg hover:bg-chip transition-colors cursor-pointer"
                            title="ورود به حالت تمرکز عمیق روی این فعالیت"
                          >
                            <Play className="w-4 h-4 text-fg" />
                          </button>
                          <button
                            onClick={() => {
                              setRescheduleTaskId(task.id);
                              setRescheduleTargetDay((selectedDayIdx + 1) % 5);
                            }}
                            className="p-1.5 text-muted hover:text-fg rounded-lg hover:bg-chip transition-colors cursor-pointer"
                            title="انتقال / زمان‌بندی مجدد"
                          >
                            <ArrowRightLeft className="w-4 h-4 text-muted" />
                          </button>
                          <button
                            onClick={() => deletePlannedTask(task.id, selectedDayIdx)}
                            className="p-1.5 text-muted hover:text-fg rounded-lg hover:bg-chip transition-colors cursor-pointer"
                            title="حذف فعالیت"
                          >
                            <Trash2 className="w-4 h-4 text-muted" />
                          </button>
                        </div>
                      </div>

                      {/* Subtasks breakdown */}
                      <div className="mt-3 pt-2.5 border-t border-line">
                        <div className="flex items-center justify-between text-[11px] text-muted mb-1.5">
                          <span className="flex items-center gap-1 font-semibold">
                            <Layers className="w-3.5 h-3.5 text-muted" />
                            زیر‌کارهای خردشده ({toPersianDigits(subDone)}/{toPersianDigits(subtasks.length)})
                          </span>
                          {activeSubtaskTaskId !== task.id && (
                            <button
                              onClick={() => {
                                setActiveSubtaskTaskId(task.id);
                                setNewSubtaskTitle('');
                              }}
                              className="text-fg hover:underline cursor-pointer font-medium"
                            >
                              + گام خرد جدید
                            </button>
                          )}
                        </div>

                        {subtasks.length > 0 && (
                          <div className="space-y-1.5 mb-2">
                            {subtasks.map((st) => (
                              <div
                                key={st.id}
                                onClick={() => toggleTaskSubtask(selectedDayIdx, task.id, st.id)}
                                className="flex items-center gap-2 text-xs text-muted cursor-pointer hover:text-fg"
                              >
                                <span className={`w-3.5 h-3.5 rounded border flex items-center justify-center text-[10px] ${
                                  st.completed
                                    ? 'bg-fg border-fg text-bg font-bold'
                                    : 'border-line'
                                }`}>
                                  {st.completed ? '✓' : ''}
                                </span>
                                <span className={st.completed ? 'line-through text-muted' : 'text-fg'}>
                                  {st.title}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}

                        {activeSubtaskTaskId === task.id && (
                          <div className="flex items-center gap-2 mt-2">
                            <input
                              type="text"
                              value={newSubtaskTitle}
                              onChange={(e) => setNewSubtaskTitle(e.target.value)}
                              placeholder="عنوان زیروظیفه خرد..."
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  handleAddSubtaskSubmit(task.id);
                                }
                              }}
                              className="flex-1 px-2.5 py-1 bg-surface border border-line rounded-lg text-xs text-fg placeholder:text-muted"
                            />
                            <button
                              onClick={() => handleAddSubtaskSubmit(task.id)}
                              className="px-2.5 py-1 bg-fg text-bg rounded-lg text-xs font-bold hover:opacity-90"
                            >
                              افزودن
                            </button>
                            <button
                              onClick={() => setActiveSubtaskTaskId(null)}
                              className="p-1 text-muted hover:text-fg"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Task Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xl">
          <div className="glass-strong w-full max-w-md rounded-[24px] p-5 shadow-2xl text-right animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-line mb-4">
              <h3 className="text-sm font-bold text-fg flex items-center gap-2">
                <Plus className="w-4 h-4 text-fg" />
                ثبت فعالیت جدید در برنامه ({getIranianDayName(selectedDayIdx)})
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 text-muted hover:text-fg rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  عنوان فعالیت:
                </label>
                <input
                  type="text"
                  required
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  placeholder="مثلاً: تمرین مبحث مثلثات ریاضی"
                  className="w-full px-3 py-2 bg-surface border border-line rounded-xl text-xs text-fg placeholder:text-muted"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-fg mb-1">
                    بخش مرتبط:
                  </label>
                  <select
                    value={taskSection}
                    onChange={(e) => setTaskSection(e.target.value as SectionType)}
                    className="w-full px-3 py-2 bg-surface border border-line rounded-xl text-xs text-fg"
                  >
                    <option value="school">مدرسه و درس‌ها</option>
                    <option value="skill">توسعه مهارت‌ها</option>
                    <option value="project">پروژه</option>
                    <option value="competition">مسابقات</option>
                    <option value="general">عمومی و فردی</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-fg mb-1">
                    سطح اولویت:
                  </label>
                  <select
                    value={taskPriority}
                    onChange={(e) => setTaskPriority(e.target.value as Priority)}
                    className="w-full px-3 py-2 bg-surface border border-line rounded-xl text-xs text-fg"
                  >
                    <option value="high">فوری و ضروری</option>
                    <option value="medium">متوسط</option>
                    <option value="low">عادی</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-semibold text-fg mb-1">
                    ساعت شروع:
                  </label>
                  <input
                    type="time"
                    value={taskStartTime}
                    onChange={(e) => setTaskStartTime(e.target.value)}
                    className="w-full px-2 py-1.5 bg-surface border border-line rounded-xl text-xs font-mono text-fg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-fg mb-1">
                    ساعت پایان:
                  </label>
                  <input
                    type="time"
                    value={taskEndTime}
                    onChange={(e) => setTaskEndTime(e.target.value)}
                    className="w-full px-2 py-1.5 bg-surface border border-line rounded-xl text-xs font-mono text-fg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-fg mb-1">
                    تخمین (دقیقه):
                  </label>
                  <input
                    type="number"
                    min="5"
                    step="5"
                    value={taskEstMinutes}
                    onChange={(e) => setTaskEstMinutes(Number(e.target.value))}
                    className="w-full px-2 py-1.5 bg-surface border border-line rounded-xl text-xs font-mono text-fg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-fg mb-1">
                    سطح انرژی موردنیاز:
                  </label>
                  <select
                    value={taskEnergy}
                    onChange={(e) => setTaskEnergy(e.target.value as any)}
                    className="w-full px-3 py-2 bg-surface border border-line rounded-xl text-xs text-fg"
                  >
                    <option value="high">⚡ انرژی بالا و تمرکز عمیق</option>
                    <option value="medium">⚡ انرژی متوسط</option>
                    <option value="low">⚡ سبک یا روتین (انرژی کم)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-fg mb-1">
                    اهمیت استراتژیک:
                  </label>
                  <select
                    value={taskImportance}
                    onChange={(e) => setTaskImportance(e.target.value as any)}
                    className="w-full px-3 py-2 bg-surface border border-line rounded-xl text-xs text-fg"
                  >
                    <option value="critical">🔥 بحرانی (عدم انجام پیامد فوری دارد)</option>
                    <option value="high">★ بااهمیت بالا</option>
                    <option value="medium">متوسط</option>
                    <option value="low">کم (اختیاری یا تاخیرپذیر)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-fg mb-1">
                  وابستگی به فعالیت دیگر (اختیاری):
                </label>
                <select
                  value={taskDependsOn}
                  onChange={(e) => setTaskDependsOn(e.target.value)}
                  className="w-full px-3 py-2 bg-surface border border-line rounded-xl text-xs text-fg"
                >
                  <option value="">-- بدون وابستگی مستقیم --</option>
                  {tasks.map((t) => (
                    <option key={t.id} value={t.id}>
                      پس از: {t.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-chip border border-line">
                <input
                  type="checkbox"
                  id="task-is-fixed"
                  checked={taskIsFixed}
                  onChange={(e) => setTaskIsFixed(e.target.checked)}
                  className="w-4 h-4 rounded text-fg focus:ring-fg/20 bg-surface border-line"
                />
                <label htmlFor="task-is-fixed" className="text-xs text-fg cursor-pointer select-none">
                  این فعالیت دارای زمان ثابت است (تعهد غیرقابل جابجایی توسط هوش مصنوعی)
                </label>
              </div>

              <div>
                <label className="block font-semibold text-fg mb-1">
                  یادداشت یا دستور کار:
                </label>
                <textarea
                  rows={2}
                  value={taskNotes}
                  onChange={(e) => setTaskNotes(e.target.value)}
                  placeholder="نکات مهم یا شماره صفحات مورد مطالعه..."
                  className="w-full px-3 py-2 bg-surface border border-line rounded-xl text-xs text-fg placeholder:text-muted"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-line">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-muted hover:text-fg text-xs font-bold"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-fg text-bg hover:opacity-90 font-semibold rounded-lg text-xs transition-colors cursor-pointer shadow-xs"
                >
                  ثبت در جدول برنامه
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reschedule Modal */}
      {rescheduleTaskId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-surface w-full max-w-sm rounded-2xl border border-line p-5 shadow-2xl text-right animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-sm font-bold text-fg mb-2 flex items-center gap-2">
              <ArrowRightLeft className="w-4 h-4 text-fg" />
              انتقال و زمان‌بندی مجدد
            </h3>
            <p className="text-xs text-muted mb-4">
              روز مقصد را برای انتقال این فعالیت انتخاب نمایید:
            </p>

            <div className="space-y-2 mb-4">
              {[0, 1, 2, 3, 4].map((dIdx) => (
                <button
                  key={dIdx}
                  onClick={() => setRescheduleTargetDay(dIdx)}
                  className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-xs font-semibold cursor-pointer ${
                    rescheduleTargetDay === dIdx
                      ? 'border-line bg-chip text-fg font-bold'
                      : 'border-line hover:bg-chip text-muted hover:text-fg'
                  }`}
                >
                  <span>{getIranianDayName(dIdx)}</span>
                  {selectedDayIdx === dIdx && <span className="text-[10px] text-muted">(روز فعلی)</span>}
                </button>
              ))}
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setRescheduleTaskId(null)}
                className="px-3 py-1.5 text-muted hover:text-fg text-xs font-bold"
              >
                انصراف
              </button>
              <button
                onClick={handleExecuteReschedule}
                className="px-4 py-1.5 bg-fg text-bg rounded-xl text-xs font-bold hover:opacity-90"
              >
                تایید و انتقال
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Smart Planner & AI Schedule Modal */}
      {isSmartPlannerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-md animate-fade-in" dir="rtl">
          <div className="relative w-full max-w-xl bg-surface border border-line rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
            {/* Header */}
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-line bg-surface relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-chip border border-line flex items-center justify-center text-fg">
                  <Sparkles className="w-5 h-5 text-fg" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-fg flex items-center gap-2">
                    برنامه‌ریزی خودکار و بهینه‌ساز روز
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-chip text-fg border border-line font-medium">
                      AI Schedule
                    </span>
                  </h3>
                  <p className="text-xs text-muted mt-0.5">
                    چینش بهینه وظایف بر اساس فوریت، انرژی، تعهدات ثابت و زمان‌های استراحت
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsSmartPlannerModalOpen(false)}
                className="p-1.5 text-muted hover:text-fg rounded-lg hover:bg-chip transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-4 text-xs text-fg flex-1">
              {/* Parameters Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-chip p-3.5 rounded-xl border border-line">
                <div>
                  <label className="block font-semibold text-fg mb-1">
                    زمان مفید در دسترس امروز (دقیقه):
                  </label>
                  <input
                    type="number"
                    min="30"
                    step="15"
                    value={smartAvailMinutes}
                    onChange={(e) => setSmartAvailMinutes(Number(e.target.value) || 180)}
                    className="w-full px-3 py-2 bg-surface border border-line rounded-xl text-xs font-mono text-fg font-bold focus:outline-none focus:border-fg"
                  />
                  <div className="flex gap-1.5 mt-1.5">
                    {[120, 180, 240, 300].map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setSmartAvailMinutes(m)}
                        className={`text-[10px] px-2 py-0.5 rounded border transition-colors cursor-pointer ${
                          smartAvailMinutes === m
                            ? 'bg-fg text-bg font-bold border-fg'
                            : 'border-line text-muted hover:text-fg hover:bg-surface'
                        }`}
                      >
                        {toPersianDigits(m / 60)} ساعت
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-fg mb-1">
                    ساعت شروع فعالیت‌ها:
                  </label>
                  <input
                    type="time"
                    value={smartStartTime}
                    onChange={(e) => setSmartStartTime(e.target.value)}
                    className="w-full px-3 py-2 bg-surface border border-line rounded-xl text-xs font-mono text-fg focus:outline-none focus:border-fg"
                  />
                  <span className="text-[10px] text-muted mt-1 block">
                    پس از بازگشت از مدرسه و استراحت اولیه
                  </span>
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-fg mb-1">
                    تمرکز ویژه امروز (اختیاری):
                  </label>
                  <input
                    type="text"
                    value={smartFocusGoal}
                    onChange={(e) => setSmartFocusGoal(e.target.value)}
                    placeholder="مثلاً: جمع‌بندی مبحث فیزیک، تمرین کدنویسی C++"
                    className="w-full px-3 py-2 bg-surface border border-line rounded-xl text-xs text-fg placeholder:text-muted focus:outline-none focus:border-fg"
                  />
                </div>
              </div>

              {/* Live Feasibility Simulation Card */}
              {(() => {
                const sim = simulateSchedule(tasks, smartAvailMinutes);
                return (
                  <div className="p-3.5 rounded-xl border border-line bg-chip text-fg flex flex-col gap-2">
                    <div className="flex items-center justify-between font-bold">
                      <span className="flex items-center gap-1.5">
                        <BrainCircuit className="w-4 h-4 text-muted" />
                        سنجش امکان‌پذیری و ظرفیت (Feasibility Score): {toPersianDigits(sim.score)}٪
                      </span>
                      <span className="text-[11px] font-mono text-muted">
                        {toPersianDigits(sim.totalRequiredMinutes)} از {toPersianDigits(sim.availableMinutes)} دقیقه
                      </span>
                    </div>
                    {sim.suggestions.map((s, idx) => (
                      <p key={idx} className="text-[11px] text-muted leading-relaxed">
                        • {s}
                      </p>
                    ))}
                  </div>
                );
              })()}

              {/* Generate Button */}
              <button
                type="button"
                disabled={isSmartPlanLoading}
                onClick={async () => {
                  setIsSmartPlanLoading(true);
                  try {
                    const res = await generateSmartSchedule(smartAvailMinutes, smartStartTime, smartFocusGoal);
                    if (res && res.schedule) {
                      setProposedSchedule(res.schedule);
                      if (res.advice) setProposedAdvice(res.advice);
                    }
                  } finally {
                    setIsSmartPlanLoading(false);
                  }
                }}
                className="w-full py-2.5 px-4 bg-fg hover:opacity-90 text-bg font-semibold rounded-lg text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
              >
                {isSmartPlanLoading ? (
                  <>
                    <Sparkles className="w-4 h-4 animate-spin text-bg" />
                    <span>در حال چینش و بهینه‌سازی الگوریتمی برنامه...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-bg" />
                    <span>تولید پیشنهاد زمان‌بندی بهینه</span>
                  </>
                )}
              </button>

              {/* Proposed Schedule Preview */}
              {proposedSchedule && proposedSchedule.length > 0 && (
                <div className="space-y-3 pt-3 border-t border-line">
                  <div className="flex items-center justify-between font-bold text-fg">
                    <span className="flex items-center gap-1.5 text-fg">
                      <CheckCircle2 className="w-4 h-4" />
                      برنامه پیشنهادی برای بررسی و تایید:
                    </span>
                    <span className="text-[10px] text-muted">
                      {toPersianDigits(proposedSchedule.length)} آیتم
                    </span>
                  </div>

                  {proposedAdvice && (
                    <div className="p-3 bg-chip border border-line rounded-xl text-[11px] text-fg leading-relaxed">
                      💡 {proposedAdvice}
                    </div>
                  )}

                  <div className="space-y-2">
                    {proposedSchedule.map((item, idx) => (
                      <div
                        key={idx}
                        className={`p-2.5 rounded-xl border flex items-center justify-between text-xs ${
                          item.isBreak
                            ? 'bg-chip border-line text-fg'
                            : 'bg-surface border-line text-fg'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-md bg-chip text-fg flex items-center justify-center text-[10px] font-mono border border-line">
                            {toPersianDigits(idx + 1)}
                          </span>
                          <div>
                            <span className="font-semibold block">{item.title}</span>
                            {item.reason && (
                              <span className="text-[10px] text-muted">{item.reason}</span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded bg-chip border border-line font-mono text-fg text-[11px]">
                            {item.timeSlot}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Apply Schedule Button */}
                  <div className="flex items-center gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        applyProposedSchedule(proposedSchedule);
                        setIsSmartPlannerModalOpen(false);
                      }}
                      className="flex-1 py-2.5 px-4 bg-fg hover:opacity-90 text-bg font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                    >
                      <Check className="w-4 h-4 stroke-[2.5]" />
                      <span>تأیید و اعمال این زمان‌بندی در جدول امروز</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setProposedSchedule(null)}
                      className="px-3 py-2.5 border border-line hover:bg-chip text-fg rounded-xl text-xs font-semibold cursor-pointer"
                    >
                      تنظیم مجدد
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
