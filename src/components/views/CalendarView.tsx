import React, { useState } from 'react';
import {
  CalendarDays,
  ChevronRight,
  ChevronLeft,
  Plus,
  Trash2,
  Clock,
  Filter,
  CheckCircle2,
  X,
  BookOpen,
  Sparkles,
  FolderGit2,
  Trophy,
  Calendar as CalendarIcon,
  Repeat,
  ExternalLink,
  Edit2,
  ArrowRight,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import {
  toJalali,
  toGregorian,
  getJalaliMonthDays,
  getPersianMonthName,
  toPersianDigits,
  formatJalaliFull,
  formatJalaliShort,
  getIranianDayName,
  getIranianDayOfWeek,
} from '../../utils/jalali';
import { CalendarEvent, Priority, SectionType } from '../../types';

interface UnifiedCalendarItem {
  id: string;
  sourceId: string;
  sourceType: 'custom' | 'homework' | 'exam' | 'project' | 'competition';
  title: string;
  date: string; // YYYY-MM-DD
  startTime?: string;
  endTime?: string;
  section: SectionType;
  priority: Priority;
  description?: string;
  completed?: boolean;
  recurrence?: string;
}

export const CalendarView: React.FC = () => {
  const {
    calendarEvents,
    addCalendarEvent,
    updateCalendarEvent,
    deleteCalendarEvent,
    toggleCalendarEventCompleted,
    homeworks,
    updateHomework,
    exams,
    updateExam,
    projects,
    updateProject,
    competitions,
    updateCompetition,
    subjects,
    profile,
  } = useApp();

  const today = new Date();
  const todayIso = today.toISOString().slice(0, 10);
  const currentJalali = toJalali(today);

  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month');
  const [viewYear, setViewYear] = useState<number>(currentJalali.jy);
  const [viewMonth, setViewMonth] = useState<number>(currentJalali.jm);
  const [selectedDateIso, setSelectedDateIso] = useState<string>(todayIso);
  const [sectionFilter, setSectionFilter] = useState<SectionType | 'all'>('all');

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedItemDetails, setSelectedItemDetails] = useState<UnifiedCalendarItem | null>(null);

  // Form state
  const [eventTitle, setEventTitle] = useState('');
  const [eventDate, setEventDate] = useState(today.toISOString().slice(0, 10));
  const [eventTime, setEventTime] = useState('16:00');
  const [eventSection, setEventSection] = useState<SectionType>('school');
  const [eventPriority, setEventPriority] = useState<Priority>('medium');
  const [eventRecurrence, setEventRecurrence] = useState<'none' | 'daily' | 'weekly' | 'monthly'>('none');
  const [eventDesc, setEventDesc] = useState('');

  // Reschedule state
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [isRescheduling, setIsRescheduling] = useState(false);

  // Aggregate items across entire app
  const unifiedItems: UnifiedCalendarItem[] = [
    // 1. Custom calendar events
    ...calendarEvents.map((ev) => ({
      id: `ce-${ev.id}`,
      sourceId: ev.id,
      sourceType: 'custom' as const,
      title: ev.title,
      date: ev.date,
      startTime: ev.startTime,
      endTime: ev.endTime,
      section: ev.section,
      priority: ev.priority,
      description: ev.description,
      completed: ev.completed,
      recurrence: ev.recurrence,
    })),
    // 2. School homeworks
    ...homeworks.map((hw) => ({
      id: `hw-${hw.id}`,
      sourceId: hw.id,
      sourceType: 'homework' as const,
      title: `تکلیف: ${hw.title}`,
      date: hw.dueDate,
      startTime: '18:00',
      section: 'school' as SectionType,
      priority: hw.priority,
      description: `${hw.subjectName} · موعد تحویل تکلیف`,
      completed: hw.completed,
    })),
    // 3. School exams
    ...exams.map((ex) => ({
      id: `ex-${ex.id}`,
      sourceId: ex.id,
      sourceType: 'exam' as const,
      title: `${ex.type === 'exam' ? 'امتحان' : ex.type === 'quiz' ? 'کوییز' : 'تحویل'}: ${ex.title}`,
      date: ex.date,
      startTime: ex.time || '08:00',
      section: 'school' as SectionType,
      priority: ex.priority,
      description: `${ex.subjectName} · سرفصل: ${ex.chapters || 'مشخص نشده'}`,
      completed: ex.completed,
    })),
    // 4. Project deadlines & task due dates
    ...projects.map((proj) => ({
      id: `proj-${proj.id}`,
      sourceId: proj.id,
      sourceType: 'project' as const,
      title: `موعد پروژه: ${proj.title}`,
      date: proj.deadline,
      startTime: '20:00',
      section: 'project' as SectionType,
      priority: proj.priority,
      description: `پیشرفت: ${proj.progressPercentage}% · ${proj.targetsAndDeliverables}`,
      completed: proj.status === 'completed',
    })),
    // 5. Competition registration deadlines
    ...competitions.map((comp) => ({
      id: `comp-${comp.id}`,
      sourceId: comp.id,
      sourceType: 'competition' as const,
      title: `مهلت ثبت‌نام: ${comp.title}`,
      date: comp.registrationDeadline,
      startTime: '23:59',
      section: 'competition' as SectionType,
      priority: 'high' as Priority,
      description: `برگزارکننده: ${comp.organizer} · مرحله: ${comp.currentStage}`,
      completed: comp.readinessStatus === 'completed',
    })),
  ];

  const filteredItems = unifiedItems.filter((item) => {
    if (sectionFilter !== 'all' && item.section !== sectionFilter) return false;
    return true;
  });

  const nextMonth = () => {
    if (viewMonth === 12) {
      setViewYear((y) => y + 1);
      setViewMonth(1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const prevMonth = () => {
    if (viewMonth === 1) {
      setViewYear((y) => y - 1);
      setViewMonth(12);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const daysInMonth = getJalaliMonthDays(viewYear, viewMonth);
  const firstDayGreg = toGregorian(viewYear, viewMonth, 1);
  const firstDayObj = new Date(firstDayGreg.gy, firstDayGreg.gm - 1, firstDayGreg.gd);
  const firstDayIranian = (firstDayObj.getDay() + 1) % 7;

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventTitle.trim()) return;

    addCalendarEvent({
      title: eventTitle.trim(),
      date: eventDate,
      startTime: eventTime,
      section: eventSection,
      priority: eventPriority,
      recurrence: eventRecurrence,
      description: eventDesc.trim() || undefined,
      completed: false,
    });

    setEventTitle('');
    setEventDesc('');
    setShowAddModal(false);
  };

  const handleReschedule = () => {
    if (!selectedItemDetails || !rescheduleDate) return;
    if (selectedItemDetails.sourceType === 'custom') {
      updateCalendarEvent(selectedItemDetails.sourceId, { date: rescheduleDate });
    } else if (selectedItemDetails.sourceType === 'homework') {
      updateHomework(selectedItemDetails.sourceId, { dueDate: rescheduleDate });
    } else if (selectedItemDetails.sourceType === 'exam') {
      updateExam(selectedItemDetails.sourceId, { date: rescheduleDate });
    } else if (selectedItemDetails.sourceType === 'project') {
      updateProject(selectedItemDetails.sourceId, { deadline: rescheduleDate });
    } else if (selectedItemDetails.sourceType === 'competition') {
      updateCompetition(selectedItemDetails.sourceId, { registrationDeadline: rescheduleDate });
    }
    setSelectedItemDetails(null);
    setIsRescheduling(false);
  };

  const getSectionBadge = (section: SectionType) => {
    switch (section) {
      case 'school':
        return { label: 'مدرسه', icon: BookOpen, color: 'text-blue-600 dark:text-blue-400' };
      case 'skill':
        return { label: 'مهارت', icon: Sparkles, color: 'text-purple-600 dark:text-purple-400' };
      case 'project':
        return { label: 'پروژه', icon: FolderGit2, color: 'text-emerald-600 dark:text-emerald-400' };
      case 'competition':
        return { label: 'مسابقه', icon: Trophy, color: 'text-amber-600 dark:text-amber-400' };
      default:
        return { label: 'عمومی', icon: CalendarDays, color: 'text-slate-600 dark:text-slate-400' };
    }
  };

  // Selected date items
  const itemsForSelectedDate = filteredItems.filter((i) => i.date === selectedDateIso);

  // Weekly view calculation: 7 days starting from Saturday of current week
  const selectedDateObj = new Date(selectedDateIso);
  const dayOfWeek = (selectedDateObj.getDay() + 1) % 7; // 0 for Saturday
  const weekStart = new Date(selectedDateObj);
  weekStart.setDate(selectedDateObj.getDate() - dayOfWeek);

  const weekDays = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    const iso = d.toISOString().slice(0, 10);
    const jalali = toJalali(d);
    return {
      dateObj: d,
      iso,
      jalali,
      dayName: getIranianDayName(d),
      items: filteredItems.filter((item) => item.date === iso),
    };
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs relative">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
            <span className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              <CalendarDays className="w-5 h-5" />
            </span>
            تقویم و زمان‌بندی رویدادها
          </h1>
          <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-1">
            یکپارچه‌سازی تاریخ امتحانات، تکالیف مدرسه، مهلت پروژه‌ها و مسابقات با تقویم شمسی
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* View mode switcher */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-1 rounded-lg text-xs font-medium">
            <button
              onClick={() => setViewMode('month')}
              className={`px-3 py-1.5 rounded transition-colors whitespace-nowrap cursor-pointer ${
                viewMode === 'month'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-semibold shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              ماهانه
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={`px-3 py-1.5 rounded transition-colors whitespace-nowrap cursor-pointer ${
                viewMode === 'week'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-semibold shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              هفتگی
            </button>
            <button
              onClick={() => setViewMode('day')}
              className={`px-3 py-1.5 rounded transition-colors whitespace-nowrap cursor-pointer ${
                viewMode === 'day'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-semibold shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              روزانه
            </button>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 btn-primary text-xs rounded-lg transition-colors whitespace-nowrap cursor-pointer shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>رویداد جدید</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs & Navigation Strip */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs text-slate-400 pl-1 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5 text-slate-400" /> فیلتر:
          </span>
          {[
            { id: 'all', label: 'همه بخش‌ها' },
            { id: 'school', label: 'مدرسه و تکالیف' },
            { id: 'skill', label: 'مهارت‌ها' },
            { id: 'project', label: 'پروژه‌ها' },
            { id: 'competition', label: 'مسابقات' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setSectionFilter(item.id as typeof sectionFilter)}
              className={`px-3 py-1.5 text-xs rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                sectionFilter === item.id
                  ? 'btn-secondary font-semibold'
                  : 'btn-ghost'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Month Navigation for monthly view, or date jumper */}
        <div className="flex items-center justify-between md:justify-end gap-3">
          <button
            onClick={prevMonth}
            className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-cyan-500/40 text-slate-600 dark:text-slate-300 cursor-pointer"
            title="ماه قبل"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200 min-w-[120px] text-center font-mono tabular-nums">
            {getPersianMonthName(viewMonth)} {toPersianDigits(viewYear)}
          </span>
          <button
            onClick={nextMonth}
            className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-cyan-500/40 text-slate-600 dark:text-slate-300 cursor-pointer"
            title="ماه بعد"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* VIEW MODES */}
      {viewMode === 'month' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 items-start w-full">
          {/* Calendar Matrix (8 cols on desktop, 9 on 2xl) */}
          <div className="lg:col-span-8 xl:col-span-8 2xl:col-span-9 bg-white dark:bg-[#0D1222] p-3 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3 sm:space-y-4 shadow-xs">
            {/* Weekday headers */}
            <div className="grid grid-cols-7 gap-1 sm:gap-2 text-center text-xs font-bold text-slate-400 border-b border-slate-100 dark:border-slate-800 pb-2">
              <div><span className="hidden sm:inline">شنبه</span><span className="sm:hidden text-[11px]">ش</span></div>
              <div><span className="hidden sm:inline">یکشنبه</span><span className="sm:hidden text-[11px]">ی</span></div>
              <div><span className="hidden sm:inline">دوشنبه</span><span className="sm:hidden text-[11px]">د</span></div>
              <div><span className="hidden sm:inline">سه‌شنبه</span><span className="sm:hidden text-[11px]">س</span></div>
              <div><span className="hidden sm:inline">چهارشنبه</span><span className="sm:hidden text-[11px]">چ</span></div>
              <div><span className="hidden sm:inline">پنجشنبه</span><span className="sm:hidden text-[11px]">پ</span></div>
              <div className="text-rose-500"><span className="hidden sm:inline">جمعه</span><span className="sm:hidden text-[11px]">ج</span></div>
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 gap-1 sm:gap-2">
              {/* Empty leading cells */}
              {Array.from({ length: firstDayIranian }).map((_, i) => (
                <div key={`empty-${i}`} className="min-h-[70px] sm:min-h-[95px] lg:min-h-[110px] p-1 rounded-xl bg-slate-50/50 dark:bg-[#090D18]/50 opacity-20" />
              ))}

              {/* Days in Month */}
              {Array.from({ length: daysInMonth }).map((_, idx) => {
                const dayNum = idx + 1;
                const isToday =
                  currentJalali.jy === viewYear &&
                  currentJalali.jm === viewMonth &&
                  currentJalali.jd === dayNum;

                const dayGreg = toGregorian(viewYear, viewMonth, dayNum);
                const dayIso = `${dayGreg.gy}-${String(dayGreg.gm).padStart(2, '0')}-${String(dayGreg.gd).padStart(2, '0')}`;
                const isSelected = selectedDateIso === dayIso;

                const dayItems = filteredItems.filter((ev) => ev.date === dayIso);

                return (
                  <div
                    key={dayNum}
                    onClick={() => setSelectedDateIso(dayIso)}
                    className={`min-h-[70px] sm:min-h-[95px] lg:min-h-[110px] p-1.5 sm:p-2 rounded-xl border flex flex-col justify-between cursor-pointer transition-all ${
                      isSelected
                        ? 'border-slate-900 dark:border-slate-100 bg-slate-50 dark:bg-slate-800/80 shadow-xs'
                        : isToday
                        ? 'border-slate-400 dark:border-slate-600 bg-slate-50/50 dark:bg-slate-900/50'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-xs font-mono tabular-nums w-5 h-5 flex items-center justify-center rounded ${
                          isToday
                            ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-bold'
                            : 'text-slate-800 dark:text-slate-200'
                        }`}
                      >
                        {toPersianDigits(dayNum)}
                      </span>
                      {dayItems.length > 0 && (
                        <span className="text-[10px] font-mono tabular-nums text-slate-400">
                          {toPersianDigits(dayItems.length)}
                        </span>
                      )}
                    </div>

                    <div className="space-y-1 overflow-hidden">
                      {dayItems.slice(0, 2).map((item) => (
                        <div
                          key={item.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedItemDetails(item);
                          }}
                          className="text-[10px] px-1.5 py-0.5 rounded truncate font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-indigo-600"
                        >
                          {item.title}
                        </div>
                      ))}
                      {dayItems.length > 2 && (
                        <div className="text-[9px] text-slate-400 px-1 font-mono tabular-nums">
                          + {toPersianDigits(dayItems.length - 2)} رویداد دیگر
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Day Detail Sidebar (4 cols on desktop, 3 on 2xl) */}
          <div className="lg:col-span-4 xl:col-span-4 2xl:col-span-3 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
              <span className="text-xs text-slate-400">رویدادهای تاریخ انتخابی:</span>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                {formatJalaliFull(new Date(selectedDateIso))}
              </h3>
            </div>

            <div className="space-y-2.5 max-h-[500px] overflow-y-auto">
              {itemsForSelectedDate.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-400 space-y-3">
                  <p>هیچ رویداد، تکلیف یا امتحانی برای این روز ثبت نشده است.</p>
                  <button
                    onClick={() => {
                      setEventDate(selectedDateIso);
                      setShowAddModal(true);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 rounded-lg hover:bg-indigo-100"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>افزودن رویداد به این روز</span>
                  </button>
                </div>
              ) : (
                itemsForSelectedDate.map((item) => {
                  const b = getSectionBadge(item.section);
                  return (
                    <div
                      key={item.id}
                      onClick={() => setSelectedItemDetails(item)}
                      className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30 transition-all cursor-pointer"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                            {item.title}
                          </p>
                          <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-1">
                            <span className={b.color}>{b.label}</span>
                            <span aria-hidden="true">·</span>
                            <span className="font-mono tabular-nums">{toPersianDigits(item.startTime || '16:00')}</span>
                          </div>
                        </div>

                        {item.sourceType === 'custom' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteCalendarEvent(item.sourceId);
                            }}
                            className="p-1 text-slate-400 hover:text-rose-500 rounded"
                            title="حذف رویداد"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* WEEKLY VIEW */}
      {viewMode === 'week' && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
            {weekDays.map((col, idx) => {
              const isToday = col.iso === todayIso;
              return (
                <div
                  key={col.iso}
                  className={`p-3 rounded-xl border min-h-[360px] flex flex-col justify-between ${
                    isToday
                      ? 'border-indigo-400 dark:border-indigo-800 bg-indigo-50/20 dark:bg-indigo-950/10'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/30'
                  }`}
                >
                  <div>
                    <div className="border-b border-slate-200 dark:border-slate-800 pb-2 mb-3 text-center">
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        {col.dayName}
                      </span>
                      <div className="text-[11px] text-slate-400 font-mono tabular-nums mt-0.5">
                        {toPersianDigits(col.jalali.jd)} {getPersianMonthName(col.jalali.jm)}
                      </div>
                    </div>

                    <div className="space-y-2">
                      {col.items.length === 0 ? (
                        <div className="py-8 text-center text-[10px] text-slate-400">
                          بدون رویداد
                        </div>
                      ) : (
                        col.items.map((item) => (
                          <div
                            key={item.id}
                            onClick={() => setSelectedItemDetails(item)}
                            className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-right cursor-pointer hover:border-indigo-400 transition-colors"
                          >
                            <div className="text-[11px] font-semibold text-slate-800 dark:text-slate-100 truncate">
                              {item.title}
                            </div>
                            <div className="text-[9px] text-slate-400 font-mono tabular-nums mt-0.5">
                              {toPersianDigits(item.startTime || '')}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setEventDate(col.iso);
                      setShowAddModal(true);
                    }}
                    className="w-full mt-3 py-1.5 text-[10px] text-indigo-600 dark:text-indigo-400 border border-dashed border-indigo-200 dark:border-indigo-900 rounded hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-colors"
                  >
                    + افزودن
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* DAILY VIEW */}
      {viewMode === 'day' && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <span className="text-xs text-slate-400">نمای تفصیلی روزانه:</span>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {formatJalaliFull(new Date(selectedDateIso))}
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={selectedDateIso}
                onChange={(e) => setSelectedDateIso(e.target.value)}
                className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
              />
            </div>
          </div>

          {/* Time Slots 08:00 to 22:00 */}
          <div className="space-y-3">
            {['08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00'].map((timeSlot) => {
              const slotHour = parseInt(timeSlot.split(':')[0], 10);
              const matching = itemsForSelectedDate.filter((i) => {
                const itemHour = parseInt((i.startTime || '12:00').split(':')[0], 10);
                return itemHour >= slotHour && itemHour < slotHour + 2;
              });

              return (
                <div key={timeSlot} className="flex items-start gap-4 p-3 rounded-xl border border-slate-100 dark:border-slate-800/80">
                  <div className="w-16 font-mono tabular-nums text-xs font-bold text-slate-400 pt-1 shrink-0 text-left">
                    {toPersianDigits(timeSlot)}
                  </div>
                  <div className="flex-1 space-y-2">
                    {matching.length === 0 ? (
                      <span className="text-xs text-slate-400 italic">بدون برنامه زمان‌بندی‌شده</span>
                    ) : (
                      matching.map((item) => {
                        const b = getSectionBadge(item.section);
                        return (
                          <div
                            key={item.id}
                            onClick={() => setSelectedItemDetails(item)}
                            className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between cursor-pointer hover:border-slate-300"
                          >
                            <div>
                              <div className="text-xs font-bold text-slate-800 dark:text-slate-100">
                                {item.title}
                              </div>
                              <div className="text-[11px] text-slate-400 mt-0.5">
                                <span className={b.color}>{b.label}</span>
                                {item.description && <span> · {item.description}</span>}
                              </div>
                            </div>
                            <span className="text-xs text-slate-400 font-mono tabular-nums">
                              {toPersianDigits(item.startTime || '')}
                            </span>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Event Details Modal */}
      {selectedItemDetails && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
            <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="min-w-0">
                <span className={`text-[11px] font-semibold ${getSectionBadge(selectedItemDetails.section).color}`}>
                  {getSectionBadge(selectedItemDetails.section).label}
                </span>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mt-1">
                  {selectedItemDetails.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedItemDetails(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-slate-400" />
                <span>تاریخ: {formatJalaliFull(new Date(selectedItemDetails.date))}</span>
              </div>
              {selectedItemDetails.startTime && (
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-slate-400" />
                  <span className="font-mono tabular-nums">ساعت: {toPersianDigits(selectedItemDetails.startTime)}</span>
                </div>
              )}
              {selectedItemDetails.description && (
                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 mt-2">
                  <span className="text-slate-400 text-[11px] block mb-1">توضیحات:</span>
                  {selectedItemDetails.description}
                </div>
              )}
            </div>

            {/* Reschedule section */}
            {isRescheduling ? (
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  انتخاب تاریخ جدید برای جابه‌جایی:
                </label>
                <input
                  type="date"
                  value={rescheduleDate}
                  onChange={(e) => setRescheduleDate(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                />
                <div className="flex justify-end gap-2 pt-1">
                  <button
                    onClick={() => setIsRescheduling(false)}
                    className="px-2.5 py-1 text-xs text-slate-500"
                  >
                    انصراف
                  </button>
                  <button
                    onClick={handleReschedule}
                    className="px-3 py-1 bg-indigo-600 text-white text-xs rounded"
                  >
                    تایید انتقال
                  </button>
                </div>
              </div>
            ) : null}

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2 flex-wrap">
              {!isRescheduling && (
                <button
                  onClick={() => {
                    setRescheduleDate(selectedItemDetails.date);
                    setIsRescheduling(true);
                  }}
                  className="px-3 py-1.5 text-xs text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200 transition-colors"
                >
                  انتقال به تاریخ دیگر
                </button>
              )}

              {selectedItemDetails.sourceType === 'custom' && !isRescheduling && (
                <button
                  onClick={() => {
                    deleteCalendarEvent(selectedItemDetails.sourceId);
                    setSelectedItemDetails(null);
                  }}
                  className="px-3 py-1.5 text-xs text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-colors"
                >
                  حذف رویداد
                </button>
              )}

              {selectedItemDetails.sourceType !== 'custom' && !isRescheduling && (
                <span className="text-[11px] text-slate-400">
                  متصل به بخش {getSectionBadge(selectedItemDetails.section).label}
                </span>
              )}

              <button
                onClick={() => setSelectedItemDetails(null)}
                className="px-4 py-1.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-semibold rounded-lg mr-auto"
              >
                بستن
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Event Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                ثبت رویداد جدید در تقویم
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateEvent} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  عنوان رویداد *
                </label>
                <input
                  type="text"
                  required
                  placeholder="مثلاً: جلسه رفع اشکال حسابان یا تحویل فاز ۱"
                  value={eventTitle}
                  onChange={(e) => setEventTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    تاریخ رویداد *
                  </label>
                  <input
                    type="date"
                    required
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    ساعت شروع
                  </label>
                  <input
                    type="time"
                    value={eventTime}
                    onChange={(e) => setEventTime(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    بخش مرتبط
                  </label>
                  <select
                    value={eventSection}
                    onChange={(e) => setEventSection(e.target.value as SectionType)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="school">مدرسه</option>
                    <option value="skill">مهارت</option>
                    <option value="project">پروژه</option>
                    <option value="competition">مسابقات</option>
                    <option value="general">عمومی</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    اولویت
                  </label>
                  <select
                    value={eventPriority}
                    onChange={(e) => setEventPriority(e.target.value as Priority)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="high">بالا</option>
                    <option value="medium">متوسط</option>
                    <option value="low">عادی</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  تکرار رویداد
                </label>
                <select
                  value={eventRecurrence}
                  onChange={(e) => setEventRecurrence(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  <option value="none">بدون تکرار (یک‌باره)</option>
                  <option value="daily">روزانه</option>
                  <option value="weekly">هفتگی در همین روز</option>
                  <option value="monthly">ماهانه</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  توضیحات و یادداشت (اختیاری)
                </label>
                <textarea
                  rows={2}
                  value={eventDesc}
                  onChange={(e) => setEventDesc(e.target.value)}
                  placeholder="محل برگزاری، لینک یا جزییات تکمیلی"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white resize-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3.5 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-xs"
                >
                  ثبت رویداد
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
