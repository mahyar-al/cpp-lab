import React, { useState } from 'react';
import {
  Sparkles,
  Plus,
  Flame,
  Clock,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Trash2,
  Calendar,
  X,
  Target,
  Pause,
  Play,
  Layers,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { toPersianDigits, formatJalaliShort } from '../../utils/jalali';
import { Skill } from '../../types';

export const SkillsView: React.FC = () => {
  const {
    skills,
    projects,
    addSkill,
    updateSkill,
    deleteSkill,
    toggleSkillRoadmapStep,
    addSkillRoadmapStep,
    logSkillPractice,
    addSkillWeakness,
    removeSkillWeakness,
    addSkillResource,
    toggleSkillResource,
    addSkillExercise,
    toggleSkillExercise,
    breakdownGoalWithAI,
    showToast,
  } = useApp();

  const [selectedSkillId, setSelectedSkillId] = useState<string>(skills[0]?.id || '');
  const [activeTab, setActiveTab] = useState<'roadmap' | 'practice' | 'resources' | 'exercises' | 'weaknesses'>('roadmap');

  // New Skill Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillCategory, setNewSkillCategory] = useState<Skill['category']>('programming');
  const [newSkillCurrentLevel, setNewSkillCurrentLevel] = useState<Skill['currentLevel']>('مقدماتی');
  const [newSkillTargetLevel, setNewSkillTargetLevel] = useState<Skill['targetLevel']>('پیشرفته');
  const [newDailyTargetMin, setNewDailyTargetMin] = useState(45);
  const [newWeeklyTargetMin, setNewWeeklyTargetMin] = useState(300);
  const [newTargetDate, setNewTargetDate] = useState('2026-12-30');
  const [newSkillNotes, setNewSkillNotes] = useState('');
  const [newPrerequisites, setNewPrerequisites] = useState<string[]>([]);
  const [isBreakingDownRoadmap, setIsBreakingDownRoadmap] = useState(false);

  // Quick inputs
  const [newStepTitle, setNewStepTitle] = useState('');
  const [practiceMinutes, setPracticeMinutes] = useState(45);
  const [practiceNotes, setPracticeNotes] = useState('');
  const [newWeaknessText, setNewWeaknessText] = useState('');
  const [newResourceTitle, setNewResourceTitle] = useState('');
  const [newResourceType, setNewResourceType] = useState<'course' | 'book' | 'article' | 'video'>('course');
  const [newResourceUrl, setNewResourceUrl] = useState('');
  const [newExerciseTitle, setNewExerciseTitle] = useState('');

  const activeSkill = skills.find((s) => s.id === selectedSkillId) || skills[0];

  const handleCreateSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkillName.trim()) return;

    addSkill({
      name: newSkillName.trim(),
      category: newSkillCategory,
      currentLevel: newSkillCurrentLevel,
      targetLevel: newSkillTargetLevel,
      dailyTargetMin: Number(newDailyTargetMin) || 30,
      weeklyTargetMin: Number(newWeeklyTargetMin) || 200,
      roadmap: [
        { id: 'step-1', title: 'مبانی و تعاریف اولیه', completed: true, order: 1 },
        { id: 'step-2', title: 'تمرینات کاربردی و ساخت پروژه کوچک', completed: false, order: 2 },
      ],
      resources: [],
      exercises: [],
      practiceLogs: [],
      notes: newSkillNotes,
      weaknesses: [],
      relatedProjectIds: [],
      targetDate: newTargetDate,
      status: 'active',
      prerequisites: newPrerequisites,
    });

    setNewSkillName('');
    setNewPrerequisites([]);
    setShowAddModal(false);
  };

  const handleAIBreakdown = async () => {
    if (!activeSkill) return;
    setIsBreakingDownRoadmap(true);
    try {
      const res = await breakdownGoalWithAI(
        activeSkill.name,
        activeSkill.notes,
        activeSkill.targetLevel,
        activeSkill.category
      );
      if (res && res.steps && res.steps.length > 0) {
        const newRoadmapSteps = res.steps.map((st: any, idx: number) => ({
          id: `step-ai-${Date.now()}-${idx}`,
          title: st.title || st.step || 'گام آموزشی هوشمند',
          completed: false,
          order: (activeSkill.roadmap?.length || 0) + idx + 1,
        }));
        updateSkill(activeSkill.id, {
          roadmap: [...(activeSkill.roadmap || []), ...newRoadmapSteps],
        });
        showToast('مراحل یادگیری هوشمند با موفقیت به نقشه راه اضافه شدند.');
      }
    } catch (e: any) {
      showToast('خطا در تحلیل نقشه راه با هوش مصنوعی');
    } finally {
      setIsBreakingDownRoadmap(false);
    }
  };

  const handleAddRoadmapStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSkill || !newStepTitle.trim()) return;
    addSkillRoadmapStep(activeSkill.id, newStepTitle.trim());
    setNewStepTitle('');
  };

  const handleLogPractice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSkill) return;
    logSkillPractice(activeSkill.id, Number(practiceMinutes) || 30, practiceNotes);
    setPracticeNotes('');
  };

  const handleAddWeakness = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSkill || !newWeaknessText.trim()) return;
    addSkillWeakness(activeSkill.id, newWeaknessText.trim());
    setNewWeaknessText('');
  };

  const handleAddResource = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSkill || !newResourceTitle.trim()) return;
    addSkillResource(activeSkill.id, {
      title: newResourceTitle.trim(),
      type: newResourceType,
      url: newResourceUrl.trim() || undefined,
    });
    setNewResourceTitle('');
    setNewResourceUrl('');
  };

  const handleAddExercise = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSkill || !newExerciseTitle.trim()) return;
    addSkillExercise(activeSkill.id, newExerciseTitle.trim());
    setNewExerciseTitle('');
  };

  const calculateMastery = (skill: Skill) => {
    if (!skill.roadmap || skill.roadmap.length === 0) return 0;
    const completed = skill.roadmap.filter((r) => r.completed).length;
    return Math.round((completed / skill.roadmap.length) * 100);
  };

  const totalPracticeHours = (skill: Skill) => {
    const totalMinutes = skill.practiceLogs.reduce((acc, log) => acc + log.minutes, 0);
    return (totalMinutes / 60).toFixed(1);
  };

  const getCategoryBadge = (cat: Skill['category']) => {
    switch (cat) {
      case 'programming':
        return { label: 'برنامه‌نویسی', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300' };
      case 'ai':
        return { label: 'هوش مصنوعی', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300' };
      case 'language':
        return { label: 'زبان خارجه', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' };
      case 'security':
        return { label: 'امنیت سایبری', color: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300' };
      case 'tools':
        return { label: 'ابزارها', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300' };
      default:
        return { label: 'سایر', color: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300' };
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs relative">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
            <span className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              <Sparkles className="w-5 h-5" />
            </span>
            مدیریت و توسعه مهارت‌ها
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            نقشه‌های راه، منابع آموزشی و ثبت ساعات تمرین
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 text-xs font-semibold rounded-lg transition-colors cursor-pointer shrink-0 shadow-xs"
        >
          <Plus className="w-4 h-4" />
          افزودن مهارت جدید
        </button>
      </div>

      {skills.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 p-12 text-center rounded-xl border border-dashed border-slate-300 dark:border-slate-800">
          <Sparkles className="w-10 h-10 mx-auto text-slate-400 mb-3" />
          <h3 className="text-base font-bold text-slate-700 dark:text-slate-200">هنوز مهارتی تعریف نشده است</h3>
          <p className="text-xs text-slate-500 mt-1 mb-4">اولین مهارت خود را برای ثبت پیشرفت و نقشه یادگیری اضافه کنید.</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 rounded-lg text-xs font-semibold cursor-pointer"
          >
            افزودن اولین مهارت
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Skill Selector Sidebar */}
          <div className="lg:col-span-4 space-y-4">
            <h2 className="text-sm font-bold text-slate-500 dark:text-slate-400 px-1">
              فهرست مهارت‌ها ({toPersianDigits(skills.length)})
            </h2>
            <div className="space-y-3 max-h-72 lg:max-h-none overflow-y-auto pr-0.5">
              {skills.map((skill) => {
                const isSelected = activeSkill && activeSkill.id === skill.id;
                const mastery = calculateMastery(skill);
                const categoryBadge = getCategoryBadge(skill.category);

                return (
                  <div
                    key={skill.id}
                    onClick={() => setSelectedSkillId(skill.id)}
                    className={`p-4 rounded-xl border cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-slate-50 dark:bg-slate-800/60 border-slate-900 dark:border-slate-100 shadow-xs'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${categoryBadge.color}`}>
                            {categoryBadge.label}
                          </span>
                          {skill.status === 'paused' && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400">
                              متوقف‌شده
                            </span>
                          )}
                        </div>
                        <h3 className="font-bold text-sm text-slate-900 dark:text-white mt-1.5">
                          {skill.name}
                        </h3>
                      </div>
                      <div className="flex items-center gap-1 text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2.5 py-1 rounded-md text-xs font-medium border border-amber-200 dark:border-amber-800/50">
                        <Flame className="w-3.5 h-3.5 text-amber-500" />
                        <span>{toPersianDigits(skill.streak)} روز</span>
                      </div>
                    </div>

                    <div className="mt-3">
                      <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
                        <span>میزان تسلط نقشه راه</span>
                        <span className="font-mono tabular-nums font-semibold text-slate-700 dark:text-slate-300">{toPersianDigits(mastery)}٪</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="bg-slate-700 dark:bg-slate-300 h-full rounded-full transition-all"
                          style={{ width: `${mastery}%` }}
                        />
                      </div>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                      <span>سطح: {skill.currentLevel} ← {skill.targetLevel}</span>
                      <span>{toPersianDigits(totalPracticeHours(skill))} ساعت تمرین</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Active Skill Workspace */}
          {activeSkill && (
            <div className="lg:col-span-8 space-y-6">
              {/* Skill Main Card */}
              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg ${getCategoryBadge(activeSkill.category).color}`}>
                        {getCategoryBadge(activeSkill.category).label}
                      </span>
                      <span className="text-xs px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        مهلت هدف: {formatJalaliShort(activeSkill.targetDate)}
                      </span>
                    </div>
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white mt-2">
                      {activeSkill.name}
                    </h2>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        updateSkill(activeSkill.id, {
                          status: activeSkill.status === 'active' ? 'paused' : 'active',
                        })
                      }
                      className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs flex items-center gap-1.5 transition-colors"
                      title={activeSkill.status === 'active' ? 'توقف موقت یادگیری' : 'شروع مجدد'}
                    >
                      {activeSkill.status === 'active' ? (
                        <>
                          <Pause className="w-4 h-4 text-amber-500" />
                          <span>توقف موقت</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 text-emerald-500" />
                          <span>فعال‌سازی</span>
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`آیا از حذف مهارت «${activeSkill.name}» اطمینان دارید؟`)) {
                          deleteSkill(activeSkill.id);
                        }
                      }}
                      className="p-2 rounded-xl border border-red-200 dark:border-red-900/40 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                      title="حذف مهارت"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Status Badges & Quick Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                    <span className="text-xs text-slate-500 dark:text-slate-400 block mb-1">تسلط کنونی</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200 text-sm">{activeSkill.currentLevel}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                    <span className="text-xs text-slate-500 dark:text-slate-400 block mb-1">سطح هدف</span>
                    <span className="font-bold text-purple-600 dark:text-purple-400 text-sm">{activeSkill.targetLevel}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                    <span className="text-xs text-slate-500 dark:text-slate-400 block mb-1">هدف روزانه</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200 text-sm">{toPersianDigits(activeSkill.dailyTargetMin)} دقیقه</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                    <span className="text-xs text-slate-500 dark:text-slate-400 block mb-1">مجموع تمرین</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">{toPersianDigits(totalPracticeHours(activeSkill))} ساعت</span>
                  </div>
                </div>

                {/* Related Projects */}
                {activeSkill.relatedProjectIds && activeSkill.relatedProjectIds.length > 0 && (
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400 block mb-2">
                      پروژه‌های عملی پیوند داده‌شده:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {activeSkill.relatedProjectIds.map((pId) => {
                        const proj = projects.find((p) => p.id === pId);
                        if (!proj) return null;
                        return (
                          <div
                            key={pId}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 text-xs font-medium border border-purple-200 dark:border-purple-800"
                          >
                            <Layers className="w-3.5 h-3.5" />
                            <span>{proj.title}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Workspace Tabs */}
                <div className="border-b border-slate-200 dark:border-slate-800 flex gap-2 overflow-x-auto pb-1">
                  {[
                    { id: 'roadmap', label: 'نقشه راه یادگیری', count: activeSkill.roadmap.length },
                    { id: 'practice', label: 'ثبت تمرین و استمرار', count: activeSkill.practiceLogs.length },
                    { id: 'resources', label: 'منابع آموزشی', count: activeSkill.resources.length },
                    { id: 'exercises', label: 'تمرین‌ها و مینی‌پروژه‌ها', count: activeSkill.exercises.length },
                    { id: 'weaknesses', label: 'نقاط ضعف و چالش‌ها', count: activeSkill.weaknesses.length },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as typeof activeTab)}
                      className={`px-3 py-2 text-xs font-medium rounded-xl whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                        activeTab === tab.id
                          ? 'bg-purple-600 text-white font-bold'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      {tab.label}
                      <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                        activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-700'
                      }`}>
                        {toPersianDigits(tab.count)}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Tab 1: Roadmap */}
                {activeTab === 'roadmap' && (
                  <div className="space-y-4">
                    {/* Prerequisites Info if any */}
                    {activeSkill.prerequisites && activeSkill.prerequisites.length > 0 && (
                      <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center gap-2 text-xs text-blue-300 flex-wrap">
                        <span className="font-bold flex items-center gap-1 text-blue-400">
                          <Layers className="w-3.5 h-3.5" />
                          پیش‌نیازهای این مهارت:
                        </span>
                        {activeSkill.prerequisites.map((prereq, pIdx) => {
                          const prereqSkill = skills.find((s) => s.id === prereq);
                          return (
                            <span
                              key={pIdx}
                              className="px-2 py-0.5 rounded-md bg-blue-500/15 border border-blue-500/30 text-blue-200 text-[11px]"
                            >
                              {prereqSkill ? prereqSkill.name : prereq}
                            </span>
                          );
                        })}
                      </div>
                    )}

                    {/* AI Breakdown Action Bar */}
                    <div className="flex items-center justify-between p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-xs text-purple-300">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-purple-400" />
                        <span>پیشنهاد گام‌های آموزشی متناسب با سطح هدف شما ({activeSkill.targetLevel})</span>
                      </div>
                      <button
                        type="button"
                        onClick={handleAIBreakdown}
                        disabled={isBreakingDownRoadmap}
                        className="px-3 py-1.5 bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white font-bold rounded-lg text-xs shadow-sm flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
                        <span>{isBreakingDownRoadmap ? 'در حال تحلیل...' : 'تولید نقشه راه با هوش مصنوعی'}</span>
                      </button>
                    </div>

                    <form onSubmit={handleAddRoadmapStep} className="flex gap-2">
                      <input
                        type="text"
                        value={newStepTitle}
                        onChange={(e) => setNewStepTitle(e.target.value)}
                        placeholder="افزودن مرحله جدید به نقشه راه..."
                        className="flex-1 px-4 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                      <button
                        type="submit"
                        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-medium rounded-xl flex items-center gap-1.5"
                      >
                        <Plus className="w-4 h-4" />
                        افزودن گام
                      </button>
                    </form>

                    <div className="space-y-2">
                      {activeSkill.roadmap.map((step, idx) => (
                        <div
                          key={step.id}
                          onClick={() => toggleSkillRoadmapStep(activeSkill.id, step.id)}
                          className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                            step.completed
                              ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/40 text-slate-500 dark:text-slate-400 line-through'
                              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200'
                          }`}
                        >
                          <div
                            className={`w-5 h-5 rounded-lg flex items-center justify-center border transition-colors ${
                              step.completed
                                ? 'bg-emerald-600 border-emerald-600 text-white'
                                : 'border-slate-300 dark:border-slate-600'
                            }`}
                          >
                            {step.completed && <CheckCircle2 className="w-3.5 h-3.5" />}
                          </div>
                          <span className="text-xs font-bold text-slate-400">
                            گام {toPersianDigits(idx + 1)}:
                          </span>
                          <span className="text-sm font-medium flex-1">{step.title}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tab 2: Practice Logs & Streak */}
                {activeTab === 'practice' && (
                  <div className="space-y-6">
                    <form onSubmit={handleLogPractice} className="p-4 rounded-xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800/50 space-y-3">
                      <h4 className="text-xs font-bold text-purple-900 dark:text-purple-300 flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        ثبت گزارش تمرین امروز
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs text-slate-500 mb-1 block">مدت زمان تمرین (دقیقه):</label>
                          <input
                            type="number"
                            min="5"
                            step="5"
                            value={practiceMinutes}
                            onChange={(e) => setPracticeMinutes(Number(e.target.value))}
                            className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-slate-500 mb-1 block">توضیحات و نکات کلیدی:</label>
                          <input
                            type="text"
                            value={practiceNotes}
                            onChange={(e) => setPracticeNotes(e.target.value)}
                            placeholder="مثلاً: حل مسائل دیکشنری و لیست در پایتون"
                            className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl"
                          />
                        </div>
                      </div>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-medium rounded-xl"
                      >
                        ثبت در سابقه و افزایش Streak
                      </button>
                    </form>

                    <div className="space-y-2">
                      <h4 className="text-xs font-bold text-slate-500">تاریخچه جلسات تمرین</h4>
                      {activeSkill.practiceLogs.length === 0 ? (
                        <p className="text-xs text-slate-400">هنوز تمرینی برای این مهارت ثبت نشده است.</p>
                      ) : (
                        activeSkill.practiceLogs.map((log) => (
                          <div
                            key={log.id}
                            className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 text-xs"
                          >
                            <div className="flex items-center gap-2">
                              <Calendar className="w-3.5 h-3.5 text-slate-400" />
                              <span className="font-semibold text-slate-700 dark:text-slate-300">
                                {formatJalaliShort(log.date)}
                              </span>
                              <span className="text-slate-500">{log.notes}</span>
                            </div>
                            <span className="font-bold text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/40 px-2 py-0.5 rounded-lg">
                              {toPersianDigits(log.minutes)} دقیقه
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}

                {/* Tab 3: Resources */}
                {activeTab === 'resources' && (
                  <div className="space-y-4">
                    <form onSubmit={handleAddResource} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-3">
                      <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">افزودن منبع آموزشی جدید</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <input
                          type="text"
                          value={newResourceTitle}
                          onChange={(e) => setNewResourceTitle(e.target.value)}
                          placeholder="عنوان دوره یا کتاب..."
                          className="sm:col-span-1 px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl"
                        />
                        <select
                          value={newResourceType}
                          onChange={(e) => setNewResourceType(e.target.value as typeof newResourceType)}
                          className="px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl"
                        >
                          <option value="course">دوره آموزشی</option>
                          <option value="book">کتاب / PDF</option>
                          <option value="article">مقاله / مستندات</option>
                          <option value="video">ویدیو یوتیوب</option>
                        </select>
                        <input
                          type="text"
                          value={newResourceUrl}
                          onChange={(e) => setNewResourceUrl(e.target.value)}
                          placeholder="لینک (اختیاری)..."
                          className="px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl"
                        />
                      </div>
                      <button
                        type="submit"
                        className="px-4 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-medium rounded-xl"
                      >
                        افزودن منبع
                      </button>
                    </form>

                    <div className="space-y-2">
                      {activeSkill.resources.map((res) => (
                        <div
                          key={res.id}
                          className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs"
                        >
                          <div
                            onClick={() => toggleSkillResource(activeSkill.id, res.id)}
                            className="flex items-center gap-2 cursor-pointer flex-1"
                          >
                            <div className={`w-4 h-4 rounded border flex items-center justify-center ${
                              res.completed ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-400'
                            }`}>
                              {res.completed && <CheckCircle2 className="w-3 h-3" />}
                            </div>
                            <span className={res.completed ? 'line-through text-slate-400' : 'font-medium text-slate-800 dark:text-slate-200'}>
                              {res.title}
                            </span>
                            <span className="text-[10px] text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                              {res.type === 'course' ? 'دوره' : res.type === 'book' ? 'کتاب' : 'مقاله'}
                            </span>
                          </div>

                          {res.url && (
                            <a
                              href={res.url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-purple-600 hover:text-purple-700 flex items-center gap-1"
                            >
                              مشاهده <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tab 4: Exercises */}
                {activeTab === 'exercises' && (
                  <div className="space-y-4">
                    <form onSubmit={handleAddExercise} className="flex gap-2">
                      <input
                        type="text"
                        value={newExerciseTitle}
                        onChange={(e) => setNewExerciseTitle(e.target.value)}
                        placeholder="افزودن تمرین یا مینی‌پروژه..."
                        className="flex-1 px-4 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                      />
                      <button
                        type="submit"
                        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-medium rounded-xl"
                      >
                        ثبت تمرین
                      </button>
                    </form>

                    <div className="space-y-2">
                      {activeSkill.exercises.map((ex) => (
                        <div
                          key={ex.id}
                          onClick={() => toggleSkillExercise(activeSkill.id, ex.id)}
                          className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer ${
                            ex.completed
                              ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/40 line-through text-slate-400'
                              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                          }`}
                        >
                          <div className={`w-4 h-4 rounded border flex items-center justify-center ${
                            ex.completed ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-400'
                          }`}>
                            {ex.completed && <CheckCircle2 className="w-3 h-3" />}
                          </div>
                          <span className="text-sm font-medium">{ex.title}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tab 5: Weaknesses */}
                {activeTab === 'weaknesses' && (
                  <div className="space-y-4">
                    <form onSubmit={handleAddWeakness} className="flex gap-2">
                      <input
                        type="text"
                        value={newWeaknessText}
                        onChange={(e) => setNewWeaknessText(e.target.value)}
                        placeholder="ثبت نقطه ضعف یا مبحث چالش‌برانگیز برای تمرین بیشتر..."
                        className="flex-1 px-4 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                      />
                      <button
                        type="submit"
                        className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-medium rounded-xl"
                      >
                        افزودن چالش
                      </button>
                    </form>

                    <div className="space-y-2">
                      {activeSkill.weaknesses.map((w, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-3 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 text-xs"
                        >
                          <div className="flex items-center gap-2 text-amber-900 dark:text-amber-200">
                            <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                            <span>{w}</span>
                          </div>
                          <button
                            onClick={() => removeSkillWeakness(activeSkill.id, idx)}
                            className="text-red-500 hover:text-red-600"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* New Skill Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-600" />
                تعریف مهارت جدید
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSkill} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  نام مهارت:
                </label>
                <input
                  type="text"
                  required
                  value={newSkillName}
                  onChange={(e) => setNewSkillName(e.target.value)}
                  placeholder="مثلاً: یادگیری ماشین با Scikit-Learn"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">دسته‌بندی:</label>
                  <select
                    value={newSkillCategory}
                    onChange={(e) => setNewSkillCategory(e.target.value as typeof newSkillCategory)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                  >
                    <option value="programming">برنامه‌نویسی</option>
                    <option value="ai">هوش مصنوعی و داده</option>
                    <option value="language">زبان خارجی</option>
                    <option value="security">امنیت شبکه</option>
                    <option value="tools">ابزارها و فریمورک‌ها</option>
                    <option value="other">سایر</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">هدف روزانه (دقیقه):</label>
                  <input
                    type="number"
                    value={newDailyTargetMin}
                    onChange={(e) => setNewDailyTargetMin(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">سطح فعلی:</label>
                  <select
                    value={newSkillCurrentLevel}
                    onChange={(e) => setNewSkillCurrentLevel(e.target.value as typeof newSkillCurrentLevel)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                  >
                    <option value="مقدماتی">مقدماتی</option>
                    <option value="متوسط">متوسط</option>
                    <option value="پیشرفته">پیشرفته</option>
                    <option value="تخصصی">تخصصی</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">سطح هدف:</label>
                  <select
                    value={newSkillTargetLevel}
                    onChange={(e) => setNewSkillTargetLevel(e.target.value as typeof newSkillTargetLevel)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                  >
                    <option value="متوسط">متوسط</option>
                    <option value="پیشرفته">پیشرفته</option>
                    <option value="تخصصی">تخصصی</option>
                    <option value="تسلط کامل">تسلط کامل</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  پیش‌نیازها (مهارت‌های لازم قبل از شروع):
                </label>
                <select
                  multiple
                  value={newPrerequisites}
                  onChange={(e) => {
                    const selected = Array.from(e.target.selectedOptions, (option) => option.value);
                    setNewPrerequisites(selected);
                  }}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs min-h-[70px]"
                >
                  {skills.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.currentLevel})
                    </option>
                  ))}
                </select>
                <span className="text-[10px] text-slate-400 mt-0.5 block">
                  (برای انتخاب چند مورد کلید Ctrl یا Cmd را نگه دارید)
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">یادداشت و هدف:</label>
                <textarea
                  rows={2}
                  value={newSkillNotes}
                  onChange={(e) => setNewSkillNotes(e.target.value)}
                  placeholder="اهداف و چرایی یادگیری این مهارت..."
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
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold"
                >
                  ذخیره مهارت
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
