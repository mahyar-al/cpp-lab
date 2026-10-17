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
  Trophy,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatJalaliFull, toPersianDigits } from '../../utils/jalali';
import { SectionType } from '../../types';
import { NavTab } from './Sidebar';
import { AVATAR_OPTIONS, getAvatarOption } from '../../utils/avatars';
import { RPGBanner } from '../common/RPGBanner';
import { ThemeToggle } from '../../theme/ThemeToggle';

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
        return 'text-muted';
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
    <header className="sticky top-0 z-30 glass-nav border-b border-[var(--glass-nav-border)] transition-colors w-full">
      <div className="flex items-center justify-between px-3.5 sm:px-5 md:px-6 lg:px-8 xl:px-10 2xl:px-12 h-15 gap-4 w-full">
        {/* Right Zone in RTL: Mobile menu trigger & Title / Date */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onToggleSidebar}
            className="p-2 text-muted hover:text-fg lg:hidden rounded-xl hover:bg-chip transition-colors"
            aria-label="منوی ناوبری"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-baseline gap-3 min-w-0">
            <h1 className="text-base font-bold text-fg truncate">
              {activeSectionTitle}
            </h1>
            <span className="hidden sm:inline text-xs text-muted truncate font-medium">
              {formatJalaliFull()}
            </span>
          </div>
        </div>

        {/* Action buttons on the left (in RTL) */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Search Trigger (Secondary) */}
          <button
            onClick={onOpenSearch}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs btn-secondary rounded-[14px] transition-all cursor-pointer active:scale-[0.98]"
            aria-label="جستجو در سامانه"
            title="جستجو (Ctrl + K)"
          >
            <Search className="w-3.5 h-3.5 text-muted" />
            <span className="hidden sm:inline font-semibold">جستجو</span>
          </button>

          {/* Quick Add Action (Secondary in global header) */}
          <button
            onClick={onOpenQuickAdd}
            className="flex items-center gap-1.5 px-3.5 py-1.5 btn-secondary text-xs font-semibold rounded-[14px] transition-all whitespace-nowrap cursor-pointer active:scale-98"
            title="ثبت سریع وظیفه یا رویداد جدید"
          >
            <Plus className="w-3.5 h-3.5 text-muted" />
            <span>ثبت سریع</span>
          </button>

          {/* Notifications Dropdown (Ghost icon button) */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 btn-ghost rounded-xl transition-colors cursor-pointer"
              aria-label="اعلان‌ها"
            >
              <Bell className="w-4 h-4 text-muted" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-fg rounded-full" />
              )}
            </button>

            {showNotifications && (
              <div className="fixed inset-x-3 sm:inset-x-auto sm:absolute left-auto sm:left-0 top-16 sm:top-auto sm:mt-2 w-auto sm:w-88 max-w-[calc(100vw-1.5rem)] glass-strong rounded-[20px] p-4 z-50 animate-in fade-in duration-150 shadow-2xl">
                <div className="flex items-center justify-between pb-3 border-b border-line">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-fg">
                      مرکز یادآوری‌ها
                    </span>
                    {unreadCount > 0 && (
                      <span className="text-xs font-mono px-1.5 py-0.5 bg-chip text-fg font-semibold rounded" dir="ltr">
                        {toPersianDigits(unreadCount)} جدید
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllNotificationsAsRead}
                        className="text-xs text-muted hover:text-fg hover:underline cursor-pointer font-medium"
                      >
                        خواندن همه
                      </button>
                    )}
                    <button
                      onClick={() => setShowNotifications(false)}
                      className="p-1 text-muted hover:text-fg rounded cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="mt-3 max-h-80 overflow-y-auto space-y-2">
                  {notifications.length === 0 ? (
                    <div className="py-6 text-center text-xs text-muted font-medium">
                      هیچ اعلانی وجود ندارد.
                    </div>
                  ) : (
                    notifications.map((item) => (
                      <div
                        key={item.id}
                        className={`p-2.5 rounded-lg border text-right transition-colors ${
                          item.isRead
                            ? 'bg-surface border-line text-muted'
                            : 'bg-chip border-line text-fg font-medium'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-1.5">
                            <span className={`text-[11px] font-semibold ${getSectionBadgeColor(item.section)}`}>
                              {getSectionName(item.section)}
                            </span>
                            <span className="text-xs font-semibold text-fg">
                              {item.title}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            {!item.isRead && (
                              <button
                                onClick={() => markNotificationAsRead(item.id)}
                                title="علامت به عنوان خوانده‌شده"
                                className="text-muted hover:text-amber-500 cursor-pointer"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                            <button
                              onClick={() => clearNotification(item.id)}
                              title="حذف"
                              className="text-muted hover:text-rose-500 cursor-pointer"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                        <p className="mt-1 text-xs text-muted line-clamp-2">
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
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400 animate-pulse'
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

          {/* Login CTA if guest (Secondary) */}
          {!currentUser && (
            <button
              onClick={() => openAuthModal('login')}
              className="flex items-center gap-1.5 px-3 py-1.5 btn-secondary text-xs rounded-lg transition-colors cursor-pointer"
              title="ورود یا ثبت‌نام حساب چندکاربره"
            >
              <LogIn className="w-3.5 h-3.5 text-muted" />
              <span className="hidden sm:inline">ورود / ثبت‌نام</span>
            </button>
          )}

          {/* Monochrome Theme Toggle */}
          <ThemeToggle />

          {/* Profile button & Dropdown on the left */}
          <div className="relative" ref={profileMenuRef}>
            <button
              onClick={() => setShowProfileMenu((prev) => !prev)}
              className="flex items-center gap-2 p-1 sm:px-2 sm:py-1 rounded-lg btn-ghost transition-colors text-right cursor-pointer"
              title="پروفایل کاربر"
            >
              <div className="w-7 h-7 rounded-lg bg-chip text-fg flex items-center justify-center font-semibold text-xs shrink-0">
                <AvatarIcon className="w-4 h-4" />
              </div>
              <div className="hidden sm:flex flex-col text-right min-w-0">
                <span className="text-xs font-bold text-fg truncate max-w-[110px]">
                  {currentUser ? currentUser.name : (profile.name || 'کاربر')}
                </span>
                <span className="text-[10px] text-muted truncate max-w-[110px] font-medium">
                  {currentUser ? `@${currentUser.username}` : (profile.gradeOrField || 'دانش‌آموز')}
                </span>
              </div>
              <ChevronDown className="hidden sm:block w-3 h-3 text-muted transition-transform" />
            </button>

            {/* Profile Popover */}
            {showProfileMenu && (
              <div className="fixed inset-x-3 sm:inset-x-auto sm:absolute left-auto sm:left-0 top-16 sm:top-auto sm:mt-2 w-auto sm:w-80 max-w-[calc(100vw-1.5rem)] glass-strong rounded-[20px] p-4 z-50 text-right animate-in fade-in duration-150 shadow-2xl">
                {/* User identity summary */}
                <div className="flex items-center gap-3 pb-3 border-b border-line/60">
                  <div className="w-10 h-10 rounded-xl bg-chip text-fg flex items-center justify-center shrink-0">
                    <AvatarIcon className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="text-sm font-bold text-fg truncate">
                      {currentUser ? currentUser.name : (profile.name || 'کاربر مهمان')}
                    </span>
                    <span className="text-xs text-muted truncate font-medium">
                      {currentUser ? currentUser.email : (profile.gradeOrField || 'حالت محلی')}
                    </span>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className={`w-1.5 h-1.5 rounded-full ${currentUser ? 'bg-emerald-500' : 'bg-muted'}`} />
                      <span className="text-[11px] text-muted font-medium">
                        {currentUser ? 'متصل به حساب ابری' : 'حافظه محلی (آفلاین)'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Quick Rescue Actions */}
                <div className="py-2.5 border-b border-line space-y-1.5">
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      setIsRescueModalOpen(true);
                    }}
                    className="w-full flex items-center justify-between p-2 rounded-lg text-xs font-medium text-fg hover:bg-chip transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <LifeBuoy className="w-4 h-4 text-amber-500" />
                      <span>حالت نجات روز</span>
                    </div>
                    <span className="text-[10px] text-muted font-normal">جبران عقب‌افتادگی</span>
                  </button>

                  {currentUser && (
                    <button
                      onClick={() => {
                        syncWithServer();
                      }}
                      className="w-full flex items-center justify-between p-2 rounded-lg text-xs font-medium text-fg hover:bg-chip transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <Cloud className={`w-4 h-4 ${syncStatus === 'syncing' ? 'animate-spin text-amber-500' : 'text-muted'}`} />
                        <span>همگام‌سازی ابری</span>
                      </div>
                      <span className="text-[10px] text-muted">
                        {syncStatus === 'synced' ? 'به‌روز' : syncStatus === 'syncing' ? 'در حال ارسال' : 'خطا'}
                      </span>
                    </button>
                  )}
                </div>

                {/* Account Actions Bar */}
                <div className="py-2.5 border-b border-line">
                  {currentUser ? (
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => {
                          setShowProfileMenu(false);
                          setIsAuthModalOpen(true);
                        }}
                        className="flex items-center justify-center gap-1.5 py-1.5 px-2 bg-chip hover:bg-chip/80 text-fg text-xs font-medium rounded-lg transition-colors cursor-pointer"
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
                      className="w-full py-2 px-3 bg-fg hover:opacity-90 text-bg text-xs font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors cursor-pointer"
                    >
                      <LogIn className="w-4 h-4" />
                      <span>ورود / ساخت حساب ابری</span>
                    </button>
                  )}
                </div>

                {/* Avatar icons selection */}
                <div className="py-2.5 border-b border-line">
                  <span className="block text-[11px] font-semibold text-muted mb-2">
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
                              ? 'bg-chip ring-1 ring-fg'
                              : 'hover:bg-chip/60'
                          }`}
                        >
                          <div className="w-7 h-7 rounded-md bg-chip text-fg flex items-center justify-center">
                            <Icon className="w-3.5 h-3.5" />
                          </div>
                          <span className="text-[10px] mt-1 text-muted truncate max-w-full">
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
                    className="w-full flex items-center justify-center gap-2 py-2 px-3 text-xs font-medium text-fg bg-chip hover:bg-chip/80 rounded-lg transition-colors cursor-pointer"
                  >
                    <Settings className="w-3.5 h-3.5 text-muted" />
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

