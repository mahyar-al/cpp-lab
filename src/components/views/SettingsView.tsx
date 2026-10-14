import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  User,
  Clock,
  Download,
  Upload,
  RefreshCw,
  Check,
  AlertTriangle,
  Sun,
  Moon,
  ShieldCheck,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { toPersianDigits } from '../../utils/jalali';
import { SchoolBellTime } from '../../types';
import { AVATAR_OPTIONS, getAvatarOption } from '../../utils/avatars';

export const SettingsView: React.FC = () => {
  const {
    profile,
    updateProfile,
    exportBackup,
    importBackup,
    resetToDefault,
  } = useApp();

  const [name, setName] = useState(profile.name);
  const [gradeOrField, setGradeOrField] = useState(profile.gradeOrField);
  const [selectedAvatar, setSelectedAvatar] = useState(profile.avatarSeed || 'cyber-neon');
  const [bellTimes, setBellTimes] = useState<SchoolBellTime[]>(profile.bellTimes || []);
  const [importJson, setImportJson] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [importError, setImportError] = useState(false);
  const [importSuccess, setImportSuccess] = useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      name: name.trim(),
      gradeOrField: gradeOrField.trim(),
      avatarSeed: selectedAvatar,
      bellTimes,
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleBellTimeChange = (index: number, field: 'startTime' | 'endTime', value: string) => {
    const updated = [...bellTimes];
    updated[index] = { ...updated[index], [field]: value };
    setBellTimes(updated);
  };

  const handleImportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!importJson.trim()) return;
    const ok = importBackup(importJson);
    if (ok) {
      setImportSuccess(true);
      setImportError(false);
      setImportJson('');
      setTimeout(() => setImportSuccess(false), 3000);
    } else {
      setImportError(true);
      setImportSuccess(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white dark:bg-[#0D1222] p-6 rounded-2xl border border-slate-200 dark:border-cyan-500/25 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-32 bg-cyan-500/5 dark:bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            <span className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20 shadow-[0_0_12px_rgba(0,245,255,0.25)]">
              <SettingsIcon className="w-6 h-6" />
            </span>
            تنظیمات سامانه و مدیریت اطلاعات
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            پیکربندی حساب کاربری، آیکون پروفایل، ساعت زنگ‌های مدرسه، پوسته و پشتیبان‌گیری
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Section 1: User Profile & Theme */}
        <div className="bg-white dark:bg-[#0D1222] p-6 rounded-2xl border border-slate-200 dark:border-slate-800/80 shadow-sm space-y-5">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <User className="w-4 h-4 text-cyan-400" />
            اطلاعات حساب، آیکون و ظاهر
          </h2>

          <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                نام و نام خانوادگی:
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-[#090D18] border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-white focus:border-cyan-400 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                پایه و رشته تحصیلی:
              </label>
              <input
                type="text"
                required
                value={gradeOrField}
                onChange={(e) => setGradeOrField(e.target.value)}
                placeholder="مثلاً: پایه یازدهم ریاضی فیزیک"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-[#090D18] border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-white focus:border-cyan-400 focus:outline-hidden"
              />
            </div>

            {/* Avatar Selector */}
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-2">
                آیکون پروفایل (آواتار):
              </label>
              <div className="grid grid-cols-4 gap-2.5">
                {AVATAR_OPTIONS.map((opt) => {
                  const Icon = opt.icon;
                  const isSelected = selectedAvatar === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => {
                        setSelectedAvatar(opt.id);
                        updateProfile({ avatarSeed: opt.id });
                      }}
                      className={`flex flex-col items-center justify-center p-2.5 rounded-xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'border-cyan-400 bg-cyan-500/10 dark:bg-[#090D18] ring-2 ring-cyan-400 shadow-[0_0_12px_rgba(0,245,255,0.25)]'
                          : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-[#121829]'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-lg bg-gradient-to-tr ${opt.gradient} text-white flex items-center justify-center ${isSelected ? opt.glowColor : ''}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className={`text-[10px] mt-1.5 font-medium ${isSelected ? 'text-cyan-600 dark:text-cyan-400 font-bold' : 'text-slate-600 dark:text-slate-400'}`}>
                        {opt.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Theme Toggle */}
            <div className="pt-2">
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-2">
                حالت نمایش و پوسته:
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => updateProfile({ theme: 'light' })}
                  className={`p-3 rounded-xl border flex items-center justify-center gap-2 font-bold transition-all cursor-pointer ${
                    profile.theme === 'light'
                      ? 'border-cyan-500 bg-cyan-50 dark:bg-cyan-950/40 text-cyan-600 dark:text-cyan-400 shadow-xs'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-[#121829]'
                  }`}
                >
                  <Sun className="w-4 h-4 text-amber-500" />
                  حالت روشن (Light)
                </button>
                <button
                  type="button"
                  onClick={() => updateProfile({ theme: 'dark' })}
                  className={`p-3 rounded-xl border flex items-center justify-center gap-2 font-bold transition-all cursor-pointer ${
                    profile.theme === 'dark'
                      ? 'border-cyan-500 bg-cyan-500/10 dark:bg-[#090D18] text-cyan-600 dark:text-cyan-400 shadow-[0_0_12px_rgba(0,245,255,0.25)]'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-[#121829]'
                  }`}
                >
                  <Moon className="w-4 h-4 text-cyan-400" />
                  حالت تاریک نئونی (Dark)
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              {saveSuccess && (
                <span className="text-emerald-500 flex items-center gap-1 font-bold">
                  <Check className="w-4 h-4" /> تغییرات با موفقیت ذخیره شد
                </span>
              )}
              <button
                type="submit"
                className="mr-auto px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 rounded-xl font-bold shadow-[0_0_12px_rgba(0,245,255,0.25)] transition-all cursor-pointer active:scale-95"
              >
                ذخیره تغییرات پروفایل
              </button>
            </div>
          </form>
        </div>

        {/* Section 2: School Bell Times */}
        <div className="bg-white dark:bg-[#0D1222] p-6 rounded-2xl border border-slate-200 dark:border-slate-800/80 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-cyan-400" />
            ساعت شروع و پایان زنگ‌های مدرسه
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            ساعات زنگ‌ها به صورت خودکار در جدول برنامه هفتگی مدرسه منعکس می‌شوند.
          </p>

          <div className="space-y-3">
            {bellTimes.map((bell, idx) => (
              <div
                key={bell.period}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-[#090D18] border border-slate-200 dark:border-slate-800 text-xs"
              >
                <span className="font-bold text-slate-800 dark:text-slate-200 w-24">
                  {bell.title}
                </span>

                <div className="flex items-center gap-2">
                  <input
                    type="time"
                    value={bell.startTime}
                    onChange={(e) => handleBellTimeChange(idx, 'startTime', e.target.value)}
                    className="px-2 py-1 bg-white dark:bg-[#0D1222] border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-mono text-slate-900 dark:text-white"
                  />
                  <span className="text-slate-400">تا</span>
                  <input
                    type="time"
                    value={bell.endTime}
                    onChange={(e) => handleBellTimeChange(idx, 'endTime', e.target.value)}
                    className="px-2 py-1 bg-white dark:bg-[#0D1222] border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-mono text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={handleSaveProfile}
            className="w-full py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 text-xs font-bold rounded-xl shadow-[0_0_12px_rgba(0,245,255,0.2)] transition-all cursor-pointer"
          >
            ذخیره زمان‌بندی زنگ‌ها
          </button>
        </div>
      </div>

      {/* Section 3: Backup & Restore */}
      <div className="bg-white dark:bg-[#0D1222] p-6 rounded-2xl border border-slate-200 dark:border-slate-800/80 shadow-sm space-y-5">
        <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#39FF88]" />
          پشتیبان‌گیری، بازیابی و ایمنی داده‌ها
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          تمام اطلاعات شما به شکل محلی در مرورگر ذخیره شده است. برای حفظ داده‌ها در دستگاه‌های دیگر یا جلوگیری از پاک‌شدن، از فایل پشتیبان JSON استفاده کنید.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {/* Action 1: Export */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[#090D18] space-y-3 text-xs">
            <span className="font-bold text-slate-800 dark:text-slate-200 block">
              خروجی گرفتن (Export)
            </span>
            <p className="text-slate-500 dark:text-slate-400 text-[11px] leading-relaxed">
              دانلود یک فایل حاوی کل برنامه‌ها، نمرات، مهارت‌ها و وظایف.
            </p>
            <button
              onClick={exportBackup}
              className="w-full py-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-[0_0_12px_rgba(16,185,129,0.3)] transition-all cursor-pointer"
            >
              <Download className="w-4 h-4" />
              دانلود فایل پشتیبان JSON
            </button>
          </div>

          {/* Action 2: Import */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[#090D18] space-y-2 text-xs md:col-span-2">
            <span className="font-bold text-slate-800 dark:text-slate-200 block">
              بازیابی از فایل پشتیبان (Import)
            </span>
            <form onSubmit={handleImportSubmit} className="space-y-2">
              <textarea
                rows={2}
                value={importJson}
                onChange={(e) => setImportJson(e.target.value)}
                placeholder="محتوای متنی فایل JSON را اینجا قرار دهید..."
                className="w-full p-2.5 bg-white dark:bg-[#0D1222] border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-mono text-slate-900 dark:text-white focus:border-cyan-400 focus:outline-hidden"
              />
              <div className="flex items-center justify-between">
                {importSuccess && (
                  <span className="text-emerald-500 font-bold flex items-center gap-1 text-xs">
                    <Check className="w-4 h-4" /> داده‌ها با موفقیت بازیابی شدند
                  </span>
                )}
                {importError && (
                  <span className="text-rose-500 font-bold flex items-center gap-1 text-xs">
                    <AlertTriangle className="w-4 h-4" /> ساختار JSON نامعتبر است!
                  </span>
                )}
                <button
                  type="submit"
                  className="mr-auto px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold rounded-xl flex items-center gap-1 shadow-[0_0_12px_rgba(0,245,255,0.2)] transition-all cursor-pointer"
                >
                  <Upload className="w-4 h-4" />
                  بازیابی اطلاعات
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Action 3: Reset to Default */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div>
            <span className="font-bold text-rose-500 block">پاکسازی یا بازنشانی داده‌ها</span>
            <span className="text-slate-400">شروع از ابتدا با پاک‌سازی کامل تمام اطلاعات سامانه</span>
          </div>
          <button
            onClick={() => {
              if (confirm('آیا مطمئن هستید؟ تمام تغییرات شما پاک خواهد شد.')) {
                resetToDefault();
              }
            }}
            className="px-4 py-2 border border-rose-500/30 text-rose-500 hover:bg-rose-500/10 rounded-xl font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            پاکسازی و بازنشانی
          </button>
        </div>
      </div>
    </div>
  );
};
