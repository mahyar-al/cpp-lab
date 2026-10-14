import React, { useState } from 'react';
import {
  Brain,
  Plus,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles,
  BookOpen,
  Filter,
  Check,
  X,
  Calendar as CalendarIcon,
  HelpCircle,
  Eye,
  Trash2,
  Star,
  Layers,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { toPersianDigits } from '../../utils/jalali';
import { SectionType, SpacedReviewItem } from '../../types';

export const ReviewsView: React.FC = () => {
  const { reviews, addReviewItem, deleteReviewItem, submitReviewOutcome, subjects, skills, competitions } = useApp();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [activeReviewItem, setActiveReviewItem] = useState<SpacedReviewItem | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [reviewNotesInput, setReviewNotesInput] = useState('');

  // Form State
  const [newTitle, setNewTitle] = useState('');
  const [newTopic, setNewTopic] = useState('');
  const [newSection, setNewSection] = useState<SectionType>('school');
  const [newEntityId, setNewEntityId] = useState('');
  const [newDifficulty, setNewDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [newIsDifficult, setNewIsDifficult] = useState(false);
  const [newNotes, setNewNotes] = useState('');

  // Filter
  const [filterSection, setFilterSection] = useState<'all' | SectionType>('all');
  const [filterDifficultOnly, setFilterDifficultOnly] = useState(false);

  const todayIso = new Date().toISOString().slice(0, 10);

  // Reviews due today or overdue
  const dueReviews = reviews.filter((r) => r.nextReviewDate <= todayIso);
  const upcomingReviews = reviews.filter((r) => r.nextReviewDate > todayIso);

  const filteredList = reviews.filter((r) => {
    if (filterSection !== 'all' && r.section !== filterSection) return false;
    if (filterDifficultOnly && !r.isDifficult) return false;
    return true;
  });

  const handleCreateReviewItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    let linkedName = '';
    if (newSection === 'school') {
      linkedName = subjects.find((s) => s.id === newEntityId)?.name || 'درس مدرسه';
    } else if (newSection === 'skill') {
      linkedName = skills.find((s) => s.id === newEntityId)?.name || 'مهارت فنی';
    } else if (newSection === 'competition') {
      linkedName = competitions.find((c) => c.id === newEntityId)?.title || 'مسابقه';
    }

    addReviewItem({
      title: newTitle.trim(),
      topic: newTopic.trim() || newTitle.trim(),
      section: newSection,
      linkedEntityId: newEntityId || undefined,
      linkedEntityName: linkedName || undefined,
      difficulty: newDifficulty,
      isDifficult: newIsDifficult,
      masteryLevel: 1,
      nextReviewDate: todayIso,
      notes: newNotes.trim() || undefined,
    });

    setNewTitle('');
    setNewTopic('');
    setNewNotes('');
    setNewIsDifficult(false);
    setIsAddModalOpen(false);
  };

  const handleRatingSubmit = (rating: 'easy' | 'good' | 'hard' | 'forgotten') => {
    if (!activeReviewItem) return;
    submitReviewOutcome(activeReviewItem.id, rating, reviewNotesInput.trim() || undefined);
    setActiveReviewItem(null);
    setShowAnswer(false);
    setReviewNotesInput('');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white dark:bg-[#111827] p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-[#263247] shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-[0_0_12px_rgba(0,245,255,0.2)]">
                <Brain className="w-5 h-5 text-cyan-400" />
              </span>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                سیستم مرور هوشمند و یادگیری فاصله‌دار (Spaced Repetition)
              </h1>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              تثبیت پایدار مفاهیم درسی، الگوریتم‌ها و مهارت‌ها با الگوریتم تکرار فاصله‌دار لایتنر
            </p>
          </div>

          <div className="flex items-center gap-2">
            {dueReviews.length > 0 && (
              <button
                onClick={() => {
                  setActiveReviewItem(dueReviews[0]);
                  setShowAnswer(false);
                }}
                className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold rounded-xl text-xs shadow-[0_0_14px_rgba(57,255,136,0.3)] transition-all cursor-pointer active:scale-95"
              >
                <Sparkles className="w-4 h-4" />
                <span>شروع مرور امروز ({toPersianDigits(dueReviews.length)})</span>
              </button>
            )}
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold rounded-xl text-xs shadow-[0_0_12px_rgba(0,245,255,0.25)] transition-all cursor-pointer active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>ثبت مبحث جدید برای مرور</span>
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center justify-between gap-3 flex-wrap mt-5 pt-4 border-t border-slate-100 dark:border-[#263247] text-xs">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-slate-400 ml-1">فیلتر بخش:</span>
            {[
              { id: 'all', label: 'همه بخش‌ها' },
              { id: 'school', label: 'مدرسه و دروس' },
              { id: 'skill', label: 'مهارت‌ها' },
              { id: 'competition', label: 'مسابقات' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setFilterSection(f.id as any)}
                className={`px-3 py-1 rounded-lg border transition-all cursor-pointer ${
                  filterSection === f.id
                    ? 'border-cyan-400 bg-cyan-500/10 text-cyan-400 font-bold'
                    : 'border-slate-200 dark:border-[#263247] hover:bg-slate-50 dark:hover:bg-[#172033] text-slate-600 dark:text-slate-400'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <label className="flex items-center gap-2 cursor-pointer text-slate-600 dark:text-slate-300">
            <input
              type="checkbox"
              checked={filterDifficultOnly}
              onChange={(e) => setFilterDifficultOnly(e.target.checked)}
              className="rounded text-cyan-500"
            />
            <span>فقط مباحث دشوار و پرچالش</span>
          </label>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#111827] p-4 rounded-xl border border-slate-200 dark:border-[#263247]">
          <span className="text-xs text-slate-400 block mb-1">موعد مرور امروز:</span>
          <span className="text-xl font-bold font-mono text-cyan-400">
            {toPersianDigits(dueReviews.length)} مبحث
          </span>
        </div>

        <div className="bg-white dark:bg-[#111827] p-4 rounded-xl border border-slate-200 dark:border-[#263247]">
          <span className="text-xs text-slate-400 block mb-1">کل مباحث ثبت‌شده:</span>
          <span className="text-xl font-bold font-mono text-slate-900 dark:text-white">
            {toPersianDigits(reviews.length)} مفهوم
          </span>
        </div>

        <div className="bg-white dark:bg-[#111827] p-4 rounded-xl border border-slate-200 dark:border-[#263247]">
          <span className="text-xs text-slate-400 block mb-1">مباحث پرچالش (دشوار):</span>
          <span className="text-xl font-bold font-mono text-rose-500">
            {toPersianDigits(reviews.filter((r) => r.isDifficult).length)} مبحث
          </span>
        </div>

        <div className="bg-white dark:bg-[#111827] p-4 rounded-xl border border-slate-200 dark:border-[#263247]">
          <span className="text-xs text-slate-400 block mb-1">تثبیت‌شده در حافظه (سطح ۴ و ۵):</span>
          <span className="text-xl font-bold font-mono text-[#39FF88]">
            {toPersianDigits(reviews.filter((r) => (r.masteryLevel || 1) >= 4).length)} مورد
          </span>
        </div>
      </div>

      {/* Active Flashcard Review Modal */}
      {activeReviewItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#111827] w-full max-w-lg rounded-2xl border border-cyan-500/40 p-6 shadow-2xl text-right animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-[#263247] mb-4">
              <div className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-cyan-400" />
                <span className="text-sm font-bold text-slate-900 dark:text-white">
                  جلسه مرور هوشمند لایتنر
                </span>
              </div>
              <button
                onClick={() => setActiveReviewItem(null)}
                className="p-1 text-slate-400 hover:text-slate-200 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Prompt Card */}
            <div className="p-5 rounded-xl bg-slate-50 dark:bg-[#0D1220] border border-slate-200 dark:border-[#263247] space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-semibold">
                  {activeReviewItem.linkedEntityName || 'مفهوم علمی'}
                </span>
                <span className="font-mono">
                  تکرار: {toPersianDigits(activeReviewItem.repetitionCount || 0)} بار
                </span>
              </div>

              <h2 className="text-base font-bold text-slate-900 dark:text-white leading-relaxed">
                {activeReviewItem.title}
              </h2>

              {activeReviewItem.topic !== activeReviewItem.title && (
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  سرفصل / مبحث: {activeReviewItem.topic}
                </p>
              )}

              {/* Reveal Notes/Answer button */}
              {!showAnswer ? (
                <button
                  onClick={() => setShowAnswer(true)}
                  className="w-full mt-3 py-2.5 bg-slate-200 hover:bg-slate-300 dark:bg-[#172033] dark:hover:bg-[#1f2b45] text-slate-800 dark:text-slate-200 font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Eye className="w-4 h-4 text-cyan-400" />
                  <span>نمایش نکات و پاسخ کلیدی</span>
                </button>
              ) : (
                <div className="mt-3 p-3.5 rounded-lg bg-cyan-500/5 dark:bg-[#172033]/80 border border-cyan-500/20 text-xs text-slate-700 dark:text-slate-300 space-y-1">
                  <span className="font-bold text-cyan-400 block text-[11px]">
                    نکات کلیدی و راهکار حل:
                  </span>
                  <p className="leading-relaxed whitespace-pre-line">
                    {activeReviewItem.notes || 'نکته خاصی برای این مبحث ثبت نشده بود. یادآوری و تسلط خود را ارزیابی کنید.'}
                  </p>
                </div>
              )}
            </div>

            {/* Reflection Note */}
            {showAnswer && (
              <div className="mt-3">
                <input
                  type="text"
                  value={reviewNotesInput}
                  onChange={(e) => setReviewNotesInput(e.target.value)}
                  placeholder="یادداشت تکمیلی این دور از مرور (اختیاری)..."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-[#0D1220] border border-slate-200 dark:border-[#263247] rounded-xl text-xs"
                />
              </div>
            )}

            {/* Rating Buttons */}
            {showAnswer && (
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-[#263247]">
                <span className="block text-center text-xs font-bold text-slate-500 dark:text-slate-400 mb-2">
                  میزان یادآوری و پاسخ‌دهی شما چطور بود؟
                </span>
                <div className="grid grid-cols-4 gap-2">
                  <button
                    onClick={() => handleRatingSubmit('forgotten')}
                    className="p-2.5 rounded-xl border border-rose-500/40 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 text-xs font-bold transition-all cursor-pointer flex flex-col items-center"
                  >
                    <span>فراموش‌کردم</span>
                    <span className="text-[10px] opacity-75 font-mono">فردا مجدد</span>
                  </button>

                  <button
                    onClick={() => handleRatingSubmit('hard')}
                    className="p-2.5 rounded-xl border border-amber-500/40 bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 text-xs font-bold transition-all cursor-pointer flex flex-col items-center"
                  >
                    <span>سخت بود</span>
                    <span className="text-[10px] opacity-75 font-mono">+۱ تا ۲ روز</span>
                  </button>

                  <button
                    onClick={() => handleRatingSubmit('good')}
                    className="p-2.5 rounded-xl border border-blue-500/40 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 text-xs font-bold transition-all cursor-pointer flex flex-col items-center"
                  >
                    <span>خوب یادم بود</span>
                    <span className="text-[10px] opacity-75 font-mono">فاصله دوبرابر</span>
                  </button>

                  <button
                    onClick={() => handleRatingSubmit('easy')}
                    className="p-2.5 rounded-xl border border-emerald-500/40 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs font-bold transition-all cursor-pointer flex flex-col items-center"
                  >
                    <span>خیلی آسان</span>
                    <span className="text-[10px] opacity-75 font-mono">فاصله طولانی</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Reviews List */}
      <div className="bg-white dark:bg-[#111827] p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-[#263247] shadow-sm">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-[#263247] mb-4">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-cyan-400" />
            فهرست مباحث و زمان‌بندی مرورها
          </h2>
          <span className="text-xs font-mono text-slate-400">
            {toPersianDigits(filteredList.length)} مبحث
          </span>
        </div>

        {filteredList.length === 0 ? (
          <div className="py-16 text-center text-xs text-slate-400 space-y-3">
            <p>مبحثی در این دسته‌بندی یافت نشد.</p>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-4 py-2 bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 rounded-xl font-bold"
            >
              + ثبت اولین مبحث
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {filteredList.map((item) => {
              const isDue = item.nextReviewDate <= todayIso;
              const mastery = item.masteryLevel || 1;

              return (
                <div
                  key={item.id}
                  className={`p-4 rounded-xl border transition-all text-right ${
                    isDue
                      ? 'bg-cyan-500/5 dark:bg-[#0D1220] border-cyan-400/50 shadow-[0_0_12px_rgba(0,245,255,0.15)]'
                      : 'bg-white dark:bg-[#0D1220] border-slate-200 dark:border-[#263247] hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[11px] font-semibold text-cyan-400">
                        {item.linkedEntityName || 'عمومی'}
                      </span>
                      {item.isDifficult && (
                        <span className="text-[10px] px-1.5 py-0.5 bg-rose-500/10 text-rose-500 border border-rose-500/20 rounded">
                          دشوار
                        </span>
                      )}
                      {isDue && (
                        <span className="text-[10px] px-1.5 py-0.5 bg-emerald-500/10 text-[#39FF88] border border-emerald-500/30 rounded font-bold animate-pulse">
                          موعد مرور امروز!
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => deleteReviewItem(item.id)}
                      className="text-slate-400 hover:text-rose-500 p-1"
                      title="حذف مبحث"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-2 leading-relaxed">
                    {item.title}
                  </h3>

                  {item.topic !== item.title && (
                    <p className="text-xs text-slate-400 mt-0.5">
                      مبحث: {item.topic}
                    </p>
                  )}

                  {/* Mastery stars & intervals */}
                  <div className="flex items-center justify-between text-xs text-slate-400 mt-3 pt-2.5 border-t border-slate-100 dark:border-[#263247]/60">
                    <div className="flex items-center gap-1">
                      <span className="text-[10px]">تسلط:</span>
                      <div className="flex items-center">
                        {[1, 2, 3, 4, 5].map((lvl) => (
                          <Star
                            key={lvl}
                            className={`w-3 h-3 ${
                              lvl <= mastery
                                ? 'text-amber-400 fill-amber-400'
                                : 'text-slate-300 dark:text-slate-700'
                            }`}
                          />
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 font-mono text-[11px]">
                      <span>فاصله: {toPersianDigits(item.intervalDays || 1)} روز</span>
                      <button
                        onClick={() => {
                          setActiveReviewItem(item);
                          setShowAnswer(false);
                        }}
                        className="px-2.5 py-1 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 rounded-lg font-bold transition-all cursor-pointer"
                      >
                        مرور
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Review Item Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#111827] w-full max-w-md rounded-2xl border border-slate-200 dark:border-[#263247] p-5 shadow-2xl text-right animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-[#263247] mb-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Brain className="w-4 h-4 text-cyan-400" />
                ثبت مفهوم جدید برای تکرار فاصله‌دار
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-200 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateReviewItem} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  عنوان مفهوم یا پرسش:
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="مثلاً: قضیه هم‌ارزی تالس و کاربردها"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-[#0D1220] border border-slate-200 dark:border-[#263247] rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  سرفصل یا نام فصل:
                </label>
                <input
                  type="text"
                  value={newTopic}
                  onChange={(e) => setNewTopic(e.target.value)}
                  placeholder="مثلاً: هندسه پایه یازدهم، فصل ۲"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-[#0D1220] border border-slate-200 dark:border-[#263247] rounded-xl text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    بخش مرتبط:
                  </label>
                  <select
                    value={newSection}
                    onChange={(e) => {
                      setNewSection(e.target.value as SectionType);
                      setNewEntityId('');
                    }}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#0D1220] border border-slate-200 dark:border-[#263247] rounded-xl text-xs"
                  >
                    <option value="school">مدرسه و درس‌ها</option>
                    <option value="skill">مهارت فنی</option>
                    <option value="competition">مسابقات</option>
                    <option value="general">عمومی</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    انتخاب مورد وابسته:
                  </label>
                  <select
                    value={newEntityId}
                    onChange={(e) => setNewEntityId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#0D1220] border border-slate-200 dark:border-[#263247] rounded-xl text-xs"
                  >
                    <option value="">بدون وابستگی خاص</option>
                    {newSection === 'school' &&
                      subjects.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    {newSection === 'skill' &&
                      skills.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    {newSection === 'competition' &&
                      competitions.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.title}
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  نکات کلیدی و راهکارها (پاسخ فلش‌کارت):
                </label>
                <textarea
                  rows={3}
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="تعاریف کلیدی، فرمول‌ها یا نکات ظریفی که باید به یاد آورید..."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-[#0D1220] border border-slate-200 dark:border-[#263247] rounded-xl text-xs"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="diffCheck"
                  checked={newIsDifficult}
                  onChange={(e) => setNewIsDifficult(e.target.checked)}
                  className="rounded text-rose-500"
                />
                <label htmlFor="diffCheck" className="text-slate-700 dark:text-slate-300 font-semibold cursor-pointer">
                  این مبحث برای من دشوار است (پرچالش)
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-[#263247]">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-slate-400 text-xs font-bold"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold rounded-xl text-xs shadow-[0_0_12px_rgba(0,245,255,0.25)]"
                >
                  افزودن به جعبه مرور
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
