import React, { useState, useEffect, useRef } from 'react';
import {
  Timer,
  Play,
  Pause,
  RotateCcw,
  Coffee,
  CheckCircle2,
  Sparkles,
  BookOpen,
  Volume2,
  VolumeX,
  Plus,
  Flame,
  Check,
  Award,
  X,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { toPersianDigits } from '../../utils/jalali';
import { SectionType, StudySession } from '../../types';

export const FocusTimerView: React.FC = () => {
  const { profile, subjects, skills, projects, studySessions, addStudySession, showToast } = useApp();

  // Mode: focus | short_break | long_break
  const [mode, setMode] = useState<'focus' | 'short_break' | 'long_break'>('focus');
  const [durationMinutes, setDurationMinutes] = useState(25);
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [completedSessionsCount, setCompletedSessionsCount] = useState(0);

  // Link to section / subject
  const [selectedSection, setSelectedSection] = useState<SectionType>('school');
  const [selectedEntityId, setSelectedEntityId] = useState('');
  const [sessionTopic, setSessionTopic] = useState('');
  const [focusScore, setFocusScore] = useState<number>(5);
  const [outcomeNotes, setOutcomeNotes] = useState('');

  // Finished modal
  const [isFinishedModalOpen, setIsFinishedModalOpen] = useState(false);
  const [sessionElapsedMinutes, setSessionElapsedMinutes] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Sound chime synthesizer
  const playBeep = () => {
    if (!soundEnabled || typeof window === 'undefined') return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.3); // A5
      gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.6);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.6);
    } catch (e) {
      // Audio context might be restricted
    }
  };

  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            setIsRunning(false);
            playBeep();
            handleSessionComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, durationMinutes, mode]);

  const handleSessionComplete = () => {
    const elapsed = durationMinutes;
    setSessionElapsedMinutes(elapsed);
    if (mode === 'focus') {
      setCompletedSessionsCount((prev) => prev + 1);
      setIsFinishedModalOpen(true);
    } else {
      showToast('زمان استراحت پایان یافت! آماده شروع دور بعدی تمرکز باشید.');
    }
  };

  const handleModeChange = (newMode: 'focus' | 'short_break' | 'long_break', mins: number) => {
    setIsRunning(false);
    setMode(newMode);
    setDurationMinutes(mins);
    setSecondsLeft(mins * 60);
  };

  const toggleTimer = () => {
    setIsRunning((prev) => !prev);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setSecondsLeft(durationMinutes * 60);
  };

  const handleSaveSessionLog = (e: React.FormEvent) => {
    e.preventDefault();
    let subName = 'عمومی';
    if (selectedSection === 'school') {
      subName = subjects.find((s) => s.id === selectedEntityId)?.name || 'درس مدرسه';
    } else if (selectedSection === 'skill') {
      subName = skills.find((s) => s.id === selectedEntityId)?.name || 'مهارت فنی';
    } else if (selectedSection === 'project') {
      subName = projects.find((p) => p.id === selectedEntityId)?.title || 'پروژه';
    }

    const todayIso = new Date().toISOString().slice(0, 10);
    const timeStr = new Date().toTimeString().slice(0, 5);

    addStudySession({
      subjectName: subName,
      subjectId: selectedEntityId || undefined,
      topic: sessionTopic.trim() || 'جلسه کار عمیق و تمرکز',
      date: todayIso,
      startTime: timeStr,
      expectedDurationMin: durationMinutes,
      actualDurationMin: sessionElapsedMinutes,
      focusScore,
      outcomeNotes: outcomeNotes.trim() || 'جلسه با موفقیت تکمیل شد.',
      type: selectedSection,
    });

    setIsFinishedModalOpen(false);
    setOutcomeNotes('');
    setSessionTopic('');
    showToast(`جلسه تمرکز «${sessionElapsedMinutes} دقیقه‌ای» در گزارش عملکرد ثبت شد.`);
    // Automatically switch to break
    handleModeChange('short_break', 5);
  };

  const formatTimerDigits = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${toPersianDigits(m < 10 ? '0' + m : m)}:${toPersianDigits(s < 10 ? '0' + s : s)}`;
  };

  const totalSeconds = durationMinutes * 60;
  const progressPercent = totalSeconds > 0 ? ((totalSeconds - secondsLeft) / totalSeconds) * 100 : 0;

  // Today's total study minutes from studySessions
  const todayIso = new Date().toISOString().slice(0, 10);
  const todaySessions = studySessions.filter((s) => s.date === todayIso);
  const todayTotalMinutes = todaySessions.reduce((sum, s) => sum + (s.actualDurationMin || 0), 0);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white dark:bg-[#111827] p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-[#263247] shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-[0_0_12px_rgba(0,245,255,0.2)]">
                <Timer className="w-5 h-5 text-cyan-400" />
              </span>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                مرکز تمرکز و کار عمیق (Pomodoro Focus)
              </h1>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              ارتقای تمرکز حواس، ثبت جلسات مطالعه، زمان‌بندی فواصل استراحت و سنجش کیفیت یادگیری
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSoundEnabled((prev) => !prev)}
              className="p-2 rounded-xl border border-slate-200 dark:border-[#263247] text-slate-500 dark:text-slate-400 hover:text-cyan-400 cursor-pointer"
              title={soundEnabled ? 'صدا فعال است' : 'صدا غیرفعال است'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-cyan-400" /> : <VolumeX className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Mode Selector Tabs */}
        <div className="flex items-center justify-center gap-2 mt-6 p-1.5 bg-slate-100 dark:bg-[#0D1220] rounded-xl border border-slate-200 dark:border-[#263247] max-w-md mx-auto">
          <button
            onClick={() => handleModeChange('focus', 25)}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              mode === 'focus'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 shadow-[0_0_12px_rgba(0,245,255,0.3)]'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            کار عمیق (۲۵ دقیقه)
          </button>
          <button
            onClick={() => handleModeChange('short_break', 5)}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              mode === 'short_break'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 shadow-[0_0_12px_rgba(57,255,136,0.3)]'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            استراحت کوتاه (۵ دقیقه)
          </button>
          <button
            onClick={() => handleModeChange('long_break', 15)}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              mode === 'long_break'
                ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-[0_0_12px_rgba(168,85,247,0.3)]'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            استراحت بلند (۱۵ دقیقه)
          </button>
        </div>
      </div>

      {/* Main Timer Display */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Timer Card (2 cols) */}
        <div className="lg:col-span-2 bg-white dark:bg-[#111827] p-8 rounded-2xl border border-slate-200 dark:border-[#263247] shadow-sm flex flex-col items-center justify-center text-center relative overflow-hidden">
          {/* Ambient Glow */}
          <div
            className={`absolute w-72 h-72 rounded-full blur-[100px] pointer-events-none opacity-20 ${
              mode === 'focus' ? 'bg-cyan-500' : mode === 'short_break' ? 'bg-emerald-500' : 'bg-purple-500'
            }`}
          />

          {/* Linked Subject / Task Indicator */}
          <div className="mb-6 flex items-center gap-2 text-xs">
            <span className="text-slate-400">موضوع تمرکز فعلی:</span>
            <span className="font-bold text-cyan-600 dark:text-cyan-400 px-2.5 py-1 bg-cyan-500/10 border border-cyan-500/20 rounded-lg">
              {sessionTopic || 'عمومی / بدون دسته‌بندی خاص'}
            </span>
          </div>

          {/* Timer Clock Circle */}
          <div className="relative w-64 h-64 sm:w-72 sm:h-72 flex items-center justify-center my-2">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="45"
                className="stroke-slate-200 dark:stroke-[#172033]"
                strokeWidth="5"
                fill="none"
              />
              <circle
                cx="50"
                cy="50"
                r="45"
                className={`transition-all duration-1000 ${
                  mode === 'focus'
                    ? 'stroke-cyan-400'
                    : mode === 'short_break'
                    ? 'stroke-[#39FF88]'
                    : 'stroke-purple-400'
                }`}
                strokeWidth="5"
                strokeDasharray={283}
                strokeDashoffset={283 - (283 * progressPercent) / 100}
                strokeLinecap="round"
                fill="none"
              />
            </svg>

            {/* Digits inside circle */}
            <div className="absolute flex flex-col items-center">
              <span className="text-5xl sm:text-6xl font-black font-mono tracking-tight text-slate-900 dark:text-white dark:neon-text-cyan tabular-nums">
                {formatTimerDigits(secondsLeft)}
              </span>
              <span className="text-xs text-slate-400 mt-2 font-semibold">
                {mode === 'focus' ? 'زمان کار و تمرکز' : 'زمان استراحت و تنفس'}
              </span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-4 mt-8 z-10">
            <button
              onClick={toggleTimer}
              className={`px-8 py-3.5 rounded-2xl font-bold text-sm flex items-center gap-2 transition-all cursor-pointer shadow-lg active:scale-95 ${
                isRunning
                  ? 'bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-amber-500/25'
                  : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 shadow-[0_0_18px_rgba(0,245,255,0.4)]'
              }`}
            >
              {isRunning ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
              <span>{isRunning ? 'توقف موقت' : 'شروع تمرکز'}</span>
            </button>

            <button
              onClick={resetTimer}
              className="p-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-[#172033] dark:hover:bg-[#1f2b45] text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-[#263247] transition-all cursor-pointer"
              title="شروع مجدد تایمر"
            >
              <RotateCcw className="w-5 h-5" />
            </button>

            {mode === 'focus' && (
              <button
                onClick={() => {
                  setIsRunning(false);
                  handleSessionComplete();
                }}
                className="px-4 py-3.5 rounded-2xl border border-emerald-500/30 text-emerald-600 dark:text-[#39FF88] hover:bg-emerald-500/10 text-xs font-bold transition-all cursor-pointer"
                title="ثبت زودهنگام جلسه"
              >
                ثبت پایان جلسه
              </button>
            )}
          </div>
        </div>

        {/* Right Column: Pre-Session Config & Daily Focus Stats */}
        <div className="space-y-4">
          {/* Pre-session Setup Box */}
          <div className="bg-white dark:bg-[#111827] p-5 rounded-2xl border border-slate-200 dark:border-[#263247] shadow-sm space-y-3.5 text-right">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-[#263247]">
              <BookOpen className="w-4 h-4 text-cyan-400" />
              تنظیم هدف جلسه تمرکز
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                بخش فعالیت:
              </label>
              <select
                value={selectedSection}
                onChange={(e) => {
                  setSelectedSection(e.target.value as SectionType);
                  setSelectedEntityId('');
                }}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-[#0D1220] border border-slate-200 dark:border-[#263247] rounded-xl text-xs"
              >
                <option value="school">درس مدرسه</option>
                <option value="skill">مهارت فنی</option>
                <option value="project">پروژه</option>
                <option value="general">عمومی</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                انتخاب درس / مهارت:
              </label>
              <select
                value={selectedEntityId}
                onChange={(e) => setSelectedEntityId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-[#0D1220] border border-slate-200 dark:border-[#263247] rounded-xl text-xs"
              >
                <option value="">انتخاب کنید...</option>
                {selectedSection === 'school' &&
                  subjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                {selectedSection === 'skill' &&
                  skills.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                {selectedSection === 'project' &&
                  projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title}
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                موضوع دقیق مطالعه:
              </label>
              <input
                type="text"
                value={sessionTopic}
                onChange={(e) => setSessionTopic(e.target.value)}
                placeholder="مثلاً: حل تمارین هندسه فضایی"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-[#0D1220] border border-slate-200 dark:border-[#263247] rounded-xl text-xs"
              />
            </div>
          </div>

          {/* Today's Focus Summary Box */}
          <div className="bg-white dark:bg-[#111827] p-5 rounded-2xl border border-slate-200 dark:border-[#263247] shadow-sm space-y-3 text-right text-xs">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-[#263247]">
              <Award className="w-4 h-4 text-amber-400" />
              عملکرد تمرکز امروز
            </h3>

            <div className="flex items-center justify-between">
              <span className="text-slate-400">مجموع مطالعه امروز:</span>
              <span className="font-bold font-mono text-cyan-400 text-sm">
                {toPersianDigits(todayTotalMinutes)} دقیقه
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-400">تعداد جلسات پومودورو:</span>
              <span className="font-bold font-mono text-slate-200">
                {toPersianDigits(completedSessionsCount)} جلسه
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-400">هدف روزانه مطالعه:</span>
              <span className="font-mono text-slate-400">
                {toPersianDigits(todayTotalMinutes)} / {toPersianDigits((profile.studyTargetDailyHours || 4) * 60)} دقیقه
              </span>
            </div>

            <div className="w-full bg-slate-100 dark:bg-[#0D1220] h-2 rounded-full overflow-hidden mt-1">
              <div
                className="bg-gradient-to-r from-cyan-500 to-blue-500 h-full rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(0,245,255,0.4)]"
                style={{
                  width: `${Math.min(
                    100,
                    Math.round((todayTotalMinutes / ((profile.studyTargetDailyHours || 4) * 60)) * 100)
                  )}%`,
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Finished Session Logging Modal */}
      {isFinishedModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#111827] w-full max-w-md rounded-2xl border border-cyan-400/40 p-6 shadow-2xl text-right animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-[#263247] mb-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-[#39FF88]" />
                <span className="text-sm font-bold text-slate-900 dark:text-white">
                  جلسه تمرکز با موفقیت به پایان رسید!
                </span>
              </div>
              <button
                onClick={() => setIsFinishedModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-200 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveSessionLog} className="space-y-4 text-xs">
              <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 font-semibold">
                مدت زمان ثبت‌شده: {toPersianDigits(sessionElapsedMinutes)} دقیقه
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  میزان تمرکز حواس و کیفیت مطالعه (۱ تا ۵):
                </label>
                <div className="flex items-center justify-between gap-2 p-2 bg-slate-50 dark:bg-[#0D1220] rounded-xl border border-slate-200 dark:border-[#263247]">
                  {[1, 2, 3, 4, 5].map((score) => (
                    <button
                      key={score}
                      type="button"
                      onClick={() => setFocusScore(score)}
                      className={`flex-1 py-1.5 rounded-lg font-bold font-mono text-xs cursor-pointer ${
                        focusScore === score
                          ? 'bg-cyan-500 text-slate-950 shadow-sm'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {toPersianDigits(score)}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  یادداشت و نتیجه جلسه:
                </label>
                <textarea
                  rows={2}
                  value={outcomeNotes}
                  onChange={(e) => setOutcomeNotes(e.target.value)}
                  placeholder="چه مباحثی پوشش داده شد؟ آیا نکته‌ای برای دور بعدی هست؟"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-[#0D1220] border border-slate-200 dark:border-[#263247] rounded-xl text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-[#263247]">
                <button
                  type="button"
                  onClick={() => setIsFinishedModalOpen(false)}
                  className="px-4 py-2 text-slate-400 text-xs font-bold"
                >
                  صرف‌نظر
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold rounded-xl text-xs shadow-[0_0_12px_rgba(0,245,255,0.25)]"
                >
                  ثبت دائمی در تاریخچه مطالعه
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
