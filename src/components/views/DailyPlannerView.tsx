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
      color: cell?.color || sub?.color || '#3B82F6',
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
        subtasks: [],
      },
      selectedDayIdx
    );

    setTaskTitle('');
    setTaskNotes('');
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
      <div className="bg-white dark:bg-[#111827] p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-[#263247] shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-2 rounded-xl bg-cyan-500/10 text-cyan-500 border border-cyan-500/20 shadow-[0_0_12px_rgba(0,245,255,0.2)]">
                <ListTodo className="w-5 h-5" />
              </span>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                برنامه‌ریز هوشمند روزانه
              </h1>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              مدیریت واقع‌بینانه زمان، تخمین دقایق، شناسایی تداخل‌ها و هدایت گام‌به‌گام کارها
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => rolloverOverdueTasks()}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-[#172033] dark:hover:bg-[#1f2b45] text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition-all cursor-pointer border border-slate-200 dark:border-[#263247]"
              title="انتقال کارهای عقب‌افتاده"
            >
              <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
              <span>انتقال کارهای معوق</span>
            </button>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold rounded-xl text-xs shadow-[0_0_12px_rgba(0,245,255,0.25)] transition-all cursor-pointer active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>افزودن فعالیت به برنامه</span>
            </button>
          </div>
        </div>

        {/* Day of Week Selector */}
        <div className="grid grid-cols-5 gap-1 sm:gap-2 mt-5 pt-4 border-t border-slate-100 dark:border-[#263247]">
          {[0, 1, 2, 3, 4].map((dIdx) => {
            const isSelected = selectedDayIdx === dIdx;
            const isToday = currentIranianDayIdx === dIdx;
            const dayTasks = dayData[dIdx]?.postSchoolTasks || [];
            const dayCompleted = dayTasks.filter((t) => t.completed).length;

            return (
              <button
                key={dIdx}
                onClick={() => setSelectedDayIdx(dIdx)}
                className={`flex flex-col items-center justify-center p-1.5 sm:p-2.5 rounded-xl border transition-all cursor-pointer min-w-0 ${
                  isSelected
                    ? 'bg-cyan-500/10 dark:bg-[#172033] border-cyan-400 text-cyan-600 dark:text-cyan-400 ring-2 ring-cyan-400/30 shadow-[0_0_14px_rgba(0,245,255,0.2)]'
                    : 'border-slate-200 dark:border-[#263247] hover:bg-slate-50 dark:hover:bg-[#172033]/60 text-slate-600 dark:text-slate-300'
                }`}
              >
                <div className="flex items-center gap-1 min-w-0">
                  <span className="text-[11px] sm:text-xs font-bold truncate">{getIranianDayName(dIdx)}</span>
                  {isToday && (
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0" />
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
        <div className="bg-white dark:bg-[#111827] p-4 rounded-xl border border-slate-200 dark:border-[#263247]">
          <span className="text-xs text-slate-400 block mb-1">زمان برنامه‌ریزی‌شده:</span>
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-bold font-mono text-cyan-600 dark:text-cyan-400">
              {toPersianDigits(Math.floor(totalPlannedMinutes / 60))} ساعت و {toPersianDigits(totalPlannedMinutes % 60)} دقیقه
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-[#111827] p-4 rounded-xl border border-slate-200 dark:border-[#263247]">
          <span className="text-xs text-slate-400 block mb-1">زمان ثبت‌شده واقعی:</span>
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-bold font-mono text-emerald-600 dark:text-[#39FF88]">
              {toPersianDigits(Math.floor(totalActualMinutes / 60))} ساعت و {toPersianDigits(totalActualMinutes % 60)} دقیقه
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-[#111827] p-4 rounded-xl border border-slate-200 dark:border-[#263247]">
          <span className="text-xs text-slate-400 block mb-1">فرصت آزاد تخمینی:</span>
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-bold font-mono text-indigo-600 dark:text-[#C084FC]">
              {toPersianDigits(Math.floor(estimatedFreeMinutes / 60))} ساعت
            </span>
            <span className="text-[10px] text-slate-400">و {toPersianDigits(estimatedFreeMinutes % 60)} دقیقه</span>
          </div>
        </div>

        <div className="bg-white dark:bg-[#111827] p-4 rounded-xl border border-slate-200 dark:border-[#263247]">
          <span className="text-xs text-slate-400 block mb-1">میزان پیشرفت روز:</span>
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-bold font-mono text-amber-500">
              {toPersianDigits(tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0)}٪
            </span>
            <span className="text-[10px] text-slate-400">({toPersianDigits(completedCount)} از {toPersianDigits(tasks.length)})</span>
          </div>
        </div>
      </div>

      {/* Warnings & Suggestions */}
      {conflicts.length > 0 && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-3">
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
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs flex items-center gap-3">
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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (Desktop 1 col): School Bells for this day */}
        <div className="bg-white dark:bg-[#111827] p-5 rounded-2xl border border-slate-200 dark:border-[#263247] shadow-sm h-fit">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-[#263247] mb-3">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-cyan-400" />
              زنگ‌های مدرسه ({getIranianDayName(selectedDayIdx)})
            </h2>
          </div>

          {dayBells.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              درسی برای این روز در برنامه هفتگی ثبت نشده است.
            </div>
          ) : (
            <div className="space-y-2.5">
              {dayBells.map((bell) => (
                <div
                  key={bell.period}
                  className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#0D1220] border border-slate-200 dark:border-[#263247] flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: bell.color }}
                    />
                    <div className="flex flex-col min-w-0">
                      <span className="font-bold text-slate-800 dark:text-slate-200 truncate">
                        {bell.subjectName}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {bell.bellTime.title}
                      </span>
                    </div>
                  </div>
                  <span className="font-mono text-[11px] text-slate-500 dark:text-slate-400 shrink-0">
                    {bell.bellTime.startTime} - {bell.bellTime.endTime}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Buffer / Break Advice */}
          <div className="mt-4 p-3 rounded-xl bg-cyan-500/5 dark:bg-[#172033] border border-cyan-500/20 text-xs space-y-1">
            <span className="font-bold text-cyan-600 dark:text-cyan-400 flex items-center gap-1 text-[11px]">
              <Coffee className="w-3.5 h-3.5" />
              پیشنهاد استراحت هوشمند:
            </span>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              پس از پایان مدرسه، اختصاص حداقل ۴۵ دقیقه برای ناهار و استراحت پیش از شروع اولین فعالیت بعدازظهر توصیه می‌شود.
            </p>
          </div>
        </div>

        {/* Right Column (Desktop 2 cols): Post-School Tasks Timeline */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white dark:bg-[#111827] p-5 rounded-2xl border border-slate-200 dark:border-[#263247] shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-[#263247] mb-4">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <ListTodo className="w-4 h-4 text-cyan-400" />
                وظایف و فعالیت‌های زمان‌بندی‌شده
              </h2>
              <span className="text-xs font-mono text-slate-400">
                {toPersianDigits(completedCount)}/{toPersianDigits(tasks.length)} انجام‌شده
              </span>
            </div>

            {tasks.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400 space-y-3">
                <p>هیچ فعالیتی برای بعدازظهر این روز ثبت نشده است.</p>
                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="px-4 py-2 bg-cyan-500/10 text-cyan-500 border border-cyan-500/30 rounded-xl font-bold hover:bg-cyan-500/20 transition-all cursor-pointer"
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
                          ? 'bg-slate-50/60 dark:bg-[#0D1220]/60 border-slate-200/60 dark:border-[#263247] opacity-80'
                          : 'bg-white dark:bg-[#0D1220] border-slate-200 dark:border-[#263247] hover:border-cyan-500/40 shadow-xs'
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
                            className="mt-0.5 text-slate-400 hover:text-cyan-400 transition-colors cursor-pointer"
                          >
                            {task.completed ? (
                              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                            ) : (
                              <Circle className="w-5 h-5" />
                            )}
                          </button>

                          <div className="flex flex-col min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span
                                className={`text-sm font-bold ${
                                  task.completed
                                    ? 'line-through text-slate-400'
                                    : 'text-slate-900 dark:text-white'
                                }`}
                              >
                                {task.title}
                              </span>
                              {task.isRollover && (
                                <span className="text-[10px] px-1.5 py-0.5 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded-md">
                                  منتقل‌شده
                                </span>
                              )}
                              <span
                                className={`text-[10px] px-1.5 py-0.5 rounded-md font-semibold ${
                                  task.priority === 'high'
                                    ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                                    : task.priority === 'medium'
                                    ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                                    : 'bg-slate-500/10 text-slate-400 border border-slate-500/20'
                                }`}
                              >
                                {task.priority === 'high' ? 'ضروری' : task.priority === 'medium' ? 'متوسط' : 'عادی'}
                              </span>
                            </div>

                            {/* Time & Duration comparison */}
                            <div className="flex items-center gap-3 text-xs text-slate-400 dark:text-slate-400 mt-1.5 flex-wrap">
                              {task.startTime && task.endTime && (
                                <span className="flex items-center gap-1 font-mono">
                                  <Clock className="w-3.5 h-3.5 text-cyan-400" />
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
                                    className="w-16 px-1.5 py-0.5 bg-slate-100 dark:bg-[#172033] border border-cyan-400 rounded text-xs font-mono"
                                  />
                                  <button
                                    onClick={() => handleSaveActualMinutes(task.id)}
                                    className="p-1 text-emerald-400 hover:text-emerald-300"
                                  >
                                    <Check className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => setEditingActualTaskId(null)}
                                    className="p-1 text-rose-400"
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
                                      ? 'text-rose-400 bg-rose-500/10 border border-rose-500/30'
                                      : 'text-slate-500 dark:text-slate-300 hover:text-cyan-400'
                                  }`}
                                  title="کلیک برای ثبت زمان واقعی انجام"
                                >
                                  <span>واقعی: {toPersianDigits(task.actualMinutes || 0)} دقیقه</span>
                                  <Edit2 className="w-3 h-3 opacity-60" />
                                </button>
                              )}
                            </div>

                            {task.notes && (
                              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                {task.notes}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Task Actions */}
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={() => {
                              setRescheduleTaskId(task.id);
                              setRescheduleTargetDay((selectedDayIdx + 1) % 5);
                            }}
                            className="p-1.5 text-slate-400 hover:text-cyan-400 rounded-lg hover:bg-slate-100 dark:hover:bg-[#172033] transition-colors cursor-pointer"
                            title="انتقال / زمان‌بندی مجدد"
                          >
                            <ArrowRightLeft className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deletePlannedTask(task.id, selectedDayIdx)}
                            className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-slate-100 dark:hover:bg-[#172033] transition-colors cursor-pointer"
                            title="حذف فعالیت"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Subtasks breakdown */}
                      <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-[#263247]/60">
                        <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1.5">
                          <span className="flex items-center gap-1 font-semibold">
                            <Layers className="w-3.5 h-3.5 text-cyan-400" />
                            زیر‌کارهای خردشده ({toPersianDigits(subDone)}/{toPersianDigits(subtasks.length)})
                          </span>
                          {activeSubtaskTaskId !== task.id && (
                            <button
                              onClick={() => {
                                setActiveSubtaskTaskId(task.id);
                                setNewSubtaskTitle('');
                              }}
                              className="text-cyan-500 hover:underline cursor-pointer"
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
                                className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300 cursor-pointer hover:text-cyan-400"
                              >
                                <span className={`w-3.5 h-3.5 rounded border flex items-center justify-center text-[10px] ${
                                  st.completed
                                    ? 'bg-cyan-500 border-cyan-400 text-slate-950 font-bold'
                                    : 'border-slate-400'
                                }`}>
                                  {st.completed ? '✓' : ''}
                                </span>
                                <span className={st.completed ? 'line-through text-slate-400' : ''}>
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
                              className="flex-1 px-2.5 py-1 bg-slate-100 dark:bg-[#172033] border border-slate-200 dark:border-[#263247] rounded-lg text-xs"
                            />
                            <button
                              onClick={() => handleAddSubtaskSubmit(task.id)}
                              className="px-2.5 py-1 bg-cyan-500 text-slate-950 rounded-lg text-xs font-bold"
                            >
                              افزودن
                            </button>
                            <button
                              onClick={() => setActiveSubtaskTaskId(null)}
                              className="p-1 text-slate-400 hover:text-slate-200"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#111827] w-full max-w-md rounded-2xl border border-slate-200 dark:border-[#263247] p-5 shadow-2xl text-right animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-[#263247] mb-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-cyan-400" />
                ثبت فعالیت جدید در برنامه ({getIranianDayName(selectedDayIdx)})
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-200 rounded"
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
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-[#0D1220] border border-slate-200 dark:border-[#263247] rounded-xl text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    بخش مرتبط:
                  </label>
                  <select
                    value={taskSection}
                    onChange={(e) => setTaskSection(e.target.value as SectionType)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#0D1220] border border-slate-200 dark:border-[#263247] rounded-xl text-xs"
                  >
                    <option value="school">مدرسه و درس‌ها</option>
                    <option value="skill">توسعه مهارت‌ها</option>
                    <option value="project">پروژه</option>
                    <option value="competition">مسابقات</option>
                    <option value="general">عمومی و فردی</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    سطح اولویت:
                  </label>
                  <select
                    value={taskPriority}
                    onChange={(e) => setTaskPriority(e.target.value as Priority)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#0D1220] border border-slate-200 dark:border-[#263247] rounded-xl text-xs"
                  >
                    <option value="high">فوری و ضروری</option>
                    <option value="medium">متوسط</option>
                    <option value="low">عادی</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    ساعت شروع:
                  </label>
                  <input
                    type="time"
                    value={taskStartTime}
                    onChange={(e) => setTaskStartTime(e.target.value)}
                    className="w-full px-2 py-1.5 bg-slate-50 dark:bg-[#0D1220] border border-slate-200 dark:border-[#263247] rounded-xl text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    ساعت پایان:
                  </label>
                  <input
                    type="time"
                    value={taskEndTime}
                    onChange={(e) => setTaskEndTime(e.target.value)}
                    className="w-full px-2 py-1.5 bg-slate-50 dark:bg-[#0D1220] border border-slate-200 dark:border-[#263247] rounded-xl text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    تخمین (دقیقه):
                  </label>
                  <input
                    type="number"
                    min="5"
                    step="5"
                    value={taskEstMinutes}
                    onChange={(e) => setTaskEstMinutes(Number(e.target.value))}
                    className="w-full px-2 py-1.5 bg-slate-50 dark:bg-[#0D1220] border border-slate-200 dark:border-[#263247] rounded-xl text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  یادداشت یا دستور کار:
                </label>
                <textarea
                  rows={2}
                  value={taskNotes}
                  onChange={(e) => setTaskNotes(e.target.value)}
                  placeholder="نکات مهم یا شماره صفحات مورد مطالعه..."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-[#0D1220] border border-slate-200 dark:border-[#263247] rounded-xl text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-[#263247]">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-slate-400 hover:text-slate-200 text-xs font-bold"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold rounded-xl text-xs shadow-[0_0_12px_rgba(0,245,255,0.25)]"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#111827] w-full max-w-sm rounded-2xl border border-slate-200 dark:border-[#263247] p-5 shadow-2xl text-right animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
              <ArrowRightLeft className="w-4 h-4 text-cyan-400" />
              انتقال و زمان‌بندی مجدد
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              روز مقصد را برای انتقال این فعالیت انتخاب نمایید:
            </p>

            <div className="space-y-2 mb-4">
              {[0, 1, 2, 3, 4].map((dIdx) => (
                <button
                  key={dIdx}
                  onClick={() => setRescheduleTargetDay(dIdx)}
                  className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-xs font-semibold cursor-pointer ${
                    rescheduleTargetDay === dIdx
                      ? 'border-cyan-400 bg-cyan-500/10 text-cyan-400 font-bold'
                      : 'border-slate-200 dark:border-[#263247] hover:bg-slate-50 dark:hover:bg-[#172033]'
                  }`}
                >
                  <span>{getIranianDayName(dIdx)}</span>
                  {selectedDayIdx === dIdx && <span className="text-[10px] text-slate-400">(روز فعلی)</span>}
                </button>
              ))}
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setRescheduleTaskId(null)}
                className="px-3 py-1.5 text-slate-400 text-xs font-bold"
              >
                انصراف
              </button>
              <button
                onClick={handleExecuteReschedule}
                className="px-4 py-1.5 bg-cyan-500 text-slate-950 rounded-xl text-xs font-bold"
              >
                تایید و انتقال
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
