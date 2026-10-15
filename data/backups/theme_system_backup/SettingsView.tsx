import React, { useState, useEffect } from 'react';
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
  Lock,
  Trash2,
  RotateCcw,
  Cloud,
  Database,
  KeyRound,
  FileText,
  CheckCircle2,
  LogIn,
  LogOut,
  UserPlus,
  Calendar,
  Palette,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { toPersianDigits, formatJalaliFull } from '../../utils/jalali';
import { SchoolBellTime, TrashItem } from '../../types';
import { AVATAR_OPTIONS } from '../../utils/avatars';
import { CustomizationView } from './CustomizationView';

export const SettingsView: React.FC = () => {
  const {
    profile,
    updateProfile,
    exportBackup,
    importBackup,
    resetToDefault,
    currentUser,
    syncStatus,
    syncWithServer,
    changePassword,
    updateAuthProfile,
    deleteAccount,
    logout,
    setIsAuthModalOpen,
    openAuthModal,
    serverSnapshots,
    refreshSnapshots,
    restoreServerSnapshot,
    createManualSnapshot,
    exportServerBackup,
    importServerBackup,
    trash,
    restoreFromTrash,
    emptyTrash,
    deleteFromTrashPermanently,
    showToast,
  } = useApp();

  type SettingsTab = 'profile' | 'customization' | 'account' | 'cloud' | 'trash';
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');

  useEffect(() => {
    const handleOpenCustomization = () => {
      setActiveTab('customization');
    };
    window.addEventListener('pathly_open_customization', handleOpenCustomization);
    return () => window.removeEventListener('pathly_open_customization', handleOpenCustomization);
  }, []);

  // Profile states
  const [name, setName] = useState(profile.name);
  const [gradeOrField, setGradeOrField] = useState(profile.gradeOrField);
  const [selectedAvatar, setSelectedAvatar] = useState(profile.avatarSeed || 'cyber-neon');
  const [bellTimes, setBellTimes] = useState<SchoolBellTime[]>(profile.bellTimes || []);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Password change states
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passLoading, setPassLoading] = useState(false);
  const [passError, setPassError] = useState<string | null>(null);
  const [passSuccess, setPassSuccess] = useState(false);

  // Security question states
  const [secQuestion, setSecQuestion] = useState(currentUser?.securityQuestion || 'نام اولین مدرسه شما چیست؟');
  const [secAnswer, setSecAnswer] = useState('');
  const [secLoading, setSecLoading] = useState(false);
  const [secSuccess, setSecSuccess] = useState(false);

  // Manual snapshot states
  const [snapshotReason, setSnapshotReason] = useState('');
  const [snapshotLoading, setSnapshotLoading] = useState(false);

  // Import JSON states
  const [importJson, setImportJson] = useState('');
  const [importError, setImportError] = useState(false);
  const [importSuccess, setImportSuccess] = useState(false);

  // Account deletion states
  const [deletePass, setDeletePass] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    setName(profile.name);
    setGradeOrField(profile.gradeOrField);
    setSelectedAvatar(profile.avatarSeed || 'cyber-neon');
    setBellTimes(profile.bellTimes || []);
  }, [profile]);

  useEffect(() => {
    if (currentUser) {
      refreshSnapshots();
    }
  }, [currentUser]);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      name: name.trim(),
      gradeOrField: gradeOrField.trim(),
      avatarSeed: selectedAvatar,
      bellTimes,
    });
    if (currentUser && name.trim() !== currentUser.name) {
      updateAuthProfile({ name: name.trim() });
    }
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleBellTimeChange = (index: number, field: 'startTime' | 'endTime', value: string) => {
    const updated = [...bellTimes];
    updated[index] = { ...updated[index], [field]: value };
    setBellTimes(updated);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassError(null);
    setPassSuccess(false);

    if (newPassword.length < 6) {
      setPassError('رمز عبور جدید باید حداقل ۶ کاراکتر باشد.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPassError('تکرار رمز عبور جدید مطابقت ندارد.');
      return;
    }

    try {
      setPassLoading(true);
      await changePassword(oldPassword, newPassword);
      setPassSuccess(true);
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPassSuccess(false), 3500);
    } catch (err: any) {
      setPassError(err.message || 'خطا در تغییر رمز عبور');
    } finally {
      setPassLoading(false);
    }
  };

  const handleUpdateSecurity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!secAnswer.trim()) {
      showToast('لطفاً پاسخ سؤال امنیتی را وارد کنید.');
      return;
    }
    try {
      setSecLoading(true);
      await updateAuthProfile({ securityQuestion: secQuestion, securityAnswer: secAnswer });
      setSecSuccess(true);
      setSecAnswer('');
      setTimeout(() => setSecSuccess(false), 3000);
    } catch (err: any) {
      showToast(err.message || 'خطا در ویرایش سوال امنیتی');
    } finally {
      setSecLoading(false);
    }
  };

  const handleCreateSnapshot = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSnapshotLoading(true);
      await createManualSnapshot(snapshotReason.trim() || 'نقطه بازیابی ایجاد شده توسط کاربر');
      setSnapshotReason('');
    } finally {
      setSnapshotLoading(false);
    }
  };

  const handleImportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!importJson.trim()) return;
    try {
      let parsed = JSON.parse(importJson);
      let ok: boolean;
      if (currentUser) {
        ok = await importServerBackup(parsed);
      } else {
        ok = importBackup(importJson);
      }
      if (ok) {
        setImportSuccess(true);
        setImportError(false);
        setImportJson('');
        setTimeout(() => setImportSuccess(false), 3000);
      } else {
        setImportError(true);
      }
    } catch {
      setImportError(true);
      setImportSuccess(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!deletePass) {
      showToast('لطفاً رمز عبور خود را برای تایید حذف وارد کنید.');
      return;
    }
    if (confirm('هشدار نهایی: با حذف حساب کاربری، کلیه اطلاعات، پروژه‌ها و سوابق شما برای همیشه پاک خواهد شد. آیا مطمئنید؟')) {
      try {
        await deleteAccount(deletePass);
        setShowDeleteConfirm(false);
      } catch (err: any) {
        showToast(err.message || 'خطا در حذف حساب کاربری');
      }
    }
  };

  const getTrashTypeLabel = (type: TrashItem['itemType']) => {
    switch (type) {
      case 'subject': return 'درس مدرسه';
      case 'homework': return 'تکلیف';
      case 'exam': return 'آزمون';
      case 'skill': return 'مهارت';
      case 'project': return 'پروژه';
      case 'competition': return 'مسابقه';
      case 'goal': return 'هدف';
      case 'note': return 'یادداشت';
      case 'habit': return 'عادت';
      case 'calendarEvent': return 'رویداد تقویم';
      case 'resource': return 'منبع یادگیری';
      default: return 'مورد';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white dark:bg-[#0D1222] p-6 rounded-2xl border border-slate-200 dark:border-cyan-500/25 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-32 bg-cyan-500/5 dark:bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
              <span className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20 shadow-[0_0_12px_rgba(0,245,255,0.25)]">
                <SettingsIcon className="w-6 h-6" />
              </span>
              تنظیمات سامانه، حساب و ایمنی اطلاعات
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              مدیریت حساب چندکاربره، ذخیره‌سازی ابری دائمی، سطل بازیافت و نقاط بازگردانی (Snapshots)
            </p>
          </div>

          {/* Quick User Status Badge */}
          <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#090D18] border border-slate-200 dark:border-slate-800 text-xs">
            <span className={`w-2.5 h-2.5 rounded-full ${currentUser ? 'bg-emerald-400 ring-2 ring-emerald-400/20' : 'bg-amber-400 ring-2 ring-amber-400/20'}`} />
            <div className="flex flex-col text-right">
              <span className="font-bold text-slate-800 dark:text-slate-200">
                {currentUser ? currentUser.name : 'کاربر مهمان (آفلاین)'}
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400">
                {currentUser ? `@${currentUser.username} (${currentUser.role === 'admin' ? 'مدیر' : 'کاربر'})` : 'داده‌ها فقط محلی هستند'}
              </span>
            </div>
            {!currentUser && (
              <button
                onClick={() => openAuthModal('login')}
                className="mr-2 px-2.5 py-1 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-lg text-xs transition-colors cursor-pointer"
              >
                ورود
              </button>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1.5 sm:gap-2 mt-6 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto text-xs font-bold">
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'profile'
                ? 'bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#172033]'
            }`}
          >
            <User className="w-4 h-4" />
            <span>مشخصات و نمایه</span>
          </button>

          <button
            onClick={() => setActiveTab('customization')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'customization'
                ? 'bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30 font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#172033]'
            }`}
          >
            <Palette className="w-4 h-4 text-cyan-400" />
            <span>شخصی‌سازی سایت و ظاهر</span>
          </button>

          <button
            onClick={() => setActiveTab('account')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'account'
                ? 'bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#172033]'
            }`}
          >
            <Lock className="w-4 h-4" />
            <span>حساب کاربری و امنیت</span>
          </button>

          <button
            onClick={() => setActiveTab('cloud')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'cloud'
                ? 'bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#172033]'
            }`}
          >
            <Cloud className="w-4 h-4" />
            <span>پایگاه داده و پشتیبان‌گیری</span>
            {serverSnapshots.length > 0 && (
              <span className="px-1.5 py-0.2 bg-cyan-500/20 text-cyan-400 rounded-full text-[10px]">
                {toPersianDigits(serverSnapshots.length)}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('trash')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'trash'
                ? 'bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#172033]'
            }`}
          >
            <Trash2 className="w-4 h-4" />
            <span>سطل بازیافت (Soft Delete)</span>
            {trash.length > 0 && (
              <span className="px-1.5 py-0.2 bg-rose-500/20 text-rose-400 rounded-full text-[10px]">
                {toPersianDigits(trash.length)}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Tab 1: Profile & Appearance */}
      {activeTab === 'profile' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-[#0D1222] p-6 rounded-2xl border border-slate-200 dark:border-slate-800/80 shadow-sm space-y-5">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <User className="w-4 h-4 text-cyan-400" />
              اطلاعات نمایه، آواتار و پوسته
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

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  آیکون پروفایل:
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

              <div className="pt-2">
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  پوسته سامانه:
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
                    <Check className="w-4 h-4" /> ذخیره شد
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

          {/* Bell Times */}
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
      )}

      {/* Tab: User Customization */}
      {activeTab === 'customization' && <CustomizationView />}

      {/* Tab 2: Multi-User Account & Security */}
      {activeTab === 'account' && (
        <div className="space-y-6">
          {currentUser ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Account Details & Security Question */}
              <div className="bg-white dark:bg-[#0D1222] p-6 rounded-2xl border border-slate-200 dark:border-slate-800/80 shadow-sm space-y-5">
                <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  مشخصات هویتی و سؤال امنیتی حساب
                </h2>

                <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#090D18] border border-slate-200 dark:border-slate-800 space-y-2.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">شناسه کاربر:</span>
                    <span className="font-mono text-slate-700 dark:text-slate-300">{currentUser.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">نام کاربری:</span>
                    <span className="font-bold text-cyan-600 dark:text-cyan-400">@{currentUser.username}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">آدرس ایمیل:</span>
                    <span className="font-mono text-slate-700 dark:text-slate-300">{currentUser.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">سطح دسترسی:</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">
                      {currentUser.role === 'admin' ? 'مدیر ارشد سامانه' : 'کاربر مستقل'}
                    </span>
                  </div>
                </div>

                {/* Security Question Update Form */}
                <form onSubmit={handleUpdateSecurity} className="space-y-3 text-xs pt-2">
                  <h3 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5 text-cyan-400" />
                    ویرایش سؤال امنیتی برای بازیابی رمز عبور:
                  </h3>
                  <div>
                    <input
                      type="text"
                      value={secQuestion}
                      onChange={(e) => setSecQuestion(e.target.value)}
                      placeholder="متن سؤال امنیتی"
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-[#090D18] border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:border-cyan-400 focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      value={secAnswer}
                      onChange={(e) => setSecAnswer(e.target.value)}
                      placeholder="پاسخ محرمانه شما (هش شده ذخیره می‌شود)"
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-[#090D18] border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:border-cyan-400 focus:outline-hidden"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    {secSuccess && <span className="text-emerald-500 font-bold">سوال امنیتی ثبت شد.</span>}
                    <button
                      type="submit"
                      disabled={secLoading}
                      className="mr-auto px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-[#172033] dark:hover:bg-[#1f2b45] text-slate-800 dark:text-slate-200 font-bold rounded-xl transition-all cursor-pointer"
                    >
                      {secLoading ? 'در حال ثبت...' : 'بروزرسانی سؤال امنیتی'}
                    </button>
                  </div>
                </form>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <button
                    onClick={() => setIsAuthModalOpen(true)}
                    className="px-3.5 py-2 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    <span>ورود به حساب کاربری دیگر</span>
                  </button>

                  <button
                    onClick={logout}
                    className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>خروج از حساب</span>
                  </button>
                </div>
              </div>

              {/* Password Change Form & Danger Zone */}
              <div className="space-y-6">
                <div className="bg-white dark:bg-[#0D1222] p-6 rounded-2xl border border-slate-200 dark:border-slate-800/80 shadow-sm space-y-4 text-xs">
                  <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Lock className="w-4 h-4 text-cyan-400" />
                    تغییر رمز عبور حساب
                  </h2>

                  <form onSubmit={handleChangePassword} className="space-y-3">
                    <div>
                      <label className="block text-slate-600 dark:text-slate-400 mb-1">رمز عبور فعلی:</label>
                      <input
                        type="password"
                        required
                        value={oldPassword}
                        onChange={(e) => setOldPassword(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-[#090D18] border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:border-cyan-400 focus:outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 dark:text-slate-400 mb-1">رمز عبور جدید (حداقل ۶ کاراکتر):</label>
                      <input
                        type="password"
                        required
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-[#090D18] border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:border-cyan-400 focus:outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 dark:text-slate-400 mb-1">تکرار رمز عبور جدید:</label>
                      <input
                        type="password"
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-[#090D18] border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:border-cyan-400 focus:outline-hidden"
                      />
                    </div>

                    {passError && <div className="p-2.5 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-xl">{passError}</div>}
                    {passSuccess && <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-xl">رمز عبور با موفقیت به‌روزرسانی شد.</div>}

                    <button
                      type="submit"
                      disabled={passLoading}
                      className="w-full py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold rounded-xl shadow-[0_0_12px_rgba(0,245,255,0.2)] transition-all cursor-pointer"
                    >
                      {passLoading ? 'در حال ثبت...' : 'ثبت رمز عبور جدید'}
                    </button>
                  </form>
                </div>

                {/* Danger Zone: Account Deletion */}
                <div className="bg-rose-500/5 dark:bg-rose-950/20 p-6 rounded-2xl border border-rose-500/30 space-y-3 text-xs">
                  <h3 className="text-sm font-bold text-rose-600 dark:text-rose-400 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    منطقه حساس: حذف حساب کاربری
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-[11px]">
                    با حذف حساب، تمام اطلاعات شخصی، برنامه‌ها، نمرات و سوابق شما از پایگاه داده سرور پاک خواهند شد.
                  </p>

                  {!showDeleteConfirm ? (
                    <button
                      onClick={() => setShowDeleteConfirm(true)}
                      className="px-4 py-2 border border-rose-500/40 text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 rounded-xl font-bold transition-all cursor-pointer"
                    >
                      درخواست حذف دائمی حساب
                    </button>
                  ) : (
                    <div className="p-3.5 bg-white dark:bg-[#090D18] rounded-xl border border-rose-500/40 space-y-2.5">
                      <label className="block text-slate-700 dark:text-slate-300 font-semibold">
                        جهت تایید، لطفاً رمز عبور فعلی خود را وارد کنید:
                      </label>
                      <input
                        type="password"
                        value={deletePass}
                        onChange={(e) => setDeletePass(e.target.value)}
                        placeholder="رمز عبور شما"
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-[#0D1222] border border-rose-500/30 rounded-xl text-slate-900 dark:text-white text-xs focus:outline-hidden"
                      />
                      <div className="flex items-center gap-2 pt-1">
                        <button
                          onClick={handleDeleteAccount}
                          className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl transition-all cursor-pointer"
                        >
                          تایید و حذف دائمی حساب
                        </button>
                        <button
                          onClick={() => { setShowDeleteConfirm(false); setDeletePass(''); }}
                          className="px-3 py-2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 cursor-pointer"
                        >
                          انصراف
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-[#0D1222] p-8 rounded-2xl border border-slate-200 dark:border-slate-800/80 text-center space-y-4">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center">
                <LogIn className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                شما در حال حاضر با حساب مهمان وارد شده‌اید
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
                برای ذخیره دائمی کلیه اطلاعات در پایگاه داده سرور، دسترسی از دستگاه‌های دیگر و امکان استفاده همزمان با دوستان، لطفاً حساب مستقل خود را ایجاد کنید یا وارد شوید.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => openAuthModal('login')}
                  className="px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-bold rounded-xl shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all cursor-pointer flex items-center gap-2"
                >
                  <LogIn className="w-4 h-4" />
                  <span>ورود به حساب کاربری</span>
                </button>
                <button
                  onClick={() => openAuthModal('register')}
                  className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-cyan-500/30 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-2"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>ثبت‌نام حساب مستقل</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Cloud Database, Snapshots & Backups */}
      {activeTab === 'cloud' && (
        <div className="space-y-6">
          {/* Cloud Sync Status & Manual Checkpoint */}
          <div className="bg-white dark:bg-[#0D1222] p-6 rounded-2xl border border-slate-200 dark:border-slate-800/80 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Database className="w-4 h-4 text-cyan-400" />
                  وضعیت ذخیره‌سازی ابری و نقاط بازگردانی (Snapshots)
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  پایگاه داده سرور تمامی اطلاعات شما را به صورت خودکار و ایزوله ذخیره می‌کند.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={syncWithServer}
                  className="px-4 py-2 bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${syncStatus === 'syncing' ? 'animate-spin' : ''}`} />
                  <span>همگام‌سازی فوری با سرور</span>
                </button>
              </div>
            </div>

            {/* Create Snapshot Form */}
            {currentUser && (
              <form onSubmit={handleCreateSnapshot} className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center gap-2 text-xs">
                <input
                  type="text"
                  value={snapshotReason}
                  onChange={(e) => setSnapshotReason(e.target.value)}
                  placeholder="عنوان یا دلیل ایجاد نقطه بازگردانی (مثلاً: قبل از شروع امتحانات نهایی)..."
                  className="flex-1 px-3 py-2 bg-slate-50 dark:bg-[#090D18] border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white text-xs focus:border-cyan-400 focus:outline-hidden"
                />
                <button
                  type="submit"
                  disabled={snapshotLoading}
                  className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap shadow-[0_0_12px_rgba(16,185,129,0.2)]"
                >
                  {snapshotLoading ? 'در حال ثبت...' : 'ایجاد نسخه پشتیبان لحظه‌ای (Snapshot)'}
                </button>
              </form>
            )}

            {/* Historical Snapshots Table */}
            {currentUser && (
              <div className="space-y-2 pt-2">
                <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  نقاط بازگردانی سرور برای حساب شما ({toPersianDigits(serverSnapshots.length)} نسخه):
                </h3>
                {serverSnapshots.length === 0 ? (
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#090D18] text-center text-xs text-slate-400">
                    هنوز نسخه پشتیبان لحظه‌ای ثبت نشده است. می‌توانید با فرم بالا یک نقطه بازگردانی ایجاد کنید.
                  </div>
                ) : (
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {serverSnapshots.map((snap) => (
                      <div
                        key={snap.id}
                        className="p-3 rounded-xl bg-slate-50 dark:bg-[#090D18] border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs"
                      >
                        <div className="flex flex-col text-right">
                          <span className="font-bold text-slate-800 dark:text-slate-200">{snap.reason}</span>
                          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                            {new Date(snap.createdAt).toLocaleString('fa-IR')}
                          </span>
                        </div>
                        <button
                          onClick={() => {
                            if (confirm(`آیا می‌خواهید سامانه را به نسخه «${snap.reason}» بازگردانید؟ (یک نسخه ایمنی از وضعیت فعلی شما نیز ذخیره خواهد شد)`)) {
                              restoreServerSnapshot(snap.id);
                            }
                          }}
                          className="px-3 py-1.5 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 border border-cyan-500/25 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>بازگردانی (Restore)</span>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Standalone JSON Backup & Restore */}
          <div className="bg-white dark:bg-[#0D1222] p-6 rounded-2xl border border-slate-200 dark:border-slate-800/80 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Download className="w-4 h-4 text-emerald-400" />
              خروجی و ورودی فایل پشتیبان JSON (آفلاین / قابل انتقال)
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[#090D18] space-y-3 text-xs">
                <span className="font-bold text-slate-800 dark:text-slate-200 block">
                  خروجی فایل JSON
                </span>
                <p className="text-slate-500 dark:text-slate-400 text-[11px] leading-relaxed">
                  دانلود یک فایل حاوی کلیه اطلاعات سامانه برای نگهداری شخصی یا انتقال به سیستمی دیگر.
                </p>
                <button
                  onClick={currentUser ? exportServerBackup : exportBackup}
                  className="w-full py-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-[0_0_12px_rgba(16,185,129,0.25)] transition-all cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  دانلود فایل پشتیبان
                </button>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[#090D18] space-y-2 text-xs md:col-span-2">
                <span className="font-bold text-slate-800 dark:text-slate-200 block">
                  بازیابی از فایل JSON
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
                        <Check className="w-4 h-4" /> اطلاعات با موفقیت بازیابی و ذخیره شد
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
                      اعمال و بازیابی
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* Reset to Default */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
              <div>
                <span className="font-bold text-rose-500 block">بازنشانی کامل داده‌ها به نمونه اولیه</span>
                <span className="text-slate-400">تمام داده‌های فعلی به حالت پیش‌فرض پروژه بازنشانی خواهند شد.</span>
              </div>
              <button
                onClick={() => {
                  if (confirm('آیا مطمئن هستید؟ تمام اطلاعات شما به داده‌های اولیه بازمی‌گردد.')) {
                    resetToDefault();
                  }
                }}
                className="px-4 py-2 border border-rose-500/30 text-rose-500 hover:bg-rose-500/10 rounded-xl font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                بازنشانی به حالت پیش‌فرض
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Soft Delete / Trash Management */}
      {activeTab === 'trash' && (
        <div className="bg-white dark:bg-[#0D1222] p-6 rounded-2xl border border-slate-200 dark:border-slate-800/80 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Trash2 className="w-4 h-4 text-rose-400" />
                سطل بازیافت و محافظت در برابر حذف تصادفی (Soft Delete)
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                تمام مواردی که در بخش‌های مختلف حذف می‌کنید به این سطل منتقل می‌شوند و تا زمان تخلیه نهایی، قابل بازیابی هستند.
              </p>
            </div>

            {trash.length > 0 && (
              <button
                onClick={() => {
                  if (confirm('آیا از تخلیه کامل سطل بازیافت و حذف دائمی تمام موارد مطمئن هستید؟')) {
                    emptyTrash();
                  }
                }}
                className="px-3.5 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>تخلیه کامل سطل بازیافت</span>
              </button>
            )}
          </div>

          {trash.length === 0 ? (
            <div className="py-12 text-center space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                سطل بازیافت خالی است
              </h3>
              <p className="text-xs text-slate-400">
                هیچ مورد اخیراً حذف‌شده‌ای در سامانه وجود ندارد.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {trash.map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#090D18] border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="px-2 py-1 bg-slate-200 dark:bg-[#172033] text-slate-700 dark:text-slate-300 rounded-lg text-[10px] font-bold shrink-0">
                      {getTrashTypeLabel(item.itemType)}
                    </span>
                    <div className="flex flex-col min-w-0">
                      <span className="font-bold text-slate-900 dark:text-white truncate">
                        {item.title}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        حذف شده در: {new Date(item.deletedAt).toLocaleString('fa-IR')}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => restoreFromTrash(item.id)}
                      className="px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>بازیابی به برنامه</span>
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`حذف همیشگی «${item.title}»؟ این عمل غیرقابل بازگشت است.`)) {
                          deleteFromTrashPermanently(item.id);
                        }
                      }}
                      className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg transition-colors cursor-pointer"
                      title="حذف همیشگی"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
