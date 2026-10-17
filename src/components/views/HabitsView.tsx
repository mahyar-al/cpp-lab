import React, { useState } from 'react';
import {
  Flame,
  Plus,
  CheckCircle2,
  Circle,
  Pause,
  Play,
  Trash2,
  Edit2,
  Calendar as CalendarIcon,
  Sparkles,
  TrendingUp,
  Shield,
  Coffee,
  Check,
  X,
  Target,
  BarChart2,
  Award,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import {
  toPersianDigits,
  formatJalaliFull,
  getIranianDayName,
} from '../../utils/jalali';
import { Habit, SectionType } from '../../types';

export const HabitsView: React.FC = () => {
  const { habits, addHabit, toggleHabitToday, updateHabit, deleteHabit } = useApp();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [habitTitle, setHabitTitle] = useState('');
  const [habitCategory, setHabitCategory] = useState<SectionType>('school');
  const [habitTargetDays, setHabitTargetDays] = useState(5);
  const [habitNotes, setHabitNotes] = useState('');

  // Editing habit
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);

  const today = new Date();
  const todayIso = today.toISOString().slice(0, 10);

  // Generate last 14 days for the activity heatmap
  const pastDays = Array.from({ length: 14 }).map((_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (13 - i));
    return d.toISOString().slice(0, 10);
  });

  // Calculate global adherence rate across all active habits for the last 7 days
  const last7Days = pastDays.slice(7);
  let totalOpportunities = 0;
  let totalCompletions = 0;

  habits.forEach((h) => {
    if (h.paused) return;
    const requiredDays = h.targetDaysPerWeek || 5;
    totalOpportunities += requiredDays;
    const completedLast7 = (h.completedDates || []).filter((d) => last7Days.includes(d)).length;
    totalCompletions += Math.min(requiredDays, completedLast7);
  });

  const overallAdherencePercent =
    totalOpportunities > 0
      ? Math.round((totalCompletions / totalOpportunities) * 100)
      : 0;

  const handleCreateHabit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!habitTitle.trim()) return;

    addHabit({
      title: habitTitle.trim(),
      category: habitCategory,
      targetDaysPerWeek: Number(habitTargetDays) || 5,
      notes: habitNotes.trim() || undefined,
      color: habitCategory === 'school' ? '#3B82F6' : habitCategory === 'skill' ? '#39FF88' : '#A855F7',
    });

    setHabitTitle('');
    setHabitNotes('');
    setIsAddModalOpen(false);
  };

  const handleApplyPreset = (title: string, category: SectionType, days: number) => {
    setHabitTitle(title);
    setHabitCategory(category);
    setHabitTargetDays(days);
    setIsAddModalOpen(true);
  };

  const handleToggleFreezeDay = (habitId: string) => {
    const habit = habits.find((h) => h.id === habitId);
    if (!habit) return;
    const rests = habit.plannedRestDates || [];
    const isRest = rests.includes(todayIso);
    let updatedRests: string[];
    if (isRest) {
      updatedRests = rests.filter((d) => d !== todayIso);
    } else {
      updatedRests = [...rests, todayIso];
    }
    updateHabit(habitId, { plannedRestDates: updatedRests });
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs relative">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <span className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                <Flame className="w-5 h-5 text-amber-500" />
              </span>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                سیستم عادت‌ها و استمرار فردی
              </h1>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              پایش زنجیره روزانه، اهداف هفتگی، استراحت‌های برنامه‌ریزی‌شده و نمودار پایداری
            </p>
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 btn-primary font-semibold rounded-lg text-xs transition-colors cursor-pointer self-start md:self-auto shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>تعریف عادت جدید</span>
          </button>
        </div>

        {/* Preset Quick Chips */}
        <div className="mt-5 pt-4 border-t border-slate-100 dark:border-[#263247]">
          <span className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-2">
            الگوهای آماده برای شروع سریع:
          </span>
          <div className="flex items-center gap-2 flex-wrap">
            {[
              { label: 'مطالعه روزانه دروس', title: 'مطالعه روزانه و تست', category: 'school' as SectionType, days: 6 },
              { label: 'تمرین برنامه‌نویسی', title: 'تمرین کدنویسی و دیباگ', category: 'skill' as SectionType, days: 5 },
              { label: 'یادگیری زبان انگلیسی', title: 'لغات و گرامر زبان انگلیسی', category: 'skill' as SectionType, days: 5 },
              { label: 'حل مسائل الگوریتمی', title: 'حل مسائل لیت‌کد و المپیاد', category: 'competition' as SectionType, days: 4 },
              { label: 'مرور مطالب قبلی', title: 'مرور فلش‌کارت‌های فاصله‌دار', category: 'school' as SectionType, days: 6 },
              { label: 'مطالعه منابع مسابقات', title: 'مطالعه مقالات و منابع مسابقه', category: 'competition' as SectionType, days: 4 },
            ].map((p, idx) => (
              <button
                key={idx}
                onClick={() => handleApplyPreset(p.title, p.category, p.days)}
                className="px-2.5 py-1 text-xs bg-slate-100 hover:bg-slate-200 dark:bg-[#172033] dark:hover:bg-[#1f2b45] text-slate-700 dark:text-slate-300 rounded-lg transition-colors cursor-pointer border border-slate-200 dark:border-[#263247]"
              >
                + {p.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* KPI Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#0D1222] p-4 rounded-xl border border-slate-200 dark:border-slate-800/80 hover:border-cyan-500/30 transition-all">
          <span className="text-xs text-slate-400 block mb-1">عادت‌های فعال:</span>
          <span className="text-xl font-bold font-mono text-cyan-600 dark:text-cyan-400">
            {toPersianDigits(habits.filter((h) => !h.paused).length)} عادت
          </span>
        </div>

        <div className="bg-white dark:bg-[#0D1222] p-4 rounded-xl border border-slate-200 dark:border-slate-800/80 hover:border-amber-500/30 transition-all">
          <span className="text-xs text-slate-400 block mb-1">طولانی‌ترین استریک فعال:</span>
          <span className="text-xl font-bold font-mono text-amber-500">
            {toPersianDigits(Math.max(0, ...habits.map((h) => h.streak || 0)))} روز
          </span>
        </div>

        <div className="bg-white dark:bg-[#0D1222] p-4 rounded-xl border border-slate-200 dark:border-slate-800/80 hover:border-emerald-500/30 transition-all">
          <span className="text-xs text-slate-400 block mb-1">نرخ پایبندی این هفته:</span>
          <span className="text-xl font-bold font-mono text-emerald-600 dark:text-[#39FF88]">
            {toPersianDigits(overallAdherencePercent)}٪
          </span>
        </div>

        <div className="bg-white dark:bg-[#0D1222] p-4 rounded-xl border border-slate-200 dark:border-slate-800/80 hover:border-purple-500/30 transition-all">
          <span className="text-xs text-slate-400 block mb-1">تکمیل‌شده‌های امروز:</span>
          <span className="text-xl font-bold font-mono text-indigo-600 dark:text-[#C084FC]">
            {toPersianDigits(habits.filter((h) => (h.completedDates || []).includes(todayIso)).length)} از {toPersianDigits(habits.filter((h) => !h.paused).length)}
          </span>
        </div>
      </div>

      {/* Habits List */}
      <div className="bg-white dark:bg-[#0D1222] p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800/80 shadow-sm">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800/80 mb-4">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Flame className="w-4 h-4 text-cyan-400" />
            فهرست و نقشه استمرار روزانه
          </h2>
          <span className="text-xs text-slate-400">
            ۱۴ روز گذشته (به سمت چپ: امروز)
          </span>
        </div>

        {habits.length === 0 ? (
          <div className="py-16 text-center text-xs text-slate-400 space-y-3">
            <p>هنوز عادتی ثبت نشده است. از گزینه‌های پیشنهادی بالا برای شروع استفاده کنید.</p>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-4 py-2 btn-secondary rounded-xl font-medium cursor-pointer"
            >
              + تعریف اولین عادت
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {habits.map((habit) => {
              const isCompletedToday = (habit.completedDates || []).includes(todayIso);
              const isRestToday = (habit.plannedRestDates || []).includes(todayIso);
              const completedIn7Days = (habit.completedDates || []).filter((d) => last7Days.includes(d)).length;
              const target = habit.targetDaysPerWeek || 5;
              const progressPct = Math.min(100, Math.round((completedIn7Days / target) * 100));

              return (
                <div
                  key={habit.id}
                  className={`p-4 rounded-xl border transition-all text-right ${
                    habit.paused
                      ? 'bg-slate-50/50 dark:bg-[#0D1220]/50 border-slate-200/50 dark:border-[#263247]/50 opacity-60'
                      : 'bg-white dark:bg-[#0D1220] border-slate-200 dark:border-[#263247] hover:border-cyan-500/40 shadow-xs'
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    {/* Habit Info & Today Check */}
                    <div className="flex items-center gap-3 min-w-0">
                      <button
                        onClick={() => toggleHabitToday(habit.id)}
                        disabled={habit.paused}
                        className="text-slate-400 hover:text-cyan-400 transition-colors cursor-pointer shrink-0"
                        title={isCompletedToday ? 'علامت به عنوان انجام‌نشده' : 'علامت انجام امروز'}
                      >
                        {isCompletedToday ? (
                          <CheckCircle2 className="w-6 h-6 text-[#39FF88]" />
                        ) : (
                          <Circle className="w-6 h-6 hover:text-cyan-400" />
                        )}
                      </button>

                      <div className="flex flex-col min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-sm font-bold ${isCompletedToday ? 'text-slate-900 dark:text-white' : 'text-slate-800 dark:text-slate-200'}`}>
                            {habit.title}
                          </span>
                          {habit.paused && (
                            <span className="text-[10px] px-1.5 py-0.5 bg-slate-500/10 text-slate-400 border border-slate-500/20 rounded">
                              متوقف‌شده
                            </span>
                          )}
                          {isRestToday && (
                            <span className="text-[10px] px-1.5 py-0.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded">
                              استراحت مجاز
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                          <span className="flex items-center gap-1 font-mono text-amber-500">
                            <Flame className="w-3.5 h-3.5" />
                            استریک: {toPersianDigits(habit.streak || 0)} روز
                          </span>
                          <span>·</span>
                          <span className="font-mono">
                            هدف: {toPersianDigits(completedIn7Days)} از {toPersianDigits(target)} روز در هفته ({toPersianDigits(progressPct)}٪)
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* 14-day Heatmap Mini Grid */}
                    <div className="flex items-center gap-1.5 self-end md:self-auto">
                      {pastDays.map((dateStr, idx) => {
                        const isDone = (habit.completedDates || []).includes(dateStr);
                        const isRest = (habit.plannedRestDates || []).includes(dateStr);
                        const isTodayDate = dateStr === todayIso;

                        return (
                          <button
                            key={idx}
                            onClick={() => toggleHabitToday(habit.id, dateStr)}
                            title={`${dateStr} ${isDone ? '(انجام شده)' : isRest ? '(استراحت)' : ''}`}
                            className={`w-4 h-6 rounded-xs transition-colors cursor-pointer ${
                              isDone
                                ? 'bg-slate-800 dark:bg-slate-200'
                                : isRest
                                ? 'bg-slate-400/50'
                                : 'bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700'
                            } ${isTodayDate ? 'ring-1 ring-slate-900 dark:ring-slate-100' : ''}`}
                          />
                        );
                      })}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleToggleFreezeDay(habit.id)}
                        className={`p-1.5 rounded-lg text-xs cursor-pointer ${
                          isRestToday
                            ? 'bg-blue-500/20 text-blue-400'
                            : 'text-slate-400 hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-[#172033]'
                        }`}
                        title="ثبت استراحت برنامه‌ریزی‌شده امروز (بدون قطع استریک)"
                      >
                        <Coffee className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => updateHabit(habit.id, { paused: !habit.paused })}
                        className="p-1.5 text-slate-400 hover:text-cyan-400 rounded-lg hover:bg-slate-100 dark:hover:bg-[#172033] cursor-pointer"
                        title={habit.paused ? 'از سرگیری عادت' : 'توقف موقت عادت'}
                      >
                        {habit.paused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                      </button>

                      <button
                        onClick={() => deleteHabit(habit.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-slate-100 dark:hover:bg-[#172033] cursor-pointer"
                        title="حذف عادت"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Habit Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#0D1222] w-full max-w-md rounded-2xl border border-slate-200 dark:border-cyan-500/30 p-5 shadow-2xl text-right animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800/80 mb-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Flame className="w-4 h-4 text-cyan-400" />
                تعریف عادت یا زنجیره جدید
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateHabit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  عنوان عادت:
                </label>
                <input
                  type="text"
                  required
                  value={habitTitle}
                  onChange={(e) => setHabitTitle(e.target.value)}
                  placeholder="مثلاً: حل ۵ تست هوش و الگوریتم"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-[#090D18] border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    بخش مرتبط:
                  </label>
                  <select
                    value={habitCategory}
                    onChange={(e) => setHabitCategory(e.target.value as SectionType)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#090D18] border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500/50"
                  >
                    <option value="school">مدرسه و درس‌ها</option>
                    <option value="skill">توسعه مهارت‌ها</option>
                    <option value="project">پروژه</option>
                    <option value="competition">مسابقات</option>
                    <option value="general">رشد فردی</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    هدف هفتگی (چند روز در هفته):
                  </label>
                  <select
                    value={habitTargetDays}
                    onChange={(e) => setHabitTargetDays(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#090D18] border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500/50"
                  >
                    <option value="7">هر روز (۷ روز در هفته)</option>
                    <option value="6">۶ روز در هفته</option>
                    <option value="5">۵ روز در هفته (روزهای تحصیلی)</option>
                    <option value="4">۴ روز در هفته</option>
                    <option value="3">۳ روز در هفته</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  توضیحات و انگیزه‌نامه:
                </label>
                <textarea
                  rows={2}
                  value={habitNotes}
                  onChange={(e) => setHabitNotes(e.target.value)}
                  placeholder="دلیل و زمان اجرای این عادت..."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-[#090D18] border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500/50"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800/80">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-slate-400 text-xs font-bold cursor-pointer"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 font-semibold rounded-lg text-xs transition-colors cursor-pointer shadow-xs"
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
