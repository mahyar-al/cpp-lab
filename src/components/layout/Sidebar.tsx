import React, { useState, useEffect } from 'react';
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
  ChevronDown,
  X,
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
  groupId: string;
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

  // 6 Structured Groups as specified in user brief:
  // ۱. نمای کلی: داشبورد، برنامه‌ریز روزانه
  // ۲. برنامه‌ریزی: مدرسه و درس‌ها، تقویم رویدادها، اهداف
  // ۳. رشد و فعالیت: مهارت‌ها، پروژه‌ها، مسابقات
  // ۴. تمرکز: عادت‌ها، تایمر تمرکز، مرور فاصله‌دار
  // ۵. اطلاعات: کتابخانه منابع، یادداشت‌ها، آمار و عملکرد
  // ۶. حساب: تنظیمات و پروفایل
  const rawNavGroups: NavGroup[] = [
    {
      groupId: 'overview',
      groupTitle: 'نمای کلی',
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
      groupId: 'planning',
      groupTitle: 'برنامه‌ریزی',
      items: [
        {
          id: 'school',
          label: getSectionTitle('school'),
          icon: GraduationCap,
          badge: pendingHomeworkCount > 0 ? pendingHomeworkCount : undefined,
        },
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
      ],
    },
    {
      groupId: 'growth',
      groupTitle: 'رشد و فعالیت',
      items: [
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
      groupId: 'focus',
      groupTitle: 'تمرکز',
      items: [
        {
          id: 'habits',
          label: getSectionTitle('habits'),
          icon: Flame,
        },
        {
          id: 'focus_timer',
          label: getSectionTitle('focus_timer'),
          icon: Zap,
        },
        {
          id: 'reviews',
          label: getSectionTitle('reviews'),
          icon: RotateCcw,
          badge: dueReviewsCount > 0 ? dueReviewsCount : undefined,
        },
      ],
    },
    {
      groupId: 'knowledge',
      groupTitle: 'اطلاعات',
      items: [
        {
          id: 'resources',
          label: getSectionTitle('resources'),
          icon: BookOpen,
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
      ],
    },
    {
      groupId: 'account',
      groupTitle: 'حساب',
      items: [
        {
          id: 'settings',
          label: getSectionTitle('settings'),
          icon: Settings,
        },
      ],
    },
  ];

  // Collapsible groups state - default all open
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});

  // Ensure group containing active tab is always open
  useEffect(() => {
    const activeGroup = rawNavGroups.find((g) => g.items.some((it) => it.id === currentTab));
    if (activeGroup && collapsedGroups[activeGroup.groupId]) {
      setCollapsedGroups((prev) => ({ ...prev, [activeGroup.groupId]: false }));
    }
  }, [currentTab]);

  const toggleGroupCollapse = (groupId: string) => {
    setCollapsedGroups((prev) => ({
      ...prev,
      [groupId]: !prev[groupId],
    }));
  };

  // Filter hidden sections (Settings is never hidden)
  const navGroups: NavGroup[] = rawNavGroups
    .map((grp) => ({
      ...grp,
      items: grp.items.filter(
        (it) => it.id === 'settings' || !(customization?.hiddenSections || []).includes(it.id)
      ),
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
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 lg:hidden transition-opacity"
        />
      )}

      {/* Main Sidebar Aside */}
      <aside
        className={`fixed top-0 bottom-0 right-0 z-50 flex flex-col bg-white dark:bg-[#0D0D0D] border-l border-[#E7E5DF] dark:border-[#252525] transition-all duration-300 ease-in-out shadow-lg ${
          isCollapsed ? 'w-20' : 'w-64'
        } ${isOpenMobile ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}`}
        dir="rtl"
      >
        {/* Top Header / Branding */}
        <div
          className={`flex items-center h-16 border-b border-[#E7E5DF] dark:border-[#252525] transition-all relative ${
            isCollapsed ? 'px-2 justify-center' : 'px-4 justify-between'
          }`}
        >
          {/* Logo & Brand Name */}
          <div
            onClick={isCollapsed ? onToggleCollapse : undefined}
            className={`flex items-center ${isCollapsed ? 'justify-center cursor-pointer' : 'gap-3'} overflow-hidden`}
            title={isCollapsed ? 'برای گسترش منو کلیک کنید' : undefined}
          >
            <div className="w-8 h-8 rounded-xl bg-[#D6A62E] text-black font-bold text-sm flex items-center justify-center shrink-0 shadow-xs">
              P
            </div>

            {!isCollapsed && (
              <div className="flex flex-col min-w-0">
                <span className="font-bold text-sm tracking-tight text-[#292A27] dark:text-[#E8E8E8] truncate">
                  Pathly
                </span>
                <span className="text-[10px] text-[#74756F] dark:text-[#A0A0A0] truncate">
                  مسیر پیشرفت من
                </span>
              </div>
            )}
          </div>

          {/* Controls: Collapse Desktop / Close Mobile */}
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={onToggleCollapse}
              className={`hidden lg:flex items-center justify-center p-1.5 text-[#74756F] hover:text-[#292A27] dark:text-[#A0A0A0] dark:hover:text-[#E8E8E8] rounded-lg hover:bg-[#F9F8F5] dark:hover:bg-[#151515] transition-colors cursor-pointer ${
                isCollapsed ? 'w-8 h-8' : ''
              }`}
              aria-label={isCollapsed ? 'گسترش منو' : 'جمع‌کردن منو'}
              title={isCollapsed ? 'گسترش منو' : 'جمع‌کردن منو'}
            >
              {isCollapsed ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>

            <button
              onClick={onCloseMobile}
              className="lg:hidden p-1.5 text-[#74756F] hover:text-[#292A27] dark:text-[#A0A0A0] dark:hover:text-[#E8E8E8] rounded-lg hover:bg-[#F9F8F5] dark:hover:bg-[#151515] cursor-pointer"
              aria-label="بستن منو"
              title="بستن منو"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Groups List */}
        <nav className="flex-1 overflow-y-auto px-2.5 py-3 space-y-3 scrollbar-thin">
          {navGroups.map((group) => {
            const isGroupCollapsed = collapsedGroups[group.groupId] && !isCollapsed;

            return (
              <div key={group.groupId} className="space-y-0.5">
                {/* Group Title Header (Collapsible) */}
                {!isCollapsed && (
                  <button
                    type="button"
                    onClick={() => toggleGroupCollapse(group.groupId)}
                    className="w-full flex items-center justify-between px-2 py-1 text-[11px] font-semibold text-[#74756F] dark:text-[#A0A0A0] hover:text-[#292A27] dark:hover:text-[#E8E8E8] transition-colors cursor-pointer group"
                  >
                    <span>{group.groupTitle}</span>
                    <ChevronDown
                      className={`w-3 h-3 text-[#A0A0A0] transition-transform duration-200 ${
                        isGroupCollapsed ? '-rotate-90' : 'rotate-0'
                      }`}
                    />
                  </button>
                )}

                {/* Group Items */}
                {(!isGroupCollapsed || isCollapsed) && (
                  <div className="space-y-0.5">
                    {group.items.map((item) => {
                      const Icon = item.icon;
                      const isActive = currentTab === item.id;

                      return (
                        <button
                          key={item.id}
                          onClick={() => handleNavClick(item.id)}
                          className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl text-xs font-medium transition-all group cursor-pointer relative ${
                            isActive
                              ? 'bg-[#D6A62E]/15 text-[#D6A62E] font-semibold'
                              : 'text-[#74756F] dark:text-[#A0A0A0] hover:bg-[#F9F8F5] dark:hover:bg-[#151515] hover:text-[#292A27] dark:hover:text-[#E8E8E8]'
                          } ${isCollapsed ? 'justify-center px-0' : 'justify-between'}`}
                          title={isCollapsed ? item.label : undefined}
                        >
                          {/* Active Matte Gold Indicator Bar */}
                          {isActive && (
                            <span className="absolute right-0 inset-y-1 w-1 bg-[#D6A62E] rounded-full" />
                          )}

                          <div className="flex items-center gap-2.5 truncate">
                            <Icon
                              className={`w-4 h-4 shrink-0 transition-colors ${
                                isActive
                                  ? 'text-[#D6A62E]'
                                  : 'text-[#A0A0A0] group-hover:text-[#292A27] dark:group-hover:text-[#E8E8E8]'
                              }`}
                            />
                            {!isCollapsed && <span className="truncate">{item.label}</span>}
                          </div>

                          {!isCollapsed && item.badge !== undefined && item.badge > 0 && (
                            <span
                              className={`px-1.5 py-0.2 text-[10px] rounded-md font-mono tabular-nums font-semibold ${
                                isActive
                                  ? 'bg-[#D6A62E] text-black'
                                  : 'text-[#74756F] dark:text-[#A0A0A0] bg-[#E7E5DF] dark:bg-[#252525]'
                              }`}
                            >
                              {toPersianDigits(item.badge)}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* AI Assistant Quick Trigger in Sidebar */}
        <div className="px-2.5 mb-2.5">
          <button
            onClick={() => setIsAIAssistantOpen(true)}
            className={`w-full flex items-center gap-2.5 p-2 rounded-xl text-xs font-semibold bg-[#D6A62E]/10 hover:bg-[#D6A62E]/20 text-[#D6A62E] border border-[#D6A62E]/30 transition-all cursor-pointer shadow-2xs ${
              isCollapsed ? 'justify-center px-0' : 'justify-between'
            }`}
            title="دستیار هوشمند Pathly"
          >
            <div className="flex items-center gap-2 truncate">
              <Sparkles className="w-4 h-4 shrink-0 text-[#D6A62E]" />
              {!isCollapsed && <span className="truncate">دستیار هوشمند Pathly</span>}
            </div>
            {!isCollapsed && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#D6A62E]/20 text-[#D6A62E] font-bold">
                زنده
              </span>
            )}
          </button>
        </div>

        {/* Footer Streak & Progress Widget */}
        {!isCollapsed && (
          <div className="p-3 mx-2.5 mb-3 bg-[#F9F8F5] dark:bg-[#151515] rounded-xl border border-[#E7E5DF] dark:border-[#252525]">
            <div className="flex items-center justify-between text-xs text-[#292A27] dark:text-[#E8E8E8] font-medium mb-1.5">
              <span className="flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-[#D6A62E]" />
                استمرار روزانه
              </span>
              <span className="font-mono tabular-nums text-[#292A27] dark:text-[#E8E8E8] font-bold">
                {toPersianDigits(maxStreak)} روز
              </span>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-[11px] text-[#74756F] dark:text-[#A0A0A0]">
                <span>پیشرفت هفتگی اهداف</span>
                <span className="font-mono tabular-nums">{toPersianDigits(weeklyGoalPercent)}٪</span>
              </div>
              <div className="w-full bg-[#E7E5DF] dark:bg-[#252525] h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-[#D6A62E] h-full rounded-full transition-all duration-300"
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
