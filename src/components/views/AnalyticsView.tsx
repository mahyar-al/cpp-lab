import React, { useState } from 'react';
import {
  BarChart3,
  Clock,
  CheckCircle2,
  Target,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { toPersianDigits } from '../../utils/jalali';

export const AnalyticsView: React.FC = () => {
  const {
    grades,
    homeworks,
    studySessions,
    skills,
    projects,
    competitions,
    goals,
    dayData,
  } = useApp();

  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'all'>('week');

  // Genuine calculations from actual state:
  const totalHomeworkCount = homeworks.length;
  const completedHomeworkCount = homeworks.filter((h) => h.completed).length;
  const homeworkCompletionRate =
    totalHomeworkCount > 0 ? Math.round((completedHomeworkCount / totalHomeworkCount) * 100) : 0;

  const totalStudyMinutes = studySessions.reduce(
    (acc, s) => acc + (s.actualDurationMin || 0),
    0
  );
  const totalStudyHours = (totalStudyMinutes / 60).toFixed(1);

  const plannedMinutes = studySessions.reduce(
    (acc, s) => acc + (s.expectedDurationMin || 0),
    0
  );
  const plannedHours = (plannedMinutes / 60).toFixed(1);

  // Group study sessions by subject
  const studyBySubject: Record<string, number> = {};
  studySessions.forEach((s) => {
    studyBySubject[s.subjectName] = (studyBySubject[s.subjectName] || 0) + (s.actualDurationMin || 0);
  });

  const topStudiedSubjects = Object.entries(studyBySubject)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  // Goals completion
  const totalGoals = goals.length;
  const completedGoals = goals.filter((g) => g.status === 'completed').length;
  const inProgressGoals = goals.filter((g) => g.status === 'in_progress').length;

  // Grades Average
  const totalScore = grades.reduce((acc, g) => acc + (g.score / g.maxScore) * 20, 0);
  const averageGrade = grades.length > 0 ? (totalScore / grades.length).toFixed(2) : null;

  // Pre & Post school task count from dayData
  const allPreTasks = Object.values(dayData).flatMap((d) => d.preSchoolTasks);
  const allPostTasks = Object.values(dayData).flatMap((d) => d.postSchoolTasks);
  const totalDayTasks = allPreTasks.length + allPostTasks.length;
  const completedDayTasks =
    allPreTasks.filter((t) => t.completed).length + allPostTasks.filter((t) => t.completed).length;
  const dailyRoutinesRate =
    totalDayTasks > 0 ? Math.round((completedDayTasks / totalDayTasks) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-[#0D1222] p-6 rounded-2xl border border-slate-200 dark:border-cyan-500/25 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-32 bg-cyan-500/5 dark:bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            <span className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20 shadow-[0_0_12px_rgba(6,182,212,0.25)]">
              <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6" />
            </span>
            گزارش عملکرد و تحلیل هوشمند پیشرفت
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            محاسبه دقیق ساعات مطالعه، نرخ تحقق اهداف و بازدهی یادگیری بر اساس داده‌های ثبت‌شده
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-1.5 bg-slate-100 dark:bg-[#090D18] p-1 rounded-xl border border-slate-200 dark:border-slate-800">
          <button
            onClick={() => setTimeRange('week')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              timeRange === 'week'
                ? 'bg-white dark:bg-cyan-500/15 shadow-xs text-cyan-600 dark:text-[#00F5FF] border border-slate-200 dark:border-cyan-500/30'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            این هفته
          </button>
          <button
            onClick={() => setTimeRange('month')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              timeRange === 'month'
                ? 'bg-white dark:bg-cyan-500/15 shadow-xs text-cyan-600 dark:text-[#00F5FF] border border-slate-200 dark:border-cyan-500/30'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            این ماه
          </button>
          <button
            onClick={() => setTimeRange('all')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              timeRange === 'all'
                ? 'bg-white dark:bg-cyan-500/15 shadow-xs text-cyan-600 dark:text-[#00F5FF] border border-slate-200 dark:border-cyan-500/30'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            کل دوره
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Study Hours */}
        <div className="bg-white dark:bg-[#0D1222] p-5 rounded-2xl border border-slate-200 dark:border-cyan-500/20 hover:border-cyan-500/40 shadow-sm space-y-2 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">ساعت مطالعه کل</span>
            <span className="p-2 rounded-xl bg-cyan-500/10 text-cyan-500 dark:text-cyan-400 border border-cyan-500/20 shadow-[0_0_8px_rgba(6,182,212,0.2)]">
              <Clock className="w-4 h-4" />
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black font-mono text-slate-900 dark:text-white">
              {toPersianDigits(totalStudyHours)}
            </span>
            <span className="text-xs text-slate-400">ساعت محقق‌شده</span>
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 flex justify-between pt-1 border-t border-slate-100 dark:border-slate-800">
            <span>برنامه‌ریزی اولیه: {toPersianDigits(plannedHours)} ساعت</span>
            <span className="text-emerald-500 font-bold font-mono">
              {Number(totalStudyHours) >= Number(plannedHours) ? 'تحقق کامل' : 'در حال انجام'}
            </span>
          </div>
        </div>

        {/* Card 2: Homework Completion Rate */}
        <div className="bg-white dark:bg-[#0D1222] p-5 rounded-2xl border border-slate-200 dark:border-emerald-500/20 hover:border-emerald-500/40 shadow-sm space-y-2 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">نرخ انجام تکالیف</span>
            <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500 dark:text-[#39FF88] border border-emerald-500/20 shadow-[0_0_8px_rgba(16,185,129,0.2)]">
              <CheckCircle2 className="w-4 h-4" />
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black font-mono text-slate-900 dark:text-white">
              {toPersianDigits(homeworkCompletionRate)}٪
            </span>
            <span className="text-xs text-slate-400 font-mono">
              ({toPersianDigits(completedHomeworkCount)} از {toPersianDigits(totalHomeworkCount)})
            </span>
          </div>
          <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.3)]"
              style={{ width: `${homeworkCompletionRate}%` }}
            />
          </div>
        </div>

        {/* Card 3: Grade Average */}
        <div className="bg-white dark:bg-[#0D1222] p-5 rounded-2xl border border-slate-200 dark:border-purple-500/20 hover:border-purple-500/40 shadow-sm space-y-2 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">معدل نمرات ثبت‌شده</span>
            <span className="p-2 rounded-xl bg-purple-500/10 text-purple-500 dark:text-purple-400 border border-purple-500/20 shadow-[0_0_8px_rgba(168,85,247,0.2)]">
              <TrendingUp className="w-4 h-4" />
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black font-mono text-slate-900 dark:text-white">
              {averageGrade ? toPersianDigits(averageGrade) : '—'}
            </span>
            <span className="text-xs text-slate-400">از ۲۰</span>
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800 font-mono">
            <span>{toPersianDigits(grades.length)} ارزیابی و آزمون ثبت‌شده</span>
          </div>
        </div>

        {/* Card 4: Daily Routine Completion */}
        <div className="bg-white dark:bg-[#0D1222] p-5 rounded-2xl border border-slate-200 dark:border-amber-500/20 hover:border-amber-500/40 shadow-sm space-y-2 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">روتین‌های روزانه</span>
            <span className="p-2 rounded-xl bg-amber-500/10 text-amber-500 dark:text-amber-400 border border-amber-500/20 shadow-[0_0_8px_rgba(245,158,11,0.2)]">
              <Target className="w-4 h-4" />
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black font-mono text-slate-900 dark:text-white">
              {toPersianDigits(dailyRoutinesRate)}٪
            </span>
            <span className="text-xs text-slate-400 font-mono">
              ({toPersianDigits(completedDayTasks)} از {toPersianDigits(totalDayTasks)})
            </span>
          </div>
          <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-orange-400 rounded-full shadow-[0_0_8px_rgba(245,158,11,0.3)]"
              style={{ width: `${dailyRoutinesRate}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Charts & Breakdown Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Study Time per Subject */}
        <div className="bg-white dark:bg-[#0D1222] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-cyan-400" />
            توزیع زمان مطالعه بر اساس درس و موضوع
          </h2>

          <div className="space-y-3 pt-2">
            {topStudiedSubjects.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">هنوز جلسه مطالعه‌ای ثبت نشده است.</p>
            ) : (
              topStudiedSubjects.map(([subject, minutes]) => {
                const hours = (minutes / 60).toFixed(1);
                const maxMinutes = topStudiedSubjects[0][1] || 1;
                const percentage = Math.round((minutes / maxMinutes) * 100);

                return (
                  <div key={subject} className="space-y-1.5 text-xs">
                    <div className="flex justify-between items-center font-semibold">
                      <span className="text-slate-800 dark:text-slate-200">{subject}</span>
                      <span className="text-cyan-500 dark:text-cyan-400 font-mono font-bold">{toPersianDigits(hours)} ساعت ({toPersianDigits(minutes)} دقیقه)</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 dark:bg-[#090D18] rounded-full overflow-hidden border border-slate-100 dark:border-slate-800">
                      <div
                        className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-300 shadow-[0_0_8px_rgba(6,182,212,0.3)]"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right: Skills & Projects Progress */}
        <div className="bg-white dark:bg-[#0D1222] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-400" />
            وضعیت تسلط بر مهارت‌ها و پروژه‌ها
          </h2>

          <div className="space-y-3 pt-2">
            {skills.slice(0, 4).map((skill) => {
              const completedRoadmap = skill.roadmap.filter((r) => r.completed).length;
              const mastery =
                skill.roadmap.length > 0 ? Math.round((completedRoadmap / skill.roadmap.length) * 100) : 0;

              return (
                <div key={skill.id} className="space-y-1.5 text-xs">
                  <div className="flex justify-between items-center font-semibold">
                    <span className="text-slate-800 dark:text-slate-200">{skill.name}</span>
                    <span className="text-purple-500 dark:text-purple-400 font-mono font-bold">{toPersianDigits(mastery)}٪ تسلط</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 dark:bg-[#090D18] rounded-full overflow-hidden border border-slate-100 dark:border-slate-800">
                    <div
                      className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full shadow-[0_0_8px_rgba(168,85,247,0.3)]"
                      style={{ width: `${mastery}%` }}
                    />
                  </div>
                </div>
              );
            })}

            {projects.slice(0, 3).map((proj) => (
              <div key={proj.id} className="space-y-1.5 text-xs pt-1">
                <div className="flex justify-between items-center font-semibold">
                  <span className="text-slate-800 dark:text-slate-200">پروژه: {proj.title}</span>
                  <span className="text-blue-500 dark:text-blue-400 font-mono font-bold">{toPersianDigits(proj.progressPercentage)}٪</span>
                </div>
                <div className="w-full h-2 bg-slate-100 dark:bg-[#090D18] rounded-full overflow-hidden border border-slate-100 dark:border-slate-800">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.3)]"
                    style={{ width: `${proj.progressPercentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Goals Status Summary */}
      <div className="bg-white dark:bg-[#0D1222] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Target className="w-4 h-4 text-emerald-400" />
          ارزیابی جامع اهداف ({toPersianDigits(totalGoals)} هدف کل)
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-emerald-500/5 dark:bg-[#090D18] border border-emerald-500/20 text-center space-y-1">
            <span className="text-slate-500 dark:text-slate-400 font-semibold">تکمیل‌شده و محقق</span>
            <span className="text-2xl font-black font-mono text-emerald-500 dark:text-[#39FF88] block">
              {toPersianDigits(completedGoals)}
            </span>
          </div>
          <div className="p-4 rounded-xl bg-blue-500/5 dark:bg-[#090D18] border border-blue-500/20 text-center space-y-1">
            <span className="text-slate-500 dark:text-slate-400 font-semibold">در حال پیگیری</span>
            <span className="text-2xl font-black font-mono text-blue-500 dark:text-blue-400 block">
              {toPersianDigits(inProgressGoals)}
            </span>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 dark:bg-[#090D18] border border-amber-500/20 text-center space-y-1">
            <span className="text-slate-500 dark:text-slate-400 font-semibold">تعداد مسابقات فعال</span>
            <span className="text-2xl font-black font-mono text-amber-500 dark:text-amber-400 block">
              {toPersianDigits(competitions.length)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
