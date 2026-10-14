import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  User,
  Bell,
  Clock,
  Download,
  Upload,
  RefreshCw,
  Trash2,
  Check,
  AlertTriangle,
  Sun,
  Moon,
  ShieldCheck,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { toPersianDigits } from '../../utils/jalali';
import { SchoolBellTime } from '../../types';

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
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
          <span className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
            <SettingsIcon className="w-6 h-6" />
          </span>
          تنظیمات سامانه و مدیریت اطلاعات
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          پیکربندی حساب کاربری، ساعت زنگ‌های مدرسه، پوسته و پشتیبان‌گیری
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Section 1: User Profile & Theme */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <User className="w-4 h-4 text-blue-600" />
            اطلاعات حساب و ظاهر
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
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
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
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
              />
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
                  className={`p-3 rounded-xl border flex items-center justify-center gap-2 font-bold transition-all ${
                    profile.theme === 'light'
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/40 text-blue-600'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600'
                  }`}
                >
                  <Sun className="w-4 h-4" />
                  حالت روشن (Light)
                </button>
                <button
                  type="button"
                  onClick={() => updateProfile({ theme: 'dark' })}
                  className={`p-3 rounded-xl border flex items-center justify-center gap-2 font-bold transition-all ${
                    profile.theme === 'dark'
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/40 text-blue-600'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600'
                  }`}
                >
                  <Moon className="w-4 h-4" />
                  حالت تیره (Dark)
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              {saveSuccess && (
                <span className="text-emerald-600 flex items-center gap-1 font-bold">
                  <Check className="w-4 h-4" /> تغییرات ذخیره شد
                </span>
              )}
              <button
                type="submit"
                className="mr-auto px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold"
              >
                ذخیره پروفایل
              </button>
            </div>
          </form>
        </div>

        {/* Section 2: School Bell Times */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-indigo-600" />
            ساعت شروع و پایان زنگ‌های مدرسه
          </h2>
          <p className="text-xs text-slate-500">
            ساعات زنگ‌ها به صورت خودکار در جدول برنامه هفتگی مدرسه منعکس می‌شوند.
          </p>

          <div className="space-y-3">
            {bellTimes.map((bell, idx) => (
              <div
                key={bell.period}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-xs"
              >
                <span className="font-bold text-slate-800 dark:text-slate-200 w-24">
                  {bell.title}
                </span>

                <div className="flex items-center gap-2">
                  <input
                    type="time"
                    value={bell.startTime}
                    onChange={(e) => handleBellTimeChange(idx, 'startTime', e.target.value)}
                    className="px-2 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                  />
                  <span className="text-slate-400">تا</span>
                  <input
                    type="time"
                    value={bell.endTime}
                    onChange={(e) => handleBellTimeChange(idx, 'endTime', e.target.value)}
                    className="px-2 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                  />
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={handleSaveProfile}
            className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl"
          >
            ذخیره زمان‌بندی زنگ‌ها
          </button>
        </div>
      </div>

      {/* Section 3: Backup & Restore */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
        <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          پشتیبان‌گیری، بازیابی و ایمنی داده‌ها
        </h2>
        <p className="text-xs text-slate-500">
          تمام اطلاعات شما به شکل محلی در مرورگر ذخیره شده است. برای حفظ داده‌ها در دستگاه‌های دیگر یا جلوگیری از پاک‌شدن، از فایل پشتیبان JSON استفاده کنید.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {/* Action 1: Export */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-3 text-xs">
            <span className="font-bold text-slate-800 dark:text-slate-200 block">
              خروجی گرفتن (Export)
            </span>
            <p className="text-slate-500 text-[11px] leading-relaxed">
              دانلود یک فایل حاوی کل برنامه‌ها، نمرات، مهارت‌ها و وظایف.
            </p>
            <button
              onClick={exportBackup}
              className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl flex items-center justify-center gap-1.5"
            >
              <Download className="w-4 h-4" />
              دانلود فایل پشتیبان JSON
            </button>
          </div>

          {/* Action 2: Import */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-2 text-xs md:col-span-2">
            <span className="font-bold text-slate-800 dark:text-slate-200 block">
              بازیابی از فایل پشتیبان (Import)
            </span>
            <form onSubmit={handleImportSubmit} className="space-y-2">
              <textarea
                rows={2}
                value={importJson}
                onChange={(e) => setImportJson(e.target.value)}
                placeholder="محتوای متنی فایل JSON را اینجا قرار دهید..."
                className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono"
              />
              <div className="flex items-center justify-between">
                {importSuccess && (
                  <span className="text-emerald-600 font-bold flex items-center gap-1 text-xs">
                    <Check className="w-4 h-4" /> داده‌ها با موفقیت بازیابی شدند
                  </span>
                )}
                {importError && (
                  <span className="text-red-500 font-bold flex items-center gap-1 text-xs">
                    <AlertTriangle className="w-4 h-4" /> ساختار JSON نامعتبر است!
                  </span>
                )}
                <button
                  type="submit"
                  className="mr-auto px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl flex items-center gap-1"
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
            <span className="font-bold text-red-600 block">بازنشانی کامل سامانه</span>
            <span className="text-slate-400">بازگرداندن تمام داده‌ها به نمونه اولیه پیش‌فرض</span>
          </div>
          <button
            onClick={() => {
              if (confirm('آیا مطمئن هستید؟ تمام تغییرات شما پاک شده و نمونه داده اولیه بارگذاری می‌شود.')) {
                resetToDefault();
              }
            }}
            className="px-4 py-2 border border-red-200 dark:border-red-900/60 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl font-bold flex items-center gap-1.5 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            بازنشانی به حالت پیش‌فرض
          </button>
        </div>
      </div>
    </div>
  );
};
