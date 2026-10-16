import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
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
  GraduationCap,
  FolderGit2,
  Trophy,
  CalendarDays,
  Target,
  Zap,
  ChevronLeft,
  Server,
  Terminal,
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

  // Password visibility states
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Form states
  const [rememberMe, setRememberMe] = useState(() => {
    return localStorage.getItem('pathly_remember_me') === 'true';
  });
  const [identifier, setIdentifier] = useState(() => {
    return localStorage.getItem('pathly_remember_id') || '';
  });
  const [password, setPassword] = useState('');

  // Register form fields
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [securityQuestion, setSecurityQuestion] = useState('نام اولین مدرسه یا معلم دوران کودکی شما چیست؟');
  const [securityAnswer, setSecurityAnswer] = useState('');

  // Recovery form fields
  const [recoveryIdentifier, setRecoveryIdentifier] = useState('');
  const [recoveryCode, setRecoveryCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [retrievedQuestion, setRetrievedQuestion] = useState<string | null>(null);
  const [recoveryMethod, setRecoveryMethod] = useState<'token' | 'security_question'>('token');
  const [recoverySimulatedToken, setRecoverySimulatedToken] = useState<string | null>(null);
  const [infraStatus, setInfraStatus] = useState<any | null>(null);
  const [countdown, setCountdown] = useState<number>(0);

  // Live availability states for register
  const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'available' | 'taken' | 'invalid'>('idle');
  const [emailStatus, setEmailStatus] = useState<'idle' | 'checking' | 'available' | 'taken' | 'invalid'>('idle');

  // Check username availability with debounce
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
    }, 450);

    return () => clearTimeout(timer);
  }, [username, mode]);

  // Check email availability with debounce
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
    }, 450);

    return () => clearTimeout(timer);
  }, [email, mode]);

  // Countdown timer for reset token
  useEffect(() => {
    if (countdown <= 0) return;
    const interval = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [countdown]);

  // Calculate password strength
  const calculateStrength = (pwd: string) => {
    if (!pwd) return { score: 0, label: 'خیلی ضعیف', color: 'bg-slate-600', percent: 0, criteria: { length: false, upperLower: false, number: false, special: false } };
    
    const criteria = {
      length: pwd.length >= 8,
      upperLower: /[a-z]/.test(pwd) && /[A-Z]/.test(pwd),
      number: /[0-9]/.test(pwd),
      special: /[^A-Za-z0-9]/.test(pwd),
    };

    let score = 0;
    if (criteria.length) score += 1;
    if (criteria.upperLower) score += 1;
    if (criteria.number) score += 1;
    if (criteria.special) score += 1;

    if (score <= 1) {
      return { score: 1, label: 'ضعیف', color: 'bg-rose-500', percent: 25, criteria };
    }
    if (score === 2) {
      return { score: 2, label: 'متوسط', color: 'bg-amber-500', percent: 50, criteria };
    }
    if (score === 3) {
      return { score: 3, label: 'خوب', color: 'bg-cyan-500', percent: 75, criteria };
    }
    return { score: 4, label: 'عالی و قدرتمند', color: 'bg-emerald-400', percent: 100, criteria };
  };

  const registerStrength = useMemo(() => calculateStrength(password), [password]);
  const newPasswordStrength = useMemo(() => calculateStrength(newPassword), [newPassword]);

  // Handle Login
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!identifier.trim() || !password) {
      setError('لطفاً نام کاربری/ایمیل و رمز عبور را وارد فرمایید.');
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

  // Handle Register
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!name.trim() || !username.trim() || !email.trim() || !password) {
      setError('لطفاً همه فیلدهای ستاره‌دار را تکمیل کنید.');
      return;
    }

    if (usernameStatus === 'taken') {
      setError('این نام کاربری قبلاً توسط شخص دیگری ثبت شده است.');
      return;
    }

    if (emailStatus === 'taken') {
      setError('این آدرس ایمیل قبلاً در سامانه ثبت شده است.');
      return;
    }

    if (password.length < 6) {
      setError('رمز عبور باید حداقل ۶ کاراکتر باشد.');
      return;
    }

    if (password !== confirmPassword) {
      setError('تکرار رمز عبور با رمز اصلی مطابقت ندارد.');
      return;
    }

    try {
      setLoading(true);
      await register(email.trim(), username.trim(), name.trim(), password, securityQuestion, securityAnswer);

      if (rememberMe) {
        localStorage.setItem('pathly_remember_me', 'true');
        localStorage.setItem('pathly_remember_id', username.trim());
      }

      showToast('حساب کاربری ابری شما با موفقیت ایجاد گردید.');
      if (onSuccess) onSuccess();
      if (onCancel) onCancel();
    } catch (err: any) {
      setError(err.message || 'خطا در ساخت حساب کاربری.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Forgot Password Request (Step 1)
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
      setRetrievedQuestion(res.securityQuestion || 'نام اولین مدرسه شما چیست؟');
      setRecoverySimulatedToken(res.mockVerificationToken || null);
      setInfraStatus(res.infrastructureStatus || null);
      setCountdown(res.expiresInMinutes ? res.expiresInMinutes * 60 : 15 * 60);

      setSuccessMsg(`درخواست بازیابی ثبت شد. کد تأیید امن برای حساب ${res.maskedEmail || targetId} ایجاد گردید.`);
      setMode('recovery_token');
    } catch (err: any) {
      setError(err.message || 'کاربری با این مشخصات یافت نشد.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Password Reset Execution (Step 2)
  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    const targetId = (recoveryIdentifier || identifier).trim();
    if (!targetId) {
      setError('لطفاً نام کاربری یا ایمیل را مشخص نمایید.');
      return;
    }

    if (newPassword.length < 6) {
      setError('رمز عبور جدید باید حداقل ۶ کاراکتر باشد.');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setError('تکرار رمز عبور جدید با رمز اصلی مطابقت ندارد.');
      return;
    }

    try {
      setLoading(true);
      if (recoveryMethod === 'token') {
        if (!recoveryCode.trim()) {
          setError('لطفاً کد تأیید ۶ رقمی را وارد کنید.');
          return;
        }
        await resetPasswordWithToken(targetId, recoveryCode.trim(), newPassword);
      } else {
        if (!securityAnswer.trim()) {
          setError('لطفاً پاسخ سؤال امنیتی را وارد فرمایید.');
          return;
        }
        await resetPassword(targetId, securityAnswer.trim(), newPassword);
      }

      setSuccessMsg('رمز عبور شما با موفقیت بازنشانی شد! اکنون می‌توانید با رمز جدید وارد شوید.');
      setPassword(newPassword);
      setIdentifier(targetId);
      setTimeout(() => {
        setMode('login');
      }, 1400);
    } catch (err: any) {
      setError(err.message || 'خطا در اعتبارسنجی و تغییر رمز عبور.');
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
          ? 'max-w-5xl rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden text-right'
          : 'min-h-[85vh] flex items-center justify-center p-2 sm:p-4 text-right'
      }`}
      dir="rtl"
    >
      <div className={`w-full ${isModal ? '' : 'max-w-6xl'} grid grid-cols-1 lg:grid-cols-12 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl overflow-hidden relative`}>

        {/* ----------------- COLUMN 1: FORM SECTION (7 cols on lg) ----------------- */}
        <div className="lg:col-span-7 p-6 sm:p-8 lg:p-10 flex flex-col justify-between relative z-10 border-b lg:border-b-0 lg:border-l border-slate-200 dark:border-slate-800">
          <div>
            {/* Top Bar with Brand and Quick Action */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 flex items-center justify-center font-bold">
                  P
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-lg text-slate-900 dark:text-white tracking-wider">PATHLY</span>
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      نسخه ابری
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">سامانه برنامه‌ریزی فردی و پیشرفت مسیر</span>
                </div>
              </div>

              {onCancel && (
                <button
                  type="button"
                  onClick={onCancel}
                  className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800/60 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
                >
                  <span>پیش‌نمایش مهمان</span>
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Mode Selector Tabs (Login / Register / Forgot Password) */}
            <div className="grid grid-cols-3 p-1 bg-slate-100 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 mb-6 gap-1 text-xs font-medium">
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setError(null);
                  setSuccessMsg(null);
                }}
                className={`py-2 px-3 rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
                  mode === 'login'
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>ورود به حساب</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setMode('register');
                  setError(null);
                  setSuccessMsg(null);
                }}
                className={`py-2 px-3 rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
                  mode === 'register'
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>ثبت‌نام جدید</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setMode('forgot_password');
                  setError(null);
                  setSuccessMsg(null);
                }}
                className={`py-2 px-3 rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
                  mode === 'forgot_password' || mode === 'recovery_token'
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>بازیابی رمز</span>
              </button>
            </div>

            {/* Error & Success Banners */}
            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="p-3.5 mb-5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2.5 font-medium shadow-md shadow-rose-950/20"
                >
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span className="flex-1">{error}</span>
                  <button onClick={() => setError(null)} className="text-rose-400 hover:text-white cursor-pointer">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </motion.div>
              )}

              {successMsg && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="p-3.5 mb-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2.5 font-medium shadow-md shadow-emerald-950/20"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="flex-1">{successMsg}</span>
                  <button onClick={() => setSuccessMsg(null)} className="text-emerald-400 hover:text-white cursor-pointer">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Active User Notice (if user is already logged in and views auth) */}
            {currentUser && (
              <div className="mb-5 p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/25 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <img
                    src={currentUser.avatarUrl || 'https://api.dicebear.com/7.x/bottts/svg?seed=user'}
                    alt={currentUser.name}
                    className="w-8 h-8 rounded-full border border-cyan-500/40"
                  />
                  <div>
                    <span className="text-slate-900 dark:text-white font-bold block">{currentUser.name}</span>
                    <span className="text-slate-500 dark:text-slate-400 text-[11px]">حساب فعال: @{currentUser.username}</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    logout();
                    showToast('با موفقیت از حساب خارج شدید.');
                  }}
                  className="px-3 py-1 text-rose-500 dark:text-rose-400 hover:text-rose-600 dark:hover:text-rose-300 hover:bg-rose-500/10 rounded-lg border border-rose-500/30 transition-colors cursor-pointer"
                >
                  خروج از حساب
                </button>
              </div>
            )}

            {/* -------------------- VIEW 1: LOGIN -------------------- */}
            {mode === 'login' && (
              <motion.form
                key="login-form"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                onSubmit={handleLoginSubmit}
                className="space-y-4"
              >
                <div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <span>خوش برگشتی!</span>
                    <span className="inline-block animate-wave">👋</span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    برای دسترسی به داشبورد و برنامه‌ها وارد حساب خود شوید.
                  </p>
                </div>

                {/* Username / Email Field */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    نام کاربری یا ایمیل <span className="text-cyan-600 dark:text-cyan-400">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      placeholder="مثال: ali_developer یا user@domain.com"
                      className="w-full pl-3 pr-10 py-3 rounded-xl bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-700/80 focus:border-cyan-500 dark:focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20 text-sm text-slate-900 dark:text-white outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500 text-left"
                      dir="ltr"
                      autoFocus
                    />
                    <User className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5" />
                  </div>
                </div>

                {/* Password Field */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                      رمز عبور <span className="text-cyan-600 dark:text-cyan-400">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setRecoveryIdentifier(identifier);
                        setMode('forgot_password');
                      }}
                      className="text-[11px] text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300 transition-colors cursor-pointer font-medium"
                    >
                      رمز عبور را فراموش کرده‌اید؟
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-10 py-3 rounded-xl bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-700/80 focus:border-cyan-500 dark:focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20 text-sm text-slate-900 dark:text-white outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500 text-left"
                      dir="ltr"
                    />
                    <Lock className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5" />
                    <button
                      type="button"
                      onClick={() => setShowPassword((p) => !p)}
                      className="absolute left-3 top-3.5 text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors cursor-pointer"
                      title={showPassword ? 'مخفی‌سازی رمز' : 'نمایش رمز'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Remember Me Checkbox */}
                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-4 h-4 rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 peer-checked:bg-cyan-500 peer-checked:border-cyan-400 flex items-center justify-center transition-all">
                      {rememberMe && <Check className="w-3 h-3 text-slate-950 stroke-[3]" />}
                    </div>
                    <span className="text-xs text-slate-700 dark:text-slate-300 font-medium">مرا به خاطر بسپار</span>
                  </label>

                  <span className="text-[11px] text-slate-400 dark:text-slate-500">احراز هویت امن</span>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 font-semibold text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer shadow-xs"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-white" />
                      <span>در حال اعتبارسنجی و ورود...</span>
                    </>
                  ) : (
                    <>
                      <span>ورود به حساب کاربری</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                {/* Switch to Register Link */}
                <div className="text-center pt-3 text-xs text-slate-500 dark:text-slate-400">
                  <span>حساب کاربری ندارید؟ </span>
                  <button
                    type="button"
                    onClick={() => {
                      setMode('register');
                      setError(null);
                    }}
                    className="text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300 font-bold hover:underline transition-colors mr-1 cursor-pointer"
                  >
                    همین حالا ثبت‌نام کنید
                  </button>
                </div>
              </motion.form>
            )}

            {/* -------------------- VIEW 2: REGISTER -------------------- */}
            {mode === 'register' && (
              <motion.form
                key="register-form"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                onSubmit={handleRegisterSubmit}
                className="space-y-3.5"
              >
                <div>
                  <h3 className="text-xl font-black text-white flex items-center gap-2">
                    <span>ایجاد حساب کاربری</span>
                    <Sparkles className="w-4 h-4 text-cyan-400" />
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    ثبت‌نام برای ذخیره دائمی و همگام‌سازی اطلاعات
                  </p>
                </div>

                {/* Display Name */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    نام و نام خانوادگی <span className="text-cyan-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="مثال: پارسا صادقی"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700/80 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20 text-sm text-white outline-none transition-all placeholder:text-slate-500"
                    autoFocus
                  />
                </div>

                {/* Username & Email Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Username with Live Check */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-semibold text-slate-300">
                        نام کاربری انگلیسی <span className="text-cyan-400">*</span>
                      </label>
                      {usernameStatus === 'checking' && (
                        <span className="text-[10px] text-cyan-400 flex items-center gap-1">
                          <RefreshCw className="w-2.5 h-2.5 animate-spin" /> در حال بررسی
                        </span>
                      )}
                      {usernameStatus === 'available' && (
                        <span className="text-[10px] text-emerald-400 flex items-center gap-0.5">
                          <Check className="w-3 h-3" /> آزاد است
                        </span>
                      )}
                      {usernameStatus === 'taken' && (
                        <span className="text-[10px] text-rose-400 flex items-center gap-0.5">
                          <X className="w-3 h-3" /> رزرو شده
                        </span>
                      )}
                    </div>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="parsa_dev"
                        className={`w-full px-3 py-2.5 rounded-xl bg-slate-900/90 border text-sm text-white outline-none transition-all placeholder:text-slate-500 text-left ${
                          usernameStatus === 'available'
                            ? 'border-emerald-500/70 focus:border-emerald-400'
                            : usernameStatus === 'taken'
                            ? 'border-rose-500/70 focus:border-rose-400'
                            : 'border-slate-700/80 focus:border-cyan-400'
                        }`}
                        dir="ltr"
                      />
                    </div>
                  </div>

                  {/* Email with Live Check */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-semibold text-slate-300">
                        آدرس ایمیل <span className="text-cyan-400">*</span>
                      </label>
                      {emailStatus === 'checking' && (
                        <span className="text-[10px] text-cyan-400 flex items-center gap-1">
                          <RefreshCw className="w-2.5 h-2.5 animate-spin" /> در حال بررسی
                        </span>
                      )}
                      {emailStatus === 'available' && (
                        <span className="text-[10px] text-emerald-400 flex items-center gap-0.5">
                          <Check className="w-3 h-3" /> معتبر
                        </span>
                      )}
                      {emailStatus === 'taken' && (
                        <span className="text-[10px] text-rose-400 flex items-center gap-0.5">
                          <X className="w-3 h-3" /> ثبت شده
                        </span>
                      )}
                    </div>
                    <div className="relative">
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="parsa@gmail.com"
                        className={`w-full px-3 py-2.5 rounded-xl bg-slate-900/90 border text-sm text-white outline-none transition-all placeholder:text-slate-500 text-left ${
                          emailStatus === 'available'
                            ? 'border-emerald-500/70 focus:border-emerald-400'
                            : emailStatus === 'taken'
                            ? 'border-rose-500/70 focus:border-rose-400'
                            : 'border-slate-700/80 focus:border-cyan-400'
                        }`}
                        dir="ltr"
                      />
                    </div>
                  </div>
                </div>

                {/* Password & Confirm Password Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      رمز عبور <span className="text-cyan-400">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700/80 focus:border-cyan-400 text-sm text-white outline-none transition-all placeholder:text-slate-500 text-left"
                        dir="ltr"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((p) => !p)}
                        className="absolute left-2.5 top-3 text-slate-400 hover:text-cyan-400 cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-semibold text-slate-300">
                        تکرار رمز عبور <span className="text-cyan-400">*</span>
                      </label>
                      {confirmPassword && (
                        <span className={`text-[10px] font-bold ${password === confirmPassword ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {password === confirmPassword ? '✓ مطابقت دارد' : '✕ عدم مطابقت'}
                        </span>
                      )}
                    </div>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className={`w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-900/90 border text-sm text-white outline-none transition-all placeholder:text-slate-500 text-left ${
                          confirmPassword && password === confirmPassword
                            ? 'border-emerald-500/70 focus:border-emerald-400'
                            : confirmPassword
                            ? 'border-rose-500/70 focus:border-rose-400'
                            : 'border-slate-700/80 focus:border-cyan-400'
                        }`}
                        dir="ltr"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword((p) => !p)}
                        className="absolute left-2.5 top-3 text-slate-400 hover:text-cyan-400 cursor-pointer"
                      >
                        {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Password Strength Indicator */}
                {password && (
                  <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 text-[11px]">قدرت رمز عبور:</span>
                      <span className={`font-bold text-[11px] ${
                        registerStrength.score === 4 ? 'text-emerald-400' :
                        registerStrength.score === 3 ? 'text-cyan-400' :
                        registerStrength.score === 2 ? 'text-amber-400' : 'text-rose-400'
                      }`}>
                        {registerStrength.label}
                      </span>
                    </div>

                    {/* Progress Bar with 4 Segments */}
                    <div className="grid grid-cols-4 gap-1.5 h-1.5 w-full">
                      <div className={`rounded-full transition-all ${registerStrength.score >= 1 ? registerStrength.color : 'bg-slate-800'}`} />
                      <div className={`rounded-full transition-all ${registerStrength.score >= 2 ? registerStrength.color : 'bg-slate-800'}`} />
                      <div className={`rounded-full transition-all ${registerStrength.score >= 3 ? registerStrength.color : 'bg-slate-800'}`} />
                      <div className={`rounded-full transition-all ${registerStrength.score >= 4 ? registerStrength.color : 'bg-slate-800'}`} />
                    </div>

                    {/* Criteria checklist */}
                    <div className="grid grid-cols-2 gap-x-2 gap-y-1 pt-1 text-[10px]">
                      <span className={`flex items-center gap-1 ${registerStrength.criteria.length ? 'text-emerald-400' : 'text-slate-500'}`}>
                        {registerStrength.criteria.length ? '✓' : '○'} حداقل ۸ نویسه
                      </span>
                      <span className={`flex items-center gap-1 ${registerStrength.criteria.upperLower ? 'text-emerald-400' : 'text-slate-500'}`}>
                        {registerStrength.criteria.upperLower ? '✓' : '○'} حروف بزرگ و کوچک
                      </span>
                      <span className={`flex items-center gap-1 ${registerStrength.criteria.number ? 'text-emerald-400' : 'text-slate-500'}`}>
                        {registerStrength.criteria.number ? '✓' : '○'} اعداد انگلیسی
                      </span>
                      <span className={`flex items-center gap-1 ${registerStrength.criteria.special ? 'text-emerald-400' : 'text-slate-500'}`}>
                        {registerStrength.criteria.special ? '✓' : '○'} نماد ویژه (!@#$)
                      </span>
                    </div>
                  </div>
                )}

                {/* Security Question for Account Recovery */}
                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                      <HelpCircle className="w-3.5 h-3.5 text-cyan-400" />
                      سؤال امنیتی جهت بازیابی رمز عبور
                    </span>
                    <span className="text-[10px] text-cyan-400 font-medium">پشتیبان امن</span>
                  </div>

                  <select
                    value={securityQuestion}
                    onChange={(e) => setSecurityQuestion(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white outline-none focus:border-cyan-400"
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
                    placeholder="پاسخ کوتاه شما به سؤال امنیتی (اختیاری اما توصیه می‌شود)..."
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white outline-none focus:border-cyan-400 placeholder:text-slate-500"
                  />
                </div>

                {/* Submit Register Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 font-semibold text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer shadow-xs"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-white" />
                      <span>در حال ساخت حساب و ایجاد پایگاه داده...</span>
                    </>
                  ) : (
                    <>
                      <span>ایجاد حساب کاربری مستقل</span>
                      <ShieldCheck className="w-4 h-4" />
                    </>
                  )}
                </button>

                {/* Switch to Login Link */}
                <div className="text-center pt-2 text-xs text-slate-400">
                  <span>قبلاً ثبت‌نام کرده‌اید؟ </span>
                  <button
                    type="button"
                    onClick={() => {
                      setMode('login');
                      setError(null);
                    }}
                    className="text-cyan-400 hover:text-cyan-300 font-bold hover:underline transition-colors mr-1 cursor-pointer"
                  >
                    وارد شوید
                  </button>
                </div>
              </motion.form>
            )}

            {/* -------------------- VIEW 3: FORGOT PASSWORD REQUEST -------------------- */}
            {mode === 'forgot_password' && (
              <motion.form
                key="forgot-form"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                onSubmit={handleForgotRequest}
                className="space-y-4"
              >
                <div>
                  <h3 className="text-xl font-black text-white flex items-center gap-2">
                    <span>بازیابی رمز عبور</span>
                    <KeyRound className="w-5 h-5 text-amber-400" />
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    نام کاربری یا آدرس ایمیل ثبت‌شده خود را وارد کنید تا فرآیند بازیابی امن آغاز شود.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    نام کاربری یا ایمیل ثبت شده <span className="text-amber-400">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={recoveryIdentifier}
                      onChange={(e) => setRecoveryIdentifier(e.target.value)}
                      placeholder="مثال: ali یا ali@gmail.com"
                      className="w-full pl-3 pr-10 py-3 rounded-xl bg-slate-900/90 border border-slate-700/80 focus:border-amber-400 focus:ring-2 focus:ring-amber-500/20 text-sm text-white outline-none transition-all placeholder:text-slate-500 text-left"
                      dir="ltr"
                      autoFocus
                    />
                    <Mail className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5" />
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-[11px] text-slate-400">
                  کد تأیید به ایمیل ارسال می‌شود؛ همچنین می‌توانید از سؤال امنیتی برای بازنشانی رمز استفاده کنید.
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 font-semibold text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer shadow-xs"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-white" />
                      <span>در حال استعلام و ارسال درخواست...</span>
                    </>
                  ) : (
                    <>
                      <span>ادامه و دریافت کد بازیابی</span>
                      <Send className="w-4 h-4" />
                    </>
                  )}
                </button>

                <div className="flex items-center justify-between pt-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setMode('login')}
                    className="text-slate-400 hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <ArrowRight className="w-3.5 h-3.5 rotate-180" />
                    <span>بازگشت به صفحه ورود</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setMode('recovery_token');
                      setRecoveryMethod('security_question');
                    }}
                    className="text-cyan-400 hover:text-cyan-300 hover:underline cursor-pointer"
                  >
                    بازیابی مستقیم با سؤال امنیتی
                  </button>
                </div>
              </motion.form>
            )}

            {/* -------------------- VIEW 4: RESET PASSWORD WITH TOKEN / QUESTION -------------------- */}
            {mode === 'recovery_token' && (
              <motion.form
                key="recovery-token-form"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                onSubmit={handleResetSubmit}
                className="space-y-3.5"
              >
                <div>
                  <h3 className="text-xl font-black text-white flex items-center gap-2">
                    <span>تأیید هویت و ثبت رمز جدید</span>
                    <ShieldCheck className="w-5 h-5 text-cyan-400" />
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    کد تأیید یا پاسخ سؤال امنیتی را وارد نموده و رمز عبور جدید تعیین فرمایید.
                  </p>
                </div>

                {/* Method Switcher */}
                <div className="grid grid-cols-2 p-1 bg-slate-950 rounded-xl border border-slate-800 text-xs">
                  <button
                    type="button"
                    onClick={() => setRecoveryMethod('token')}
                    className={`py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                      recoveryMethod === 'token'
                        ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    کد تأیید ۶ رقمی {countdown > 0 ? `(${formatCountdown(countdown)})` : ''}
                  </button>

                  <button
                    type="button"
                    onClick={() => setRecoveryMethod('security_question')}
                    className={`py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                      recoveryMethod === 'security_question'
                        ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    پاسخ سؤال امنیتی
                  </button>
                </div>

                {/* Method 1: Verification Code */}
                {recoveryMethod === 'token' ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <label className="font-semibold text-slate-300">
                        کد تأیید ۶ رقمی بازیابی <span className="text-cyan-400">*</span>
                      </label>
                      {countdown > 0 ? (
                        <span className="text-[11px] text-amber-400 flex items-center gap-1 font-mono">
                          <Clock className="w-3 h-3" /> مهلت انقضا: {formatCountdown(countdown)}
                        </span>
                      ) : (
                        <span className="text-[11px] text-rose-400">کد منقضی شد</span>
                      )}
                    </div>

                    <input
                      type="text"
                      required
                      value={recoveryCode}
                      onChange={(e) => setRecoveryCode(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                      placeholder="مثال: 582914"
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700/80 focus:border-cyan-400 text-center font-mono text-lg tracking-[0.3em] text-cyan-400 outline-none"
                      maxLength={6}
                      autoFocus
                    />

                    {/* Temporary Token Display */}
                    {recoverySimulatedToken && (
                      <div className="p-2.5 rounded-xl bg-cyan-950/40 border border-cyan-500/30 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="text-slate-300">کد بازیابی:</span>
                          <span className="font-mono font-bold text-cyan-300 text-sm tracking-widest">{recoverySimulatedToken}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setRecoveryCode(recoverySimulatedToken)}
                          className="px-2.5 py-1 rounded bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 text-xs font-bold cursor-pointer"
                        >
                          درج کد
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  /* Method 2: Security Question */
                  <div className="space-y-2">
                    <label className="block text-xs font-semibold text-slate-300">
                      پاسخ سؤال امنیتی شما:
                    </label>
                    <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-cyan-400 font-medium">
                      {retrievedQuestion || securityQuestion}
                    </div>
                    <input
                      type="text"
                      required
                      value={securityAnswer}
                      onChange={(e) => setSecurityAnswer(e.target.value)}
                      placeholder="پاسخ کوتاه ثبت‌شده..."
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700/80 focus:border-cyan-400 text-sm text-white outline-none"
                      autoFocus
                    />
                  </div>
                )}

                {/* New Password & Confirm Password */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      رمز عبور جدید <span className="text-cyan-400">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        required
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700/80 focus:border-cyan-400 text-sm text-white outline-none text-left"
                        dir="ltr"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword((p) => !p)}
                        className="absolute left-2.5 top-3 text-slate-400 hover:text-cyan-400 cursor-pointer"
                      >
                        {showNewPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      تکرار رمز عبور جدید <span className="text-cyan-400">*</span>
                    </label>
                    <input
                      type="password"
                      required
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700/80 focus:border-cyan-400 text-sm text-white outline-none text-left"
                      dir="ltr"
                    />
                  </div>
                </div>

                {/* Strength Meter for New Password */}
                {newPassword && (
                  <div className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-[11px] flex items-center justify-between">
                    <span className="text-slate-400">سطح امنیت رمز جدید:</span>
                    <span className={`font-bold ${
                      newPasswordStrength.score >= 3 ? 'text-emerald-400' : 'text-amber-400'
                    }`}>
                      {newPasswordStrength.label}
                    </span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 font-semibold text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer shadow-xs"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-white" />
                      <span>در حال راستی‌آزمایی و بازنشانی...</span>
                    </>
                  ) : (
                    <>
                      <span>ثبت و ذخیره رمز عبور جدید</span>
                      <Check className="w-4 h-4" />
                    </>
                  )}
                </button>

                <div className="text-center pt-1">
                  <button
                    type="button"
                    onClick={() => setMode('login')}
                    className="text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
                  >
                    لغو و بازگشت به صفحه ورود
                  </button>
                </div>
              </motion.form>
            )}
          </div>

          {/* Form Footer Note */}
          <div className="pt-4 mt-4 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-500">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              سرور ابری فعال
            </span>
            <span>حفظ کامل حریم خصوصی</span>
          </div>
        </div>

        {/* ----------------- COLUMN 2: HERO SHOWCASE (5 cols on lg) ----------------- */}
        <div className="hidden lg:flex lg:col-span-5 p-8 flex-col justify-between bg-gradient-to-br from-[#0c1427] via-[#090e1d] to-[#070b16] relative overflow-hidden">
          {/* Futuristic Cyber Circuit Grid Overlay */}
          <div className="pointer-events-none absolute inset-0 cyber-grid opacity-35" />

          {/* Ambient Glowing Blobs */}
          <div className="pointer-events-none absolute top-10 left-10 w-48 h-48 bg-cyan-500/20 rounded-full blur-[90px]" />
          <div className="pointer-events-none absolute bottom-10 right-10 w-48 h-48 bg-indigo-500/20 rounded-full blur-[90px]" />

          {/* Top Showcase Content */}
          <div className="relative z-10 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-bold">
              <Zap className="w-3.5 h-3.5 text-cyan-400" />
              <span>پایگاه داده چندکاربره مستقل</span>
            </div>

            <div>
              <h2 className="text-2xl font-black text-white leading-snug tracking-tight">
                مسیر یکپارچه رشد،
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400">
                  یادگیری و مهارت‌های آینده
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                برنامه‌ریزی درسی، پروژه‌ها، چالش‌های مسابقات و مرور فاصله‌دار در یک محیط یکپارچه
              </p>
            </div>

            {/* Feature Showcase Cards */}
            <div className="space-y-2.5">
              <div className="p-3.5 rounded-2xl bg-slate-900/70 border border-slate-700/60 backdrop-blur-md shadow-lg shadow-black/20 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
                  <GraduationCap className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <div className="text-xs font-bold text-white">مدرسه و نمرات تحلیلی</div>
                  <span className="text-[10px] text-slate-400">کارنامه، برنامه هفتگی و پیگیری تکالیف</span>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-900/70 border border-slate-700/60 backdrop-blur-md shadow-lg shadow-black/20 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
                  <FolderGit2 className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <div className="text-xs font-bold text-white">پروژه‌ها و مهارت‌ها</div>
                  <span className="text-[10px] text-slate-400">برد کانبان و نقشه‌راه گام‌به‌گام یادگیری</span>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-900/70 border border-slate-700/60 backdrop-blur-md shadow-lg shadow-black/20 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0">
                  <Trophy className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <div className="text-xs font-bold text-white">مسابقات و آزمون‌ها</div>
                  <span className="text-[10px] text-slate-400">زمان‌بندی مراحل و ارزیابی آمادگی</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Trust Note */}
          <div className="relative z-10 pt-4 mt-4 border-t border-slate-800/80">
            <p className="text-[11px] text-slate-400 text-center leading-relaxed">
              ذخیره‌سازی امن و دسترسی پیوسته به اطلاعات در تمام دستگاه‌ها
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};
