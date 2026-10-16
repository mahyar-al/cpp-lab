import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  Plus,
  Bell,
  Sun,
  Moon,
  Monitor,
  Menu,
  CheckCircle2,
  X,
  User,
  Settings,
  Check,
  ChevronDown,
  LogIn,
  LogOut,
  Cloud,
  ShieldCheck,
  Palette,
  LifeBuoy,
  Sparkles,
  Bot,
  Trophy,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatJalaliFull, toPersianDigits } from '../../utils/jalali';
import { SectionType } from '../../types';
import { NavTab } from './Sidebar';
import { AVATAR_OPTIONS, getAvatarOption } from '../../utils/avatars';
import { RPGBanner } from '../common/RPGBanner';

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
    themeMode,
    resolvedTheme,
    setThemeMode,
    notifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    clearNotification,
    currentUser,
    syncStatus,
    setIsAuthModalOpen,
    openAuthModal,
    logout,
    syncWithServer,
    setIsRescueModalOpen,
    setIsAIAssistantOpen,
    rpg,
  } = useApp();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const themeMenuRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const currentAvatar = getAvatarOption(profile.avatarSeed);
  const AvatarIcon = currentAvatar.icon;

  // Close menus on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target as Node)) {
        setShowProfileMenu(false);
      }
      if (themeMenuRef.current && !themeMenuRef.current.contains(e.target as Node)) {
        setShowThemeMenu(false);
      }
    };
    if (showProfileMenu || showThemeMenu) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [showProfileMenu, showThemeMenu]);

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
    <header className="sticky top-0 z-30 bg-white/95 dark:bg-[#0B0F19]/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="flex items-center justify-between px-4 lg:px-6 h-15 gap-4">
        {/* Right Zone in RTL: Mobile menu trigger & Title / Date */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onToggleSidebar}
            className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 lg:hidden rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="منوی ناوبری"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-baseline gap-3 min-w-0">
            <h1 className="text-base font-bold text-slate-900 dark:text-white truncate">
              {activeSectionTitle}
            </h1>
            <span className="hidden sm:inline text-xs text-slate-400 dark:text-slate-500 truncate font-normal">
              {formatJalaliFull()}
            </span>
          </div>
        </div>

        {/* Action buttons on the left (in RTL) */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Search Trigger */}
          <button
            onClick={onOpenSearch}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-slate-600 dark:text-slate-300 bg-slate-100 hover:bg-slate-200/70 dark:bg-slate-800/60 dark:hover:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700/60 transition-colors cursor-pointer"
            aria-label="جستجو در سامانه"
            title="جستجو (Ctrl + K)"
          >
            <Search className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden sm:inline">جستجو</span>
          </button>

          {/* Primary Action: Quick Add */}
          <button
            onClick={onOpenQuickAdd}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer active:scale-98 shadow-xs"
            title="ثبت سریع وظیفه یا رویداد جدید"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>ثبت سریع</span>
          </button>

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="اعلان‌ها"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full" />
              )}
            </button>

            {showNotifications && (
              <div className="fixed inset-x-3 sm:inset-x-auto sm:absolute left-auto sm:left-0 top-16 sm:top-auto sm:mt-2 w-auto sm:w-88 max-w-[calc(100vw-1.5rem)] bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 p-4 z-50 animate-in fade-in duration-150">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
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

          {/* Cloud Sync Status Indicator */}
          {currentUser && (
            <button
              onClick={syncWithServer}
              className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                syncStatus === 'synced'
                  ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20'
                  : syncStatus === 'syncing'
                  ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-600 dark:text-cyan-400 animate-pulse'
                  : 'bg-rose-500/10 border-rose-500/25 text-rose-500 hover:bg-rose-500/20'
              }`}
              title="همگام‌سازی فوری با پایگاه داده سرور"
            >
              <Cloud className={`w-3.5 h-3.5 ${syncStatus === 'syncing' ? 'animate-spin' : ''}`} />
              <span className="text-[11px]">
                {syncStatus === 'synced' ? 'ذخیره ابری فعال' : syncStatus === 'syncing' ? 'در حال ذخیره...' : 'خطا در همگام‌سازی'}
              </span>
            </button>
          )}

          {/* Login CTA if guest */}
          {!currentUser && (
            <button
              onClick={() => openAuthModal('login')}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
              title="ورود یا ثبت‌نام حساب چندکاربره"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">ورود / ثبت‌نام</span>
            </button>
          )}

          {/* Modern Theme Switcher Control */}
          <div className="relative" ref={themeMenuRef}>
            <button
              onClick={() => setShowThemeMenu((prev) => !prev)}
              className="flex items-center gap-1.5 p-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="تغییر حالت تم (روشن / تاریک / سیستم)"
              title="تغییر حالت تم"
            >
              {themeMode === 'system' ? (
                <Monitor className="w-4 h-4 text-slate-600 dark:text-slate-300" />
              ) : resolvedTheme === 'dark' ? (
                <Moon className="w-4 h-4 text-slate-300" />
              ) : (
                <Sun className="w-4 h-4 text-amber-500" />
              )}
              <ChevronDown className={`hidden sm:block w-3 h-3 text-slate-400 transition-transform ${showThemeMenu ? 'rotate-180' : ''}`} />
            </button>

            {/* Theme Dropdown Popover */}
            {showThemeMenu && (
              <div className="fixed inset-x-3 sm:inset-x-auto sm:absolute left-auto sm:left-0 top-16 sm:top-auto sm:mt-2 w-auto sm:w-60 max-w-[calc(100vw-1.5rem)] bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 p-2 z-50 text-right animate-in fade-in duration-150">
                <div className="px-2.5 py-1.5 text-[11px] font-semibold text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-800 mb-1 flex items-center justify-between">
                  <span>انتخاب حالت پوسته</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                    {resolvedTheme === 'dark' ? 'تاریک' : 'روشن'}
                  </span>
                </div>

                <div className="space-y-1">
                  {/* Light Mode Button */}
                  <button
                    type="button"
                    onClick={() => {
                      setThemeMode('light', true);
                      setShowThemeMenu(false);
                    }}
                    className={`w-full flex items-center justify-between p-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                      themeMode === 'light'
                        ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Sun className="w-4 h-4 text-amber-500" />
                      <span>حالت روشن</span>
                    </div>
                    {themeMode === 'light' && <Check className="w-3.5 h-3.5 text-slate-900 dark:text-white" />}
                  </button>

                  {/* Dark Mode Button */}
                  <button
                    type="button"
                    onClick={() => {
                      setThemeMode('dark', true);
                      setShowThemeMenu(false);
                    }}
                    className={`w-full flex items-center justify-between p-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                      themeMode === 'dark'
                        ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Moon className="w-4 h-4 text-slate-400" />
                      <span>حالت تاریک</span>
                    </div>
                    {themeMode === 'dark' && <Check className="w-3.5 h-3.5 text-slate-900 dark:text-white" />}
                  </button>

                  {/* System Auto Mode Button */}
                  <button
                    type="button"
                    onClick={() => {
                      setThemeMode('system', true);
                      setShowThemeMenu(false);
                    }}
                    className={`w-full flex items-center justify-between p-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                      themeMode === 'system'
                        ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Monitor className="w-4 h-4 text-slate-400" />
                      <span>هماهنگ با سیستم</span>
                    </div>
                    {themeMode === 'system' && <Check className="w-3.5 h-3.5 text-slate-900 dark:text-white" />}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Profile button & Dropdown on the left */}
          <div className="relative" ref={profileMenuRef}>
            <button
              onClick={() => setShowProfileMenu((prev) => !prev)}
              className="flex items-center gap-2 p-1 sm:px-2 sm:py-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-right cursor-pointer"
              title="پروفایل کاربر"
            >
              <div className="w-7 h-7 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center font-semibold text-xs shrink-0">
                <AvatarIcon className="w-4 h-4" />
              </div>
              <div className="hidden sm:flex flex-col text-right min-w-0">
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[110px]">
                  {currentUser ? currentUser.name : (profile.name || 'کاربر')}
                </span>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 truncate max-w-[110px]">
                  {currentUser ? `@${currentUser.username}` : (profile.gradeOrField || 'دانش‌آموز')}
                </span>
              </div>
              <ChevronDown className="hidden sm:block w-3 h-3 text-slate-400 transition-transform" />
            </button>

            {/* Profile Popover */}
            {showProfileMenu && (
              <div className="fixed inset-x-3 sm:inset-x-auto sm:absolute left-auto sm:left-0 top-16 sm:top-auto sm:mt-2 w-auto sm:w-80 max-w-[calc(100vw-1.5rem)] bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 p-4 z-50 text-right animate-in fade-in duration-150">
                {/* User identity summary */}
                <div className="flex items-center gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center shrink-0">
                    <AvatarIcon className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="text-sm font-bold text-slate-900 dark:text-white truncate">
                      {currentUser ? currentUser.name : (profile.name || 'کاربر مهمان')}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 truncate">
                      {currentUser ? currentUser.email : (profile.gradeOrField || 'حالت محلی')}
                    </span>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className={`w-1.5 h-1.5 rounded-full ${currentUser ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                      <span className="text-[11px] text-slate-500">
                        {currentUser ? 'متصل به حساب ابری' : 'حافظه محلی (آفلاین)'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Quick Assistant & Rescue Actions */}
                <div className="py-2.5 border-b border-slate-100 dark:border-slate-800 space-y-1.5">
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      setIsAIAssistantOpen(true);
                    }}
                    className="w-full flex items-center justify-between p-2 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <Bot className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                      <span>دستیار هوش مصنوعی</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-normal">گفتگوی هوشمند</span>
                  </button>

                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      setIsRescueModalOpen(true);
                    }}
                    className="w-full flex items-center justify-between p-2 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <LifeBuoy className="w-4 h-4 text-amber-500" />
                      <span>حالت نجات روز</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-normal">جبران عقب‌افتادگی</span>
                  </button>

                  {currentUser && (
                    <button
                      onClick={() => {
                        syncWithServer();
                      }}
                      className="w-full flex items-center justify-between p-2 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <Cloud className={`w-4 h-4 ${syncStatus === 'syncing' ? 'animate-spin text-cyan-500' : 'text-slate-500'}`} />
                        <span>همگام‌سازی ابری</span>
                      </div>
                      <span className="text-[10px] text-slate-400">
                        {syncStatus === 'synced' ? 'به‌روز' : syncStatus === 'syncing' ? 'در حال ارسال' : 'خطا'}
                      </span>
                    </button>
                  )}
                </div>

                {/* Account Actions Bar */}
                <div className="py-2.5 border-b border-slate-100 dark:border-slate-800">
                  {currentUser ? (
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => {
                          setShowProfileMenu(false);
                          setIsAuthModalOpen(true);
                        }}
                        className="flex items-center justify-center gap-1.5 py-1.5 px-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-medium rounded-lg transition-colors cursor-pointer"
                      >
                        <LogIn className="w-3.5 h-3.5" />
                        <span>تغییر حساب</span>
                      </button>
                      <button
                        onClick={() => {
                          setShowProfileMenu(false);
                          logout();
                        }}
                        className="flex items-center justify-center gap-1.5 py-1.5 px-2 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/30 dark:hover:bg-rose-900/40 text-rose-600 dark:text-rose-400 text-xs font-medium rounded-lg transition-colors cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>خروج</span>
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        openAuthModal('login');
                      }}
                      className="w-full py-2 px-3 bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 text-xs font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors cursor-pointer"
                    >
                      <LogIn className="w-4 h-4" />
                      <span>ورود / ساخت حساب ابری</span>
                    </button>
                  )}
                </div>

                {/* Avatar icons selection */}
                <div className="py-2.5 border-b border-slate-100 dark:border-slate-800">
                  <span className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-2">
                    آیکون نمایه:
                  </span>
                  <div className="grid grid-cols-4 gap-1.5">
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
                          className={`flex flex-col items-center justify-center p-1.5 rounded-lg transition-colors cursor-pointer relative ${
                            isSelected
                              ? 'bg-slate-100 dark:bg-slate-800 ring-1 ring-slate-400 dark:ring-slate-600'
                              : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                          }`}
                        >
                          <div className="w-7 h-7 rounded-md bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center">
                            <Icon className="w-3.5 h-3.5" />
                          </div>
                          <span className="text-[10px] mt-1 text-slate-600 dark:text-slate-400 truncate max-w-full">
                            {opt.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Settings link */}
                <div className="pt-2.5">
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      if (onSelectTab) onSelectTab('settings');
                    }}
                    className="w-full flex items-center justify-center gap-2 py-2 px-3 text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
                  >
                    <Settings className="w-3.5 h-3.5 text-slate-400" />
                    <span>تنظیمات و شخصی‌سازی</span>
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

