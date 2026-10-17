import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Lock,
  Mail,
  User,
  KeyRound,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  Check,
  X,
  RefreshCw,
  Clock,
  Send,
  HelpCircle,
  ChevronLeft,
  ChevronDown,
  Sparkles,
  Compass,
  Leaf,
  LogOut,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export type AuthMode = 'login' | 'register' | 'forgot_password' | 'recovery_token';

interface AuthPageProps {
  initialMode?: AuthMode;
  onSuccess?: () => void;
  onCancel?: () => void;
  isModal?: boolean;
}

export const AuthPage: React.FC<AuthPageProps> = ({
  initialMode = 'login',
  onSuccess,
  onCancel,
  isModal = false,
}) => {
  const {
    login,
    register,
    resetPassword,
    requestPasswordResetToken,
    resetPasswordWithToken,
    checkAvailability,
    showToast,
    currentUser,
    logout,
  } = useApp();

  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Password visibility
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Remember me & credentials
  const [rememberMe, setRememberMe] = useState(() => {
    return localStorage.getItem('pathly_remember_me') === 'true';
  });
  const [identifier, setIdentifier] = useState(() => {
    return localStorage.getItem('pathly_remember_id') || '';
  });
  const [password, setPassword] = useState('');

  // Register fields
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showSecurityFields, setShowSecurityFields] = useState(false);
  const [securityQuestion, setSecurityQuestion] = useState('نام اولین مدرسه یا معلم دوران کودکی شما چیست؟');
  const [securityAnswer, setSecurityAnswer] = useState('');

  // Recovery fields
  const [recoveryIdentifier, setRecoveryIdentifier] = useState('');
  const [recoveryCode, setRecoveryCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [retrievedQuestion, setRetrievedQuestion] = useState<string | null>(null);
  const [recoveryMethod, setRecoveryMethod] = useState<'token' | 'security_question'>('token');
  const [recoverySimulatedToken, setRecoverySimulatedToken] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number>(0);

  // Field validation status
  const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'available' | 'taken' | 'invalid'>('idle');
  const [emailStatus, setEmailStatus] = useState<'idle' | 'checking' | 'available' | 'taken' | 'invalid'>('idle');

  // Debounced username availability check
  useEffect(() => {
    if (mode !== 'register') return;
    const cleanUser = username.trim().toLowerCase();
    if (!cleanUser) {
      setUsernameStatus('idle');
      return;
    }
    if (cleanUser.length < 3 || !/^[a-z0-9_-]+$/.test(cleanUser)) {
      setUsernameStatus('invalid');
      return;
    }

    setUsernameStatus('checking');
    const timer = setTimeout(async () => {
      try {
        const res = await checkAvailability({ username: cleanUser });
        if (res.usernameAvailable === true) {
          setUsernameStatus('available');
        } else if (res.usernameAvailable === false) {
          setUsernameStatus('taken');
        } else {
          setUsernameStatus('idle');
        }
      } catch {
        setUsernameStatus('idle');
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [username, mode, checkAvailability]);

  // Debounced email availability check
  useEffect(() => {
    if (mode !== 'register') return;
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      setEmailStatus('idle');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setEmailStatus('invalid');
      return;
    }

    setEmailStatus('checking');
    const timer = setTimeout(async () => {
      try {
        const res = await checkAvailability({ email: cleanEmail });
        if (res.emailAvailable === true) {
          setEmailStatus('available');
        } else if (res.emailAvailable === false) {
          setEmailStatus('taken');
        } else {
          setEmailStatus('idle');
        }
      } catch {
        setEmailStatus('idle');
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [email, mode, checkAvailability]);

  // Recovery countdown timer
  useEffect(() => {
    if (countdown <= 0) return;
    const interval = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [countdown]);

  // Calming, friendly password strength assessment
  const calculateStrength = (pwd: string) => {
    if (!pwd) return { score: 0, label: 'خالی', barWidth: '0%', color: 'bg-stone-300 dark:bg-stone-700', textClass: 'text-stone-400' };
    
    let score = 0;
    if (pwd.length >= 6) score += 1;
    if (pwd.length >= 8) score += 1;
    if (/[0-9]/.test(pwd) && /[a-zA-Z]/.test(pwd)) score += 1;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 1;

    if (score <= 1) {
      return { score: 1, label: 'ساده', barWidth: '33%', color: 'bg-amber-400/80 dark:bg-amber-500/80', textClass: 'text-amber-600 dark:text-amber-400' };
    }
    if (score <= 2) {
      return { score: 2, label: 'مناسب', barWidth: '66%', color: 'bg-emerald-500/80 dark:bg-emerald-400/80', textClass: 'text-emerald-600 dark:text-emerald-400' };
    }
    return { score: 3, label: 'بسیار امن و قدرتمند', barWidth: '100%', color: 'bg-emerald-600 dark:bg-emerald-400', textClass: 'text-emerald-600 dark:text-emerald-300' };
  };

  const registerStrength = useMemo(() => calculateStrength(password), [password]);
  const newPasswordStrength = useMemo(() => calculateStrength(newPassword), [newPassword]);

  // Handle Login Submit
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!identifier.trim() || !password) {
      setError('لطفاً نام کاربری یا ایمیل و رمز عبور خود را وارد کنید.');
      return;
    }

    try {
      setLoading(true);
      await login(identifier.trim(), password);

      if (rememberMe) {
        localStorage.setItem('pathly_remember_me', 'true');
        localStorage.setItem('pathly_remember_id', identifier.trim());
      } else {
        localStorage.removeItem('pathly_remember_me');
        localStorage.removeItem('pathly_remember_id');
      }

      showToast('خوش برگشتی! با موفقیت وارد حساب خود شدید.');
      if (onSuccess) onSuccess();
      if (onCancel) onCancel();
    } catch (err: any) {
      setError(err.message || 'نام کاربری یا رمز عبور اشتباه است.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Register Submit
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!name.trim() || !username.trim() || !email.trim() || !password) {
      setError('لطفاً همه موارد ستاره‌دار را تکمیل کنید.');
      return;
    }

    if (usernameStatus === 'taken') {
      setError('این نام کاربری قبلاً توسط کاربر دیگری ثبت شده است.');
      return;
    }

    if (emailStatus === 'taken') {
      setError('این آدرس ایمیل قبلاً در سامانه ثبت شده است.');
      return;
    }

    if (password.length < 6) {
      setError('رمز عبور باید حداقل ۶ نویسه داشته باشد.');
      return;
    }

    if (confirmPassword && password !== confirmPassword) {
      setError('تکرار رمز عبور با رمز وارد شده مطابقت ندارد.');
      return;
    }

    try {
      setLoading(true);
      await register(
        email.trim(),
        username.trim(),
        name.trim(),
        password,
        securityQuestion,
        securityAnswer.trim() || undefined
      );

      if (rememberMe) {
        localStorage.setItem('pathly_remember_me', 'true');
        localStorage.setItem('pathly_remember_id', username.trim());
      }

      showToast('حساب اختصاصی شما ساخته شد. به مسیر آرام پیشرفت خوش آمدید.');
      if (onSuccess) onSuccess();
      if (onCancel) onCancel();
    } catch (err: any) {
      setError(err.message || 'خطا در ثبت‌نام. لطفاً دوباره تلاش فرمایید.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Forgot Password Request
  const handleForgotRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    const targetId = (recoveryIdentifier || identifier).trim();
    if (!targetId) {
      setError('لطفاً نام کاربری یا ایمیل ثبت‌شده را وارد کنید.');
      return;
    }

    try {
      setLoading(true);
      const res = await requestPasswordResetToken(targetId);
      setRetrievedQuestion(res.securityQuestion || 'نام اولین مدرسه یا معلم دوران کودکی شما چیست؟');
      setRecoverySimulatedToken(res.mockVerificationToken || null);
      setCountdown(res.expiresInMinutes ? res.expiresInMinutes * 60 : 15 * 60);

      setSuccessMsg(`درخواست بازیابی ثبت شد. کد تأیید برای حساب ${res.maskedEmail || targetId} ایجاد گردید.`);
      setMode('recovery_token');
    } catch (err: any) {
      setError(err.message || 'کاربری با این مشخصات یافت نشد.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Reset Submit
  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    const targetId = (recoveryIdentifier || identifier).trim();
    if (!targetId) {
      setError('لطفاً نام کاربری یا ایمیل را مشخص کنید.');
      return;
    }

    if (newPassword.length < 6) {
      setError('رمز عبور جدید باید حداقل ۶ نویسه باشد.');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setError('تکرار رمز عبور جدید مطابقت ندارد.');
      return;
    }

    try {
      setLoading(true);
      if (recoveryMethod === 'token') {
        if (!recoveryCode.trim()) {
          setError('لطفاً کد ۶ رقمی را وارد کنید.');
          return;
        }
        await resetPasswordWithToken(targetId, recoveryCode.trim(), newPassword);
      } else {
        if (!securityAnswer.trim()) {
          setError('لطفاً پاسخ سؤال امنیتی را وارد کنید.');
          return;
        }
        await resetPassword(targetId, securityAnswer.trim(), newPassword);
      }

      setSuccessMsg('رمز عبور شما با موفقیت تغییر کرد. در حال انتقال به صفحه ورود...');
      setPassword(newPassword);
      setIdentifier(targetId);
      setTimeout(() => {
        setMode('login');
      }, 1200);
    } catch (err: any) {
      setError(err.message || 'خطا در بازنشانی رمز عبور.');
    } finally {
      setLoading(false);
    }
  };

  const formatCountdown = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div
      className={`w-full ${
        isModal
          ? 'max-w-4xl rounded-3xl bg-white/80 dark:bg-[#0E0E12]/80 backdrop-blur-2xl border border-stone-200/80 dark:border-white/15 shadow-2xl overflow-hidden text-right'
          : 'min-h-[85vh] flex items-center justify-center p-3 sm:p-6 text-right'
      }`}
      dir="rtl"
    >
      <div
        className={`w-full ${
          isModal ? '' : 'max-w-4xl rounded-3xl border border-stone-200/80 dark:border-white/15 bg-white/80 dark:bg-[#0E0E12]/80 backdrop-blur-2xl shadow-2xl'
        } grid grid-cols-1 lg:grid-cols-12 overflow-hidden relative`}
      >
        {/* Ambient Glass Reflections */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-[var(--accent-primary)] opacity-10 dark:opacity-[0.06] rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-violet-500 opacity-10 dark:opacity-[0.05] rounded-full blur-3xl pointer-events-none" />

        {/* ===================== SIDE 1: FORM SECTION (7 cols) ===================== */}
        <div className="lg:col-span-7 p-6 sm:p-8 md:p-10 flex flex-col justify-between relative z-10">
          <div>
            {/* Header row: Brand & Guest link */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-stone-200/60 dark:border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 flex items-center justify-center font-bold text-sm tracking-wider shadow-xs">
                  P
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-base text-stone-900 dark:text-stone-100 tracking-wide font-sans">
                      Pathly
                    </span>
                    <span className="text-[11px] font-medium text-stone-500 dark:text-stone-400">
                      مسیر پیشرفت من
                    </span>
                  </div>
                </div>
              </div>

              {onCancel && (
                <button
                  type="button"
                  onClick={onCancel}
                  className="flex items-center gap-1.5 text-xs text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-200 px-3 py-1.5 rounded-xl bg-stone-500/[0.05] hover:bg-stone-500/[0.1] dark:bg-white/[0.05] dark:hover:bg-white/[0.1] backdrop-blur-sm transition-colors cursor-pointer"
                >
                  <span>ادامه به عنوان مهمان</span>
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Subtle Mode Switcher (Login / Sign Up / Forgot Password) */}
            <div className="flex items-center p-1 bg-stone-500/[0.05] dark:bg-white/[0.05] backdrop-blur-md rounded-xl border border-stone-200/70 dark:border-white/10 mb-6 gap-1 text-xs">
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setError(null);
                  setSuccessMsg(null);
                }}
                className={`flex-1 py-2 px-3 rounded-lg transition-all text-center font-medium cursor-pointer ${
                  mode === 'login'
                    ? 'bg-white dark:bg-white/15 text-stone-900 dark:text-stone-100 shadow-xs font-semibold'
                    : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
                }`}
              >
                ورود به حساب
              </button>

              <button
                type="button"
                onClick={() => {
                  setMode('register');
                  setError(null);
                  setSuccessMsg(null);
                }}
                className={`flex-1 py-2 px-3 rounded-lg transition-all text-center font-medium cursor-pointer ${
                  mode === 'register'
                    ? 'bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 shadow-xs font-semibold'
                    : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
                }`}
              >
                ثبت‌نام جدید
              </button>

              {(mode === 'forgot_password' || mode === 'recovery_token') && (
                <button
                  type="button"
                  className="flex-1 py-2 px-3 rounded-lg bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 shadow-xs font-semibold text-center"
                >
                  بازیابی رمز
                </button>
              )}
            </div>

            {/* Calm Error & Success Banners */}
            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="p-3.5 mb-5 rounded-xl bg-rose-50/90 dark:bg-rose-950/25 border border-rose-200/80 dark:border-rose-900/40 text-rose-800 dark:text-rose-200 text-xs flex items-center gap-2.5 font-medium leading-relaxed"
                >
                  <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
                  <span className="flex-1">{error}</span>
                  <button
                    onClick={() => setError(null)}
                    className="text-rose-500 hover:text-rose-700 dark:hover:text-rose-300 p-0.5 rounded cursor-pointer"
                    aria-label="بستن پیام خطا"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </motion.div>
              )}

              {successMsg && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="p-3.5 mb-5 rounded-xl bg-emerald-50/90 dark:bg-emerald-950/25 border border-emerald-200/80 dark:border-emerald-900/40 text-emerald-800 dark:text-emerald-200 text-xs flex items-center gap-2.5 font-medium leading-relaxed"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span className="flex-1">{successMsg}</span>
                  <button
                    onClick={() => setSuccessMsg(null)}
                    className="text-emerald-500 hover:text-emerald-700 dark:hover:text-emerald-300 p-0.5 rounded cursor-pointer"
                    aria-label="بستن پیام موفقیت"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Currently Logged In Account Notice */}
            {currentUser && (
              <div className="mb-5 p-3.5 rounded-xl bg-stone-100/70 dark:bg-stone-850/60 border border-stone-200/80 dark:border-stone-800 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <img
                    src={currentUser.avatarUrl || 'https://api.dicebear.com/7.x/bottts/svg?seed=user'}
                    alt={currentUser.name}
                    className="w-9 h-9 rounded-full border border-stone-300 dark:border-stone-700 object-cover"
                  />
                  <div>
                    <span className="text-stone-900 dark:text-stone-100 font-semibold block">
                      {currentUser.name}
                    </span>
                    <span className="text-stone-500 dark:text-stone-400 text-[11px]">
                      حساب فعال: @{currentUser.username}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    logout();
                    showToast('با موفقیت از حساب خارج شدید.');
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-stone-600 dark:text-stone-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-stone-200/50 dark:hover:bg-stone-800 rounded-lg transition-colors cursor-pointer text-xs"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>خروج</span>
                </button>
              </div>
            )}

            {/* -------------------- 1. LOGIN VIEW -------------------- */}
            {mode === 'login' && (
              <motion.form
                key="login-form"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.15 }}
                onSubmit={handleLoginSubmit}
                className="space-y-4"
              >
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold text-stone-900 dark:text-stone-100 tracking-tight">
                    خوش برگشتی
                  </h1>
                  <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 leading-relaxed">
                    برای دسترسی به برنامه‌ها، پیگیری اهداف و ثبت گام‌های روزانه وارد شوید.
                  </p>
                </div>

                {/* Email or Username */}
                <div>
                  <label
                    htmlFor="login-identifier"
                    className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1.5"
                  >
                    نام کاربری یا ایمیل <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      id="login-identifier"
                      type="text"
                      required
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      placeholder="ali_dev یا user@example.com"
                      className="w-full pl-3 pr-10 py-2.5 sm:py-3 rounded-xl bg-stone-50/70 dark:bg-stone-900/70 border border-stone-200 dark:border-stone-800 focus:bg-white dark:focus:bg-stone-900 focus:border-[var(--accent-primary)] focus:ring-2 focus:ring-[var(--accent-primary)]/15 text-sm text-stone-900 dark:text-stone-100 outline-none transition-all placeholder:text-stone-400 dark:placeholder:text-stone-500 text-left"
                      dir="ltr"
                      autoFocus
                    />
                    <User className="w-4 h-4 text-stone-400 absolute right-3.5 top-3 sm:top-3.5" />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label
                      htmlFor="login-password"
                      className="block text-xs font-medium text-stone-700 dark:text-stone-300"
                    >
                      رمز عبور <span className="text-rose-500">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setRecoveryIdentifier(identifier);
                        setMode('forgot_password');
                        setError(null);
                        setSuccessMsg(null);
                      }}
                      className="text-[11px] text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-200 transition-colors cursor-pointer"
                    >
                      رمز عبور را فراموش کرده‌اید؟
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      id="login-password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-10 py-2.5 sm:py-3 rounded-xl bg-stone-50/70 dark:bg-stone-900/70 border border-stone-200 dark:border-stone-800 focus:bg-white dark:focus:bg-stone-900 focus:border-[var(--accent-primary)] focus:ring-2 focus:ring-[var(--accent-primary)]/15 text-sm text-stone-900 dark:text-stone-100 outline-none transition-all placeholder:text-stone-400 dark:placeholder:text-stone-500 text-left"
                      dir="ltr"
                    />
                    <Lock className="w-4 h-4 text-stone-400 absolute right-3.5 top-3 sm:top-3.5" />
                    <button
                      type="button"
                      onClick={() => setShowPassword((p) => !p)}
                      className="absolute left-3 top-3 sm:top-3.5 text-stone-400 hover:text-stone-700 dark:hover:text-stone-300 transition-colors cursor-pointer p-0.5"
                      aria-label={showPassword ? 'پنهان‌سازی رمز عبور' : 'نمایش رمز عبور'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Remember Me */}
                <div className="flex items-center justify-between pt-0.5">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-4 h-4 rounded-md border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 peer-checked:bg-[var(--accent-primary)] peer-checked:border-[var(--accent-primary)] flex items-center justify-center transition-all">
                      {rememberMe && <Check className="w-3 h-3 text-white dark:text-stone-950 stroke-[3]" />}
                    </div>
                    <span className="text-xs text-stone-600 dark:text-stone-400">
                      مرا در این دستگاه به خاطر بسپار
                    </span>
                  </label>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 rounded-xl bg-stone-900 hover:bg-stone-800 dark:bg-stone-100 dark:hover:bg-white text-white dark:text-stone-900 font-semibold text-sm transition-all duration-150 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer shadow-xs active:scale-[0.99] mt-2"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>در حال ورود...</span>
                    </>
                  ) : (
                    <>
                      <span>ورود به فضای شخصی</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                {/* Switch to Register */}
                <div className="text-center pt-2 text-xs text-stone-500 dark:text-stone-400">
                  <span>حساب کاربری ندارید؟ </span>
                  <button
                    type="button"
                    onClick={() => {
                      setMode('register');
                      setError(null);
                      setSuccessMsg(null);
                    }}
                    className="text-stone-900 dark:text-stone-100 font-bold hover:underline transition-colors mr-1 cursor-pointer"
                  >
                    فضای خودت را بساز
                  </button>
                </div>
              </motion.form>
            )}

            {/* -------------------- 2. REGISTER VIEW -------------------- */}
            {mode === 'register' && (
              <motion.form
                key="register-form"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.15 }}
                onSubmit={handleRegisterSubmit}
                className="space-y-3.5"
              >
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold text-stone-900 dark:text-stone-100 tracking-tight">
                    فضای خودت را بساز
                  </h1>
                  <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 leading-relaxed">
                    با ساخت حساب مستقل، برنامه‌ها و یادداشت‌های شما همیشه ایمن و همگام خواهند بود.
                  </p>
                </div>

                {/* Display Name */}
                <div>
                  <label
                    htmlFor="reg-name"
                    className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1"
                  >
                    نام و نام خانوادگی <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="reg-name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="مثال: پارسا صادقی"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50/70 dark:bg-stone-900/70 border border-stone-200 dark:border-stone-800 focus:bg-white dark:focus:bg-stone-900 focus:border-[var(--accent-primary)] focus:ring-2 focus:ring-[var(--accent-primary)]/15 text-sm text-stone-900 dark:text-stone-100 outline-none transition-all placeholder:text-stone-400 dark:placeholder:text-stone-500"
                    autoFocus
                  />
                </div>

                {/* Username & Email Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Username with Live Check */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label
                        htmlFor="reg-username"
                        className="block text-xs font-medium text-stone-700 dark:text-stone-300"
                      >
                        نام کاربری انگلیسی <span className="text-rose-500">*</span>
                      </label>
                      {usernameStatus === 'checking' && (
                        <span className="text-[10px] text-stone-400 flex items-center gap-1">
                          <RefreshCw className="w-2.5 h-2.5 animate-spin" /> بررسی...
                        </span>
                      )}
                      {usernameStatus === 'available' && (
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                          ✓ آزاد است
                        </span>
                      )}
                      {usernameStatus === 'taken' && (
                        <span className="text-[10px] text-rose-500 font-medium">
                          ✕ ثبت شده
                        </span>
                      )}
                    </div>
                    <input
                      id="reg-username"
                      type="text"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="parsa_dev"
                      className={`w-full px-3 py-2.5 rounded-xl bg-stone-50/70 dark:bg-stone-900/70 border text-sm text-stone-900 dark:text-stone-100 outline-none transition-all placeholder:text-stone-400 dark:placeholder:text-stone-500 text-left ${
                        usernameStatus === 'available'
                          ? 'border-emerald-500/60 focus:border-emerald-500'
                          : usernameStatus === 'taken'
                          ? 'border-rose-400/80 focus:border-rose-500'
                          : 'border-stone-200 dark:border-stone-800 focus:border-[var(--accent-primary)]'
                      }`}
                      dir="ltr"
                    />
                  </div>

                  {/* Email with Live Check */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label
                        htmlFor="reg-email"
                        className="block text-xs font-medium text-stone-700 dark:text-stone-300"
                      >
                        آدرس ایمیل <span className="text-rose-500">*</span>
                      </label>
                      {emailStatus === 'checking' && (
                        <span className="text-[10px] text-stone-400 flex items-center gap-1">
                          <RefreshCw className="w-2.5 h-2.5 animate-spin" /> بررسی...
                        </span>
                      )}
                      {emailStatus === 'available' && (
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                          ✓ معتبر
                        </span>
                      )}
                      {emailStatus === 'taken' && (
                        <span className="text-[10px] text-rose-500 font-medium">
                          ✕ قبلاً ثبت شده
                        </span>
                      )}
                    </div>
                    <input
                      id="reg-email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="parsa@example.com"
                      className={`w-full px-3 py-2.5 rounded-xl bg-stone-50/70 dark:bg-stone-900/70 border text-sm text-stone-900 dark:text-stone-100 outline-none transition-all placeholder:text-stone-400 dark:placeholder:text-stone-500 text-left ${
                        emailStatus === 'available'
                          ? 'border-emerald-500/60 focus:border-emerald-500'
                          : emailStatus === 'taken'
                          ? 'border-rose-400/80 focus:border-rose-500'
                          : 'border-stone-200 dark:border-stone-800 focus:border-[var(--accent-primary)]'
                      }`}
                      dir="ltr"
                    />
                  </div>
                </div>

                {/* Password & Confirm Password Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label
                      htmlFor="reg-password"
                      className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1"
                    >
                      رمز عبور <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        id="reg-password"
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="حداقل ۶ نویسه"
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-stone-50/70 dark:bg-stone-900/70 border border-stone-200 dark:border-stone-800 focus:border-[var(--accent-primary)] text-sm text-stone-900 dark:text-stone-100 outline-none transition-all placeholder:text-stone-400 dark:placeholder:text-stone-500 text-left"
                        dir="ltr"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((p) => !p)}
                        className="absolute left-2.5 top-3 text-stone-400 hover:text-stone-700 dark:hover:text-stone-300 cursor-pointer p-0.5"
                        aria-label={showPassword ? 'پنهان‌سازی رمز' : 'نمایش رمز'}
                      >
                        {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label
                        htmlFor="reg-confirm-password"
                        className="block text-xs font-medium text-stone-700 dark:text-stone-300"
                      >
                        تکرار رمز عبور <span className="text-rose-500">*</span>
                      </label>
                      {confirmPassword && (
                        <span
                          className={`text-[10px] font-medium ${
                            password === confirmPassword ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500'
                          }`}
                        >
                          {password === confirmPassword ? '✓ یکسان است' : '✕ همخوانی ندارد'}
                        </span>
                      )}
                    </div>
                    <div className="relative">
                      <input
                        id="reg-confirm-password"
                        type={showConfirmPassword ? 'text' : 'password'}
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="تکرار همان رمز"
                        className={`w-full pl-9 pr-3 py-2.5 rounded-xl bg-stone-50/70 dark:bg-stone-900/70 border text-sm text-stone-900 dark:text-stone-100 outline-none transition-all placeholder:text-stone-400 dark:placeholder:text-stone-500 text-left ${
                          confirmPassword && password === confirmPassword
                            ? 'border-emerald-500/60 focus:border-emerald-500'
                            : confirmPassword
                            ? 'border-rose-400/80 focus:border-rose-500'
                            : 'border-stone-200 dark:border-stone-800 focus:border-[var(--accent-primary)]'
                        }`}
                        dir="ltr"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword((p) => !p)}
                        className="absolute left-2.5 top-3 text-stone-400 hover:text-stone-700 dark:hover:text-stone-300 cursor-pointer p-0.5"
                        aria-label={showConfirmPassword ? 'پنهان‌سازی تکرار رمز' : 'نمایش تکرار رمز'}
                      >
                        {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Gentle Password Strength Indicator */}
                {password && (
                  <div className="p-2.5 rounded-xl bg-stone-50 dark:bg-stone-900/40 border border-stone-200/60 dark:border-stone-800/60 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-stone-500 dark:text-stone-400">سطح امنیت رمز:</span>
                      <span className={`font-semibold ${registerStrength.textClass}`}>
                        {registerStrength.label}
                      </span>
                    </div>
                    <div className="w-full bg-stone-200 dark:bg-stone-800 h-1.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 rounded-full ${registerStrength.color}`}
                        style={{ width: registerStrength.barWidth }}
                      />
                    </div>
                    <p className="text-[10px] text-stone-400 dark:text-stone-500">
                      راهنما: حداقل ۶ نویسه، ترجیحاً ترکیبی از حروف و اعداد انگلیسی.
                    </p>
                  </div>
                )}

                {/* Optional Security Question for Calm Account Recovery */}
                <div className="rounded-xl border border-stone-200/80 dark:border-stone-800/80 overflow-hidden bg-stone-50/50 dark:bg-stone-900/30">
                  <button
                    type="button"
                    onClick={() => setShowSecurityFields((prev) => !prev)}
                    className="w-full p-2.5 px-3 flex items-center justify-between text-xs text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200 transition-colors cursor-pointer"
                  >
                    <span className="flex items-center gap-1.5 font-medium">
                      <HelpCircle className="w-3.5 h-3.5 text-stone-400" />
                      سؤال امنیتی جهت بازیابی آسان (اختیاری)
                    </span>
                    <ChevronDown
                      className={`w-3.5 h-3.5 text-stone-400 transition-transform duration-200 ${
                        showSecurityFields ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  {showSecurityFields && (
                    <div className="p-3 pt-0 space-y-2 border-t border-stone-200/60 dark:border-stone-800/60 mt-1">
                      <select
                        value={securityQuestion}
                        onChange={(e) => setSecurityQuestion(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-xs text-stone-800 dark:text-stone-200 outline-none focus:border-[var(--accent-primary)]"
                      >
                        <option value="نام اولین مدرسه یا معلم دوران کودکی شما چیست؟">نام اولین مدرسه یا معلم دوران کودکی شما چیست؟</option>
                        <option value="نام شهر محل تولد شما یا والدین شما چیست؟">نام شهر محل تولد شما یا والدین شما چیست؟</option>
                        <option value="نام کتاب یا اثر ادبی موردعلاقه شما چیست؟">نام کتاب یا اثر ادبی موردعلاقه شما چیست؟</option>
                        <option value="نام اولین حیوان خانگی یا پرنده شما چه بوده است؟">نام اولین حیوان خانگی یا پرنده شما چه بوده است؟</option>
                      </select>

                      <input
                        type="text"
                        value={securityAnswer}
                        onChange={(e) => setSecurityAnswer(e.target.value)}
                        placeholder="پاسخ کوتاه شما (مثال: مدرسه رازی)..."
                        className="w-full px-3 py-2 rounded-lg bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-xs text-stone-800 dark:text-stone-200 outline-none focus:border-[var(--accent-primary)] placeholder:text-stone-400 dark:placeholder:text-stone-500"
                      />
                    </div>
                  )}
                </div>

                {/* Submit Register Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 rounded-xl bg-stone-900 hover:bg-stone-800 dark:bg-stone-100 dark:hover:bg-white text-white dark:text-stone-900 font-semibold text-sm transition-all duration-150 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer shadow-xs active:scale-[0.99] mt-2"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>در حال ساخت حساب...</span>
                    </>
                  ) : (
                    <>
                      <span>شروع مسیر و ساخت حساب</span>
                      <ShieldCheck className="w-4 h-4" />
                    </>
                  )}
                </button>

                {/* Switch to Login */}
                <div className="text-center pt-1 text-xs text-stone-500 dark:text-stone-400">
                  <span>قبلاً ثبت‌نام کرده‌اید؟ </span>
                  <button
                    type="button"
                    onClick={() => {
                      setMode('login');
                      setError(null);
                      setSuccessMsg(null);
                    }}
                    className="text-stone-900 dark:text-stone-100 font-bold hover:underline transition-colors mr-1 cursor-pointer"
                  >
                    وارد شوید
                  </button>
                </div>
              </motion.form>
            )}

            {/* -------------------- 3. FORGOT PASSWORD VIEW -------------------- */}
            {mode === 'forgot_password' && (
              <motion.form
                key="forgot-form"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.15 }}
                onSubmit={handleForgotRequest}
                className="space-y-4"
              >
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold text-stone-900 dark:text-stone-100 tracking-tight">
                    بازیابی دسترسی به حساب
                  </h1>
                  <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 leading-relaxed">
                    نام کاربری یا ایمیل ثبت‌شده خود را وارد کنید تا فرآیند بازنشانی رمز آغاز گردد.
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="recovery-target"
                    className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1.5"
                  >
                    نام کاربری یا آدرس ایمیل <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      id="recovery-target"
                      type="text"
                      required
                      value={recoveryIdentifier}
                      onChange={(e) => setRecoveryIdentifier(e.target.value)}
                      placeholder="مثال: ali یا ali@example.com"
                      className="w-full pl-3 pr-10 py-2.5 sm:py-3 rounded-xl bg-stone-50/70 dark:bg-stone-900/70 border border-stone-200 dark:border-stone-800 focus:bg-white dark:focus:bg-stone-900 focus:border-[var(--accent-primary)] text-sm text-stone-900 dark:text-stone-100 outline-none transition-all placeholder:text-stone-400 dark:placeholder:text-stone-500 text-left"
                      dir="ltr"
                      autoFocus
                    />
                    <Mail className="w-4 h-4 text-stone-400 absolute right-3.5 top-3 sm:top-3.5" />
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-stone-100/70 dark:bg-stone-900/50 border border-stone-200/80 dark:border-stone-800 text-[11px] text-stone-500 dark:text-stone-400 leading-relaxed">
                  امکان بازیابی از طریق کد تأیید ۶ رقمی یا پاسخ به سؤال امنیتی پیش‌بینی شده است.
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 rounded-xl bg-stone-900 hover:bg-stone-800 dark:bg-stone-100 dark:hover:bg-white text-white dark:text-stone-900 font-semibold text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer shadow-xs"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>در حال استعلام...</span>
                    </>
                  ) : (
                    <>
                      <span>دریافت کد بازیابی</span>
                      <Send className="w-4 h-4" />
                    </>
                  )}
                </button>

                <div className="flex items-center justify-between pt-1 text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      setMode('login');
                      setError(null);
                      setSuccessMsg(null);
                    }}
                    className="text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-200 flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <ArrowRight className="w-3.5 h-3.5 rotate-180" />
                    <span>بازگشت به صفحه ورود</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setMode('recovery_token');
                      setRecoveryMethod('security_question');
                      setError(null);
                    }}
                    className="text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100 hover:underline cursor-pointer"
                  >
                    بازیابی مستقیم با سؤال امنیتی
                  </button>
                </div>
              </motion.form>
            )}

            {/* -------------------- 4. RECOVERY TOKEN / QUESTION VIEW -------------------- */}
            {mode === 'recovery_token' && (
              <motion.form
                key="recovery-token-form"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.15 }}
                onSubmit={handleResetSubmit}
                className="space-y-3.5"
              >
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold text-stone-900 dark:text-stone-100 tracking-tight">
                    تعیین رمز عبور جدید
                  </h1>
                  <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 leading-relaxed">
                    کد تأیید یا پاسخ سؤال امنیتی را وارد نموده و رمز جدیدی ثبت فرمایید.
                  </p>
                </div>

                {/* Method Switcher */}
                <div className="grid grid-cols-2 p-1 bg-stone-100 dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 text-xs">
                  <button
                    type="button"
                    onClick={() => setRecoveryMethod('token')}
                    className={`py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                      recoveryMethod === 'token'
                        ? 'bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 shadow-xs font-semibold'
                        : 'text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-200'
                    }`}
                  >
                    کد تأیید ۶ رقمی {countdown > 0 ? `(${formatCountdown(countdown)})` : ''}
                  </button>

                  <button
                    type="button"
                    onClick={() => setRecoveryMethod('security_question')}
                    className={`py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                      recoveryMethod === 'security_question'
                        ? 'bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 shadow-xs font-semibold'
                        : 'text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-200'
                    }`}
                  >
                    پاسخ سؤال امنیتی
                  </button>
                </div>

                {/* Token or Security Question input */}
                {recoveryMethod === 'token' ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <label className="font-medium text-stone-700 dark:text-stone-300">
                        کد ۶ رقمی تأیید <span className="text-rose-500">*</span>
                      </label>
                      {countdown > 0 ? (
                        <span className="text-[11px] text-stone-500 dark:text-stone-400 flex items-center gap-1 font-mono">
                          <Clock className="w-3 h-3" /> مهلت: {formatCountdown(countdown)}
                        </span>
                      ) : (
                        <span className="text-[11px] text-rose-500">مهلت کد پایان یافت</span>
                      )}
                    </div>

                    <input
                      type="text"
                      required
                      value={recoveryCode}
                      onChange={(e) => setRecoveryCode(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                      placeholder="• • • • • •"
                      className="w-full px-3 py-2.5 rounded-xl bg-stone-50/70 dark:bg-stone-900/70 border border-stone-200 dark:border-stone-800 focus:border-[var(--accent-primary)] text-center font-mono text-lg tracking-[0.3em] text-stone-900 dark:text-stone-100 outline-none"
                      maxLength={6}
                      autoFocus
                    />

                    {recoverySimulatedToken && (
                      <div className="p-2.5 rounded-xl bg-stone-100/90 dark:bg-stone-850 border border-stone-200 dark:border-stone-750 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="text-stone-500 dark:text-stone-400 text-[11px]">کد امنیتی شبیه‌ساز:</span>
                          <span className="font-mono font-bold text-stone-800 dark:text-stone-200 text-sm tracking-widest">
                            {recoverySimulatedToken}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setRecoveryCode(recoverySimulatedToken)}
                          className="px-2.5 py-1 rounded bg-stone-200 dark:bg-stone-700 hover:bg-stone-300 dark:hover:bg-stone-600 text-stone-800 dark:text-stone-200 text-xs font-semibold cursor-pointer"
                        >
                          درج مستقیم
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <label className="block text-xs font-medium text-stone-700 dark:text-stone-300">
                      سؤال امنیتی حساب شما:
                    </label>
                    <div className="p-2.5 rounded-xl bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-xs text-stone-800 dark:text-stone-200 font-medium">
                      {retrievedQuestion || securityQuestion}
                    </div>
                    <input
                      type="text"
                      required
                      value={securityAnswer}
                      onChange={(e) => setSecurityAnswer(e.target.value)}
                      placeholder="پاسخ کوتاه شما..."
                      className="w-full px-3 py-2.5 rounded-xl bg-stone-50/70 dark:bg-stone-900/70 border border-stone-200 dark:border-stone-800 focus:border-[var(--accent-primary)] text-sm text-stone-900 dark:text-stone-100 outline-none"
                      autoFocus
                    />
                  </div>
                )}

                {/* New Password & Confirm */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1">
                      رمز عبور جدید <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        required
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="حداقل ۶ نویسه"
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-stone-50/70 dark:bg-stone-900/70 border border-stone-200 dark:border-stone-800 focus:border-[var(--accent-primary)] text-sm text-stone-900 dark:text-stone-100 outline-none text-left"
                        dir="ltr"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword((p) => !p)}
                        className="absolute left-2.5 top-3 text-stone-400 hover:text-stone-700 dark:hover:text-stone-300 cursor-pointer p-0.5"
                        aria-label={showNewPassword ? 'پنهان‌سازی رمز' : 'نمایش رمز'}
                      >
                        {showNewPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1">
                      تکرار رمز عبور جدید <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="password"
                      required
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      placeholder="تکرار رمز جدید"
                      className="w-full px-3 py-2.5 rounded-xl bg-stone-50/70 dark:bg-stone-900/70 border border-stone-200 dark:border-stone-800 focus:border-[var(--accent-primary)] text-sm text-stone-900 dark:text-stone-100 outline-none text-left"
                      dir="ltr"
                    />
                  </div>
                </div>

                {newPassword && (
                  <div className="p-2 rounded-xl bg-stone-50 dark:bg-stone-900/50 border border-stone-200 dark:border-stone-800 text-[11px] flex items-center justify-between">
                    <span className="text-stone-500">سطح امنیت:</span>
                    <span className={`font-semibold ${newPasswordStrength.textClass}`}>
                      {newPasswordStrength.label}
                    </span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 rounded-xl bg-stone-900 hover:bg-stone-800 dark:bg-stone-100 dark:hover:bg-white text-white dark:text-stone-900 font-semibold text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer shadow-xs mt-2"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>در حال راستی‌آزمایی...</span>
                    </>
                  ) : (
                    <>
                      <span>ثبت و ذخیره رمز جدید</span>
                      <Check className="w-4 h-4" />
                    </>
                  )}
                </button>

                <div className="text-center pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setMode('login');
                      setError(null);
                      setSuccessMsg(null);
                    }}
                    className="text-xs text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-200 transition-colors cursor-pointer"
                  >
                    لغو و بازگشت به صفحه ورود
                  </button>
                </div>
              </motion.form>
            )}
          </div>

          {/* Reassuring Footer */}
          <div className="pt-4 mt-6 border-t border-stone-100 dark:border-stone-800/80 flex items-center justify-between text-[11px] text-stone-400 dark:text-stone-500">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/80" />
              ذخیره‌سازی رمزنگاری‌شده ابری
            </span>
            <span>حفظ کامل استقلال و حریم خصوصی</span>
          </div>
        </div>

        {/* ===================== SIDE 2: CALMING INSPIRATIONAL PANEL (5 cols on lg) ===================== */}
        <div className="hidden lg:flex lg:col-span-5 p-8 md:p-10 flex-col justify-between bg-stone-50/70 dark:bg-[#111214] border-t lg:border-t-0 lg:border-r border-stone-200/80 dark:border-stone-800/80 relative overflow-hidden">
          {/* Subtle ambient motif */}
          <div className="space-y-6 relative z-10">
            {/* Minimal Tag */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-stone-200/60 dark:bg-stone-800/70 text-stone-700 dark:text-stone-300 text-xs font-medium">
              <Leaf className="w-3.5 h-3.5 text-stone-500 dark:text-stone-400" />
              <span>نظم پایدار، آرامش ذهن</span>
            </div>

            {/* Mindful headline & philosophy */}
            <div>
              <h2 className="text-2xl font-bold text-stone-900 dark:text-stone-100 leading-snug tracking-tight">
                پیشرفت واقعی در
                <br />
                <span className="text-stone-600 dark:text-stone-400 font-normal">
                  گام‌های کوچک و پیوسته است
                </span>
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-3 leading-relaxed">
                فضایی فارغ از شلوغی و اضطراب برای شفاف‌کردن مسیر روزانه، مدیریت درس‌ها، پروژه‌ها و مهارت‌ها.
              </p>
            </div>

            {/* Elegant Path Illustration (Mindful SVG) */}
            <div className="py-4 my-2 flex items-center justify-center">
              <svg
                width="200"
                height="110"
                viewBox="0 0 200 110"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="opacity-80 text-stone-400 dark:text-stone-600"
                aria-hidden="true"
              >
                {/* Gentle curving path */}
                <path
                  d="M10 90 C 60 90, 70 30, 110 30 C 150 30, 160 70, 190 70"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeDasharray="4 4"
                />
                {/* Peaceful stepping stones along the path */}
                <circle cx="10" cy="90" r="4" fill="currentColor" opacity="0.4" />
                <circle cx="65" cy="55" r="4" fill="currentColor" opacity="0.6" />
                <circle cx="110" cy="30" r="5" fill="currentColor" />
                <circle cx="155" cy="55" r="4" fill="currentColor" opacity="0.6" />
                <circle cx="190" cy="70" r="4" fill="currentColor" opacity="0.4" />

                {/* Subtle soft horizon sun arc */}
                <circle cx="110" cy="30" r="14" stroke="currentColor" strokeWidth="1" strokeDasharray="2 3" opacity="0.3" />
              </svg>
            </div>

            {/* 3 Core Calming Principles (Zero-Pill Discipline) */}
            <div className="space-y-3 pt-1">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-lg bg-stone-200/50 dark:bg-stone-800/50 flex items-center justify-center text-stone-700 dark:text-stone-300 shrink-0 mt-0.5">
                  <Compass className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-stone-800 dark:text-stone-200">
                    برنامه‌ریزی منعطف و واقع‌بینانه
                  </div>
                  <div className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5 leading-relaxed">
                    تنظیم ساعات مطالعه و وظایف بر اساس انرژی روزانه با تقویم شمسی.
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-lg bg-stone-200/50 dark:bg-stone-800/50 flex items-center justify-center text-stone-700 dark:text-stone-300 shrink-0 mt-0.5">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-stone-800 dark:text-stone-200">
                    یکپارچگی مهارت‌ها و پروژه‌ها
                  </div>
                  <div className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5 leading-relaxed">
                    نگاهی جامع به روند یادگیری درسی، پروژه‌های عملی و اهداف بلندمدت.
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-lg bg-stone-200/50 dark:bg-stone-800/50 flex items-center justify-center text-stone-700 dark:text-stone-300 shrink-0 mt-0.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-stone-800 dark:text-stone-200">
                    دسترسی پیوسته و بدون دغدغه
                  </div>
                  <div className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5 leading-relaxed">
                    اطلاعات شما همیشه در دسترس است؛ حتی در حالت آفلاین یا دستگاه جدید.
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom gentle footnote */}
          <div className="relative z-10 pt-4 mt-6 border-t border-stone-200/60 dark:border-stone-800/60">
            <p className="text-[11px] text-stone-500 dark:text-stone-400 text-center leading-relaxed">
              «هر روز یک شروع تازه است؛ کافیست گام نخست را بردارید.»
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
