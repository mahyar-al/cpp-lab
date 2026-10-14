import React, { useState } from 'react';
import {
  X,
  User,
  Mail,
  Lock,
  UserPlus,
  LogIn,
  KeyRound,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Users,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'login' | 'register' | 'recovery';
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, initialTab = 'login' }) => {
  const { login, register, resetPassword, currentUser, logout, showToast } = useApp();

  const [activeTab, setActiveTab] = useState<'login' | 'register' | 'recovery'>(initialTab);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form states
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [name, setName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [securityQuestion, setSecurityQuestion] = useState('نام اولین مدرسه یا معلم دوران کودکی شما چیست؟');
  const [securityAnswer, setSecurityAnswer] = useState('');
  const [newPassword, setNewPassword] = useState('');

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    if (!identifier || !password) {
      setError('لطفاً نام کاربری/ایمیل و رمز عبور را وارد کنید.');
      return;
    }

    try {
      setLoading(true);
      await login(identifier, password);
      showToast('خوش آمدید! ورود به حساب با موفقیت انجام شد.');
      onClose();
    } catch (err: any) {
      setError(err.message || 'خطا در ورود به حساب کاربری');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!name || !username || !email || !password) {
      setError('لطفاً همه فیلدهای ستاره‌دار را تکمیل کنید.');
      return;
    }

    if (password.length < 6) {
      setError('رمز عبور باید حداقل ۶ کاراکتر باشد.');
      return;
    }

    if (password !== confirmPassword) {
      setError('تکرار رمز عبور با رمز اصلی یکسان نیست.');
      return;
    }

    try {
      setLoading(true);
      await register(email, username, name, password, securityQuestion, securityAnswer);
      showToast('حساب کاربری مستقل شما ساخته شد و اطلاعات در دیتابیس سرور فعال گردید.');
      onClose();
    } catch (err: any) {
      setError(err.message || 'خطا در ثبت‌نام حساب جدید');
    } finally {
      setLoading(false);
    }
  };

  const handleRecovery = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!identifier || !securityAnswer || !newPassword) {
      setError('لطفاً نام کاربری، پاسخ سؤال امنیتی و رمز جدید را وارد کنید.');
      return;
    }

    if (newPassword.length < 6) {
      setError('رمز عبور جدید باید حداقل ۶ کاراکتر باشد.');
      return;
    }

    try {
      setLoading(true);
      await resetPassword(identifier, securityAnswer, newPassword);
      setSuccessMsg('رمز عبور با موفقیت تغییر کرد. اکنون وارد حساب خود شوید.');
      setActiveTab('login');
      setPassword(newPassword);
    } catch (err: any) {
      setError(err.message || 'خطا در بازیابی رمز عبور');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoSwitch = async (demoName: string, demoUsername: string) => {
    setError(null);
    try {
      setLoading(true);
      // Try login first, or register if not existing
      try {
        await login(demoUsername, '123456');
      } catch {
        await register(
          `${demoUsername}@pathly.app`,
          demoUsername,
          demoName,
          '123456',
          'رنگ مورد علاقه شما چیست؟',
          'آبی'
        );
      }
      showToast(`وارد حساب "${demoName}" شدید.`);
      onClose();
    } catch (err: any) {
      setError(err.message || 'خطا در تغییر حساب کاربری');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#0D1222] border border-slate-200 dark:border-cyan-500/30 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden relative text-right flex flex-col max-h-[90vh]">
        {/* Top Glow Hairline */}
        <div className="h-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500" />

        {/* Modal Header */}
        <div className="p-6 pb-4 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2.5">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-cyan-500" />
                حساب کاربری چندکاربره
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                ذخیره‌سازی دائمی در سرور با تفکیک کامل اطلاعات هر شخص
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="grid grid-cols-3 p-2 bg-slate-50 dark:bg-[#090D18] border-b border-slate-100 dark:border-slate-800/80 gap-1.5 text-xs font-semibold">
          <button
            type="button"
            onClick={() => {
              setActiveTab('login');
              setError(null);
            }}
            className={`py-2.5 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'login'
                ? 'bg-white dark:bg-[#13192B] text-cyan-600 dark:text-cyan-400 shadow-sm border border-slate-200/60 dark:border-cyan-500/30'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <LogIn className="w-4 h-4" />
            ورود به حساب
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('register');
              setError(null);
            }}
            className={`py-2.5 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'register'
                ? 'bg-white dark:bg-[#13192B] text-cyan-600 dark:text-cyan-400 shadow-sm border border-slate-200/60 dark:border-cyan-500/30'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            ثبت‌نام جدید
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('recovery');
              setError(null);
            }}
            className={`py-2.5 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'recovery'
                ? 'bg-white dark:bg-[#13192B] text-cyan-600 dark:text-cyan-400 shadow-sm border border-slate-200/60 dark:border-cyan-500/30'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <KeyRound className="w-4 h-4" />
            بازیابی رمز
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-4">
          {/* Current Logged In Info (if any) */}
          {currentUser && (
            <div className="p-3.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={currentUser.avatarUrl || 'https://api.dicebear.com/7.x/bottts/svg?seed=user'}
                  alt={currentUser.name}
                  className="w-10 h-10 rounded-full border border-cyan-500/40"
                />
                <div>
                  <div className="text-sm font-bold text-cyan-900 dark:text-cyan-100">{currentUser.name}</div>
                  <div className="text-xs text-cyan-700 dark:text-cyan-300">
                    {currentUser.username}@ • حساب فعلی
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  logout();
                  showToast('از حساب کاربری خارج شدید.');
                }}
                className="text-xs text-rose-500 hover:text-rose-600 dark:hover:text-rose-400 font-semibold px-3 py-1.5 rounded-lg border border-rose-500/20 hover:bg-rose-500/10 transition-colors"
              >
                خروج
              </button>
            </div>
          )}

          {/* Feedback Messages */}
          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2 font-medium">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-2 font-medium">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Tab 1: Login */}
          {activeTab === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  نام کاربری یا ایمیل
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="مثال: ali یا ali@example.com"
                    className="w-full pl-3 pr-10 py-2.5 rounded-xl bg-slate-50 dark:bg-[#090D18] border border-slate-200 dark:border-slate-800 focus:border-cyan-500 text-sm text-slate-900 dark:text-white outline-none transition-all placeholder:text-slate-400"
                    dir="ltr"
                  />
                  <User className="w-4 h-4 text-slate-400 absolute right-3.5 top-3" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  رمز عبور
                </label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-3 pr-10 py-2.5 rounded-xl bg-slate-50 dark:bg-[#090D18] border border-slate-200 dark:border-slate-800 focus:border-cyan-500 text-sm text-slate-900 dark:text-white outline-none transition-all placeholder:text-slate-400"
                    dir="ltr"
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute right-3.5 top-3" />
                </div>
              </div>

              <div className="flex justify-between items-center text-xs">
                <button
                  type="button"
                  onClick={() => setActiveTab('recovery')}
                  className="text-cyan-600 dark:text-cyan-400 hover:underline"
                >
                  رمز عبور خود را فراموش کرده‌اید؟
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-sm shadow-lg shadow-cyan-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? 'در حال برقراری ارتباط...' : 'ورود به حساب کاربری'}
                <LogIn className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* Tab 2: Register */}
          {activeTab === 'register' && (
            <form onSubmit={handleRegister} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  نام و نام خانوادگی <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="مثال: پارسا صادقی"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#090D18] border border-slate-200 dark:border-slate-800 focus:border-cyan-500 text-sm text-slate-900 dark:text-white outline-none transition-all placeholder:text-slate-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    نام کاربری انگلیسی <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="parsa_dev"
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-[#090D18] border border-slate-200 dark:border-slate-800 focus:border-cyan-500 text-sm text-slate-900 dark:text-white outline-none transition-all placeholder:text-slate-400 text-left"
                    dir="ltr"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    ایمیل <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="parsa@example.com"
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-[#090D18] border border-slate-200 dark:border-slate-800 focus:border-cyan-500 text-sm text-slate-900 dark:text-white outline-none transition-all placeholder:text-slate-400 text-left"
                    dir="ltr"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    رمز عبور (حداقل ۶ کاراکتر) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-[#090D18] border border-slate-200 dark:border-slate-800 focus:border-cyan-500 text-sm text-slate-900 dark:text-white outline-none transition-all placeholder:text-slate-400 text-left"
                    dir="ltr"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    تکرار رمز عبور <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-[#090D18] border border-slate-200 dark:border-slate-800 focus:border-cyan-500 text-sm text-slate-900 dark:text-white outline-none transition-all placeholder:text-slate-400 text-left"
                    dir="ltr"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  پاسخ سؤال امنیتی (برای بازیابی سریع در آینده)
                </label>
                <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                  {securityQuestion}
                </div>
                <input
                  type="text"
                  value={securityAnswer}
                  onChange={(e) => setSecurityAnswer(e.target.value)}
                  placeholder="پاسخ کوتاه شما..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#090D18] border border-slate-200 dark:border-slate-800 focus:border-cyan-500 text-sm text-slate-900 dark:text-white outline-none transition-all placeholder:text-slate-400"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-sm shadow-lg shadow-emerald-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
              >
                {loading ? 'در حال ثبت‌نام و ایجاد پایگاه داده...' : 'ایجاد حساب کاربری مستقل'}
                <UserPlus className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* Tab 3: Password Recovery */}
          {activeTab === 'recovery' && (
            <form onSubmit={handleRecovery} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  نام کاربری یا ایمیل ثبت شده
                </label>
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="ali یا ali@example.com"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#090D18] border border-slate-200 dark:border-slate-800 focus:border-cyan-500 text-sm text-slate-900 dark:text-white outline-none transition-all placeholder:text-slate-400 text-left"
                  dir="ltr"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  پاسخ سؤال امنیتی
                </label>
                <input
                  type="text"
                  required
                  value={securityAnswer}
                  onChange={(e) => setSecurityAnswer(e.target.value)}
                  placeholder="پاسخی که هنگام ثبت‌نام وارد کرده‌اید"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#090D18] border border-slate-200 dark:border-slate-800 focus:border-cyan-500 text-sm text-slate-900 dark:text-white outline-none transition-all placeholder:text-slate-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  رمز عبور جدید (حداقل ۶ کاراکتر)
                </label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#090D18] border border-slate-200 dark:border-slate-800 focus:border-cyan-500 text-sm text-slate-900 dark:text-white outline-none transition-all placeholder:text-slate-400 text-left"
                  dir="ltr"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white font-bold text-sm shadow-lg shadow-amber-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? 'در حال راستی‌آزمایی...' : 'تأیید و ذخیره رمز جدید'}
                <ShieldCheck className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* Quick Demo Switcher for Friends */}
          <div className="pt-4 mt-2 border-t border-slate-100 dark:border-slate-800/80">
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              سوئیچ سریع برای آزمایش چندکاربره (دوستان و همکلاسی‌ها):
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemoSwitch('سارا حسینی', 'sara')}
                className="p-2.5 text-xs text-right rounded-xl bg-slate-100 dark:bg-[#13192B] hover:bg-cyan-500/10 border border-slate-200 dark:border-slate-800 hover:border-cyan-500/40 transition-all flex items-center gap-2 text-slate-800 dark:text-slate-200"
              >
                <img
                  src="https://api.dicebear.com/7.x/bottts/svg?seed=sara"
                  alt="سارا"
                  className="w-6 h-6 rounded-full"
                />
                <div>
                  <div className="font-bold">حساب سارا</div>
                  <div className="text-[10px] text-slate-500">کاربر مستقل A</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemoSwitch('امیررضا کمالی', 'amirreza')}
                className="p-2.5 text-xs text-right rounded-xl bg-slate-100 dark:bg-[#13192B] hover:bg-cyan-500/10 border border-slate-200 dark:border-slate-800 hover:border-cyan-500/40 transition-all flex items-center gap-2 text-slate-800 dark:text-slate-200"
              >
                <img
                  src="https://api.dicebear.com/7.x/bottts/svg?seed=amirreza"
                  alt="امیررضا"
                  className="w-6 h-6 rounded-full"
                />
                <div>
                  <div className="font-bold">حساب امیررضا</div>
                  <div className="text-[10px] text-slate-500">کاربر مستقل B</div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
