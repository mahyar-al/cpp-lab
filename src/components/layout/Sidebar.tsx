import React from 'react';
import {
  LayoutDashboard,
  GraduationCap,
  Sparkles,
  FolderGit2,
  Trophy,
  CalendarDays,
  Target,
  FileText,
  BarChart3,
  Settings,
  ChevronRight,
  ChevronLeft,
  Flame,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { toPersianDigits } from '../../utils/jalali';

export type NavTab =
  | 'dashboard'
  | 'school'
  | 'skills'
  | 'projects'
  | 'competitions'
  | 'calendar'
  | 'goals'
  | 'notes'
  | 'analytics'
  | 'settings';

export type NavItemKey = NavTab;

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  isOpenMobile,
  onCloseMobile,
  isCollapsed,
  onToggleCollapse,
}) => {
  const { homeworks, skills, goals, habits } = useApp();

  const pendingHomeworkCount = homeworks.filter((h) => !h.completed).length;

  const navItems = [
    { id: 'dashboard' as NavTab, label: 'داشبورد اصلی', icon: LayoutDashboard },
    {
      id: 'school' as NavTab,
      label: 'مدرسه و درس‌ها',
      icon: GraduationCap,
      badge: pendingHomeworkCount > 0 ? pendingHomeworkCount : undefined,
    },
    { id: 'skills' as NavTab, label: 'توسعه مهارت‌ها', icon: Sparkles },
    { id: 'projects' as NavTab, label: 'پروژه‌ها و کانبان', icon: FolderGit2 },
    { id: 'competitions' as NavTab, label: 'مسابقات و المپیاد', icon: Trophy },
    { id: 'calendar' as NavTab, label: 'تقویم جامع', icon: CalendarDays },
    { id: 'goals' as NavTab, label: 'اهداف و مرور هفتگی', icon: Target },
    { id: 'notes' as NavTab, label: 'یادداشت‌ها و وقایع', icon: FileText },
    { id: 'analytics' as NavTab, label: 'آمار و گزارش‌ها', icon: BarChart3 },
    { id: 'settings' as NavTab, label: 'تنظیمات و داده‌ها', icon: Settings },
  ];

  const allStreaks = [...(skills || []).map((s) => s.streak || 0), ...(habits || []).map((h) => h.streak || 0)];
  const maxStreak = Math.max(0, ...allStreaks);
  const weeklyGoals = goals.filter((g) => g.level === 'weekly');
  const completedWeekly = weeklyGoals.filter((g) => g.status === 'completed').length;
  const weeklyGoalPercent = weeklyGoals.length > 0 ? Math.round((completedWeekly / weeklyGoals.length) * 100) : 0;

  const handleNavClick = (tab: NavTab) => {
    onSelectTab(tab);
    onCloseMobile();
  };

  return (
    <>
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-40 lg:hidden"
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 right-0 z-50 flex flex-col bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 transition-all duration-300 ease-in-out ${
          isCollapsed ? 'w-20' : 'w-64'
        } ${
          isOpenMobile ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex items-center justify-between h-16 px-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white flex items-center justify-center font-black text-sm shrink-0 shadow-sm">
              P
            </div>
            {!isCollapsed && (
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-extrabold text-slate-900 dark:text-white tracking-tight truncate">
                  Pathly
                </span>
                <span className="text-[11px] text-slate-400 truncate">
                  مسیر پیشرفت من
                </span>
              </div>
            )}
          </div>

          <button
            onClick={onToggleCollapse}
            className="hidden lg:flex p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            {isCollapsed ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all group ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'
                } ${isCollapsed ? 'justify-center' : 'justify-between'}`}
                title={isCollapsed ? item.label : undefined}
              >
                <div className="flex items-center gap-3 truncate">
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  {!isCollapsed && <span className="truncate">{item.label}</span>}
                </div>

                {!isCollapsed && item.badge !== undefined && item.badge > 0 && (
                  <span
                    className={`px-1.5 py-0.5 text-[10px] rounded-full font-mono font-bold ${
                      isActive ? 'bg-white/20 text-white' : 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400'
                    }`}
                  >
                    {toPersianDigits(item.badge)}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {!isCollapsed && (
          <div className="p-3 mx-3 mb-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-800">
            <div className="flex items-center justify-between text-xs text-slate-700 dark:text-slate-300 font-semibold mb-2">
              <span className="flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-amber-500" />
                استمرار یادگیری
              </span>
              <span className="font-mono text-amber-600 dark:text-amber-400">
                {toPersianDigits(maxStreak)} روز
              </span>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-[11px] text-slate-500 dark:text-slate-400">
                <span>اهداف این هفته</span>
                <span className="font-mono">{toPersianDigits(weeklyGoalPercent)}٪</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${weeklyGoalPercent}%` }}
                />
              </div>
            </div>
          </div>
        )}
      </aside>
    </>
  );
};
