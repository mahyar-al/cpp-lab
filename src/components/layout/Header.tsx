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
    <header className="sticky top-0 z-30 bg-white/90 dark:bg-[#080B14]/90 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800/80 transition-colors relative before:absolute before:inset-x-0 before:top-0 before:h-[1px] before:bg-gradient-to-r before:from-transparent before:via-cyan-500/35 before:to-transparent">
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

        {/* Action buttons, Notifications, Theme, Profile on the left (in RTL) */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* RPG Level Badge */}
          {rpg?.enabled && (
            <div className="hidden sm:block">
              <RPGBanner compact={true} />
            </div>
          )}

          {/* Rescue Mode Trigger */}
          <button
            onClick={() => setIsRescueModalOpen(true)}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 text-xs font-semibold rounded-xl transition-all cursor-pointer active:scale-95"
            title="حالت نجات روز من (Rescue Mode)"
          >
            <LifeBuoy className="w-3.5 h-3.5 animate-pulse text-amber-500" />
            <span className="hidden md:inline">نجات روز</span>
          </button>

          {/* AI Assistant Trigger */}
          <button
            onClick={() => setIsAIAssistantOpen(true)}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 hover:from-cyan-500/20 hover:to-purple-500/20 text-cyan-600 dark:text-cyan-300 border border-cyan-500/30 text-xs font-semibold rounded-xl transition-all cursor-pointer active:scale-95 shadow-sm"
            title="دستیار هوشمند مسیر (AI Life Coach)"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-500 dark:text-cyan-400" />
            <span className="hidden lg:inline">دستیار هوش مصنوعی</span>
          </button>

          {/* Unified Single Search Trigger (No duplicate empty bars, No ctrl+k text) */}
          <button
            onClick={onOpenSearch}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs text-slate-600 dark:text-slate-300 bg-slate-100 hover:bg-slate-200/80 dark:bg-[#111827] dark:hover:bg-[#172033] rounded-xl border border-slate-200 dark:border-[#263247] hover:border-cyan-500/50 hover:text-cyan-500 dark:hover:text-cyan-400 transition-all cursor-pointer"
            aria-label="جستجو در سامانه"
            title="جستجو در تمام بخش‌های سامانه"
          >
            <Search className="w-4 h-4 text-slate-400 group-hover:text-cyan-400" />
            <span className="hidden sm:inline">جستجو</span>
          </button>

          <button
            onClick={onOpenQuickAdd}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 text-xs font-bold rounded-lg shadow-[0_0_12px_rgba(0,245,255,0.3)] transition-all whitespace-nowrap cursor-pointer active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden md:inline">ثبت سریع</span>
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
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-cyan-500/15 to-blue-500/15 hover:from-cyan-500/25 hover:to-blue-500/25 text-cyan-700 dark:text-cyan-300 border border-cyan-500/30 text-xs font-bold rounded-xl transition-all cursor-pointer shadow-xs active:scale-95"
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
              className="flex items-center gap-1.5 p-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-[#172033] border border-transparent hover:border-slate-200 dark:hover:border-[#263247] transition-all cursor-pointer active:scale-95 group"
              aria-label="تغییر حالت تم (روشن / تاریک / سیستم)"
              title={
                themeMode === 'system'
                  ? `تم سیستم (فعال: ${resolvedTheme === 'dark' ? 'تاریک' : 'روشن'})`
                  : themeMode === 'light'
                  ? 'تم روشن (Light Mode)'
                  : 'تم تاریک نئون (Dark Mode)'
              }
            >
              <div className="relative flex items-center justify-center">
                {themeMode === 'system' ? (
                  <Monitor className="w-4 h-4 text-cyan-600 dark:text-cyan-400 group-hover:scale-110 transition-transform" />
                ) : resolvedTheme === 'dark' ? (
                  <Moon className="w-4 h-4 text-cyan-400 group-hover:-rotate-12 transition-transform" />
                ) : (
                  <Sun className="w-4 h-4 text-amber-500 group-hover:rotate-45 transition-transform" />
                )}
                {themeMode === 'system' && (
                  <span className="absolute -bottom-1 -left-1 w-2 h-2 rounded-full bg-cyan-400 ring-1 ring-white dark:ring-[#080B14]" />
                )}
              </div>
              <ChevronDown className={`hidden sm:block w-3 h-3 text-slate-400 transition-transform ${showThemeMenu ? 'rotate-180' : ''}`} />
            </button>

            {/* Theme Dropdown Popover */}
            {showThemeMenu && (
              <div className="fixed inset-x-3 sm:inset-x-auto sm:absolute left-auto sm:left-0 top-16 sm:top-auto sm:mt-2 w-auto sm:w-64 max-w-[calc(100vw-1.5rem)] bg-white dark:bg-[#0D1222] rounded-2xl shadow-2xl border border-slate-200 dark:border-[#263247] p-2.5 z-50 animate-in fade-in zoom-in-95 duration-150 text-right">
                <div className="px-2.5 py-1.5 text-[11px] font-bold text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-[#1F293D] mb-1.5 flex items-center justify-between">
                  <span>انتخاب پوسته و تم</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
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
                    className={`w-full flex items-center justify-between p-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      themeMode === 'light'
                        ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/30 font-bold'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#172033] border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                        <Sun className="w-4 h-4" />
                      </div>
                      <div className="text-right">
                        <div className="text-xs font-bold">حالت روشن</div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 font-normal">سفید و شفاف برای روز</div>
                      </div>
                    </div>
                    {themeMode === 'light' && <Check className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />}
                  </button>

                  {/* Dark Mode Button */}
                  <button
                    type="button"
                    onClick={() => {
                      setThemeMode('dark', true);
                      setShowThemeMenu(false);
                    }}
                    className={`w-full flex items-center justify-between p-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      themeMode === 'dark'
                        ? 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30 font-bold'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#172033] border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 flex items-center justify-center shrink-0">
                        <Moon className="w-4 h-4" />
                      </div>
                      <div className="text-right">
                        <div className="text-xs font-bold">حالت تاریک نئونی</div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 font-normal">مشکی سرمه‌ای با درخشش فیروزه‌ای</div>
                      </div>
                    </div>
                    {themeMode === 'dark' && <Check className="w-4 h-4 text-cyan-600 dark:text-cyan-400 shrink-0" />}
                  </button>

                  {/* System Auto Mode Button */}
                  <button
                    type="button"
                    onClick={() => {
                      setThemeMode('system', true);
                      setShowThemeMenu(false);
                    }}
                    className={`w-full flex items-center justify-between p-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      themeMode === 'system'
                        ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30 font-bold'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#172033] border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                        <Monitor className="w-4 h-4" />
                      </div>
                      <div className="text-right">
                        <div className="text-xs font-bold">هماهنگ با سیستم</div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 font-normal">
                          تنظیم خودکار با سیستم‌عامل ({resolvedTheme === 'dark' ? 'اکنون: تاریک' : 'اکنون: روشن'})
                        </div>
                      </div>
                    </div>
                    {themeMode === 'system' && <Check className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />}
                  </button>
                </div>
              </div>
            )}
          </div>

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
                  {currentUser ? currentUser.name : (profile.name || 'کاربر مهمان')}
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 truncate max-w-[110px]">
                  {currentUser ? `@${currentUser.username}` : (profile.gradeOrField || currentAvatar.label)}
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
                      {currentUser ? currentUser.name : (profile.name || 'کاربر مهمان')}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 truncate">
                      {currentUser ? `${currentUser.email} (${currentUser.role === 'admin' ? 'مدیر سیستم' : 'کاربر'})` : (profile.gradeOrField || 'دانش‌آموز / یادگیرنده')}
                    </span>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className={`w-2 h-2 rounded-full ${currentUser ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                      <span className="text-[10px] text-slate-600 dark:text-slate-400">
                        {currentUser ? 'متصل به سرور ابری' : 'حالت مهمان (آفلاین)'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Account Actions Bar */}
                <div className="py-2.5 border-b border-slate-100 dark:border-[#263247] space-y-1.5">
                  {currentUser ? (
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => {
                          setShowProfileMenu(false);
                          setIsAuthModalOpen(true);
                        }}
                        className="flex items-center justify-center gap-1.5 py-1.5 px-2 bg-slate-100 hover:bg-slate-200 dark:bg-[#172033] dark:hover:bg-[#1f2b45] text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl transition-all cursor-pointer"
                      >
                        <LogIn className="w-3.5 h-3.5 text-cyan-400" />
                        <span>تغییر حساب</span>
                      </button>
                      <button
                        onClick={() => {
                          setShowProfileMenu(false);
                          logout();
                        }}
                        className="flex items-center justify-center gap-1.5 py-1.5 px-2 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/50 text-rose-600 dark:text-rose-400 text-xs font-bold rounded-xl transition-all cursor-pointer"
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
                      className="w-full py-2 px-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 text-xs font-bold rounded-xl flex items-center justify-center gap-2 shadow-[0_0_12px_rgba(0,245,255,0.25)] transition-all cursor-pointer"
                    >
                      <LogIn className="w-4 h-4" />
                      <span>ورود / ساخت حساب مستقل</span>
                    </button>
                  )}
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
                  <div className="text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-[#0D1220] border border-slate-200 dark:border-[#263247] space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] font-medium text-slate-600 dark:text-slate-400">
                      <span>پوسته و تم سامانه:</span>
                      <span className="font-mono text-[10px] text-cyan-600 dark:text-cyan-400">
                        {themeMode === 'system' ? 'سیستم (خودکار)' : themeMode === 'light' ? 'روشن' : 'تاریک نئون'}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-1">
                      <button
                        type="button"
                        onClick={() => setThemeMode('light', true)}
                        className={`flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          themeMode === 'light'
                            ? 'bg-amber-500/15 border border-amber-500/40 text-amber-700 dark:text-amber-400 shadow-xs'
                            : 'bg-white dark:bg-[#172033] border border-slate-200 dark:border-[#263247] text-slate-600 dark:text-slate-400 hover:border-slate-300'
                        }`}
                        title="حالت روشن"
                      >
                        <Sun className="w-3.5 h-3.5 text-amber-500" />
                        <span>روشن</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setThemeMode('dark', true)}
                        className={`flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          themeMode === 'dark'
                            ? 'bg-cyan-500/15 border border-cyan-500/40 text-cyan-700 dark:text-cyan-400 shadow-xs'
                            : 'bg-white dark:bg-[#172033] border border-slate-200 dark:border-[#263247] text-slate-600 dark:text-slate-400 hover:border-slate-300'
                        }`}
                        title="حالت تاریک"
                      >
                        <Moon className="w-3.5 h-3.5 text-cyan-400" />
                        <span>تاریک</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setThemeMode('system', true)}
                        className={`flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          themeMode === 'system'
                            ? 'bg-indigo-500/15 border border-indigo-500/40 text-indigo-700 dark:text-indigo-400 shadow-xs'
                            : 'bg-white dark:bg-[#172033] border border-slate-200 dark:border-[#263247] text-slate-600 dark:text-slate-400 hover:border-slate-300'
                        }`}
                        title="هماهنگ با سیستم"
                      >
                        <Monitor className="w-3.5 h-3.5 text-indigo-500" />
                        <span>سیستم</span>
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      if (onSelectTab) onSelectTab('settings');
                      setTimeout(() => {
                        window.dispatchEvent(new CustomEvent('pathly_open_customization'));
                      }, 50);
                    }}
                    className="w-full flex items-center justify-center gap-2 py-2 px-3 text-xs font-bold text-cyan-600 dark:text-cyan-400 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/25 rounded-xl transition-all cursor-pointer shadow-xs"
                  >
                    <Palette className="w-3.5 h-3.5" />
                    <span>شخصی‌سازی سایت و ظاهر</span>
                  </button>

                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      if (onSelectTab) onSelectTab('settings');
                    }}
                    className="w-full flex items-center justify-center gap-2 py-2 px-3 text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-[#172033] dark:hover:bg-[#1f2b45] rounded-xl transition-all cursor-pointer"
                  >
                    <Settings className="w-3.5 h-3.5 text-slate-400 dark:text-cyan-400" />
                    <span>تنظیمات پیشرفته و امنیت</span>
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

