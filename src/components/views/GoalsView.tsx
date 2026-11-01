import React, { useState } from 'react';
import {
  Target,
  Plus,
  CheckCircle2,
  Trash2,
  Calendar,
  Award,
  X,
  FileCheck,
  FolderArchive,
  LayoutGrid,
  List,
  Eye,
  Sparkles,
  Clock,
  Copy,
  Check,
  FolderPlus,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatJalaliShort, toPersianDigits } from '../../utils/jalali';
import { Goal, Priority, SectionType, WeeklyReview } from '../../types';
import { GlassFolder, ArtPreset } from '../ui/glass-folder-cards';

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
    deleteWeeklyReview,
    studySessions,
    homeworks,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'all' | 'long_term' | 'monthly' | 'weekly' | 'weekly_review'>('all');
  const [reviewViewMode, setReviewViewMode] = useState<'folders' | 'classic'>('folders');
  const [selectedReviewModal, setSelectedReviewModal] = useState<WeeklyReview | null>(null);
  const [copiedReviewId, setCopiedReviewId] = useState<string | null>(null);

  const FOLDER_ART_PRESETS: ArtPreset[] = ['aurora', 'verdant', 'ember', 'glacier', 'dusk'];

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
        return { label: 'بلندمدت (سالانه/ترم)', color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20' };
      case 'monthly':
        return { label: 'ماهانه', color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20' };
      case 'weekly':
      default:
        return { label: 'هفتگی', color: 'bg-emerald-500/10 text-emerald-600 dark:text-[#39FF88] border border-emerald-500/20' };
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs relative">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
            <span className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              <Target className="w-5 h-5" />
            </span>
            هدف‌گذاری و ارزیابی عملکرد هفتگی
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            سطوح اهداف بلندمدت و هفتگی، مایل‌استون‌ها، سنجه‌های موفقیت و جلسات مرور هفتگی
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-3.5 py-2 btn-primary text-xs rounded-lg transition-colors cursor-pointer shrink-0 shadow-xs"
          >
            <Plus className="w-4 h-4" />
            تعریف هدف جدید
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3 overflow-x-auto">
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
            className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors flex items-center gap-2 cursor-pointer ${
              activeTab === tab.id
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-semibold border border-slate-200 dark:border-slate-700 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60'
            }`}
          >
            {tab.label}
            <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
              activeTab === tab.id ? 'bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white font-bold' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
            }`}>
              {toPersianDigits(tab.count)}
            </span>
          </button>
        ))}
      </div>

      {/* If Weekly Review Tab is active */}
      {activeTab === 'weekly_review' ? (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#0D1222] p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-[#39FF88]">
                  <FolderArchive className="w-4 h-4" />
                </span>
                <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
                  بایگانی و ذخیره اطلاعات هر هفته (Weekly Archives)
                </h3>
              </div>
              <p className="text-xs text-slate-500">
                پوشه‌های شیشه‌ای سه‌بعدی تعاملی برای نگهداری سوابق مطالعاتی، دستاوردهای هفتگی و اولویت‌ها
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {/* Dual view toggle */}
              <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700/60">
                <button
                  type="button"
                  onClick={() => setReviewViewMode('folders')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                    reviewViewMode === 'folders'
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-semibold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                  <span>پوشه‌های شیشه‌ای</span>
                </button>
                <button
                  type="button"
                  onClick={() => setReviewViewMode('classic')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                    reviewViewMode === 'classic'
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-semibold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <List className="w-3.5 h-3.5" />
                  <span>نمای لیستی</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => setShowReviewForm(true)}
                className="flex items-center gap-2 px-3.5 py-2 btn-primary text-xs rounded-xl transition-all cursor-pointer shadow-xs"
              >
                <FolderPlus className="w-4 h-4" />
                <span>ثبت و ذخیره هفته جدید</span>
              </button>
            </div>
          </div>

          {/* Glass Folders 3D Desk View */}
          {reviewViewMode === 'folders' ? (
            <div className="relative rounded-3xl p-6 sm:p-10 border border-slate-200/80 dark:border-slate-800/80 bg-gradient-to-b from-slate-100/40 via-slate-50/20 to-transparent dark:from-slate-950/60 dark:via-slate-900/30 dark:to-transparent backdrop-blur-md overflow-hidden">
              <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-500/5 via-transparent to-transparent" />

              <div className="relative mb-6 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
                  <Sparkles className="w-4 h-4 text-emerald-500" />
                  <span>روی هر پوشه کلیک کنید تا ورق‌ها باز شوند، یا کلید «+» را برای بایگانی جدید بزنید:</span>
                </div>
                <span className="text-[11px] font-mono text-slate-400">
                  {toPersianDigits(weeklyReviews.length + 1)} پوشه در میز کار
                </span>
              </div>

              <div className="relative flex flex-wrap items-center justify-center gap-10 min-h-[380px]">
                {/* 1. Active Current Week Folder with Add Button */}
                <div className="flex flex-col items-center gap-2">
                  <GlassFolder
                    label="پوشه هفته جاری (در حال ثبت)"
                    meta="برای بایگانی روی + کلیک کنید"
                    tone="dark"
                    art="aurora"
                    action="add"
                    onAdd={() => setShowReviewForm(true)}
                    files={[
                      {
                        name: `مطالعه جاری: ${toPersianDigits((studySessions.reduce((acc, s) => acc + (s.actualDurationMin || 0), 0) / 60).toFixed(1))} ساعت`,
                        meta: 'ثبت‌شده در لاگ‌ها',
                      },
                      {
                        name: `تکالیف تحویل‌شده: ${toPersianDigits(homeworks.filter((h) => h.completed).length)} مورد`,
                        meta: 'وضعیت مدرسه',
                      },
                      {
                        name: 'ثبت دستاورد و پیروزی اصلی هفته',
                        meta: 'آماده ثبت',
                      },
                      {
                        name: '۳ اولویت حیاتی هفته آینده',
                        meta: 'برنامه‌ریزی',
                      },
                    ]}
                  />
                  <span className="text-[11px] font-medium text-emerald-600 dark:text-[#39FF88] flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping inline-block" />
                    هفته جاری (آماده ذخیره)
                  </span>
                </div>

                {/* 2. Archived Past Weeks */}
                {weeklyReviews.map((rev, idx) => {
                  const artPreset = FOLDER_ART_PRESETS[idx % FOLDER_ART_PRESETS.length];
                  return (
                    <div key={rev.id} className="flex flex-col items-center gap-2">
                      <GlassFolder
                        label={`بایگانی (${formatJalaliShort(rev.weekStartDate)} تا ${formatJalaliShort(rev.weekEndDate)})`}
                        meta={`${toPersianDigits(rev.totalStudyHours)} ساعت مطالعه`}
                        tone="dark"
                        art={artPreset}
                        seed={idx + 42}
                        action="more"
                        menu={[
                          {
                            label: 'مشاهده گزارش کامل و برگه تفصیلی',
                            onSelect: () => setSelectedReviewModal(rev),
                          },
                          {
                            label: 'ثبت و بایگانی هفته جدید (+)',
                            onSelect: () => setShowReviewForm(true),
                          },
                          {
                            label: 'حذف این بایگانی',
                            danger: true,
                            onSelect: () => deleteWeeklyReview(rev.id),
                          },
                        ]}
                        onFileSelect={() => setSelectedReviewModal(rev)}
                        files={[
                          {
                            name: `🏆 ${rev.biggestWin || 'دستاورد برتر هفته'}`,
                            meta: 'بزرگترین پیروزی',
                          },
                          {
                            name: `✅ ${rev.completedTasksSummary || 'وظایف تکمیل‌شده'}`,
                            meta: 'کارهای موفق',
                          },
                          {
                            name: `⏳ ${rev.unfinishedTasksSummary || 'موارد برای جبران'}`,
                            meta: 'نیازمند پیگیری',
                          },
                          {
                            name: `🎯 ${rev.nextWeekPriorities || 'اولویت‌های هفته بعد'}`,
                            meta: 'اهداف پیش‌رو',
                          },
                        ]}
                      />
                      <button
                        type="button"
                        onClick={() => setSelectedReviewModal(rev)}
                        className="text-[11px] text-slate-500 hover:text-slate-800 dark:hover:text-slate-300 flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <Eye className="w-3 h-3" />
                        <span>مشاهده برگه گزارش تفصیلی</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* Classic Cards View */
            <div className="space-y-4">
              {weeklyReviews.map((rev) => (
                <div
                  key={rev.id}
                  className="bg-white dark:bg-[#0D1222] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 hover:border-slate-300 dark:hover:border-slate-700 transition-all"
                >
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-[#39FF88]">
                        <Award className="w-4 h-4" />
                      </span>
                      <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm">
                        مرور هفته ({formatJalaliShort(rev.weekStartDate)} تا {formatJalaliShort(rev.weekEndDate)})
                      </h4>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-emerald-600 dark:text-[#39FF88] bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1 rounded-xl border border-emerald-500/20 font-mono">
                        مجموع مطالعه: {toPersianDigits(rev.totalStudyHours)} ساعت
                      </span>
                      <button
                        type="button"
                        onClick={() => setSelectedReviewModal(rev)}
                        className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                        title="مشاهده کامل"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteWeeklyReview(rev.id)}
                        className="p-1.5 text-rose-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-colors cursor-pointer"
                        title="حذف بایگانی"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#090D18] border border-slate-200 dark:border-slate-800 space-y-1">
                      <span className="font-bold text-emerald-500 block">کارهای موفق و انجام‌شده:</span>
                      <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{rev.completedTasksSummary}</p>
                    </div>
                    <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#090D18] border border-slate-200 dark:border-slate-800 space-y-1">
                      <span className="font-bold text-amber-500 block">کارهای باقیمانده برای جبران:</span>
                      <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{rev.unfinishedTasksSummary}</p>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 text-xs space-y-1">
                    <span className="font-bold text-emerald-600 dark:text-[#39FF88] block">
                      بزرگترین دستاورد هفته (Biggest Win):
                    </span>
                    <p className="text-slate-800 dark:text-slate-200 font-medium leading-relaxed">{rev.biggestWin}</p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800/40 text-xs space-y-1">
                    <span className="font-bold text-purple-600 dark:text-purple-400 block">
                      اولویت‌های اصلی هفته بعد:
                    </span>
                    <p className="text-slate-800 dark:text-slate-200 font-medium leading-relaxed">{rev.nextWeekPriorities}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
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
                className="bg-white dark:bg-[#0D1222] p-5 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-emerald-500/40 shadow-sm flex flex-col justify-between space-y-4 transition-all"
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
                      className="text-slate-400 hover:text-red-500 cursor-pointer transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div>
                    <h3 className="font-bold text-base text-slate-900 dark:text-white">
                      {goal.title}
                    </h3>
                    {goal.description && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                        {goal.description}
                      </p>
                    )}
                  </div>

                  {/* Measurement Metric */}
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#090D18] border border-slate-100 dark:border-slate-800 text-xs">
                    <span className="text-slate-400 block text-[10px] mb-0.5">سنجه موفقیت:</span>
                    <span className="font-medium text-slate-700 dark:text-slate-300">{goal.measurementMetric}</span>
                  </div>

                  {/* Progress Slider */}
                  <div>
                    <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
                      <span>پیشرفت کلی</span>
                      <span className="font-bold font-mono text-emerald-600 dark:text-[#39FF88]">
                        {toPersianDigits(goal.progressPercentage)}٪
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={goal.progressPercentage}
                      onChange={(e) => updateGoal(goal.id, { progressPercentage: Number(e.target.value) })}
                      className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                    />
                  </div>

                  {/* Milestones list */}
                  <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400">
                      <span>مایل‌استون‌ها ({toPersianDigits(completedMilestones)}/{toPersianDigits(goal.milestones.length)})</span>
                      <button
                        onClick={() => setMilestoneGoalId(goal.id)}
                        className="text-emerald-600 dark:text-[#39FF88] hover:underline flex items-center gap-0.5 text-[11px] cursor-pointer"
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
                          className="flex-1 px-2.5 py-1 text-xs bg-slate-50 dark:bg-[#090D18] border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white"
                        />
                        <button
                          onClick={() => handleAddMilestone(goal.id)}
                          className="px-3 py-1 bg-emerald-500 text-slate-950 font-bold rounded-lg text-xs cursor-pointer"
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
                          className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer text-xs transition-colors ${
                            m.done
                              ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-500/20 line-through text-slate-400'
                              : 'bg-white dark:bg-[#090D18] border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-emerald-500/40'
                          }`}
                        >
                          <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center ${
                            m.done ? 'bg-emerald-500 border-emerald-500 text-slate-950' : 'border-slate-500'
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
                  <span className="flex items-center gap-1 font-mono">
                    <Calendar className="w-3.5 h-3.5" />
                    مهلت: {formatJalaliShort(goal.deadline)}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    goal.priority === 'high' ? 'text-rose-500 bg-rose-500/10' : 'text-slate-400 bg-slate-800/40'
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
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0D1222] w-full max-w-md rounded-2xl p-6 shadow-2xl border border-slate-200 dark:border-emerald-500/30 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                <Target className="w-5 h-5 text-emerald-400" />
                تعریف هدف جدید
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer">
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
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-[#090D18] border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500/50"
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
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-[#090D18] border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">سطح هدف:</label>
                  <select
                    value={newLevel}
                    onChange={(e) => setNewLevel(e.target.value as Goal['level'])}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#090D18] border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500/50"
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
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#090D18] border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500/50"
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
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#090D18] border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">اولویت:</label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as Priority)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#090D18] border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white"
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
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-[#090D18] border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500/50"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-300 cursor-pointer"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 rounded-lg text-xs font-semibold cursor-pointer shadow-xs"
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
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0D1222] w-full max-w-lg rounded-2xl p-6 shadow-2xl border border-slate-200 dark:border-emerald-500/30 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-emerald-400" />
                ثبت مرور و ارزیابی هفتگی
              </h3>
              <button onClick={() => setShowReviewForm(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer">
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
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-[#090D18] border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500/50"
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
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-[#090D18] border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500/50"
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
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-[#090D18] border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500/50"
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
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-[#090D18] border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500/50"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowReviewForm(false)}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-600 dark:text-slate-300 cursor-pointer"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 rounded-lg text-xs font-semibold cursor-pointer shadow-xs"
                >
                  ثبت ارزیابی هفتگی
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Selected Review Detail Inspection Modal */}
      {selectedReviewModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0D1222] w-full max-w-xl rounded-2xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-5 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-[#39FF88]">
                    <FolderArchive className="w-5 h-5" />
                  </span>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">
                    برگه گزارش بایگانی هفته ({formatJalaliShort(selectedReviewModal.weekStartDate)} تا {formatJalaliShort(selectedReviewModal.weekEndDate)})
                  </h3>
                </div>
                <p className="text-xs text-slate-500">
                  شناسه بایگانی: <span className="font-mono text-[11px]">{selectedReviewModal.id}</span>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedReviewModal(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Stats Banner */}
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-[#090D18] border border-slate-200 dark:border-slate-800 text-xs">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-500" />
                <span className="text-slate-600 dark:text-slate-400">مجموع ساعت مطالعه و تمرکز:</span>
              </div>
              <span className="font-bold text-emerald-600 dark:text-[#39FF88] font-mono text-sm">
                {toPersianDigits(selectedReviewModal.totalStudyHours)} ساعت
              </span>
            </div>

            {/* 4 Detail Sections */}
            <div className="space-y-3.5 text-xs">
              {/* 1. Biggest Win */}
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 space-y-1.5">
                <span className="font-bold text-emerald-600 dark:text-[#39FF88] flex items-center gap-1.5">
                  <Award className="w-4 h-4" />
                  بزرگترین پیروزی و دستاورد هفته (Biggest Win):
                </span>
                <p className="text-slate-800 dark:text-slate-100 font-medium leading-relaxed text-sm">
                  {selectedReviewModal.biggestWin}
                </p>
              </div>

              {/* 2. Completed Items */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#090D18] border border-slate-200 dark:border-slate-800 space-y-1.5">
                <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  کارهای موفق، تکالیف و اهداف انجام‌شده:
                </span>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                  {selectedReviewModal.completedTasksSummary}
                </p>
              </div>

              {/* 3. Unfinished Items */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#090D18] border border-slate-200 dark:border-slate-800 space-y-1.5">
                <span className="font-bold text-amber-500 flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  کارهای ناتمام برای پیگیری و جبران:
                </span>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                  {selectedReviewModal.unfinishedTasksSummary}
                </p>
              </div>

              {/* 4. Next Week Priorities */}
              <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20 space-y-1.5">
                <span className="font-bold text-purple-600 dark:text-purple-400 flex items-center gap-1.5">
                  <Target className="w-4 h-4" />
                  اولویت‌های کلیدی هفته بعد:
                </span>
                <p className="text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap font-medium">
                  {selectedReviewModal.nextWeekPriorities}
                </p>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => {
                  deleteWeeklyReview(selectedReviewModal.id);
                  setSelectedReviewModal(null);
                }}
                className="flex items-center gap-1.5 text-xs text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 px-3 py-2 rounded-xl transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>حذف این بایگانی</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const text = `گزارش مرور هفته (${selectedReviewModal.weekStartDate} تا ${selectedReviewModal.weekEndDate})
مجموع مطالعه: ${selectedReviewModal.totalStudyHours} ساعت
بزرگترین دستاورد: ${selectedReviewModal.biggestWin}
کارهای انجام‌شده: ${selectedReviewModal.completedTasksSummary}
کارهای ناتمام: ${selectedReviewModal.unfinishedTasksSummary}
اولویت‌های هفته بعد: ${selectedReviewModal.nextWeekPriorities}`;
                    navigator.clipboard.writeText(text);
                    setCopiedReviewId(selectedReviewModal.id);
                    setTimeout(() => setCopiedReviewId(null), 2500);
                  }}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer text-slate-700 dark:text-slate-300"
                >
                  {copiedReviewId === selectedReviewModal.id ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                      <span>کپی شد!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>کپی متن گزارش</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedReviewModal(null)}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 rounded-xl text-xs font-semibold cursor-pointer shadow-xs transition-colors"
                >
                  بستن
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
