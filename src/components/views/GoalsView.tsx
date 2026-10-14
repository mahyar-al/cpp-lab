import React, { useState } from 'react';
import {
  Target,
  Plus,
  CheckCircle2,
  Trash2,
  Clock,
  Sparkles,
  Calendar,
  Layers,
  Award,
  X,
  FileCheck,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatJalaliShort, toPersianDigits } from '../../utils/jalali';
import { Goal, Priority, SectionType } from '../../types';

export const GoalsView: React.FC = () => {
  const {
    goals,
    addGoal,
    updateGoal,
    deleteGoal,
    toggleGoalMilestone,
    addGoalMilestone,
    weeklyReviews,
    addWeeklyReview,
    studySessions,
    homeworks,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'all' | 'long_term' | 'monthly' | 'weekly' | 'weekly_review'>('all');

  // New Goal modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newLevel, setNewLevel] = useState<Goal['level']>('weekly');
  const [newCategory, setNewCategory] = useState<SectionType>('school');
  const [newPriority, setNewPriority] = useState<Priority>('medium');
  const [newDeadline, setNewDeadline] = useState('2026-11-30');
  const [newMetric, setNewMetric] = useState('حل ۱۰۰ تمرین و کسب نمره بالای ۱۹');

  // Milestone input for a goal
  const [milestoneGoalId, setMilestoneGoalId] = useState<string | null>(null);
  const [milestoneTitle, setMilestoneTitle] = useState('');

  // Weekly review form
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [completedSummary, setCompletedSummary] = useState('');
  const [unfinishedSummary, setUnfinishedSummary] = useState('');
  const [biggestWin, setBiggestWin] = useState('');
  const [nextWeekPriorities, setNextWeekPriorities] = useState('');

  const filteredGoals = goals.filter((g) => {
    if (activeTab === 'all' || activeTab === 'weekly_review') return true;
    return g.level === activeTab;
  });

  const handleCreateGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    addGoal({
      title: newTitle.trim(),
      description: newDesc.trim(),
      level: newLevel,
      category: newCategory,
      startDate: new Date().toISOString().slice(0, 10),
      deadline: newDeadline,
      priority: newPriority,
      measurementMetric: newMetric,
      status: 'in_progress',
      progressPercentage: 20,
      milestones: [
        { id: 'm-1', title: 'شروع و گام اول', done: true },
        { id: 'm-2', title: 'ارزیابی میانه مسیر', done: false },
      ],
    });

    setNewTitle('');
    setNewDesc('');
    setShowAddModal(false);
  };

  const handleAddMilestone = (goalId: string) => {
    if (!milestoneTitle.trim()) return;
    addGoalMilestone(goalId, milestoneTitle.trim());
    setMilestoneTitle('');
    setMilestoneGoalId(null);
  };

  const handleCreateWeeklyReview = (e: React.FormEvent) => {
    e.preventDefault();
    const calculatedHours = studySessions.reduce((acc, s) => acc + (s.actualDurationMin || 0), 0) / 60;

    addWeeklyReview({
      weekStartDate: '2026-10-10',
      weekEndDate: '2026-10-16',
      completedTasksSummary: completedSummary || `انجام ${homeworks.filter((h) => h.completed).length} تکلیف مدرسه و جلسات تمرین`,
      unfinishedTasksSummary: unfinishedSummary || 'مرور بخش دوم هندسه تحلیلی',
      totalStudyHours: Number(calculatedHours.toFixed(1)),
      biggestWin: biggestWin || 'پیشرفت عالی در پروژه و حفظ زنجیره ۵ روزه مطالعه',
      nextWeekPriorities: nextWeekPriorities || 'آمادگی برای آزمون آزمایشی المپیاد و تحویل فاز ۱ پروژه',
    });

    setShowReviewForm(false);
    setCompletedSummary('');
    setUnfinishedSummary('');
    setBiggestWin('');
    setNextWeekPriorities('');
  };

  const getLevelLabel = (lvl: Goal['level']) => {
    switch (lvl) {
      case 'long_term':
        return { label: 'بلندمدت (سالانه/ترم)', color: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300' };
      case 'monthly':
        return { label: 'ماهانه', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300' };
      case 'weekly':
        return { label: 'هفتگی', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' };
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            <span className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400">
              <Target className="w-6 h-6" />
            </span>
            هدف‌گذاری و ارزیابی عملکرد هفتگی
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            سطوح اهداف بلندمدت و هفتگی، مایل‌استون‌ها، سنجه‌های موفقیت و جلسات مرور هفتگی
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-xl shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            تعریف هدف جدید
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto">
        {[
          { id: 'all', label: 'همه اهداف', count: goals.length },
          { id: 'weekly', label: 'اهداف هفتگی', count: goals.filter((g) => g.level === 'weekly').length },
          { id: 'monthly', label: 'اهداف ماهانه', count: goals.filter((g) => g.level === 'monthly').length },
          { id: 'long_term', label: 'اهداف بلندمدت', count: goals.filter((g) => g.level === 'long_term').length },
          { id: 'weekly_review', label: 'مرور هفتگی (Weekly Review)', count: weeklyReviews.length },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`px-4 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition-colors flex items-center gap-2 ${
              activeTab === tab.id
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            {tab.label}
            <span className={`text-[10px] px-2 py-0.5 rounded-full ${
              activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-700'
            }`}>
              {toPersianDigits(tab.count)}
            </span>
          </button>
        ))}
      </div>

      {/* If Weekly Review Tab is active */}
      {activeTab === 'weekly_review' ? (
        <div className="space-y-6">
          <div className="flex justify-between items-center bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
            <div>
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
                گزارش‌های مرور و بازبینی پایان هفته
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                بررسی دستاوردها، درس‌های آموخته‌شده و تعیین اولویت‌های هفته آینده
              </p>
            </div>
            <button
              onClick={() => setShowReviewForm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl"
            >
              <FileCheck className="w-4 h-4" />
              ثبت مرور هفتگی جدید
            </button>
          </div>

          <div className="space-y-4">
            {weeklyReviews.map((rev) => (
              <div
                key={rev.id}
                className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4"
              >
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40">
                      <Award className="w-4 h-4" />
                    </span>
                    <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm">
                      مرور هفته ({formatJalaliShort(rev.weekStartDate)} تا {formatJalaliShort(rev.weekEndDate)})
                    </h4>
                  </div>
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1 rounded-xl">
                    مجموع مطالعه: {toPersianDigits(rev.totalStudyHours)} ساعت
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-1">
                    <span className="font-bold text-emerald-600 block">کارهای موفق و انجام‌شده:</span>
                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{rev.completedTasksSummary}</p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-1">
                    <span className="font-bold text-amber-600 block">کارهای باقیمانده برای جبران:</span>
                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{rev.unfinishedTasksSummary}</p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 text-xs space-y-1">
                  <span className="font-bold text-emerald-800 dark:text-emerald-300 block">
                    بزرگترین دستاورد هفته (Biggest Win):
                  </span>
                  <p className="text-slate-800 dark:text-slate-200 font-medium leading-relaxed">{rev.biggestWin}</p>
                </div>

                <div className="p-3.5 rounded-xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800/40 text-xs space-y-1">
                  <span className="font-bold text-purple-800 dark:text-purple-300 block">
                    اولویت‌های اصلی هفته بعد:
                  </span>
                  <p className="text-slate-800 dark:text-slate-200 font-medium leading-relaxed">{rev.nextWeekPriorities}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Goals Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredGoals.map((goal) => {
            const levelBadge = getLevelLabel(goal.level);
            const completedMilestones = goal.milestones.filter((m) => m.done).length;

            return (
              <div
                key={goal.id}
                className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${levelBadge.color}`}>
                      {levelBadge.label}
                    </span>
                    <button
                      onClick={() => {
                        if (confirm(`حذف هدف «${goal.title}»؟`)) deleteGoal(goal.id);
                      }}
                      className="text-slate-400 hover:text-red-500"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div>
                    <h3 className="font-bold text-base text-slate-900 dark:text-white">
                      {goal.title}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                      {goal.description}
                    </p>
                  </div>

                  {/* Measurement Metric */}
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-xs">
                    <span className="text-slate-400 block text-[10px] mb-0.5">سنجه موفقیت:</span>
                    <span className="font-medium text-slate-700 dark:text-slate-300">{goal.measurementMetric}</span>
                  </div>

                  {/* Progress Slider */}
                  <div>
                    <div className="flex justify-between text-xs text-slate-500 mb-1">
                      <span>پیشرفت کلی</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">
                        {toPersianDigits(goal.progressPercentage)}٪
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={goal.progressPercentage}
                      onChange={(e) => updateGoal(goal.id, { progressPercentage: Number(e.target.value) })}
                      className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                    />
                  </div>

                  {/* Milestones list */}
                  <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                      <span>مایل‌استون‌ها ({toPersianDigits(completedMilestones)}/{toPersianDigits(goal.milestones.length)})</span>
                      <button
                        onClick={() => setMilestoneGoalId(goal.id)}
                        className="text-emerald-600 hover:text-emerald-700 flex items-center gap-0.5 text-[11px]"
                      >
                        <Plus className="w-3 h-3" /> افزودن
                      </button>
                    </div>

                    {milestoneGoalId === goal.id && (
                      <div className="flex gap-1.5">
                        <input
                          type="text"
                          value={milestoneTitle}
                          onChange={(e) => setMilestoneTitle(e.target.value)}
                          placeholder="عنوان گام..."
                          className="flex-1 px-2 py-1 text-xs bg-slate-50 dark:bg-slate-800 border rounded-lg"
                        />
                        <button
                          onClick={() => handleAddMilestone(goal.id)}
                          className="px-2 py-1 bg-emerald-600 text-white rounded-lg text-xs"
                        >
                          ثبت
                        </button>
                      </div>
                    )}

                    <div className="space-y-1.5">
                      {goal.milestones.map((m) => (
                        <div
                          key={m.id}
                          onClick={() => toggleGoalMilestone(goal.id, m.id)}
                          className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer text-xs ${
                            m.done
                              ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200 line-through text-slate-400'
                              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center ${
                            m.done ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-400'
                          }`}>
                            {m.done && <CheckCircle2 className="w-2.5 h-2.5" />}
                          </div>
                          <span>{m.title}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    مهلت: {formatJalaliShort(goal.deadline)}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    goal.priority === 'high' ? 'text-red-600 bg-red-50 dark:bg-red-950/40' : 'text-slate-500'
                  }`}>
                    اولویت {goal.priority === 'high' ? 'بالا' : 'متوسط'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* New Goal Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                <Target className="w-5 h-5 text-emerald-600" />
                تعریف هدف جدید
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateGoal} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  عنوان هدف:
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="مثلاً: کسب معدل بالای ۱۹.۵ در نیم‌سال اول"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  توضیحات و انگیزه:
                </label>
                <textarea
                  rows={2}
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="دلایل اهمیت این هدف برای شما..."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">سطح هدف:</label>
                  <select
                    value={newLevel}
                    onChange={(e) => setNewLevel(e.target.value as Goal['level'])}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                  >
                    <option value="weekly">هفتگی</option>
                    <option value="monthly">ماهانه</option>
                    <option value="long_term">بلندمدت (ترم/سال)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">بخش مربوطه:</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as SectionType)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                  >
                    <option value="school">مدرسه و درس‌ها</option>
                    <option value="skill">مهارت‌ها</option>
                    <option value="project">پروژه‌ها</option>
                    <option value="competition">مسابقات</option>
                    <option value="general">عمومی</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">مهلت تحقق:</label>
                  <input
                    type="date"
                    value={newDeadline}
                    onChange={(e) => setNewDeadline(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">اولویت:</label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as Priority)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                  >
                    <option value="high">بالا</option>
                    <option value="medium">متوسط</option>
                    <option value="low">پایین</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  سنجه اندازه‌گیری (چطور موفقیت ارزیابی می‌شود):
                </label>
                <input
                  type="text"
                  value={newMetric}
                  onChange={(e) => setNewMetric(e.target.value)}
                  placeholder="مثلاً: حل ۳۰۰ تست و تکمیل ۲ پروژه"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-300"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold"
                >
                  ذخیره هدف
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Weekly Review Form Modal */}
      {showReviewForm && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-emerald-600" />
                ثبت مرور و ارزیابی هفتگی
              </h3>
              <button onClick={() => setShowReviewForm(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateWeeklyReview} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  خلاصه کارهای انجام‌شده و موفقیت‌های این هفته:
                </label>
                <textarea
                  rows={2}
                  required
                  value={completedSummary}
                  onChange={(e) => setCompletedSummary(e.target.value)}
                  placeholder="تمام تکالیف تحویل داده شد و ۲ فصل هندسه مرور شد..."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  کارهای ناتمام یا نیازمند جبران:
                </label>
                <textarea
                  rows={2}
                  value={unfinishedSummary}
                  onChange={(e) => setUnfinishedSummary(e.target.value)}
                  placeholder="تمرین‌های درس زبان و باگ فرم ورود پروژه..."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  بزرگترین پیروزی یا دستاورد هفته (Biggest Win):
                </label>
                <input
                  type="text"
                  required
                  value={biggestWin}
                  onChange={(e) => setBiggestWin(e.target.value)}
                  placeholder="نمره ۲۰ در آزمون فیزیک یا حل سخت‌ترین مسئله الگوریتمی"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  ۳ اولویت حیاتی برای هفته بعد:
                </label>
                <textarea
                  rows={2}
                  required
                  value={nextWeekPriorities}
                  onChange={(e) => setNextWeekPriorities(e.target.value)}
                  placeholder="۱. آزمون حسابان ۲. استقرار بک‌اند پروژه ۳. حفظ پیوستگی مطالعه"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowReviewForm(false)}
                  className="px-4 py-2 border rounded-xl"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold"
                >
                  ثبت ارزیابی هفتگی
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
