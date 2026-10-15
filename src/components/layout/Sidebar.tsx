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
    colorClass?: string;
    activeBorderClass?: string;
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
      groupTitle: 'مرکز فرماندهی',
      items: [
        {
          id: 'dashboard',
          label: getSectionTitle('dashboard'),
          icon: LayoutDashboard,
          activeBorderClass: 'border-cyan-500/40 text-cyan-600 dark:text-[#00F5FF] bg-cyan-500/10 dark:bg-cyan-500/15 shadow-[0_0_15px_-3px_rgba(0,245,255,0.3)]',
          colorClass: 'text-cyan-500 dark:text-[#00F5FF]',
        },
        {
          id: 'daily_planner',
          label: getSectionTitle('daily_planner'),
          icon: Clock,
          badge: pendingTasksCount > 0 ? pendingTasksCount : undefined,
          activeBorderClass: 'border-cyan-400/40 text-cyan-600 dark:text-[#00F5FF] bg-cyan-500/10 dark:bg-cyan-500/15 shadow-[0_0_15px_-3px_rgba(0,245,255,0.3)]',
          colorClass: 'text-cyan-400 dark:text-[#00F5FF]',
        },
      ],
    },
    {
      groupTitle: 'چهار ستون اصلی',
      items: [
        {
          id: 'school',
          label: getSectionTitle('school'),
          icon: GraduationCap,
          badge: pendingHomeworkCount > 0 ? pendingHomeworkCount : undefined,
          activeBorderClass: 'border-blue-500/40 text-blue-600 dark:text-blue-400 bg-blue-500/10 dark:bg-blue-500/15 shadow-[0_0_15px_-3px_rgba(59,130,246,0.3)]',
          colorClass: 'text-blue-500 dark:text-blue-400',
        },
        {
          id: 'skills',
          label: getSectionTitle('skills'),
          icon: Sparkles,
          activeBorderClass: 'border-emerald-500/40 text-emerald-600 dark:text-[#39FF88] bg-emerald-500/10 dark:bg-emerald-500/15 shadow-[0_0_15px_-3px_rgba(57,255,136,0.3)]',
          colorClass: 'text-emerald-500 dark:text-[#39FF88]',
        },
        {
          id: 'projects',
          label: getSectionTitle('projects'),
          icon: FolderGit2,
          activeBorderClass: 'border-purple-500/40 text-purple-600 dark:text-[#C084FC] bg-purple-500/10 dark:bg-purple-500/15 shadow-[0_0_15px_-3px_rgba(168,85,247,0.3)]',
          colorClass: 'text-purple-500 dark:text-[#C084FC]',
        },
        {
          id: 'competitions',
          label: getSectionTitle('competitions'),
          icon: Trophy,
          activeBorderClass: 'border-pink-500/40 text-pink-600 dark:text-[#FF4FD8] bg-pink-500/10 dark:bg-pink-500/15 shadow-[0_0_15px_-3px_rgba(255,79,216,0.3)]',
          colorClass: 'text-pink-500 dark:text-[#FF4FD8]',
        },
      ],
    },
    {
      groupTitle: 'ابزارهای رشد و تمرکز',
      items: [
        {
          id: 'habits',
          label: getSectionTitle('habits'),
          icon: Flame,
          activeBorderClass: 'border-amber-500/40 text-amber-600 dark:text-amber-400 bg-amber-500/10 dark:bg-amber-500/15 shadow-[0_0_15px_-3px_rgba(245,158,11,0.3)]',
          colorClass: 'text-amber-500 dark:text-amber-400',
        },
        {
          id: 'reviews',
          label: getSectionTitle('reviews'),
          icon: RotateCcw,
          badge: dueReviewsCount > 0 ? dueReviewsCount : undefined,
          activeBorderClass: 'border-indigo-500/40 text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 dark:bg-indigo-500/15 shadow-[0_0_15px_-3px_rgba(99,102,241,0.3)]',
          colorClass: 'text-indigo-500 dark:text-indigo-400',
        },
        {
          id: 'focus_timer',
          label: getSectionTitle('focus_timer'),
          icon: Zap,
          activeBorderClass: 'border-cyan-500/40 text-cyan-600 dark:text-cyan-400 bg-cyan-500/10 dark:bg-cyan-500/15 shadow-[0_0_15px_-3px_rgba(0,245,255,0.3)]',
          colorClass: 'text-cyan-500 dark:text-cyan-400',
        },
        {
          id: 'resources',
          label: getSectionTitle('resources'),
          icon: BookOpen,
          activeBorderClass: 'border-teal-500/40 text-teal-600 dark:text-teal-400 bg-teal-500/10 dark:bg-teal-500/15 shadow-[0_0_15px_-3px_rgba(20,184,166,0.3)]',
          colorClass: 'text-teal-500 dark:text-teal-400',
        },
      ],
    },
    {
      groupTitle: 'سازمان‌دهی و بینش',
      items: [
        {
          id: 'calendar',
          label: getSectionTitle('calendar'),
          icon: CalendarDays,
          activeBorderClass: 'border-cyan-500/40 text-cyan-600 dark:text-cyan-400 bg-cyan-500/10 dark:bg-cyan-500/15 shadow-[0_0_15px_-3px_rgba(0,245,255,0.25)]',
          colorClass: 'text-cyan-500 dark:text-cyan-400',
        },
        {
          id: 'goals',
          label: getSectionTitle('goals'),
          icon: Target,
          activeBorderClass: 'border-emerald-500/40 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 dark:bg-emerald-500/15 shadow-[0_0_15px_-3px_rgba(16,185,129,0.25)]',
          colorClass: 'text-emerald-500 dark:text-emerald-400',
        },
        {
          id: 'notes',
          label: getSectionTitle('notes'),
          icon: FileText,
          activeBorderClass: 'border-purple-500/40 text-purple-600 dark:text-purple-400 bg-purple-500/10 dark:bg-purple-500/15 shadow-[0_0_15px_-3px_rgba(168,85,247,0.25)]',
          colorClass: 'text-purple-500 dark:text-purple-400',
        },
        {
          id: 'analytics',
          label: getSectionTitle('analytics'),
          icon: BarChart3,
          activeBorderClass: 'border-blue-500/40 text-blue-600 dark:text-blue-400 bg-blue-500/10 dark:bg-blue-500/15 shadow-[0_0_15px_-3px_rgba(59,130,246,0.25)]',
          colorClass: 'text-blue-500 dark:text-blue-400',
        },
        {
          id: 'settings',
          label: getSectionTitle('settings'),
          icon: Settings,
          activeBorderClass: 'border-slate-400 text-slate-800 dark:text-slate-200 bg-slate-200/50 dark:bg-[#172033]',
          colorClass: 'text-slate-500 dark:text-slate-400',
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
          className={`flex items-center h-16 border-b border-slate-200 dark:border-slate-800/80 transition-all relative ${
            isCollapsed ? 'px-2 justify-center' : 'px-4 justify-between'
          }`}
        >
          {/* Logo & Brand */}
          <div
            onClick={isCollapsed ? onToggleCollapse : undefined}
            className={`flex items-center ${isCollapsed ? 'justify-center cursor-pointer' : 'gap-3'} overflow-hidden`}
            title={isCollapsed ? 'برای باز کردن منو کلیک کنید' : undefined}
          >
            <div className="relative shrink-0">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#00F5FF] via-cyan-400 to-blue-600 text-slate-950 flex items-center justify-center font-black text-sm shadow-[0_0_14px_rgba(0,245,255,0.45)]">
                P
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-[#39FF88] rounded-full ring-2 ring-white dark:ring-[#0D1220] animate-pulse" />
            </div>

            {!isCollapsed && (
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-sm tracking-tight text-slate-900 dark:text-white truncate">
                    PATHLY
                  </span>
                  <span className="px-1.5 py-0.2 bg-cyan-500/10 dark:bg-cyan-500/20 text-[#00F5FF] dark:text-[#00F5FF] border border-cyan-500/30 rounded text-[9px] font-mono font-bold">
                    PRO
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-slate-400 dark:text-slate-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#39FF88]" />
                  <span>سامانه برنامه‌ریزی نئون</span>
                </div>
              </div>
            )}
          </div>

          {/* Controls: Collapse Desktop / Close Mobile */}
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={onToggleCollapse}
              className={`hidden lg:flex items-center justify-center p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-[#172033] transition-colors cursor-pointer ${
                isCollapsed ? 'w-8 h-8' : ''
              }`}
              aria-label={isCollapsed ? 'گسترش منو' : 'جمع‌کردن منو'}
              title={isCollapsed ? 'گسترش منو' : 'جمع‌کردن منو'}
            >
              {isCollapsed ? <ChevronLeft className="w-4 h-4 text-cyan-400" /> : <ChevronRight className="w-4 h-4" />}
            </button>

            <button
              onClick={onCloseMobile}
              className="lg:hidden p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-[#172033] cursor-pointer"
              aria-label="بستن منو"
              title="بستن منو"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Item Groups */}
        <nav className="flex-1 overflow-y-auto px-2.5 py-3 space-y-4 cyber-scrollbar">
          {/* AI Assistant Quick Launcher */}
          <div className="mb-2">
            <button
              onClick={() => {
                setIsAIAssistantOpen(true);
                if (isOpenMobile) onCloseMobile();
              }}
              className={`w-full flex items-center gap-2.5 p-2 rounded-xl bg-gradient-to-r from-cyan-500/15 via-blue-500/15 to-purple-500/15 hover:from-cyan-500/25 hover:to-purple-500/25 border border-cyan-500/40 text-cyan-600 dark:text-cyan-300 font-bold text-xs transition-all cursor-pointer shadow-sm shadow-cyan-500/10 group active:scale-95 ${
                isCollapsed ? 'justify-center px-0' : 'justify-between'
              }`}
              title="دستیار هوش مصنوعی هوشمند و زنده (ChatGPT-Like)"
            >
              <div className="flex items-center gap-2 truncate">
                <div className="w-7 h-7 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-500 dark:text-cyan-400 shrink-0">
                  <Bot className="w-4 h-4 animate-pulse" />
                </div>
                {!isCollapsed && <span className="truncate">دستیار هوش مصنوعی</span>}
              </div>
              {!isCollapsed && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 font-mono font-bold shrink-0">
                  زنده
                </span>
              )}
            </button>
          </div>

          {navGroups.map((group, groupIdx) => (
            <div key={groupIdx} className="space-y-1">
              {!isCollapsed && (
                <div className="px-2 pb-1 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  {group.groupTitle}
                </div>
              )}

              <div className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentTab === item.id;

                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNavClick(item.id)}
                      className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-medium transition-all duration-200 group cursor-pointer border ${
                        isActive
                          ? item.activeBorderClass || 'bg-cyan-500/10 dark:bg-cyan-500/15 text-cyan-600 dark:text-[#00F5FF] border-cyan-500/30'
                          : 'border-transparent text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#172033]/80 hover:text-slate-900 dark:hover:text-slate-100'
                      } ${isCollapsed ? 'justify-center px-0' : 'justify-between'}`}
                      title={isCollapsed ? item.label : undefined}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <Icon
                          className={`w-4 h-4 shrink-0 transition-colors ${
                            isActive ? item.colorClass : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-300'
                          }`}
                        />
                        {!isCollapsed && <span className="truncate">{item.label}</span>}
                      </div>

                      {!isCollapsed && item.badge !== undefined && item.badge > 0 && (
                        <span
                          className={`px-1.5 py-0.5 text-[10px] rounded-full font-mono font-bold ${
                            isActive
                              ? 'bg-cyan-500/20 text-cyan-400'
                              : 'bg-rose-500/15 text-rose-500 dark:text-rose-400 border border-rose-500/20'
                          }`}
                        >
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
          <div className="p-3 mx-2.5 mb-3 bg-slate-50 dark:bg-[#080B14]/70 rounded-xl border border-slate-200 dark:border-slate-800/80 shadow-xs">
            <div className="flex items-center justify-between text-xs text-slate-700 dark:text-slate-300 font-semibold mb-2">
              <span className="flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-amber-400" />
                استمرار یادگیری
              </span>
              <span className="font-mono text-amber-600 dark:text-amber-400 font-bold">
                {toPersianDigits(maxStreak)} روز
              </span>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-[11px] text-slate-500 dark:text-slate-400">
                <span>تحقق اهداف این هفته</span>
                <span className="font-mono text-cyan-600 dark:text-cyan-400 font-bold">{toPersianDigits(weeklyGoalPercent)}٪</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-cyan-500 to-blue-500 h-full rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(0,245,255,0.4)]"
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
