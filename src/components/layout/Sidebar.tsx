import React from 'react';
import {
  LayoutDashboard,
  Clock,
  GraduationCap,
  Sparkles,
  FolderGit2,
  Trophy,
  Flame,
  RotateCcw,
  Zap,
  BookOpen,
  CalendarDays,
  Target,
  FileText,
  BarChart3,
  Settings,
  ChevronRight,
  ChevronLeft,
  X,
  Layers,
  Bot,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { toPersianDigits } from '../../utils/jalali';

export type NavTab =
  | 'dashboard'
  | 'daily_planner'
  | 'school'
  | 'skills'
  | 'projects'
  | 'competitions'
  | 'habits'
  | 'reviews'
  | 'focus_timer'
  | 'resources'
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

interface NavGroup {
  groupTitle: string;
  items: {
    id: NavTab;
    label: string;
    icon: React.ElementType;
    badge?: number;
  }[];
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  isOpenMobile,
  onCloseMobile,
  isCollapsed,
  onToggleCollapse,
}) => {
  const { homeworks, skills, goals, habits, reviews, dayData, getSectionTitle, customization, setIsAIAssistantOpen } = useApp();

  const pendingHomeworkCount = homeworks.filter((h) => !h.completed).length;

  const todayIso = new Date().toISOString().slice(0, 10);
  const dueReviewsCount = reviews.filter((r) => r.nextReviewDate <= todayIso).length;

  const currentIranianDayIdx = (() => {
    const d = new Date().getDay();
    return d === 6 ? 0 : d + 1; // 0: Sat ... 4: Wed
  })();
  const todayTasks = dayData[currentIranianDayIdx]?.postSchoolTasks || [];
  const pendingTasksCount = todayTasks.filter((t) => !t.completed).length;

  const rawNavGroups: NavGroup[] = [
    {
      groupTitle: 'پیشخوان',
      items: [
        {
          id: 'dashboard',
          label: getSectionTitle('dashboard'),
          icon: LayoutDashboard,
        },
        {
          id: 'daily_planner',
          label: getSectionTitle('daily_planner'),
          icon: Clock,
          badge: pendingTasksCount > 0 ? pendingTasksCount : undefined,
        },
      ],
    },
    {
      groupTitle: 'ستون‌های اصلی',
      items: [
        {
          id: 'school',
          label: getSectionTitle('school'),
          icon: GraduationCap,
          badge: pendingHomeworkCount > 0 ? pendingHomeworkCount : undefined,
        },
        {
          id: 'skills',
          label: getSectionTitle('skills'),
          icon: Sparkles,
        },
        {
          id: 'projects',
          label: getSectionTitle('projects'),
          icon: FolderGit2,
        },
        {
          id: 'competitions',
          label: getSectionTitle('competitions'),
          icon: Trophy,
        },
      ],
    },
    {
      groupTitle: 'تمرکز و استمرار',
      items: [
        {
          id: 'habits',
          label: getSectionTitle('habits'),
          icon: Flame,
        },
        {
          id: 'reviews',
          label: getSectionTitle('reviews'),
          icon: RotateCcw,
          badge: dueReviewsCount > 0 ? dueReviewsCount : undefined,
        },
        {
          id: 'focus_timer',
          label: getSectionTitle('focus_timer'),
          icon: Zap,
        },
        {
          id: 'resources',
          label: getSectionTitle('resources'),
          icon: BookOpen,
        },
      ],
    },
    {
      groupTitle: 'برنامه‌ریزی و ارزیابی',
      items: [
        {
          id: 'calendar',
          label: getSectionTitle('calendar'),
          icon: CalendarDays,
        },
        {
          id: 'goals',
          label: getSectionTitle('goals'),
          icon: Target,
        },
        {
          id: 'notes',
          label: getSectionTitle('notes'),
          icon: FileText,
        },
        {
          id: 'analytics',
          label: getSectionTitle('analytics'),
          icon: BarChart3,
        },
        {
          id: 'settings',
          label: getSectionTitle('settings'),
          icon: Settings,
        },
      ],
    },
  ];

  // Filter hidden sections & sort by user custom navOrder (Settings is never hidden)
  const userNavOrder = customization?.navOrder || [];
  const getNavOrderIndex = (tab: NavTab) => {
    const idx = userNavOrder.indexOf(tab);
    return idx === -1 ? 999 : idx;
  };

  const navGroups: NavGroup[] = rawNavGroups
    .map((grp) => ({
      ...grp,
      items: grp.items
        .filter(
          (it) => it.id === 'settings' || !(customization?.hiddenSections || []).includes(it.id)
        )
        .sort((a, b) => getNavOrderIndex(a.id) - getNavOrderIndex(b.id)),
    }))
    .filter((grp) => grp.items.length > 0);

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
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-40 lg:hidden"
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 right-0 z-50 flex flex-col bg-white dark:bg-[#0B0F1D] border-l border-slate-200 dark:border-slate-800/80 transition-all duration-300 ease-in-out shadow-lg ${
          isCollapsed ? 'w-20' : 'w-64'
        } ${
          isOpenMobile ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Top Header of Sidebar */}
        <div
          className={`flex items-center h-15 border-b border-slate-200 dark:border-slate-800 transition-all relative ${
            isCollapsed ? 'px-2 justify-center' : 'px-4 justify-between'
          }`}
        >
          {/* Logo & Brand */}
          <div
            onClick={isCollapsed ? onToggleCollapse : undefined}
            className={`flex items-center ${isCollapsed ? 'justify-center cursor-pointer' : 'gap-2.5'} overflow-hidden`}
            title={isCollapsed ? 'برای باز کردن منو کلیک کنید' : undefined}
          >
            <div className="w-8 h-8 rounded-lg bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 flex items-center justify-center font-bold text-sm shrink-0">
              P
            </div>

            {!isCollapsed && (
              <div className="flex flex-col min-w-0">
                <span className="font-bold text-sm tracking-tight text-slate-900 dark:text-white truncate">
                  Pathly
                </span>
                <span className="text-[10px] text-slate-400 truncate">
                  مسیر پیشرفت من
                </span>
              </div>
            )}
          </div>

          {/* Controls: Collapse Desktop / Close Mobile */}
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={onToggleCollapse}
              className={`hidden lg:flex items-center justify-center p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer ${
                isCollapsed ? 'w-8 h-8' : ''
              }`}
              aria-label={isCollapsed ? 'گسترش منو' : 'جمع‌کردن منو'}
              title={isCollapsed ? 'گسترش منو' : 'جمع‌کردن منو'}
            >
              {isCollapsed ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>

            <button
              onClick={onCloseMobile}
              className="lg:hidden p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              aria-label="بستن منو"
              title="بستن منو"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Item Groups */}
        <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-3.5">
          {navGroups.map((group, groupIdx) => (
            <div key={groupIdx} className="space-y-0.5">
              {!isCollapsed && (
                <div className="px-2.5 pb-1 text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  {group.groupTitle}
                </div>
              )}

              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentTab === item.id;

                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNavClick(item.id)}
                      className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors group cursor-pointer ${
                        isActive
                          ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200'
                      } ${isCollapsed ? 'justify-center px-0' : 'justify-between'}`}
                      title={isCollapsed ? item.label : undefined}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <Icon
                          className={`w-4 h-4 shrink-0 transition-colors ${
                            isActive ? 'text-slate-900 dark:text-white' : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-300'
                          }`}
                        />
                        {!isCollapsed && <span className="truncate">{item.label}</span>}
                      </div>

                      {!isCollapsed && item.badge !== undefined && item.badge > 0 && (
                        <span className="px-1.5 py-0.2 text-[10px] rounded font-mono tabular-nums text-slate-500 dark:text-slate-400 bg-slate-200/70 dark:bg-slate-800 font-medium">
                          {toPersianDigits(item.badge)}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer Streaks Widget */}
        {!isCollapsed && (
          <div className="p-3 mx-2.5 mb-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between text-xs text-slate-700 dark:text-slate-300 font-medium mb-1.5">
              <span className="flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-amber-500" />
                استمرار روزانه
              </span>
              <span className="font-mono tabular-nums text-slate-800 dark:text-slate-200 font-semibold">
                {toPersianDigits(maxStreak)} روز
              </span>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-[11px] text-slate-400">
                <span>پیشرفت هفتگی</span>
                <span className="font-mono tabular-nums">{toPersianDigits(weeklyGoalPercent)}٪</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-800 h-1 rounded-full overflow-hidden">
                <div
                  className="bg-slate-700 dark:bg-slate-300 h-full rounded-full transition-all duration-300"
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
