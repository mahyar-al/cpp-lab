import React, { useState } from 'react';
import {
  Search,
  Plus,
  Bell,
  Sun,
  Moon,
  Menu,
  CheckCircle2,
  X,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatJalaliFull, toPersianDigits } from '../../utils/jalali';
import { SectionType } from '../../types';

interface HeaderProps {
  onToggleSidebar: () => void;
  onOpenQuickAdd: () => void;
  onOpenSearch: () => void;
  activeSectionTitle: string;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleSidebar,
  onOpenQuickAdd,
  onOpenSearch,
  activeSectionTitle,
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

  const unreadCount = notifications.filter((n) => !n.isRead).length;

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
    <header className="sticky top-0 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="flex items-center justify-between px-4 lg:px-6 h-16 gap-4">
        {/* Right Zone in RTL: Mobile menu trigger & Breadcrumb / Date */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onToggleSidebar}
            className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 lg:hidden rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
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
            className="w-full flex items-center justify-between px-3.5 py-1.5 text-xs text-slate-400 bg-slate-100 dark:bg-slate-800/80 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-all text-right"
          >
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-slate-400" />
              <span>جستجو در دروس، وظایف، اهداف، یادداشت‌ها...</span>
            </div>
            <kbd className="px-1.5 py-0.5 font-mono text-[10px] bg-white dark:bg-slate-700 text-slate-500 dark:text-slate-300 rounded border border-slate-200 dark:border-slate-600">
              Ctrl+K
            </kbd>
          </button>
        </div>

        {/* Action buttons, Notifications, Theme, Profile */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onOpenQuickAdd}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs font-medium rounded-lg shadow-sm transition-all whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden md:inline">ثبت سریع</span>
          </button>

          <button
            onClick={onOpenSearch}
            className="sm:hidden p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-label="جستجو"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              aria-label="اعلان‌ها"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full" />
              )}
            </button>

            {showNotifications && (
              <div className="absolute left-0 sm:right-auto sm:left-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 p-4 z-50">
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
                        className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
                      >
                        خواندن همه
                      </button>
                    )}
                    <button
                      onClick={() => setShowNotifications(false)}
                      className="p-1 text-slate-400 hover:text-slate-600 rounded"
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
                            ? 'bg-slate-50/60 dark:bg-slate-800/40 border-slate-200/60 dark:border-slate-800/60 text-slate-600 dark:text-slate-400'
                            : 'bg-indigo-50/70 dark:bg-indigo-950/30 border-indigo-200 dark:border-indigo-900/50 text-slate-800 dark:text-slate-200'
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
                                className="text-slate-400 hover:text-indigo-600"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                            <button
                              onClick={() => clearNotification(item.id)}
                              title="حذف"
                              className="text-slate-400 hover:text-rose-500"
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

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-label="تغییر تم"
          >
            {profile.theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-600" />
            )}
          </button>

          {/* Profile pill */}
          <div className="flex items-center gap-2 pl-1 border-r border-slate-200 dark:border-slate-800 pr-2">
            <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs ring-2 ring-indigo-500/20">
              {profile.name.slice(0, 1)}
            </div>
            <div className="hidden lg:flex flex-col text-right">
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                {profile.name}
              </span>
              <span className="text-[10px] text-slate-400 truncate max-w-[120px]">
                {profile.gradeOrField.split(' ')[0]}
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
