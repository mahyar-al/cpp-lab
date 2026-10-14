import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  Plus,
  Bell,
  Sun,
  Moon,
  Menu,
  CheckCircle2,
  X,
  User,
  Settings,
  Check,
  ChevronDown,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatJalaliFull, toPersianDigits } from '../../utils/jalali';
import { SectionType } from '../../types';
import { NavTab } from './Sidebar';
import { AVATAR_OPTIONS, getAvatarOption } from '../../utils/avatars';

interface HeaderProps {
  onToggleSidebar: () => void;
  onOpenQuickAdd: () => void;
  onOpenSearch: () => void;
  activeSectionTitle: string;
  onSelectTab?: (tab: NavTab) => void;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleSidebar,
  onOpenQuickAdd,
  onOpenSearch,
  activeSectionTitle,
  onSelectTab,
}) => {
  const {
    profile,
    updateProfile,
    notifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    clearNotification,
  } = useApp();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const currentAvatar = getAvatarOption(profile.avatarSeed);
  const AvatarIcon = currentAvatar.icon;

  // Close menus on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target as Node)) {
        setShowProfileMenu(false);
      }
    };
    if (showProfileMenu) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [showProfileMenu]);

  const toggleTheme = () => {
    updateProfile({ theme: profile.theme === 'dark' ? 'light' : 'dark' });
  };

  const getSectionBadgeColor = (sec: SectionType) => {
    switch (sec) {
      case 'school':
        return 'text-blue-600 dark:text-blue-400';
      case 'skill':
        return 'text-emerald-600 dark:text-emerald-400';
      case 'project':
        return 'text-purple-600 dark:text-purple-400';
      case 'competition':
        return 'text-amber-600 dark:text-amber-400';
      default:
        return 'text-slate-600 dark:text-slate-400';
    }
  };

  const getSectionName = (sec: SectionType) => {
    switch (sec) {
      case 'school':
        return 'مدرسه';
      case 'skill':
        return 'مهارت';
      case 'project':
        return 'پروژه';
      case 'competition':
        return 'مسابقات';
      default:
        return 'عمومی';
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 dark:bg-[#0D1220]/95 backdrop-blur-md border-b border-slate-200 dark:border-[#263247] transition-colors">
      <div className="flex items-center justify-between px-4 lg:px-6 h-16 gap-4">
        {/* Right Zone in RTL: Mobile menu trigger & Breadcrumb / Date */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onToggleSidebar}
            className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 lg:hidden rounded-lg hover:bg-slate-100 dark:hover:bg-[#172033]"
            aria-label="منوی ناوبری"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex flex-col min-w-0">
            <h1 className="text-base font-bold text-slate-900 dark:text-white truncate">
              {activeSectionTitle}
            </h1>
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <span className="truncate">{formatJalaliFull()}</span>
            </div>
          </div>
        </div>

        {/* Center / Search CTA bar */}
        <div className="hidden sm:flex items-center flex-1 max-w-md mx-4">
          <button
            onClick={onOpenSearch}
            className="w-full flex items-center justify-between px-3.5 py-1.5 text-xs text-slate-400 bg-slate-100 dark:bg-[#111827] rounded-lg border border-slate-200 dark:border-[#263247] hover:border-slate-300 dark:hover:border-cyan-500/50 transition-all text-right group cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-slate-400 group-hover:text-cyan-400 transition-colors" />
              <span className="group-hover:text-slate-300 transition-colors">جستجو در دروس، وظایف، اهداف، یادداشت‌ها...</span>
            </div>
            <kbd className="px-1.5 py-0.5 font-mono text-[10px] bg-white dark:bg-[#172033] text-slate-500 dark:text-slate-300 rounded border border-slate-200 dark:border-[#263247]">
              Ctrl+K
            </kbd>
          </button>
        </div>

        {/* Action buttons, Notifications, Theme, Profile on the left (in RTL) */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onOpenQuickAdd}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 text-xs font-bold rounded-lg shadow-[0_0_12px_rgba(0,245,255,0.3)] transition-all whitespace-nowrap cursor-pointer active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden md:inline">ثبت سریع</span>
          </button>

          <button
            onClick={onOpenSearch}
            className="sm:hidden p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-[#172033]"
            aria-label="جستجو"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-cyan-400 rounded-lg hover:bg-slate-100 dark:hover:bg-[#172033] transition-colors cursor-pointer"
              aria-label="اعلان‌ها"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white dark:ring-[#0D1220]" />
              )}
            </button>

            {showNotifications && (
              <div className="fixed inset-x-3 sm:inset-x-auto sm:absolute left-auto sm:left-0 top-16 sm:top-auto sm:mt-2 w-auto sm:w-96 max-w-[calc(100vw-1.5rem)] bg-white dark:bg-[#111827] rounded-2xl shadow-2xl border border-slate-200 dark:border-[#263247] p-4 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-[#263247]">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-900 dark:text-white">
                      مرکز یادآوری‌ها
                    </span>
                    {unreadCount > 0 && (
                      <span className="text-xs font-mono px-1.5 py-0.5 bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 rounded">
                        {toPersianDigits(unreadCount)} جدید
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllNotificationsAsRead}
                        className="text-xs text-cyan-600 dark:text-cyan-400 hover:underline cursor-pointer"
                      >
                        خواندن همه
                      </button>
                    )}
                    <button
                      onClick={() => setShowNotifications(false)}
                      className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="mt-3 max-h-80 overflow-y-auto space-y-2">
                  {notifications.length === 0 ? (
                    <div className="py-6 text-center text-xs text-slate-400">
                      هیچ اعلانی وجود ندارد.
                    </div>
                  ) : (
                    notifications.map((item) => (
                      <div
                        key={item.id}
                        className={`p-2.5 rounded-lg border text-right transition-colors ${
                          item.isRead
                            ? 'bg-slate-50/60 dark:bg-[#0D1220]/60 border-slate-200/60 dark:border-[#263247] text-slate-600 dark:text-slate-400'
                            : 'bg-indigo-50/70 dark:bg-[#172033] border-indigo-200 dark:border-cyan-500/30 text-slate-800 dark:text-slate-200'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-1.5">
                            <span className={`text-[11px] font-semibold ${getSectionBadgeColor(item.section)}`}>
                              {getSectionName(item.section)}
                            </span>
                            <span className="text-xs font-semibold text-slate-900 dark:text-white">
                              {item.title}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            {!item.isRead && (
                              <button
                                onClick={() => markNotificationAsRead(item.id)}
                                title="علامت به عنوان خوانده‌شده"
                                className="text-slate-400 hover:text-cyan-400 cursor-pointer"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                            <button
                              onClick={() => clearNotification(item.id)}
                              title="حذف"
                              className="text-slate-400 hover:text-rose-500 cursor-pointer"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                        <p className="mt-1 text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                          {item.message}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-amber-400 rounded-xl hover:bg-slate-100 dark:hover:bg-[#172033] transition-all cursor-pointer active:scale-95"
            aria-label="تغییر تم"
            title={profile.theme === 'dark' ? 'تغییر به حالت روشن (Light Mode)' : 'تغییر به حالت تاریک (Dark Mode)'}
          >
            {profile.theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400 hover:rotate-45 transition-transform" />
            ) : (
              <Moon className="w-4 h-4 text-indigo-600 hover:-rotate-12 transition-transform" />
            )}
          </button>

          {/* Profile pill button & Dropdown on the left */}
          <div className="relative" ref={profileMenuRef}>
            <button
              onClick={() => setShowProfileMenu((prev) => !prev)}
              className="flex items-center gap-2 p-1 sm:px-2.5 sm:py-1 rounded-xl hover:bg-slate-100 dark:hover:bg-[#172033] transition-colors text-right group cursor-pointer border border-transparent hover:border-slate-200 dark:hover:border-[#263247]"
              title="پروفایل و آیکون‌های کاربری"
            >
              <div className={`w-8 h-8 rounded-xl bg-gradient-to-tr ${currentAvatar.gradient} text-white flex items-center justify-center font-bold text-xs ring-2 ring-white dark:ring-[#263247] ${currentAvatar.glowColor} shrink-0`}>
                <AvatarIcon className="w-4 h-4" />
              </div>
              <div className="hidden sm:flex flex-col text-right min-w-0">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors truncate max-w-[110px]">
                  {profile.name || 'کاربر'}
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 truncate max-w-[110px]">
                  {profile.gradeOrField || currentAvatar.label}
                </span>
              </div>
              <ChevronDown className="hidden sm:block w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-transform" />
            </button>

            {/* Profile Popover / Avatar Selector */}
            {showProfileMenu && (
              <div className="fixed inset-x-3 sm:inset-x-auto sm:absolute left-auto sm:left-0 top-16 sm:top-auto sm:mt-2 w-auto sm:w-80 max-w-[calc(100vw-1.5rem)] bg-white dark:bg-[#111827] rounded-2xl shadow-2xl border border-slate-200 dark:border-[#263247] p-4 z-50 text-right animate-in fade-in zoom-in-95 duration-150">
                {/* User identity summary */}
                <div className="flex items-center gap-3 pb-3 border-b border-slate-100 dark:border-[#263247]">
                  <div className={`w-11 h-11 rounded-2xl bg-gradient-to-tr ${currentAvatar.gradient} text-white flex items-center justify-center shadow-md ${currentAvatar.glowColor} shrink-0`}>
                    <AvatarIcon className="w-6 h-6" />
                  </div>
                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="text-sm font-bold text-slate-900 dark:text-white truncate">
                      {profile.name || 'کاربر سیستم'}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 truncate">
                      {profile.gradeOrField || 'دانش‌آموز / یادگیرنده'}
                    </span>
                    <span className="text-[10px] text-cyan-600 dark:text-cyan-400 font-medium">
                      آیکون فعال: {currentAvatar.label}
                    </span>
                  </div>
                </div>

                {/* Avatar icons selection */}
                <div className="py-3 border-b border-slate-100 dark:border-[#263247]">
                  <span className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-2">
                    انتخاب آیکون پروفایل:
                  </span>
                  <div className="grid grid-cols-4 gap-2">
                    {AVATAR_OPTIONS.map((opt) => {
                      const Icon = opt.icon;
                      const isSelected = profile.avatarSeed === opt.id || (!profile.avatarSeed && opt.id === 'cyber-neon');
                      return (
                        <button
                          key={opt.id}
                          onClick={() => {
                            updateProfile({ avatarSeed: opt.id });
                          }}
                          title={opt.label}
                          className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all cursor-pointer relative ${
                            isSelected
                              ? 'bg-slate-100 dark:bg-[#172033] ring-2 ring-cyan-400 dark:ring-cyan-400 shadow-sm'
                              : 'hover:bg-slate-50 dark:hover:bg-[#172033]/60'
                          }`}
                        >
                          <div className={`w-8 h-8 rounded-lg bg-gradient-to-tr ${opt.gradient} text-white flex items-center justify-center ${isSelected ? opt.glowColor : ''}`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <span className={`text-[10px] mt-1 font-medium truncate max-w-full ${isSelected ? 'text-cyan-600 dark:text-cyan-400 font-bold' : 'text-slate-500 dark:text-slate-400'}`}>
                            {opt.label}
                          </span>
                          {isSelected && (
                            <span className="absolute top-1 right-1 w-3.5 h-3.5 bg-cyan-500 text-slate-950 rounded-full flex items-center justify-center text-[8px] font-bold">
                              ✓
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Quick actions: Theme switch & Settings */}
                <div className="pt-3 space-y-2">
                  <div className="flex items-center justify-between text-xs p-2 rounded-xl bg-slate-50 dark:bg-[#0D1220] border border-slate-200 dark:border-[#263247]">
                    <span className="text-slate-600 dark:text-slate-300 font-medium">حالت تصویر:</span>
                    <button
                      onClick={toggleTheme}
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer bg-white dark:bg-[#172033] border border-slate-200 dark:border-[#263247] text-slate-700 dark:text-slate-200 hover:border-cyan-400"
                    >
                      {profile.theme === 'dark' ? (
                        <>
                          <Sun className="w-3.5 h-3.5 text-amber-400" />
                          <span>روشن</span>
                        </>
                      ) : (
                        <>
                          <Moon className="w-3.5 h-3.5 text-indigo-600" />
                          <span>تاریک</span>
                        </>
                      )}
                    </button>
                  </div>

                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      if (onSelectTab) onSelectTab('settings');
                    }}
                    className="w-full flex items-center justify-center gap-2 py-2 px-3 text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-[#172033] dark:hover:bg-[#1f2b45] rounded-xl transition-all cursor-pointer"
                  >
                    <Settings className="w-3.5 h-3.5 text-slate-400 dark:text-cyan-400" />
                    <span>تنظیمات پیشرفته حساب کاربری</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

