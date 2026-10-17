import React, { useState } from 'react';
import { X, Check, GraduationCap, Sparkles, FolderGit2, Trophy, Target, FileText, CalendarDays } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Priority, SectionType } from '../../types';

interface QuickAddModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type AddType = 'task' | 'study' | 'note' | 'goal' | 'event';

export const QuickAddModal: React.FC<QuickAddModalProps> = ({ isOpen, onClose }) => {
  const { subjects, addHomework, addNote, addGoal, addStudySession, addCalendarEvent } = useApp();

  const [addType, setAddType] = useState<AddType>('task');

  // Task / Homework fields
  const [taskTitle, setTaskTitle] = useState('');
  const [selectedSubjectId, setSelectedSubjectId] = useState(subjects[0]?.id || '');
  const [taskPriority, setTaskPriority] = useState<Priority>('medium');
  const [taskDueDate, setTaskDueDate] = useState(new Date().toISOString().slice(0, 10));

  // Note fields
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [noteCategory, setNoteCategory] = useState<SectionType>('general');
  const [noteTags, setNoteTags] = useState('');

  // Goal fields
  const [goalTitle, setGoalTitle] = useState('');
  const [goalLevel, setGoalLevel] = useState<'long_term' | 'monthly' | 'weekly'>('weekly');
  const [goalCategory, setGoalCategory] = useState<SectionType>('school');
  const [goalMetric, setGoalMetric] = useState('');

  // Study session fields
  const [studySubject, setStudySubject] = useState(subjects[0]?.name || 'مطالعه آزاد');
  const [studyTopic, setStudyTopic] = useState('');
  const [studyDuration, setStudyDuration] = useState(45);
  const [studyFocus, setStudyFocus] = useState(4);

  // Calendar event fields
  const [eventTitle, setEventTitle] = useState('');
  const [eventDate, setEventDate] = useState(new Date().toISOString().slice(0, 10));
  const [eventTime, setEventTime] = useState('16:00');
  const [eventSection, setEventSection] = useState<SectionType>('school');
  const [eventPriority, setEventPriority] = useState<Priority>('medium');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (addType === 'task') {
      if (!taskTitle.trim()) return;
      const sub = subjects.find((s) => s.id === selectedSubjectId);
      addHomework({
        dayIndex: 0,
        subjectId: selectedSubjectId,
        subjectName: sub ? sub.name : 'عمومی',
        title: taskTitle.trim(),
        completed: false,
        dueDate: taskDueDate,
        priority: taskPriority,
      });
    } else if (addType === 'note') {
      if (!noteTitle.trim()) return;
      addNote({
        title: noteTitle.trim(),
        content: noteContent.trim(),
        category: noteCategory,
        tags: noteTags.split(',').map((t) => t.trim()).filter(Boolean),
        pinned: false,
      });
    } else if (addType === 'goal') {
      if (!goalTitle.trim()) return;
      addGoal({
        title: goalTitle.trim(),
        description: '',
        level: goalLevel,
        category: goalCategory,
        startDate: new Date().toISOString().slice(0, 10),
        deadline: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
        priority: 'medium',
        measurementMetric: goalMetric || 'تکمیل وظایف',
        status: 'todo',
        progressPercentage: 0,
        milestones: [],
      });
    } else if (addType === 'study') {
      if (!studyTopic.trim()) return;
      addStudySession({
        subjectName: studySubject,
        topic: studyTopic.trim(),
        date: new Date().toISOString().slice(0, 10),
        startTime: new Date().toTimeString().slice(0, 5),
        expectedDurationMin: studyDuration,
        actualDurationMin: studyDuration,
        focusScore: studyFocus,
        outcomeNotes: 'ثبت سریع جلسه مطالعه',
        type: 'school',
      });
    } else if (addType === 'event') {
      if (!eventTitle.trim()) return;
      addCalendarEvent({
        title: eventTitle.trim(),
        date: eventDate,
        startTime: eventTime,
        section: eventSection,
        priority: eventPriority,
        completed: false,
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/45 dark:bg-black/80 backdrop-blur-xl animate-in fade-in duration-200" dir="rtl">
      <div className="w-full max-w-lg max-h-[90dvh] flex flex-col glass-strong rounded-[24px] shadow-2xl overflow-hidden text-right relative">
        {/* Ambient subtle glow inside modal */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-fg opacity-10 dark:opacity-[0.06] rounded-full blur-2xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-stone-200/60 dark:border-white/10 shrink-0 bg-stone-500/[0.04] dark:bg-white/[0.03] relative z-10">
          <span className="text-sm font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[var(--accent-primary)]" />
            ثبت سریع در سامانه
          </span>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 rounded-xl hover:bg-stone-500/10 dark:hover:bg-white/10 cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab selection */}
        <div className="flex p-2 gap-1.5 bg-stone-500/[0.03] dark:bg-white/[0.02] border-b border-stone-200/60 dark:border-white/10 overflow-x-auto shrink-0 relative z-10">
          {[
            { id: 'task', label: 'تکلیف / کار', icon: GraduationCap },
            { id: 'event', label: 'رویداد تقویم', icon: CalendarDays },
            { id: 'study', label: 'جلسه مطالعه', icon: Sparkles },
            { id: 'note', label: 'یادداشت', icon: FileText },
            { id: 'goal', label: 'هدف جدید', icon: Target },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = addType === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setAddType(tab.id as AddType)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2.5 text-xs font-semibold rounded-xl transition-all whitespace-nowrap cursor-pointer shrink-0 sm:shrink ${
                  active
                    ? 'bg-white dark:bg-white/15 text-stone-900 dark:text-stone-100 shadow-xs border border-stone-200/80 dark:border-white/15'
                    : 'text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200 hover:bg-stone-500/[0.05] dark:hover:bg-white/[0.05]'
                }`}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1">
          {addType === 'task' && (
            <>
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  عنوان تکلیف یا کار
                </label>
                <input
                  type="text"
                  required
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  placeholder="مثال: حل مسائل صفحه ۴۰ کتاب حسابان"
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    درس مربوطه
                  </label>
                  <select
                    value={selectedSubjectId}
                    onChange={(e) => setSelectedSubjectId(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none"
                  >
                    {subjects.length === 0 ? (
                      <option value="">عمومی / بدون درس</option>
                    ) : (
                      subjects.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    اولویت
                  </label>
                  <select
                    value={taskPriority}
                    onChange={(e) => setTaskPriority(e.target.value as Priority)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none"
                  >
                    <option value="low">کم</option>
                    <option value="medium">متوسط</option>
                    <option value="high">فوری و مهم</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  موعد تحویل
                </label>
                <input
                  type="date"
                  value={taskDueDate}
                  onChange={(e) => setTaskDueDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none"
                />
              </div>
            </>
          )}

          {addType === 'event' && (
            <>
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  عنوان رویداد یا جلسه
                </label>
                <input
                  type="text"
                  required
                  value={eventTitle}
                  onChange={(e) => setEventTitle(e.target.value)}
                  placeholder="مثال: جلسه آزمایشگاه فیزیک یا وبینار المپیاد"
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    تاریخ رویداد
                  </label>
                  <input
                    type="date"
                    required
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    ساعت شروع
                  </label>
                  <input
                    type="time"
                    value={eventTime}
                    onChange={(e) => setEventTime(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    بخش مرتبط
                  </label>
                  <select
                    value={eventSection}
                    onChange={(e) => setEventSection(e.target.value as SectionType)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none"
                  >
                    <option value="school">مدرسه</option>
                    <option value="skill">مهارت</option>
                    <option value="project">پروژه</option>
                    <option value="competition">مسابقات</option>
                    <option value="general">عمومی</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    اولویت
                  </label>
                  <select
                    value={eventPriority}
                    onChange={(e) => setEventPriority(e.target.value as Priority)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none"
                  >
                    <option value="high">بالا</option>
                    <option value="medium">متوسط</option>
                    <option value="low">عادی</option>
                  </select>
                </div>
              </div>
            </>
          )}

          {addType === 'study' && (
            <>
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  موضوع مطالعه یا تمرین
                </label>
                <input
                  type="text"
                  required
                  value={studyTopic}
                  onChange={(e) => setStudyTopic(e.target.value)}
                  placeholder="مثال: پیاده‌سازی صف اولویت‌دار و الگوریتم دایکسترا"
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    نام درس یا حوزه
                  </label>
                  <input
                    type="text"
                    value={studySubject}
                    onChange={(e) => setStudySubject(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    مدت زمان (دقیقه)
                  </label>
                  <input
                    type="number"
                    min="5"
                    max="300"
                    value={studyDuration}
                    onChange={(e) => setStudyDuration(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  میزان تمرکز (۱ تا ۵)
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((score) => (
                    <button
                      key={score}
                      type="button"
                      onClick={() => setStudyFocus(score)}
                      className={`flex-1 py-1.5 text-xs font-bold rounded-lg border transition-all ${
                        studyFocus === score
                          ? 'bg-indigo-600 text-white border-indigo-600'
                          : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {score}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {addType === 'note' && (
            <>
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  عنوان یادداشت
                </label>
                <input
                  type="text"
                  required
                  value={noteTitle}
                  onChange={(e) => setNoteTitle(e.target.value)}
                  placeholder="مثال: نکات طلایی فرمول‌های مثلثاتی"
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  متن یادداشت
                </label>
                <textarea
                  rows={3}
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  placeholder="محتوا یا فرمول‌های مورد نظر را اینجا بنویسید..."
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    دسته‌بندی
                  </label>
                  <select
                    value={noteCategory}
                    onChange={(e) => setNoteCategory(e.target.value as SectionType)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none"
                  >
                    <option value="general">عمومی</option>
                    <option value="school">مدرسه</option>
                    <option value="skill">مهارت‌ها</option>
                    <option value="project">پروژه‌ها</option>
                    <option value="competition">مسابقات</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    برچسب‌ها (با ویرگول جدا کنید)
                  </label>
                  <input
                    type="text"
                    value={noteTags}
                    onChange={(e) => setNoteTags(e.target.value)}
                    placeholder="مثال: ریاضی, کنکور, حد"
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none"
                  />
                </div>
              </div>
            </>
          )}

          {addType === 'goal' && (
            <>
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  عنوان هدف
                </label>
                <input
                  type="text"
                  required
                  value={goalTitle}
                  onChange={(e) => setGoalTitle(e.target.value)}
                  placeholder="مثال: حل ۱۰۰ تست فیزیک دینامیک تا آخر هفته"
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    سطح زمانی هدف
                  </label>
                  <select
                    value={goalLevel}
                    onChange={(e) => setGoalLevel(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none"
                  >
                    <option value="weekly">هدف هفتگی</option>
                    <option value="monthly">هدف ماهانه</option>
                    <option value="long_term">هدف بلندمدت</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    حوزه مربوطه
                  </label>
                  <select
                    value={goalCategory}
                    onChange={(e) => setGoalCategory(e.target.value as SectionType)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none"
                  >
                    <option value="school">مدرسه</option>
                    <option value="skills">مهارت‌ها</option>
                    <option value="projects">پروژه‌ها</option>
                    <option value="competitions">مسابقات</option>
                    <option value="personal">فردی</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  معیار سنجش تحقق
                </label>
                <input
                  type="text"
                  value={goalMetric}
                  onChange={(e) => setGoalMetric(e.target.value)}
                  placeholder="مثال: ثبت درصد بالای ۸۰ یا اتمام فصل ۲"
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none"
                />
              </div>
            </>
          )}

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-[#263247]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#172033] rounded-xl cursor-pointer"
            >
              انصراف
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
            >
              <Check className="w-4 h-4 stroke-[2]" />
              <span>ذخیره اطلاعات</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
