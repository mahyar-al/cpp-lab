import React, { useState } from 'react';
import {
  Clock,
  Printer,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  Play,
  Pause,
  RotateCcw,
  Smile,
  Meh,
  Frown,
  X,
  Calendar,
  AlertCircle,
  BookOpen,
  TrendingUp,
  Sparkles,
  ChevronLeft,
  GraduationCap,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import {
  toPersianDigits,
  formatJalaliShort,
  formatJalaliFull,
  getRelativeTimeString,
  getIranianDayOfWeek,
  getDaysRemaining,
} from '../../utils/jalali';
import {
  Priority,
  WeeklyTimetableCell,
  DayRating,
  SchoolExamItem,
} from '../../types';

const SCHOOL_DAYS = ['شنبه', 'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه'];

export const SchoolView: React.FC = () => {
  const {
    subjects,
    grades,
    weeklyCells,
    dayData,
    homeworks,
    exams,
    addExam,
    updateExam,
    toggleExam,
    deleteExam,
    studySessions,
    profile,
    updateProfile,
    addSubject,
    deleteSubject,
    addGrade,
    deleteGrade,
    updateWeeklyCell,
    clearWeeklyCell,
    updateDayData,
    addPreSchoolTask,
    togglePreSchoolTask,
    deletePreSchoolTask,
    addPostSchoolTask,
    togglePostSchoolTask,
    deletePostSchoolTask,
    setDayRating,
    addHomework,
    toggleHomework,
    deleteHomework,
    addStudySession,
    deleteStudySession,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'timetable' | 'daily' | 'subjects' | 'exams' | 'pomodoro'>('timetable');
  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(0);

  // Exam Management State
  const [showAddExamModal, setShowAddExamModal] = useState(false);
  const [examSubjectId, setExamSubjectId] = useState(subjects[0]?.id || '');
  const [examTitle, setExamTitle] = useState('');
  const [examType, setExamType] = useState<SchoolExamItem['type']>('exam');
  const [examDate, setExamDate] = useState(new Date().toISOString().slice(0, 10));
  const [examTime, setExamTime] = useState('08:30');
  const [examChapters, setExamChapters] = useState('');
  const [examReviewSchedule, setExamReviewSchedule] = useState('');
  const [examPriority, setExamPriority] = useState<Priority>('high');
  const [examFilter, setExamFilter] = useState<'all' | 'upcoming' | 'completed'>('upcoming');

  // Edit Timetable Cell Modal
  const [editingCell, setEditingCell] = useState<{ dayIndex: number; period: number } | null>(null);
  const [cellSubjectId, setCellSubjectId] = useState('');
  const [cellRoom, setCellRoom] = useState('');
  const [cellTeacher, setCellTeacher] = useState('');
  const [cellColor, setCellColor] = useState('#3b82f6');
  const [cellNotes, setCellNotes] = useState('');

  // Bell Times Settings Modal
  const [showBellSettings, setShowBellSettings] = useState(false);
  const [bellTimesDraft, setBellTimesDraft] = useState(profile.bellTimes);

  // Add Subject Modal
  const [showAddSubject, setShowAddSubject] = useState(false);
  const [newSubName, setNewSubName] = useState('');
  const [newSubTeacher, setNewSubTeacher] = useState('');
  const [newSubRoom, setNewSubRoom] = useState('');
  const [newSubColor, setNewSubColor] = useState('#3b82f6');
  const [newSubStudyRange, setNewSubStudyRange] = useState('');
  const [newSubReviewSchedule, setNewSubReviewSchedule] = useState('');

  // Add Grade Modal
  const [showAddGrade, setShowAddGrade] = useState(false);
  const [gradeSubjectId, setGradeSubjectId] = useState(subjects[0]?.id || '');
  const [gradeTitle, setGradeTitle] = useState('');
  const [gradeScore, setGradeScore] = useState<number>(20);
  const [gradeMaxScore, setGradeMaxScore] = useState<number>(20);
  const [gradeDate, setGradeDate] = useState(new Date().toISOString().slice(0, 10));

  // Add Homework form state for Daily Page
  const [newHwTitle, setNewHwTitle] = useState('');
  const [newHwSubjectId, setNewHwSubjectId] = useState(subjects[0]?.id || '');
  const [newHwDueDate, setNewHwDueDate] = useState(new Date().toISOString().slice(0, 10));

  // Quick Checklist inputs for Daily Page
  const [newPreTask, setNewPreTask] = useState('');
  const [newPostTask, setNewPostTask] = useState('');

  // Pomodoro Timer States
  const [pomodoroMode, setPomodoroMode] = useState<'work' | 'short_break' | 'long_break'>('work');
  const [pomodoroDuration, setPomodoroDuration] = useState<number>(25 * 60);
  const [pomodoroRemaining, setPomodoroRemaining] = useState<number>(25 * 60);
  const [pomodoroRunning, setPomodoroRunning] = useState<boolean>(false);
  const [pomodoroTopic, setPomodoroTopic] = useState<string>('حل تمرین و مطالعه عمیق');
  const [pomodoroSubjectName, setPomodoroSubjectName] = useState<string>(subjects[0]?.name || 'مطالعه و تمرین');
  const [pomodoroFocusScore, setPomodoroFocusScore] = useState<number>(5);
  const [pomodoroOutcomeNotes, setPomodoroOutcomeNotes] = useState<string>('');

  const playTimerChime = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime);
      osc.frequency.setValueAtTime(880, audioCtx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.6);
    } catch (e) {
      console.log('Audio chime error:', e);
    }
  };

  React.useEffect(() => {
    let interval: any = null;
    if (pomodoroRunning && pomodoroRemaining > 0) {
      interval = setInterval(() => {
        setPomodoroRemaining((prev) => prev - 1);
      }, 1000);
    } else if (pomodoroRunning && pomodoroRemaining === 0) {
      setPomodoroRunning(false);
      playTimerChime();
    }
    return () => clearInterval(interval);
  }, [pomodoroRunning, pomodoroRemaining]);

  const setPomodoroModeWithDuration = (mode: 'work' | 'short_break' | 'long_break', minutes: number) => {
    setPomodoroMode(mode);
    setPomodoroDuration(minutes * 60);
    setPomodoroRemaining(minutes * 60);
    setPomodoroRunning(false);
  };

  const handleLogPomodoroSession = () => {
    const elapsedMinutes = Math.max(1, Math.round((pomodoroDuration - pomodoroRemaining) / 60));
    addStudySession({
      subjectName: pomodoroSubjectName,
      topic: pomodoroTopic,
      date: new Date().toISOString().slice(0, 10),
      startTime: new Date().toTimeString().slice(0, 5),
      expectedDurationMin: Math.round(pomodoroDuration / 60),
      actualDurationMin: elapsedMinutes,
      focusScore: pomodoroFocusScore,
      outcomeNotes: pomodoroOutcomeNotes || 'جلسه پومودورو تکمیل شد',
      type: 'school',
    });
    setPomodoroRemaining(pomodoroDuration);
    setPomodoroRunning(false);
    setPomodoroOutcomeNotes('');
  };

  const handleOpenCellEdit = (dayIndex: number, period: number) => {
    const existing = weeklyCells.find((c) => c.dayIndex === dayIndex && c.period === period);
    const sub = subjects.find((s) => s.id === existing?.subjectId);
    setEditingCell({ dayIndex, period });
    setCellSubjectId(existing?.subjectId || subjects[0]?.id || '');
    setCellRoom(existing?.room || sub?.room || '');
    setCellTeacher(existing?.teacher || sub?.teacher || '');
    setCellColor(existing?.color || sub?.color || '#3b82f6');
    setCellNotes(existing?.notes || '');
  };

  const handleSaveCell = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCell) return;
    const sub = subjects.find((s) => s.id === cellSubjectId);
    updateWeeklyCell({
      dayIndex: editingCell.dayIndex,
      period: editingCell.period,
      subjectId: cellSubjectId,
      customSubjectName: sub?.name,
      room: cellRoom,
      teacher: cellTeacher,
      color: cellColor,
      notes: cellNotes,
    });
    setEditingCell(null);
  };

  const handleClearCurrentCell = () => {
    if (!editingCell) return;
    clearWeeklyCell(editingCell.dayIndex, editingCell.period);
    setEditingCell(null);
  };

  const totalGradeScore = grades.reduce((acc, g) => acc + (g.score / g.maxScore) * 20 * (g.weight || 1), 0);
  const totalGradeWeight = grades.reduce((acc, g) => acc + (g.weight || 1), 0);
  const calculatedGPA = totalGradeWeight > 0 ? (totalGradeScore / totalGradeWeight).toFixed(2) : null;

  const currentDayData = dayData[selectedDayIndex] || {
    dayIndex: selectedDayIndex,
    overallRating: null,
    preSchoolTasks: [],
    postSchoolTasks: [],
    notes: '',
    reflectionReport: '',
  };

  const dayBells = [1, 2, 3, 4, 5].map((period) => {
    const cell = weeklyCells.find((c) => c.dayIndex === selectedDayIndex && c.period === period);
    const sub = subjects.find((s) => s.id === cell?.subjectId);
    const bellTime = profile.bellTimes.find((b) => b.period === period);
    return {
      period,
      bellTime: bellTime || { startTime: '08:00', endTime: '09:00', title: `زنگ ${period}` },
      subject: sub,
      room: cell?.room || sub?.room,
      color: cell?.color || sub?.color || '#3b82f6',
      notes: cell?.notes,
    };
  });

  const handleCreateExam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!examTitle.trim()) return;
    const sub = subjects.find((s) => s.id === examSubjectId);
    addExam({
      subjectId: examSubjectId,
      subjectName: sub ? sub.name : 'درس عمومی',
      title: examTitle.trim(),
      date: examDate,
      time: examTime,
      type: examType,
      chapters: examChapters.trim(),
      reviewSchedule: examReviewSchedule.trim(),
      priority: examPriority,
      completed: false,
    });
    setExamTitle('');
    setExamChapters('');
    setExamReviewSchedule('');
    setShowAddExamModal(false);
  };

  const handleStartPrepForExam = (exam: SchoolExamItem) => {
    setPomodoroSubjectName(exam.subjectName);
    setPomodoroTopic(`مطالعه و آمادگی برای ${exam.title} (${exam.chapters || 'مرور سرفصل‌ها'})`);
    setActiveTab('pomodoro');
  };

  const dayHomeworks = homeworks.filter(
    (h) => h.dayIndex === selectedDayIndex || (h.dueDate && getIranianDayOfWeek(h.dueDate) === selectedDayIndex)
  );
  const remainingPre = currentDayData.preSchoolTasks.filter((t) => !t.completed).length;
  const remainingPost = currentDayData.postSchoolTasks.filter((t) => !t.completed).length;
  const remainingHw = dayHomeworks.filter((h) => !h.completed).length;
  const totalRemainingDayTasks = remainingPre + remainingPost + remainingHw;

  return (
    <div className="space-y-6">
      {/* Top Header & Sub-Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            مدیریت تحصیلی و مدرسه
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            برنامه هفتگی، تکالیف روزانه و مدیریت دروس و آزمون‌ها
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-[#0D1222] border border-slate-200 dark:border-slate-800/80 rounded-2xl overflow-x-auto">
          {[
            { id: 'timetable', label: 'برنامه هفتگی' },
            { id: 'daily', label: 'برنامه روزانه' },
            { id: 'subjects', label: 'درس‌ها و نمرات' },
            { id: 'exams', label: 'امتحانات و مرور', badge: exams.filter((e) => !e.completed).length },
            { id: 'pomodoro', label: 'تایمر پومودورو' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-semibold border border-slate-200 dark:border-slate-700 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <span>{tab.label}</span>
              {tab.badge !== undefined && tab.badge > 0 && (
                <span className="px-1.5 py-0.2 font-mono text-[10px] rounded-full bg-rose-500/15 text-rose-500 dark:text-rose-400 border border-rose-500/20 font-bold">
                  {toPersianDigits(tab.badge)}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* TAB 1: WEEKLY TIMETABLE (5 DAYS X 5 PERIODS = 25 CELLS) */}
      {activeTab === 'timetable' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <span className="text-xs text-slate-500 dark:text-slate-400">
              روی هر خانه کلیک کنید تا درس، ساعت، نام معلم و کلاس را ویرایش کنید.
            </span>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => setShowBellSettings(true)}
                className="px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-[#0D1222] border border-slate-200 dark:border-slate-800 rounded-xl hover:border-cyan-500/40 hover:text-cyan-400 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>ساعات زنگ‌ها</span>
              </button>
              <button
                onClick={() => window.print()}
                className="px-3 py-1.5 text-xs font-medium text-cyan-700 dark:text-cyan-300 bg-cyan-50 dark:bg-cyan-950/40 border border-cyan-200 dark:border-cyan-900/60 rounded-xl hover:bg-cyan-100 dark:hover:bg-cyan-900/50 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>چاپ برنامه هفتگی</span>
              </button>
            </div>
          </div>

          {/* Timetable Matrix */}
          <div className="bg-white dark:bg-[#0D1222] rounded-2xl border border-slate-200 dark:border-slate-800/90 overflow-hidden shadow-xs print-table">
            <div className="overflow-x-auto">
              <table className="w-full text-right border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-[#090D18] border-b border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300">
                    <th className="p-3 w-28 text-center border-l border-slate-200 dark:border-slate-800">
                      زنگ / ساعت
                    </th>
                    {SCHOOL_DAYS.map((dayName, idx) => (
                      <th
                        key={idx}
                        className="p-3 text-center border-l border-slate-200 dark:border-slate-800 last:border-l-0 min-w-[140px]"
                      >
                        <div className="font-extrabold text-slate-900 dark:text-white">
                          {dayName}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[1, 2, 3, 4, 5].map((period) => {
                    const bell = profile.bellTimes.find((b) => b.period === period);
                    return (
                      <tr
                        key={period}
                        className="border-b border-slate-200 dark:border-slate-800/80 last:border-b-0 hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors"
                      >
                        <td className="p-3 text-center border-l border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[#090D18]">
                          <div className="text-xs font-bold text-slate-900 dark:text-white">
                            زنگ {toPersianDigits(period)}
                          </div>
                          <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                            {toPersianDigits(bell?.startTime || '08:00')} - {toPersianDigits(bell?.endTime || '09:00')}
                          </div>
                        </td>

                        {[0, 1, 2, 3, 4].map((dayIndex) => {
                          const cell = weeklyCells.find(
                            (c) => c.dayIndex === dayIndex && c.period === period
                          );
                          const sub = subjects.find((s) => s.id === cell?.subjectId);
                          const hasContent = !!(sub || cell?.customSubjectName);

                          return (
                            <td
                              key={dayIndex}
                              onClick={() => handleOpenCellEdit(dayIndex, period)}
                              className="p-2 border-l border-slate-200 dark:border-slate-800/80 last:border-l-0 align-top cursor-pointer group hover:bg-cyan-500/5 dark:hover:bg-[#121829] transition-all"
                            >
                              {hasContent ? (
                                <div
                                  className="h-24 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 flex flex-col justify-between transition-colors group-hover:border-slate-400 dark:group-hover:border-slate-600 bg-slate-50/60 dark:bg-slate-900/60 relative overflow-hidden"
                                >
                                  <div
                                    className="absolute top-0 right-0 left-0 h-[2px] opacity-80"
                                    style={{ backgroundColor: cell?.color || sub?.color || '#06B6D4' }}
                                  />
                                  <div>
                                    <div className="flex items-center justify-between gap-1">
                                      <span className="font-bold text-xs text-slate-900 dark:text-white truncate">
                                        {sub ? sub.name : cell?.customSubjectName}
                                      </span>
                                      <Edit2 className="w-3 h-3 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </div>
                                    <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 truncate">
                                      {cell?.teacher || sub?.teacher || '—'}
                                    </div>
                                  </div>

                                  <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-200/40 dark:border-slate-800/80">
                                    <span>کلاس {cell?.room || sub?.room || '—'}</span>
                                    {cell?.notes && (
                                      <span className="truncate max-w-[80px]" title={cell.notes}>
                                        {cell.notes}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              ) : (
                                <div className="h-24 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl flex flex-col items-center justify-center text-slate-400 group-hover:text-cyan-400 group-hover:border-cyan-500/50 transition-all bg-slate-50/20 dark:bg-[#0D1222]/30">
                                  <Plus className="w-4 h-4 opacity-40 group-hover:opacity-100" />
                                  <span className="text-[10px] mt-1 opacity-0 group-hover:opacity-100">
                                    افزودن درس
                                  </span>
                                </div>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: DEDICATED DAY PAGE (5 DAYS) */}
      {activeTab === 'daily' && (
        <div className="space-y-6">
          {/* Day Selector Pills */}
          <div className="flex items-center justify-between p-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-1.5 overflow-x-auto w-full">
              {SCHOOL_DAYS.map((dayName, idx) => {
                const isSelected = selectedDayIndex === idx;
                const data = dayData[idx];
                const rating = data?.overallRating;
                return (
                  <button
                    key={idx}
                    onClick={() => setSelectedDayIndex(idx)}
                    className={`flex-1 min-w-[100px] flex flex-col items-center py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                      isSelected
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100'
                    }`}
                  >
                    <span>{dayName}</span>
                    <span className="text-[10px] font-normal mt-0.5 opacity-80">
                      {rating === 'excellent' ? 'عالی' : rating === 'normal' ? 'معمولی' : rating === 'needs_makeup' ? 'نیازمند جبران' : 'ثبت نشده'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Day Header & Status */}
          <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-extrabold text-slate-900 dark:text-white">
                  برنامه اختصاصی {SCHOOL_DAYS[selectedDayIndex]}
                </span>
                <span className="text-xs px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-full font-mono">
                  {toPersianDigits(totalRemainingDayTasks)} کار باقی‌مانده
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                برنامه زنگ‌ها، چک‌لیست قبل و بعد مدرسه، تکالیف و ارزیابی کیفیت روز
              </p>
            </div>

            {/* Quality Rating */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-medium">کیفیت روز:</span>
              <button
                onClick={() => setDayRating(selectedDayIndex, 'excellent')}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                  currentDayData.overallRating === 'excellent'
                    ? 'bg-emerald-500 text-white border-emerald-500 shadow-xs'
                    : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                }`}
              >
                <Smile className="w-3.5 h-3.5" />
                <span>عالی</span>
              </button>
              <button
                onClick={() => setDayRating(selectedDayIndex, 'normal')}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                  currentDayData.overallRating === 'normal'
                    ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                    : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                }`}
              >
                <Meh className="w-3.5 h-3.5" />
                <span>معمولی</span>
              </button>
              <button
                onClick={() => setDayRating(selectedDayIndex, 'needs_makeup')}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                  currentDayData.overallRating === 'needs_makeup'
                    ? 'bg-rose-500 text-white border-rose-500 shadow-xs'
                    : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                }`}
              >
                <Frown className="w-3.5 h-3.5" />
                <span>نیازمند جبران</span>
              </button>
            </div>
          </div>

          {/* Bells for selected day */}
          <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-indigo-500" />
              <span>زنگ‌های درسی {SCHOOL_DAYS[selectedDayIndex]}</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
              {dayBells.map((bell) => (
                <div
                  key={bell.period}
                  className="p-3 rounded-lg border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                      <span>زنگ {toPersianDigits(bell.period)}</span>
                      <span className="font-mono text-[10px]">
                        {toPersianDigits(bell.bellTime.startTime)} - {toPersianDigits(bell.bellTime.endTime)}
                      </span>
                    </div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {bell.subject ? bell.subject.name : '— بدون درس —'}
                    </div>
                    <div className="text-[10px] text-slate-500 mt-1 truncate">
                      {bell.subject?.teacher || '—'}
                    </div>
                  </div>
                  <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between text-[10px] text-slate-400">
                    <span>کلاس {bell.room || '—'}</span>
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: bell.color }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Checklists & Homeworks */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Checklists */}
            <div className="space-y-6">
              <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    فهرست کارهای قبل از مدرسه
                  </span>
                  <span className="text-[11px] font-mono text-slate-400">
                    {toPersianDigits(currentDayData.preSchoolTasks.filter((t) => t.completed).length)} / {toPersianDigits(currentDayData.preSchoolTasks.length)}
                  </span>
                </div>

                <div className="space-y-2 mb-3">
                  {currentDayData.preSchoolTasks.map((task) => (
                    <div
                      key={task.id}
                      className="flex items-center justify-between p-2.5 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <input
                          type="checkbox"
                          checked={task.completed}
                          onChange={() => togglePreSchoolTask(selectedDayIndex, task.id)}
                          className="w-4 h-4 text-indigo-600 rounded cursor-pointer"
                        />
                        <span
                          className={`text-xs ${
                            task.completed ? 'line-through text-slate-400' : 'text-slate-800 dark:text-slate-200 font-medium'
                          }`}
                        >
                          {task.title}
                        </span>
                      </div>
                      <button
                        onClick={() => deletePreSchoolTask(selectedDayIndex, task.id)}
                        className="text-slate-400 hover:text-rose-500"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newPreTask}
                    onChange={(e) => setNewPreTask(e.target.value)}
                    placeholder="کار قبل از مدرسه..."
                    className="flex-1 px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && newPreTask.trim()) {
                        addPreSchoolTask(selectedDayIndex, newPreTask.trim());
                        setNewPreTask('');
                      }
                    }}
                  />
                  <button
                    onClick={() => {
                      if (newPreTask.trim()) {
                        addPreSchoolTask(selectedDayIndex, newPreTask.trim());
                        setNewPreTask('');
                      }
                    }}
                    className="px-3 py-1.5 bg-indigo-600 text-white text-xs font-semibold rounded-lg shrink-0"
                  >
                    + افزودن
                  </button>
                </div>
              </div>

              {/* Post School */}
              <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    فهرست کارهای بعد از مدرسه
                  </span>
                  <span className="text-[11px] font-mono text-slate-400">
                    {toPersianDigits(currentDayData.postSchoolTasks.filter((t) => t.completed).length)} / {toPersianDigits(currentDayData.postSchoolTasks.length)}
                  </span>
                </div>

                <div className="space-y-2 mb-3">
                  {currentDayData.postSchoolTasks.map((task) => (
                    <div
                      key={task.id}
                      className="flex items-center justify-between p-2.5 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <input
                          type="checkbox"
                          checked={task.completed}
                          onChange={() => togglePostSchoolTask(selectedDayIndex, task.id)}
                          className="w-4 h-4 text-indigo-600 rounded cursor-pointer"
                        />
                        <span
                          className={`text-xs ${
                            task.completed ? 'line-through text-slate-400' : 'text-slate-800 dark:text-slate-200 font-medium'
                          }`}
                        >
                          {task.title}
                        </span>
                      </div>
                      <button
                        onClick={() => deletePostSchoolTask(selectedDayIndex, task.id)}
                        className="text-slate-400 hover:text-rose-500"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newPostTask}
                    onChange={(e) => setNewPostTask(e.target.value)}
                    placeholder="کار بعد از مدرسه..."
                    className="flex-1 px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && newPostTask.trim()) {
                        addPostSchoolTask(selectedDayIndex, newPostTask.trim());
                        setNewPostTask('');
                      }
                    }}
                  />
                  <button
                    onClick={() => {
                      if (newPostTask.trim()) {
                        addPostSchoolTask(selectedDayIndex, newPostTask.trim());
                        setNewPostTask('');
                      }
                    }}
                    className="px-3 py-1.5 bg-indigo-600 text-white text-xs font-semibold rounded-lg shrink-0"
                  >
                    + افزودن
                  </button>
                </div>
              </div>
            </div>

            {/* Homeworks & Reflection */}
            <div className="space-y-6">
              <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    تکالیف ثبت‌شده برای این روز
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {toPersianDigits(dayHomeworks.length)} تکلیف
                  </span>
                </div>

                <div className="space-y-2 mb-4">
                  {dayHomeworks.length === 0 ? (
                    <div className="py-4 text-center text-xs text-slate-400">
                      هیچ تکلیفی برای این روز ثبت نشده است.
                    </div>
                  ) : (
                    dayHomeworks.map((hw) => (
                      <div
                        key={hw.id}
                        className="flex items-center justify-between p-2.5 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <input
                            type="checkbox"
                            checked={hw.completed}
                            onChange={() => toggleHomework(hw.id)}
                            className="w-4 h-4 text-indigo-600 rounded cursor-pointer"
                          />
                          <div>
                            <span
                              className={`text-xs font-semibold ${
                                hw.completed ? 'line-through text-slate-400' : 'text-slate-800 dark:text-slate-200'
                              }`}
                            >
                              {hw.title}
                            </span>
                            <div className="text-[10px] text-slate-400 mt-0.5">
                              {hw.subjectName} · موعد: {getRelativeTimeString(hw.dueDate)}
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => deleteHomework(hw.id)}
                          className="text-slate-400 hover:text-rose-500"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))
                  )}
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
                  <input
                    type="text"
                    value={newHwTitle}
                    onChange={(e) => setNewHwTitle(e.target.value)}
                    placeholder="عنوان تکلیف جدید برای این روز..."
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none"
                  />
                  <div className="flex gap-2">
                    <select
                      value={newHwSubjectId}
                      onChange={(e) => setNewHwSubjectId(e.target.value)}
                      className="flex-1 px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none"
                    >
                      {subjects.length === 0 ? (
                        <option value="">(درسی تعریف نشده)</option>
                      ) : (
                        subjects.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.name}
                          </option>
                        ))
                      )}
                    </select>
                    <input
                      type="date"
                      value={newHwDueDate}
                      onChange={(e) => setNewHwDueDate(e.target.value)}
                      className="px-2 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none"
                    />
                    <button
                      onClick={() => {
                        if (newHwTitle.trim()) {
                          const sub = subjects.find((s) => s.id === newHwSubjectId);
                          addHomework({
                            dayIndex: selectedDayIndex,
                            subjectId: newHwSubjectId,
                            subjectName: sub ? sub.name : 'عمومی',
                            title: newHwTitle.trim(),
                            completed: false,
                            dueDate: newHwDueDate,
                            priority: 'medium',
                          });
                          setNewHwTitle('');
                        }
                      }}
                      className="px-3 py-1.5 bg-indigo-600 text-white text-xs font-semibold rounded-lg shrink-0"
                    >
                      ثبت تکلیف
                    </button>
                  </div>
                </div>
              </div>

              {/* Reflection and Notes */}
              <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 space-y-3">
                <span className="text-xs font-bold text-slate-900 dark:text-white block">
                  گزارش کوتاه و یادداشت پایان روز {SCHOOL_DAYS[selectedDayIndex]}
                </span>
                <textarea
                  rows={2}
                  value={currentDayData.reflectionReport || ''}
                  onChange={(e) => updateDayData(selectedDayIndex, { reflectionReport: e.target.value })}
                  placeholder="بازخورد شما از این روز، نقاط قوت، تمرکز و موارد نیازمند جبران..."
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none"
                />
                <textarea
                  rows={2}
                  value={currentDayData.notes || ''}
                  onChange={(e) => updateDayData(selectedDayIndex, { notes: e.target.value })}
                  placeholder="نکات مهم و یادداشت‌های تدریس معلمان..."
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: SUBJECTS & EXAMS & GPA */}
      {activeTab === 'subjects' && (
        <div className="space-y-6">
          <div className="p-4 bg-gradient-to-l from-blue-900 via-slate-900 to-slate-900 text-white rounded-xl flex items-center justify-between border border-blue-950/40">
            <div>
              <span className="text-xs text-blue-300 font-medium block">
                معدل نمرات ثبت‌شده
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-extrabold font-mono">
                  {calculatedGPA ? toPersianDigits(calculatedGPA) : '—'}
                </span>
                <span className="text-xs text-slate-400">از ۲۰ (بر اساس {toPersianDigits(grades.length)} آزمون)</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowAddGrade(true)}
                className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-all"
              >
                + ثبت نمره امتحان
              </button>
              <button
                onClick={() => setShowAddSubject(true)}
                className="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-lg transition-all"
              >
                + تعریف درس جدید
              </button>
            </div>
          </div>

          {subjects.length === 0 ? (
            <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
              <GraduationCap className="w-10 h-10 text-indigo-500 mx-auto opacity-70" />
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                هنوز درسی تعریف نشده است
              </h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                برای شروع برنامه‌ریزی هفتگی، ثبت نمرات و تکالیف، دروس تحصیلی خود را تعریف کنید.
              </p>
              <button
                onClick={() => setShowAddSubject(true)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg transition-all"
              >
                + تعریف اولین درس
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {subjects.map((sub) => {
                const subGrades = grades.filter((g) => g.subjectId === sub.id);
                const subAvg =
                  subGrades.length > 0
                    ? (
                        subGrades.reduce((acc, g) => acc + g.score, 0) / subGrades.length
                      ).toFixed(2)
                    : null;

                return (
                  <div
                    key={sub.id}
                    className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3"
                    style={{ borderTopColor: sub.color, borderTopWidth: '4px' }}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                          {sub.name}
                        </h4>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {sub.teacher || 'بدون استاد'} · {sub.room || 'کلاس'}
                        </p>
                      </div>

                      <div className="text-left font-mono">
                        <span className="text-xs text-slate-400 block">میانگین</span>
                        <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
                          {subAvg ? toPersianDigits(subAvg) : '—'}
                        </span>
                      </div>
                    </div>

                    {sub.studyRange && (
                      <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50 text-[11px] text-slate-600 dark:text-slate-400">
                        <span className="font-semibold block text-slate-700 dark:text-slate-300">
                          محدوده مطالعه:
                        </span>
                        <span>{sub.studyRange}</span>
                      </div>
                    )}

                    {sub.reviewSchedule && (
                      <div className="text-[11px] text-slate-500 flex items-center justify-between">
                        <span>برنامه مرور:</span>
                        <span className="font-medium text-slate-700 dark:text-slate-300">
                          {sub.reviewSchedule}
                        </span>
                      </div>
                    )}

                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                      <button
                        onClick={() => deleteSubject(sub.id)}
                        className="text-slate-400 hover:text-rose-500 p-1 rounded"
                        title="حذف درس"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Grade Trend & Analytics Chart */}
          {grades.length > 0 && (
            <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-500" />
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                    نمودار روند نمرات آزمون‌ها و پرسش‌ها (از ۲۰)
                  </h4>
                </div>
                <span className="text-xs text-slate-400 font-mono tabular-nums">
                  معدل کل: {calculatedGPA ? toPersianDigits(calculatedGPA) : '—'}
                </span>
              </div>

              <div className="flex items-end justify-between gap-3 h-32 pt-4 px-2 overflow-x-auto">
                {grades.slice(-8).map((g) => {
                  const normalizedScore = (g.score / g.maxScore) * 20;
                  const heightPercent = Math.round((normalizedScore / 20) * 100);
                  const sub = subjects.find((s) => s.id === g.subjectId);
                  const isPassing = normalizedScore >= 12;
                  const isHigh = normalizedScore >= 17;

                  return (
                    <div key={g.id} className="flex-1 min-w-[50px] flex flex-col items-center gap-1.5 h-full justify-end group">
                      <span className="text-[10px] font-mono tabular-nums font-bold text-slate-700 dark:text-slate-300">
                        {toPersianDigits(g.score)}
                      </span>
                      <div className="w-full max-w-[36px] bg-slate-100 dark:bg-slate-800 rounded-t-lg overflow-hidden flex items-end h-20">
                        <div
                          className={`w-full rounded-t-lg transition-all ${
                            isHigh
                              ? 'bg-emerald-500 hover:bg-emerald-600'
                              : isPassing
                              ? 'bg-indigo-500 hover:bg-indigo-600'
                              : 'bg-rose-500 hover:bg-rose-600'
                          }`}
                          style={{ height: `${Math.max(10, heightPercent)}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-slate-500 truncate max-w-full font-medium" title={g.title}>
                        {sub?.name?.slice(0, 7) || g.title.slice(0, 7)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 dark:text-white">
                ریز نمرات آزمون‌ها و پرسش‌های کلاسی
              </span>
              <button
                onClick={() => setShowAddGrade(true)}
                className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                + نمره جدید
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 border-b border-slate-200 dark:border-slate-800">
                    <th className="p-3">عنوان آزمون</th>
                    <th className="p-3">درس</th>
                    <th className="p-3">نمره کسب‌شده</th>
                    <th className="p-3">تاریخ</th>
                    <th className="p-3 text-center">عملیات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {grades.map((g) => {
                    const sub = subjects.find((s) => s.id === g.subjectId);
                    return (
                      <tr key={g.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                        <td className="p-3 font-semibold text-slate-800 dark:text-slate-200">{g.title}</td>
                        <td className="p-3 text-slate-500">{sub?.name || '—'}</td>
                        <td className="p-3 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                          {toPersianDigits(g.score)} / {toPersianDigits(g.maxScore)}
                        </td>
                        <td className="p-3 text-slate-400 font-mono">{formatJalaliShort(g.date)}</td>
                        <td className="p-3 text-center">
                          <button
                            onClick={() => deleteGrade(g.id)}
                            className="text-slate-400 hover:text-rose-500"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: STUDY SESSIONS & POMODORO */}
      {activeTab === 'pomodoro' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 flex flex-col items-center text-center space-y-6">
            <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl w-full">
              {[
                { id: 'work', label: 'تمرکز', min: 25 },
                { id: 'short_break', label: 'استراحت کوتاه', min: 5 },
                { id: 'long_break', label: 'استراحت بلند', min: 15 },
              ].map((m) => (
                <button
                  key={m.id}
                  onClick={() => setPomodoroModeWithDuration(m.id as any, m.min)}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    pomodoroMode === m.id
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>

            <div className="relative w-48 h-48 flex items-center justify-center rounded-full border-4 border-indigo-100 dark:border-indigo-950/60 bg-indigo-50/30 dark:bg-indigo-950/20">
              <div className="text-4xl font-extrabold font-mono text-slate-900 dark:text-white">
                {toPersianDigits(
                  `${Math.floor(pomodoroRemaining / 60)
                    .toString()
                    .padStart(2, '0')}:${(pomodoroRemaining % 60).toString().padStart(2, '0')}`
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setPomodoroRunning(!pomodoroRunning)}
                className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs font-bold rounded-xl shadow-sm transition-all"
              >
                {pomodoroRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                <span>{pomodoroRunning ? 'توقف موقت' : 'شروع پومودورو'}</span>
              </button>

              <button
                onClick={() => {
                  setPomodoroRunning(false);
                  setPomodoroRemaining(pomodoroDuration);
                }}
                className="p-2.5 text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl"
                title="بازنشانی"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>

            <div className="w-full pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3 text-right">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                ثبت جلسه انجام‌شده در کارنامه
              </span>
              <input
                type="text"
                value={pomodoroSubjectName}
                onChange={(e) => setPomodoroSubjectName(e.target.value)}
                placeholder="نام درس..."
                className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none"
              />
              <input
                type="text"
                value={pomodoroTopic}
                onChange={(e) => setPomodoroTopic(e.target.value)}
                placeholder="مبحث مطالعه..."
                className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none"
              />
              <button
                onClick={handleLogPomodoroSession}
                className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg transition-all"
              >
                ثبت جلسه در تاریخچه مطالعه
              </button>
            </div>
          </div>

          <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                تاریخچه جلسات مطالعه و تمرین
              </h3>
              <span className="text-xs font-mono text-slate-400">
                {toPersianDigits(studySessions.length)} جلسه ثبت‌شده
              </span>
            </div>

            <div className="space-y-3">
              {studySessions.map((session) => (
                <div
                  key={session.id}
                  className="p-3.5 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex items-center justify-between"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-slate-900 dark:text-white">
                        {session.subjectName}
                      </span>
                      <span className="text-xs text-slate-500">· {session.topic}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">{session.outcomeNotes}</p>
                    <div className="flex items-center gap-3 text-[10px] text-slate-400 font-mono mt-1.5">
                      <span>تاریخ: {formatJalaliShort(session.date)}</span>
                      <span>ساعت: {toPersianDigits(session.startTime)}</span>
                      <span>امتیاز تمرکز: {toPersianDigits(session.focusScore)} از ۵</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold font-mono text-indigo-600 dark:text-indigo-400">
                      {toPersianDigits(session.actualDurationMin)} دقیقه
                    </span>
                    <button
                      onClick={() => deleteStudySession(session.id)}
                      className="text-slate-400 hover:text-rose-500"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODAL: EDIT WEEKLY CELL */}
      {editingCell && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-3 border-slate-100 dark:border-slate-800">
              <span className="text-sm font-bold text-slate-900 dark:text-white">
                ویرایش {SCHOOL_DAYS[editingCell.dayIndex]} · زنگ {toPersianDigits(editingCell.period)}
              </span>
              <button onClick={() => setEditingCell(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveCell} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  درس
                </label>
                <select
                  value={cellSubjectId}
                  onChange={(e) => {
                    setCellSubjectId(e.target.value);
                    const sub = subjects.find((s) => s.id === e.target.value);
                    if (sub) {
                      setCellRoom(sub.room || '');
                      setCellTeacher(sub.teacher || '');
                      setCellColor(sub.color || '#3b82f6');
                    }
                  }}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none"
                >
                  {subjects.length === 0 ? (
                    <option value="">(درسی تعریف نشده - ابتدا درس بسازید)</option>
                  ) : (
                    subjects.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    نام دبیر
                  </label>
                  <input
                    type="text"
                    value={cellTeacher}
                    onChange={(e) => setCellTeacher(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    کلاس / آزمایشگاه
                  </label>
                  <input
                    type="text"
                    value={cellRoom}
                    onChange={(e) => setCellRoom(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={handleClearCurrentCell}
                  className="text-xs text-rose-500 hover:underline"
                >
                  خالی کردن خانه
                </button>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingCell(null)}
                    className="px-3 py-1.5 text-xs text-slate-500 rounded-lg"
                  >
                    انصراف
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-indigo-600 text-white text-xs font-semibold rounded-lg"
                  >
                    ذخیره
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: BELL TIMES SETTINGS */}
      {showBellSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-3 border-slate-100 dark:border-slate-800">
              <span className="text-sm font-bold text-slate-900 dark:text-white">
                تنظیم ساعت شروع و پایان زنگ‌ها
              </span>
              <button onClick={() => setShowBellSettings(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              {bellTimesDraft.map((bell, idx) => (
                <div key={bell.period} className="flex items-center gap-3">
                  <span className="w-20 text-xs font-bold text-slate-800 dark:text-slate-200">
                    زنگ {toPersianDigits(bell.period)}
                  </span>
                  <div className="flex items-center gap-2 flex-1">
                    <input
                      type="time"
                      value={bell.startTime}
                      onChange={(e) => {
                        const updated = [...bellTimesDraft];
                        updated[idx].startTime = e.target.value;
                        setBellTimesDraft(updated);
                      }}
                      className="px-2 py-1 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                    />
                    <span className="text-xs text-slate-400">تا</span>
                    <input
                      type="time"
                      value={bell.endTime}
                      onChange={(e) => {
                        const updated = [...bellTimesDraft];
                        updated[idx].endTime = e.target.value;
                        setBellTimesDraft(updated);
                      }}
                      className="px-2 py-1 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setShowBellSettings(false)}
                className="px-3 py-1.5 text-xs text-slate-500 rounded-lg"
              >
                انصراف
              </button>
              <button
                onClick={() => {
                  updateProfile({ bellTimes: bellTimesDraft });
                  setShowBellSettings(false);
                }}
                className="px-4 py-1.5 bg-indigo-600 text-white text-xs font-semibold rounded-lg"
              >
                ذخیره ساعات
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD SUBJECT */}
      {showAddSubject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-3 border-slate-100 dark:border-slate-800">
              <span className="text-sm font-bold text-slate-900 dark:text-white">
                تعریف درس جدید
              </span>
              <button onClick={() => setShowAddSubject(false)} className="text-slate-400">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  نام درس
                </label>
                <input
                  type="text"
                  required
                  value={newSubName}
                  onChange={(e) => setNewSubName(e.target.value)}
                  placeholder="مثال: هندسه تحلیلی"
                  className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    نام معلم
                  </label>
                  <input
                    type="text"
                    value={newSubTeacher}
                    onChange={(e) => setNewSubTeacher(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    شماره کلاس
                  </label>
                  <input
                    type="text"
                    value={newSubRoom}
                    onChange={(e) => setNewSubRoom(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button onClick={() => setShowAddSubject(false)} className="px-3 py-1.5 text-xs text-slate-500">
                  انصراف
                </button>
                <button
                  onClick={() => {
                    if (newSubName.trim()) {
                      addSubject({
                        name: newSubName.trim(),
                        teacher: newSubTeacher,
                        room: newSubRoom,
                        color: newSubColor,
                        studyRange: newSubStudyRange,
                        reviewSchedule: newSubReviewSchedule,
                      });
                      setShowAddSubject(false);
                      setNewSubName('');
                    }
                  }}
                  className="px-4 py-1.5 bg-indigo-600 text-white text-xs font-semibold rounded-lg"
                >
                  ثبت درس
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD GRADE */}
      {showAddGrade && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-3 border-slate-100 dark:border-slate-800">
              <span className="text-sm font-bold text-slate-900 dark:text-white">
                ثبت نمره امتحان و آزمون
              </span>
              <button onClick={() => setShowAddGrade(false)} className="text-slate-400">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  درس
                </label>
                <select
                  value={gradeSubjectId}
                  onChange={(e) => setGradeSubjectId(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                >
                  {subjects.length === 0 ? (
                    <option value="">(درسی تعریف نشده - ابتدا درس بسازید)</option>
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
                  عنوان آزمون یا کوئیز
                </label>
                <input
                  type="text"
                  required
                  value={gradeTitle}
                  onChange={(e) => setGradeTitle(e.target.value)}
                  placeholder="مثال: میان‌ترم فصل دوم"
                  className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    نمره کسب‌شده
                  </label>
                  <input
                    type="number"
                    step="0.25"
                    min="0"
                    max="20"
                    value={gradeScore}
                    onChange={(e) => setGradeScore(Number(e.target.value))}
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    نمره کل آزمون
                  </label>
                  <input
                    type="number"
                    value={gradeMaxScore}
                    onChange={(e) => setGradeMaxScore(Number(e.target.value))}
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button onClick={() => setShowAddGrade(false)} className="px-3 py-1.5 text-xs text-slate-500">
                  انصراف
                </button>
                <button
                  onClick={() => {
                    if (gradeTitle.trim()) {
                      addGrade({
                        subjectId: gradeSubjectId,
                        title: gradeTitle.trim(),
                        score: gradeScore,
                        maxScore: gradeMaxScore,
                        date: gradeDate,
                      });
                      setShowAddGrade(false);
                      setGradeTitle('');
                    }
                  }}
                  className="px-4 py-1.5 bg-indigo-600 text-white text-xs font-semibold rounded-lg"
                >
                  ثبت نمره
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
