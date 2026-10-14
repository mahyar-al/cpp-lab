import React, { useState } from 'react';
import {
  Trophy,
  Plus,
  ExternalLink,
  Clock,
  Calendar,
  CheckCircle2,
  Trash2,
  AlertCircle,
  Award,
  BookOpen,
  X,
  Target,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import {
  formatJalaliShort,
  toPersianDigits,
  getDaysRemaining,
} from '../../utils/jalali';
import { Competition } from '../../types';

export const CompetitionsView: React.FC = () => {
  const {
    competitions,
    addCompetition,
    updateCompetition,
    deleteCompetition,
    toggleCompetitionStage,
    toggleCompetitionTopic,
    addCompetitionTopic,
    addCompetitionMockExam,
    updateSolvedProblems,
    addCompetitionWeakness,
    removeCompetitionWeakness,
  } = useApp();

  const [selectedCompId, setSelectedCompId] = useState<string>(competitions[0]?.id || '');
  const [activeTab, setActiveTab] = useState<'stages' | 'syllabus' | 'mocks' | 'weaknesses'>('stages');

  // New competition modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newOrganizer, setNewOrganizer] = useState('');
  const [newDomain, setNewDomain] = useState('برنامه‌نویسی و الگوریتم');
  const [newDescription, setNewDescription] = useState('');
  const [newRegDeadline, setNewRegDeadline] = useState('2026-11-20');
  const [newUrl, setNewUrl] = useState('');

  // Quick inputs
  const [newTopicTitle, setNewTopicTitle] = useState('');
  const [mockTitle, setMockTitle] = useState('');
  const [mockScore, setMockScore] = useState(78);
  const [mockMaxScore, setMockMaxScore] = useState(100);
  const [newWeaknessText, setNewWeaknessText] = useState('');

  const activeComp = competitions.find((c) => c.id === selectedCompId) || competitions[0];

  const handleCreateComp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    addCompetition({
      title: newTitle.trim(),
      organizer: newOrganizer.trim() || 'باشگاه دانش‌پژوهان',
      domain: newDomain,
      description: newDescription.trim(),
      officialUrl: newUrl || undefined,
      currentStage: 'مرحله اول',
      registrationDate: new Date().toISOString().slice(0, 10),
      registrationDeadline: newRegDeadline,
      stages: [
        { id: 'st-1', name: 'ثبت‌نام اولیه', date: newRegDeadline, completed: true },
        { id: 'st-2', name: 'مرحله اول تستی', date: '2026-12-10', completed: false },
        { id: 'st-3', name: 'مرحله دوم تشریحی', date: '2027-02-15', completed: false },
      ],
      syllabusAndResources: 'سرفصل‌های رسمی دوره',
      readinessStatus: 'preparing',
      readinessPercentage: 20,
      notes: '',
      prepTopics: [
        { id: 'tp-1', title: 'مرور نمونه سوالات دوره گذشته', mastered: false },
      ],
      mockExams: [],
      solvedProblemsCount: 0,
      weaknesses: [],
    });

    setNewTitle('');
    setShowAddModal(false);
  };

  const handleAddTopic = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeComp || !newTopicTitle.trim()) return;
    addCompetitionTopic(activeComp.id, newTopicTitle.trim());
    setNewTopicTitle('');
  };

  const handleAddMockExam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeComp || !mockTitle.trim()) return;
    addCompetitionMockExam(activeComp.id, {
      title: mockTitle.trim(),
      score: Number(mockScore),
      maxScore: Number(mockMaxScore),
      date: new Date().toISOString().slice(0, 10),
    });
    setMockTitle('');
  };

  const handleAddWeakness = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeComp || !newWeaknessText.trim()) return;
    addCompetitionWeakness(activeComp.id, newWeaknessText.trim());
    setNewWeaknessText('');
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            <span className="p-2 rounded-xl bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400">
              <Trophy className="w-6 h-6" />
            </span>
            آمادگی برای مسابقات و المپیادها
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            شمارش معکوس، مدیریت مراحل آزمون، آزمون‌های آزمایشی، حل مسئله و ارزیابی آمادگی
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium rounded-xl shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          ثبت مسابقه جدید
        </button>
      </div>

      {competitions.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 p-12 text-center rounded-2xl border border-dashed border-slate-300 dark:border-slate-800">
          <Trophy className="w-12 h-12 mx-auto text-slate-400 mb-3" />
          <h3 className="text-lg font-bold text-slate-700 dark:text-slate-200">مسابقه‌ای تعریف نشده است</h3>
          <p className="text-sm text-slate-500 mt-1 mb-4">المپیاد دانش‌آموزی، هکاتون یا مسابقه علمی خود را ثبت کنید.</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-amber-600 text-white rounded-xl text-sm"
          >
            افزودن اولین مسابقه
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Competitions Sidebar */}
          <div className="lg:col-span-4 space-y-3">
            <h2 className="text-sm font-bold text-slate-500 dark:text-slate-400 px-1">
              مسابقات من ({toPersianDigits(competitions.length)})
            </h2>
            <div className="space-y-3 max-h-72 lg:max-h-none overflow-y-auto cyber-scrollbar pr-0.5">
            {competitions.map((comp) => {
              const isSelected = activeComp && activeComp.id === comp.id;
              const daysLeft = getDaysRemaining(comp.registrationDeadline);

              return (
                <div
                  key={comp.id}
                  onClick={() => setSelectedCompId(comp.id)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-amber-50/60 dark:bg-amber-950/30 border-amber-300 dark:border-amber-800 shadow-sm'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
                        {comp.domain}
                      </span>
                      <h3 className="font-bold text-base text-slate-900 dark:text-white mt-1">
                        {comp.title}
                      </h3>
                      <span className="text-xs text-slate-500 block">برگزارکننده: {comp.organizer}</span>
                    </div>

                    <div className="text-left">
                      <span className="text-xs font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {daysLeft > 0 ? `${toPersianDigits(daysLeft)} روز مانده` : 'منقضی'}
                      </span>
                    </div>
                  </div>

                  <div className="mt-3">
                    <div className="flex justify-between text-xs text-slate-500 mb-1">
                      <span>درصد آمادگی</span>
                      <span className="font-bold text-amber-600 dark:text-amber-400">{toPersianDigits(comp.readinessPercentage)}٪</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber-600 rounded-full"
                        style={{ width: `${comp.readinessPercentage}%` }}
                      />
                    </div>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
                    <span>مرحله: {comp.currentStage}</span>
                    <span>{toPersianDigits(comp.solvedProblemsCount)} مسئله حل‌شده</span>
                  </div>
                </div>
              );
            })}
            </div>
          </div>

          {/* Active Competition Detail */}
          {activeComp && (
            <div className="lg:col-span-8 space-y-6">
              {/* Main Card */}
              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
                        {activeComp.domain}
                      </span>
                      <span className="text-xs px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        مهلت ثبت‌نام: {formatJalaliShort(activeComp.registrationDeadline)}
                      </span>
                    </div>
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white mt-2">
                      {activeComp.title}
                    </h2>
                  </div>

                  <div className="flex items-center gap-2">
                    {activeComp.officialUrl && (
                      <a
                        href={activeComp.officialUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 text-amber-600"
                        title="سایت رسمی مسابقه"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                    <button
                      onClick={() => {
                        if (confirm(`آیا از حذف مسابقه «${activeComp.title}» اطمینان دارید؟`)) {
                          deleteCompetition(activeComp.id);
                        }
                      }}
                      className="p-2 rounded-xl border border-red-200 dark:border-red-900/40 text-red-500 hover:bg-red-50"
                      title="حذف مسابقه"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  {activeComp.description}
                </p>

                {/* Real-time Countdown Banner */}
                {(() => {
                  const diff = new Date(activeComp.registrationDeadline).getTime() - new Date().getTime();
                  const isPassed = diff <= 0;
                  const days = Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
                  const hours = Math.max(0, Math.floor((diff / (1000 * 60 * 60)) % 24));
                  const minutes = Math.max(0, Math.floor((diff / (1000 * 60)) % 60));

                  return (
                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div>
                        <span className="text-xs text-slate-500 block">شمارش معکوس تا مهلت ثبت‌نام:</span>
                        <div className="text-base font-extrabold text-slate-900 dark:text-white font-mono tabular-nums mt-0.5">
                          {isPassed ? (
                            <span className="text-rose-500 font-sans text-xs">مهلت ثبت‌نام به پایان رسیده است</span>
                          ) : (
                            <span>
                              {toPersianDigits(days)} روز و {toPersianDigits(hours)} ساعت و {toPersianDigits(minutes)} دقیقه
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="text-left text-xs text-slate-500">
                        <span>موعد تقویمی: </span>
                        <span className="font-bold text-slate-700 dark:text-slate-300 font-mono tabular-nums">
                          {formatJalaliShort(activeComp.registrationDeadline)}
                        </span>
                      </div>
                    </div>
                  );
                })()}

                {/* Counter & Solved Problems */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                  <div>
                    <label className="text-xs text-slate-500 font-semibold block mb-1">
                      میزان آمادگی ذهنی و علمی ({toPersianDigits(activeComp.readinessPercentage)}٪):
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={activeComp.readinessPercentage}
                      onChange={(e) => updateCompetition(activeComp.id, { readinessPercentage: Number(e.target.value) })}
                      className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-600"
                    />
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-2 flex-wrap">
                    <span className="text-xs text-slate-500 font-semibold">مسائل حل‌شده:</span>
                    <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 px-2.5 py-1 rounded-xl border border-slate-200 dark:border-slate-700">
                      <button
                        onClick={() => updateSolvedProblems(activeComp.id, -1)}
                        className="w-6 h-6 rounded bg-slate-100 dark:bg-slate-800 font-bold hover:bg-slate-200 text-xs text-slate-700 dark:text-slate-300"
                        title="کاهش ۱ مسئله"
                      >
                        -۱
                      </button>
                      <span className="text-xs font-bold px-1.5 text-amber-600 font-mono tabular-nums">
                        {toPersianDigits(activeComp.solvedProblemsCount)}
                      </span>
                      <button
                        onClick={() => updateSolvedProblems(activeComp.id, 1)}
                        className="w-6 h-6 rounded bg-slate-100 dark:bg-slate-800 font-bold hover:bg-slate-200 text-xs text-slate-700 dark:text-slate-300"
                        title="افزودن ۱ مسئله"
                      >
                        +۱
                      </button>
                      <button
                        onClick={() => updateSolvedProblems(activeComp.id, 5)}
                        className="px-2 h-6 rounded bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 font-bold hover:bg-amber-100 text-xs font-mono tabular-nums"
                        title="افزودن ۵ مسئله"
                      >
                        +۵
                      </button>
                    </div>
                  </div>
                </div>

                {/* Tabs */}
                <div className="border-b border-slate-200 dark:border-slate-800 flex gap-2">
                  <button
                    onClick={() => setActiveTab('stages')}
                    className={`px-3 py-2 text-xs font-semibold rounded-xl flex items-center gap-1.5 ${
                      activeTab === 'stages'
                        ? 'bg-amber-600 text-white'
                        : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400'
                    }`}
                  >
                    <Clock className="w-3.5 h-3.5" />
                    مراحل مسابقه ({toPersianDigits(activeComp.stages.length)})
                  </button>
                  <button
                    onClick={() => setActiveTab('syllabus')}
                    className={`px-3 py-2 text-xs font-semibold rounded-xl flex items-center gap-1.5 ${
                      activeTab === 'syllabus'
                        ? 'bg-amber-600 text-white'
                        : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400'
                    }`}
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    سرفصل‌ها و تسلط ({toPersianDigits(activeComp.prepTopics.length)})
                  </button>
                  <button
                    onClick={() => setActiveTab('mocks')}
                    className={`px-3 py-2 text-xs font-semibold rounded-xl flex items-center gap-1.5 ${
                      activeTab === 'mocks'
                        ? 'bg-amber-600 text-white'
                        : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400'
                    }`}
                  >
                    <Award className="w-3.5 h-3.5" />
                    آزمون‌های آزمایشی ({toPersianDigits(activeComp.mockExams.length)})
                  </button>
                  <button
                    onClick={() => setActiveTab('weaknesses')}
                    className={`px-3 py-2 text-xs font-semibold rounded-xl flex items-center gap-1.5 ${
                      activeTab === 'weaknesses'
                        ? 'bg-red-600 text-white'
                        : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400'
                    }`}
                  >
                    <AlertCircle className="w-3.5 h-3.5" />
                    نقاط ضعف ({toPersianDigits(activeComp.weaknesses.length)})
                  </button>
                </div>

                {/* Tab 1: Stages */}
                {activeTab === 'stages' && (
                  <div className="space-y-3">
                    {activeComp.stages.map((stage) => (
                      <div
                        key={stage.id}
                        onClick={() => toggleCompetitionStage(activeComp.id, stage.id)}
                        className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer text-xs ${
                          stage.completed
                            ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800 text-slate-500'
                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-5 h-5 rounded-lg border flex items-center justify-center ${
                            stage.completed ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-400'
                          }`}>
                            {stage.completed && <CheckCircle2 className="w-3.5 h-3.5" />}
                          </div>
                          <span className={`font-bold ${stage.completed ? 'line-through text-slate-400' : ''}`}>
                            {stage.name}
                          </span>
                        </div>
                        <span className="text-slate-500 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg">
                          تاریخ: {formatJalaliShort(stage.date)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Tab 2: Syllabus Topics */}
                {activeTab === 'syllabus' && (
                  <div className="space-y-4">
                    <form onSubmit={handleAddTopic} className="flex gap-2">
                      <input
                        type="text"
                        value={newTopicTitle}
                        onChange={(e) => setNewTopicTitle(e.target.value)}
                        placeholder="افزودن مبحث یا سرفصل جدید..."
                        className="flex-1 px-4 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                      />
                      <button
                        type="submit"
                        className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-xl"
                      >
                        افزودن سرفصل
                      </button>
                    </form>

                    <div className="space-y-2">
                      {activeComp.prepTopics.map((top) => (
                        <div
                          key={top.id}
                          onClick={() => toggleCompetitionTopic(activeComp.id, top.id)}
                          className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer text-xs ${
                            top.mastered
                              ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200 text-slate-500 line-through'
                              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                          }`}
                        >
                          <div className={`w-4 h-4 rounded border flex items-center justify-center ${
                            top.mastered ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-400'
                          }`}>
                            {top.mastered && <CheckCircle2 className="w-3 h-3" />}
                          </div>
                          <span className="font-medium text-slate-800 dark:text-slate-200">{top.title}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tab 3: Mock Exams */}
                {activeTab === 'mocks' && (
                  <div className="space-y-4">
                    <form onSubmit={handleAddMockExam} className="p-3 bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 rounded-xl flex flex-wrap gap-2 items-center text-xs">
                      <input
                        type="text"
                        value={mockTitle}
                        onChange={(e) => setMockTitle(e.target.value)}
                        placeholder="عنوان آزمون آزمایشی..."
                        className="flex-1 min-w-[150px] px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg"
                      />
                      <input
                        type="number"
                        placeholder="نمره کسب‌شده"
                        value={mockScore}
                        onChange={(e) => setMockScore(Number(e.target.value))}
                        className="w-20 px-2 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg"
                      />
                      <span>از</span>
                      <input
                        type="number"
                        placeholder="کل"
                        value={mockMaxScore}
                        onChange={(e) => setMockMaxScore(Number(e.target.value))}
                        className="w-20 px-2 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg"
                      />
                      <button
                        type="submit"
                        className="px-3 py-1.5 bg-amber-600 text-white font-semibold rounded-lg"
                      >
                        ثبت آزمون
                      </button>
                    </form>

                    <div className="space-y-2">
                      {activeComp.mockExams.length === 0 ? (
                        <p className="text-xs text-slate-400">هنوز آزمون آزمایشی ثبت نشده است.</p>
                      ) : (
                        activeComp.mockExams.map((mock) => (
                          <div
                            key={mock.id}
                            className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-xs"
                          >
                            <div>
                              <span className="font-bold text-slate-800 dark:text-slate-200">{mock.title}</span>
                              <span className="text-slate-400 block text-[11px]">{formatJalaliShort(mock.date)}</span>
                            </div>
                            <span className="font-black text-amber-600 bg-amber-100 dark:bg-amber-900/40 px-2.5 py-1 rounded-lg">
                              {toPersianDigits(mock.score)} از {toPersianDigits(mock.maxScore)}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}

                {/* Tab 4: Weaknesses */}
                {activeTab === 'weaknesses' && (
                  <div className="space-y-4">
                    <form onSubmit={handleAddWeakness} className="flex gap-2">
                      <input
                        type="text"
                        value={newWeaknessText}
                        onChange={(e) => setNewWeaknessText(e.target.value)}
                        placeholder="ثبت مبحث نیازمند تمرین بیشتر برای این مسابقه..."
                        className="flex-1 px-4 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                      />
                      <button
                        type="submit"
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-xl"
                      >
                        ثبت چالش
                      </button>
                    </form>

                    <div className="space-y-2">
                      {activeComp.weaknesses.map((w, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-3 rounded-xl bg-red-50/40 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 text-xs"
                        >
                          <span className="text-red-900 dark:text-red-200">{w}</span>
                          <button
                            onClick={() => removeCompetitionWeakness(activeComp.id, idx)}
                            className="text-red-500 hover:text-red-700"
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

      {/* New Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-600" />
                ثبت مسابقه یا رویداد علمی جدید
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateComp} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  نام مسابقه / المپیاد:
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="مثلاً: هکاتون کشوری هوش مصنوعی"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">برگزارکننده:</label>
                  <input
                    type="text"
                    value={newOrganizer}
                    onChange={(e) => setNewOrganizer(e.target.value)}
                    placeholder="دانشگاه شریف / آموزش و پرورش"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">حوزه رقابت:</label>
                  <input
                    type="text"
                    value={newDomain}
                    onChange={(e) => setNewDomain(e.target.value)}
                    placeholder="الگوریتم / هوش مصنوعی / ریاضی"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">مهلت ثبت‌نام:</label>
                  <input
                    type="date"
                    value={newRegDeadline}
                    onChange={(e) => setNewRegDeadline(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">لینک رسمی (اختیاری):</label>
                  <input
                    type="text"
                    value={newUrl}
                    onChange={(e) => setNewUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">توضیحات و اهداف:</label>
                <textarea
                  rows={2}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="شرح شرایط مسابقه و هدف از شرکت در آن..."
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
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold"
                >
                  ذخیره مسابقه
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
