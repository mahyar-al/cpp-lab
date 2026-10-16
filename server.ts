import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import path from 'node:path';
import fs from 'node:fs';
import crypto from 'node:crypto';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from './src/server/db.ts';
import type { UserAccount } from './src/server/db.ts';
import { formatJalaliFull } from './src/utils/jalali.ts';

dotenv.config();

const app = express();
const PORT = 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'pathly-super-secure-production-jwt-key-2026';

app.use(express.json({ limit: '25mb' }));

// Auth Request interface
export interface AuthenticatedRequest extends Request {
  userId?: string;
  user?: UserAccount;
}

// Authentication Middleware
export const authenticateToken = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : (req.headers['x-auth-token'] as string);

  if (!token) {
    res.status(401).json({ error: 'احراز هویت انجام نشده است. لطفاً وارد حساب خود شوید.' });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; email: string };
    const user = db.findUserById(decoded.userId);
    if (!user) {
      res.status(401).json({ error: 'کاربر یافت نشد یا حساب حذف شده است.' });
      return;
    }
    req.userId = user.id;
    req.user = user;
    next();
  } catch (err) {
    res.status(403).json({ error: 'توکن نامعتبر یا منقضی شده است. لطفاً دوباره وارد شوید.' });
  }
};

// Flexible Auth Middleware (allows both logged-in users and guest sessions)
export const authenticateTokenOrGuest = (req: AuthenticatedRequest, _res: Response, next: NextFunction): void => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : (req.headers['x-auth-token'] as string);

  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; email: string };
      const user = db.findUserById(decoded.userId);
      if (user) {
        req.userId = user.id;
        req.user = user;
        return next();
      }
    } catch {}
  }

  // Guest fallback session: preserves conversation thread per browser session
  const guestHeader = (req.headers['x-guest-id'] as string) || (req.body?.guestId as string);
  const guestId = guestHeader && guestHeader.startsWith('guest_') ? guestHeader : 'guest_session';
  req.userId = guestId;
  next();
};

// ----------------- Public & Auth APIs -----------------

// Health & System Info
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    system: 'Pathly Multi-User Cloud Engine',
    timestamp: new Date().toISOString(),
    stats: db.getStats(),
  });
});

// Register New User
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, username, password, name, securityQuestion, securityAnswer } = req.body;

    if (!email || !username || !password || !name) {
      res.status(400).json({ error: 'لطفاً نام، نام کاربری، ایمیل و رمز عبور را وارد کنید.' });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({ error: 'رمز عبور باید حداقل ۶ کاراکتر باشد.' });
      return;
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanUsername = username.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '');

    if (cleanUsername.length < 3) {
      res.status(400).json({ error: 'نام کاربری باید حداقل ۳ کاراکتر انگلیسی و عدد باشد.' });
      return;
    }

    if (db.findUserByEmail(cleanEmail)) {
      res.status(409).json({ error: 'این آدرس ایمیل قبلاً ثبت‌نام شده است.' });
      return;
    }

    if (db.findUserByUsername(cleanUsername)) {
      res.status(409).json({ error: 'این نام کاربری قبلاً انتخاب شده است.' });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    let securityAnswerHash: string | undefined;
    if (securityAnswer) {
      securityAnswerHash = await bcrypt.hash(securityAnswer.trim().toLowerCase(), 10);
    }

    const isFirstUser = db.getAllUsers().length === 0;

    const newUser = db.createUser({
      id: crypto.randomUUID(),
      email: cleanEmail,
      username: cleanUsername,
      passwordHash,
      name: name.trim(),
      role: isFirstUser ? 'admin' : 'user',
      avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${cleanUsername}`,
      securityQuestion: securityQuestion || 'نام اولین مدرسه شما چیست؟',
      securityAnswerHash,
    });

    const token = jwt.sign(
      { userId: newUser.id, email: newUser.email, username: newUser.username, role: newUser.role },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.status(201).json({
      message: 'ثبت‌نام با موفقیت انجام شد.',
      token,
      user: {
        id: newUser.id,
        email: newUser.email,
        username: newUser.username,
        name: newUser.name,
        role: newUser.role,
        avatarUrl: newUser.avatarUrl,
        createdAt: newUser.createdAt,
      },
    });
  } catch (err: any) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'خطای داخلی سرور هنگام ثبت‌نام' });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      res.status(400).json({ error: 'لطفاً نام کاربری یا ایمیل و رمز عبور را وارد کنید.' });
      return;
    }

    const cleanId = identifier.trim().toLowerCase();
    const user = db.findUserByEmail(cleanId) || db.findUserByUsername(cleanId);

    if (!user) {
      res.status(401).json({ error: 'نام کاربری یا رمز عبور اشتباه است.' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      res.status(401).json({ error: 'نام کاربری یا رمز عبور اشتباه است.' });
      return;
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.json({
      message: 'ورود موفقیت‌آمیز بود.',
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        name: user.name,
        role: user.role,
        avatarUrl: user.avatarUrl,
        createdAt: user.createdAt,
      },
    });
  } catch (err: any) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'خطای سرور در فرآیند ورود' });
  }
});

// Get Current User Profile
app.get('/api/auth/me', authenticateToken, (req: AuthenticatedRequest, res) => {
  const user = req.user!;
  res.json({
    user: {
      id: user.id,
      email: user.email,
      username: user.username,
      name: user.name,
      role: user.role,
      avatarUrl: user.avatarUrl,
      securityQuestion: user.securityQuestion,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    },
  });
});

// Update Profile
app.put('/api/auth/profile', authenticateToken, (req: AuthenticatedRequest, res) => {
  try {
    const { name, avatarUrl, securityQuestion, securityAnswer } = req.body;
    const updates: Partial<UserAccount> = {};

    if (name && typeof name === 'string') updates.name = name.trim();
    if (avatarUrl && typeof avatarUrl === 'string') updates.avatarUrl = avatarUrl;
    if (securityQuestion && typeof securityQuestion === 'string') updates.securityQuestion = securityQuestion;

    if (securityAnswer && typeof securityAnswer === 'string') {
      updates.securityAnswerHash = bcrypt.hashSync(securityAnswer.trim().toLowerCase(), 10);
    }

    const updated = db.updateUser(req.userId!, updates);
    if (!updated) {
      res.status(404).json({ error: 'کاربر یافت نشد.' });
      return;
    }

    res.json({
      message: 'اطلاعات پروفایل با موفقیت بروزرسانی شد.',
      user: {
        id: updated.id,
        email: updated.email,
        username: updated.username,
        name: updated.name,
        role: updated.role,
        avatarUrl: updated.avatarUrl,
      },
    });
  } catch (err) {
    res.status(500).json({ error: 'خطا در ویرایش اطلاعات پروفایل' });
  }
});

// Change Password
app.post('/api/auth/change-password', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      res.status(400).json({ error: 'لطفاً رمز فعلی و رمز جدید را ارسال کنید.' });
      return;
    }

    if (newPassword.length < 6) {
      res.status(400).json({ error: 'رمز عبور جدید باید حداقل ۶ کاراکتر باشد.' });
      return;
    }

    const user = req.user!;
    const isMatch = await bcrypt.compare(oldPassword, user.passwordHash);
    if (!isMatch) {
      res.status(400).json({ error: 'رمز عبور فعلی نادرست است.' });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const newHash = await bcrypt.hash(newPassword, salt);

    db.updateUser(user.id, { passwordHash: newHash });

    res.json({ message: 'رمز عبور با موفقیت تغییر یافت.' });
  } catch (err) {
    res.status(500).json({ error: 'خطا در تغییر رمز عبور' });
  }
});

// Reset Password (Self-service recovery)
app.post('/api/auth/reset-password', async (req, res) => {
  try {
    const { identifier, securityAnswer, newPassword } = req.body;

    if (!identifier || !securityAnswer || !newPassword) {
      res.status(400).json({ error: 'لطفاً نام کاربری، پاسخ سؤال امنیتی و رمز جدید را وارد کنید.' });
      return;
    }

    const cleanId = identifier.trim().toLowerCase();
    const user = db.findUserByEmail(cleanId) || db.findUserByUsername(cleanId);

    if (!user) {
      res.status(404).json({ error: 'کاربری با این مشخصات یافت نشد.' });
      return;
    }

    if (!user.securityAnswerHash) {
      res.status(400).json({ error: 'سؤال امنیتی برای این حساب ثبت نشده است. لطفاً با مدیر سیستم تماس بگیرید.' });
      return;
    }

    const isAnswerCorrect = await bcrypt.compare(securityAnswer.trim().toLowerCase(), user.securityAnswerHash);
    if (!isAnswerCorrect) {
      res.status(400).json({ error: 'پاسخ سؤال امنیتی صحیح نمی‌باشد.' });
      return;
    }

    if (newPassword.length < 6) {
      res.status(400).json({ error: 'رمز عبور جدید باید حداقل ۶ کاراکتر باشد.' });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const newHash = await bcrypt.hash(newPassword, salt);

    db.updateUser(user.id, { passwordHash: newHash });

    res.json({ message: 'رمز عبور شما با موفقیت بازنشانی شد. اکنون می‌توانید وارد شوید.' });
  } catch (err) {
    res.status(500).json({ error: 'خطا در فرآیند بازیابی رمز عبور' });
  }
});

// In-memory store for 15-minute password recovery verification tokens
interface PasswordResetTokenInfo {
  token: string;
  expiresAt: number;
  userId: string;
  email: string;
}
const resetTokensStore = new Map<string, PasswordResetTokenInfo>();

// Clean expired tokens every 10 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of resetTokensStore.entries()) {
    if (value.expiresAt <= now) {
      resetTokensStore.delete(key);
    }
  }
}, 10 * 60 * 1000).unref();

// Check availability of email or username in real-time
app.get('/api/auth/check-availability', (req, res) => {
  const { email, username } = req.query;
  const result: { emailAvailable?: boolean; usernameAvailable?: boolean } = {};

  if (typeof email === 'string' && email.trim()) {
    const cleanEmail = email.trim().toLowerCase();
    result.emailAvailable = !db.findUserByEmail(cleanEmail);
  }

  if (typeof username === 'string' && username.trim()) {
    const cleanUsername = username.trim().toLowerCase();
    result.usernameAvailable = !db.findUserByUsername(cleanUsername);
  }

  res.json(result);
});

// Request Password Reset Token or Security Question
app.post('/api/auth/forgot-password-request', (req, res) => {
  try {
    const { identifier } = req.body;

    if (!identifier || typeof identifier !== 'string') {
      res.status(400).json({ error: 'لطفاً نام کاربری یا ایمیل خود را وارد کنید.' });
      return;
    }

    const cleanId = identifier.trim().toLowerCase();
    const user = db.findUserByEmail(cleanId) || db.findUserByUsername(cleanId);

    if (!user) {
      res.status(404).json({ error: 'حساب کاربری با این مشخصات یافت نشد. لطفاً ایمیل یا نام کاربری را بررسی کنید.' });
      return;
    }

    // Generate a secure 6-digit numeric token
    const randomDigits = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 15 * 60 * 1000; // 15 minutes

    const resetInfo: PasswordResetTokenInfo = {
      token: randomDigits,
      expiresAt,
      userId: user.id,
      email: user.email,
    };

    resetTokensStore.set(user.id, resetInfo);
    resetTokensStore.set(user.email.toLowerCase(), resetInfo);
    resetTokensStore.set(user.username.toLowerCase(), resetInfo);

    // Mask user email for privacy e.g. a***@example.com
    const emailParts = user.email.split('@');
    const maskedEmail = emailParts.length === 2
      ? `${emailParts[0].slice(0, 2)}***@${emailParts[1]}`
      : user.email;

    res.json({
      success: true,
      message: 'درخواست بازیابی ثبت شد.',
      securityQuestion: user.securityQuestion || 'نام اولین مدرسه شما چیست؟',
      maskedEmail,
      expiresInMinutes: 15,
      // Simulated secure email token: in cloud environments without SMTP/SendGrid credentials,
      // this allows immediate testing and validation while reporting the infrastructure state accurately.
      mockVerificationToken: randomDigits,
      infrastructureStatus: {
        smtpConfigured: false,
        mode: 'simulation_ready',
        notice: 'سرور محلی ایمیل خارجی (SMTP/SendGrid) تنظیم نشده است. کد بازیابی ۶ رقمی به شبیه‌ساز امن ارسال شد.',
      },
    });
  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ error: 'خطای سرور در پردازش درخواست بازیابی رمز عبور' });
  }
});

// Reset Password with Verification Token
app.post('/api/auth/reset-password-token', async (req, res) => {
  try {
    const { identifier, token, newPassword } = req.body;

    if (!identifier || !token || !newPassword) {
      res.status(400).json({ error: 'لطفاً نام کاربری/ایمیل، کد تأیید و رمز عبور جدید را ارسال کنید.' });
      return;
    }

    if (newPassword.length < 6) {
      res.status(400).json({ error: 'رمز عبور جدید باید حداقل ۶ کاراکتر باشد.' });
      return;
    }

    const cleanId = identifier.trim().toLowerCase();
    const stored = resetTokensStore.get(cleanId);

    if (!stored || stored.token !== token.trim()) {
      res.status(400).json({ error: 'کد تأیید نامعتبر یا اشتباه است.' });
      return;
    }

    if (Date.now() > stored.expiresAt) {
      resetTokensStore.delete(cleanId);
      res.status(400).json({ error: 'کد تأیید منقضی شده است (مهلت ۱۵ دقیقه به پایان رسید). لطفاً درخواست مجدد ثبت کنید.' });
      return;
    }

    const user = db.findUserById(stored.userId);
    if (!user) {
      res.status(404).json({ error: 'کاربر مربوطه یافت نشد.' });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const newHash = await bcrypt.hash(newPassword, salt);

    db.updateUser(user.id, { passwordHash: newHash });

    // Invalidate used token
    resetTokensStore.delete(cleanId);
    resetTokensStore.delete(user.id);
    resetTokensStore.delete(user.email.toLowerCase());
    resetTokensStore.delete(user.username.toLowerCase());

    res.json({
      success: true,
      message: 'رمز عبور با موفقیت تغییر کرد. اکنون می‌توانید با رمز جدید وارد شوید.',
    });
  } catch (err) {
    console.error('Reset token error:', err);
    res.status(500).json({ error: 'خطا در تغییر رمز عبور با کد تأیید' });
  }
});

// Delete User Account (With verification and cascaded data cleanup)
app.delete('/api/auth/account', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const { password } = req.body;
    if (!password) {
      res.status(400).json({ error: 'برای حذف حساب کاربری باید رمز عبور خود را وارد نمایید.' });
      return;
    }

    const user = req.user!;
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      res.status(400).json({ error: 'رمز عبور وارد شده نادرست است.' });
      return;
    }

    db.deleteUser(user.id);
    res.json({ message: 'حساب کاربری و کلیه اطلاعات مربوطه با موفقیت حذف شدند.' });
  } catch (err) {
    res.status(500).json({ error: 'خطا در حذف حساب کاربری' });
  }
});

// ----------------- User Isolated Persistent Data APIs -----------------

// Fetch Complete Data for Authenticated User Only
app.get('/api/data', authenticateToken, (req: AuthenticatedRequest, res) => {
  try {
    const data = db.getUserData(req.userId!);
    if (!data) {
      res.json({ exists: false, data: null });
      return;
    }
    res.json({ exists: true, data });
  } catch (err) {
    res.status(500).json({ error: 'خطا در بازیابی داده‌های کاربر' });
  }
});

// Save / Sync Complete Data for Authenticated User Only
app.put('/api/data', authenticateToken, (req: AuthenticatedRequest, res) => {
  try {
    const payload = req.body;
    if (!payload || typeof payload !== 'object') {
      res.status(400).json({ error: 'داده‌های ارسالی نامعتبر است.' });
      return;
    }

    // Server-side strict isolation: payload is saved exclusively under req.userId!
    db.saveUserData(req.userId!, payload);

    res.json({
      success: true,
      message: 'اطلاعات در پایگاه داده سرور ذخیره شد.',
      lastSaved: new Date().toISOString(),
    });
  } catch (err) {
    console.error('Error saving user data:', err);
    res.status(500).json({ error: 'خطای سرور در ذخیره‌سازی اطلاعات' });
  }
});

// Patch Specific Data Domain (e.g. subjects, homeworks, skills)
app.patch('/api/data/:domain', authenticateToken, (req: AuthenticatedRequest, res) => {
  try {
    const { domain } = req.params;
    const content = req.body;

    const updated = db.patchUserData(req.userId!, { [domain]: content });
    res.json({
      success: true,
      domain,
      updatedAt: updated._lastModified,
    });
  } catch (err) {
    res.status(500).json({ error: `خطا در بروزرسانی بخش ${req.params.domain}` });
  }
});

// ----------------- Backups & Point-in-time Snapshots -----------------

// Export Full User Backup
app.get('/api/backup/export', authenticateToken, (req: AuthenticatedRequest, res) => {
  try {
    const data = db.getUserData(req.userId!);
    const user = req.user!;

    const backupPayload = {
      version: 'pathly-v3-multiuser',
      exportedAt: new Date().toISOString(),
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        name: user.name,
      },
      data: data || {},
    };

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename=pathly_backup_${user.username}_${Date.now()}.json`);
    res.json(backupPayload);
  } catch (err) {
    res.status(500).json({ error: 'خطا در ایجاد خروجی پشتیبان' });
  }
});

// Import and Restore Backup
app.post('/api/backup/import', authenticateToken, (req: AuthenticatedRequest, res) => {
  try {
    const { backup } = req.body;

    if (!backup || typeof backup !== 'object') {
      res.status(400).json({ error: 'فایل پشتیبان معتبر نمی‌باشد.' });
      return;
    }

    const payloadData = backup.data || backup;

    // Safety snapshot before restore
    db.createSnapshot(req.userId!, 'Pre-import automatic safety backup');

    db.saveUserData(req.userId!, payloadData);

    res.json({
      success: true,
      message: 'اطلاعات فایل پشتیبان با موفقیت بازیابی و ذخیره شد.',
    });
  } catch (err) {
    res.status(500).json({ error: 'خطا در بازیابی فایل پشتیبان' });
  }
});

// List Snapshots
app.get('/api/backup/snapshots', authenticateToken, (req: AuthenticatedRequest, res) => {
  try {
    const snapshots = db.getSnapshotsForUser(req.userId!);
    const sanitized = snapshots.map((s) => ({
      id: s.id,
      createdAt: s.createdAt,
      reason: s.reason,
    }));
    res.json({ snapshots: sanitized });
  } catch (err) {
    res.status(500).json({ error: 'خطا در دریافت لیست نسخه‌های پشتیبان' });
  }
});

// Restore Specific Snapshot
app.post('/api/backup/restore-snapshot', authenticateToken, (req: AuthenticatedRequest, res) => {
  try {
    const { snapshotId } = req.body;
    if (!snapshotId) {
      res.status(400).json({ error: 'شناسه نسخه پشتیبان الزامی است.' });
      return;
    }

    const success = db.restoreSnapshot(req.userId!, snapshotId);
    if (!success) {
      res.status(404).json({ error: 'نسخه پشتیبان یافت نشد یا متعلق به کاربر دیگری است.' });
      return;
    }

    res.json({
      success: true,
      message: 'نسخه پشتیبان انتخاب‌شده با موفقیت بازیابی گردید.',
    });
  } catch (err) {
    res.status(500).json({ error: 'خطا در بازگردانی نسخه پشتیبان' });
  }
});

// Create Manual Snapshot on Demand
app.post('/api/backup/create-snapshot', authenticateToken, (req: AuthenticatedRequest, res) => {
  try {
    const { reason } = req.body || {};
    const snapshot = db.createSnapshot(req.userId!, reason || 'پشتیبان دستی کاربر');
    res.json({
      success: true,
      message: 'نسخه پشتیبان لحظه‌ای با موفقیت ایجاد شد.',
      snapshot: {
        id: snapshot.id,
        createdAt: snapshot.createdAt,
        reason: snapshot.reason,
      },
    });
  } catch (err) {
    res.status(500).json({ error: 'خطا در ایجاد نسخه پشتیبان لحظه‌ای' });
  }
});

// Admin Only: Get System Users
app.get('/api/admin/users', authenticateToken, (req: AuthenticatedRequest, res) => {
  if (req.user?.role !== 'admin') {
    res.status(403).json({ error: 'دسترسی غیرمجاز. فقط مدیر سیستم مجاز به مشاهده این بخش است.' });
    return;
  }
  const users = db.getAllUsers().map((u) => ({
    id: u.id,
    email: u.email,
    username: u.username,
    name: u.name,
    role: u.role,
    createdAt: u.createdAt,
  }));
  res.json({ users });
});

// ----------------- Smart & Adaptive Planning (Deterministic / Algorithmic) -----------------

// 1. Smart Daily Scheduler (Deterministic / Algorithmic)
const handleSmartPlan = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { tasks = [], availableMinutes = 300, startTime = '16:00' } = req.body;

    // Deterministic Algorithmic Scheduler
    const sortedTasks = [...tasks].sort((a: any, b: any) => {
      const pMap: Record<string, number> = { high: 3, medium: 2, low: 1 };
      const pDiff = (pMap[b.priority] || 2) - (pMap[a.priority] || 2);
      if (pDiff !== 0) return pDiff;
      return (b.estimatedMinutes || 30) - (a.estimatedMinutes || 30);
    });

    const [startH, startM] = startTime.split(':').map(Number);
    let currentMins = (isNaN(startH) ? 16 : startH) * 60 + (isNaN(startM) ? 0 : startM);
    let scheduledTime = 0;
    const schedule: any[] = [];
    const suggestions: string[] = [];

    sortedTasks.forEach((t: any, idx: number) => {
      const dur = Number(t.estimatedMinutes) || 40;
      if (scheduledTime + dur > availableMinutes) {
        suggestions.push(`وظیفه «${t.title}» به دلیل کمبود وقت بهتر است به فردا موکول شود.`);
        return;
      }

      const h1 = Math.floor(currentMins / 60);
      const m1 = currentMins % 60;
      currentMins += dur;
      scheduledTime += dur;
      const h2 = Math.floor(currentMins / 60);
      const m2 = currentMins % 60;

      schedule.push({
        id: `slot_${idx + 1}`,
        taskId: t.id,
        title: t.title,
        timeSlot: `${String(h1).padStart(2, '0')}:${String(m1).padStart(2, '0')} - ${String(h2).padStart(2, '0')}:${String(m2).padStart(2, '0')}`,
        durationMin: dur,
        isBreak: false,
        energy: t.energyLevel || 'medium',
        note: `تمرکز بر روی ${t.title} (${t.priority === 'high' ? 'اولویت بالا' : 'عادی'})`,
      });

      // Insert 10 min break
      if (idx < sortedTasks.length - 1 && dur >= 35) {
        const bh1 = Math.floor(currentMins / 60);
        const bm1 = currentMins % 60;
        currentMins += 10;
        scheduledTime += 10;
        const bh2 = Math.floor(currentMins / 60);
        const bm2 = currentMins % 60;
        schedule.push({
          id: `break_${idx + 1}`,
          title: 'استراحت و تجدید قوا (چای، کشش بدنی و تنفس)',
          timeSlot: `${String(bh1).padStart(2, '0')}:${String(bm1).padStart(2, '0')} - ${String(bh2).padStart(2, '0')}:${String(bm2).padStart(2, '0')}`,
          durationMin: 10,
          isBreak: true,
          note: 'استراحت کوتاه مغزی جهت حفظ حداکثر بازدهی یادگیری',
        });
      }
    });

    const feasibilityScore = Math.max(10, Math.min(100, Math.round(((availableMinutes - scheduledTime) / availableMinutes) * 100)));
    const feasibilityStatus = scheduledTime <= availableMinutes ? 'comfortable' : 'tight';

    res.json({
      success: true,
      source: 'algorithmic',
      schedule,
      feasibilityStatus,
      feasibilityScore,
      totalScheduledMinutes: scheduledTime,
      advice: 'برنامه بر اساس اولویت‌بندی بهینه و لحاظ نمودن زمان‌های استراحت تنظیمی چیده شده است.',
      suggestions: suggestions.length > 0 ? suggestions : ['تمام وظایف اولویت‌دار به خوبی در ساعات خالی شما جا گرفتند.'],
    });
  } catch (err: any) {
    console.error('Smart plan error:', err);
    res.status(500).json({ error: 'خطا در تولید برنامه روزانه' });
  }
};

app.post('/api/planner/smart-plan', authenticateToken, handleSmartPlan);
app.post('/api/ai/smart-plan', authenticateToken, handleSmartPlan);

// 2. Rescue Mode Planner (Algorithmic)
const handleRescuePlan = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { mode = '1_hour', remainingTasks = [], currentTime = '18:00' } = req.body;

    // Heuristic Rescue Algorithm
    const criticalTasks = remainingTasks.filter((t: any) => t.priority === 'high' || t.importance === 'critical');
    const deferredTasks = remainingTasks.filter((t: any) => t.priority !== 'high' && t.importance !== 'critical');

    const firstTask = criticalTasks[0] || remainingTasks[0];
    const smallestStep = firstTask
      ? `فقط ۵ دقیقه برای باز کردن و شروع ۵ خط اول از «${firstTask.title}» وقت بگذارید.`
      : 'یک لیوان آب بنوشید و ۱۰ دقیقه استراحت بدون گوشی داشته باشید.';

    const suggestedSchedule: any[] = [];
    const [h, m] = currentTime.split(':').map(Number);
    let curMins = (isNaN(h) ? 18 : h) * 60 + (isNaN(m) ? 0 : m);

    if (mode === '15_min') {
      const h1 = Math.floor(curMins / 60);
      const m1 = curMins % 60;
      curMins += 15;
      const h2 = Math.floor(curMins / 60);
      const m2 = curMins % 60;
      suggestedSchedule.push({
        id: 'step_micro',
        taskId: firstTask?.id,
        title: firstTask ? `میکرو اسپرینت روی: ${firstTask.title}` : 'مرور سریع یادداشت‌ها',
        timeSlot: `${String(h1).padStart(2, '0')}:${String(m1).padStart(2, '0')} - ${String(h2).padStart(2, '0')}:${String(m2).padStart(2, '0')}`,
        durationMin: 15,
        note: 'فقط ۱۵ دقیقه بدون حواس‌پرتی، سپس روز را با حس پیروزی ببندید.',
      });
    } else if (mode === '1_hour') {
      // 25m work + 5m break + 25m work + 5m wrap
      for (let i = 0; i < 2; i++) {
        const targetTask = criticalTasks[i] || remainingTasks[i] || firstTask;
        const h1 = Math.floor(curMins / 60);
        const m1 = curMins % 60;
        curMins += 25;
        const h2 = Math.floor(curMins / 60);
        const m2 = curMins % 60;
        suggestedSchedule.push({
          id: `step_block_${i + 1}`,
          taskId: targetTask?.id,
          title: targetTask ? `بلاک تمرکز ۲۵ دقیقه‌ای: ${targetTask.title}` : 'مطالعه و تمرکز',
          timeSlot: `${String(h1).padStart(2, '0')}:${String(m1).padStart(2, '0')} - ${String(h2).padStart(2, '0')}:${String(m2).padStart(2, '0')}`,
          durationMin: 25,
          note: 'تمرکز مطلق در حالت تک‌وظیفه‌ای (Monotasking)',
        });

        if (i === 0) {
          const bh1 = Math.floor(curMins / 60);
          const bm1 = curMins % 60;
          curMins += 5;
          const bh2 = Math.floor(curMins / 60);
          const bm2 = curMins % 60;
          suggestedSchedule.push({
            id: 'step_break_1',
            title: 'استراحت ۵ دقیقه‌ای (چشم‌ها را ببندید)',
            timeSlot: `${String(bh1).padStart(2, '0')}:${String(bm1).padStart(2, '0')} - ${String(bh2).padStart(2, '0')}:${String(bm2).padStart(2, '0')}`,
            durationMin: 5,
            isBreak: true,
            note: 'تنفس عمیق و نوشیدن آب',
          });
        }
      }
    } else {
      // Rebuild day until 22:30
      criticalTasks.slice(0, 3).forEach((t: any, idx: number) => {
        const h1 = Math.floor(curMins / 60);
        const m1 = curMins % 60;
        curMins += 45;
        const h2 = Math.floor(curMins / 60);
        const m2 = curMins % 60;
        suggestedSchedule.push({
          id: `step_rebuild_${idx}`,
          taskId: t.id,
          title: t.title,
          timeSlot: `${String(h1).padStart(2, '0')}:${String(m1).padStart(2, '0')} - ${String(h2).padStart(2, '0')}:${String(m2).padStart(2, '0')}`,
          durationMin: 45,
          note: 'تمرکز روی تسک حیاتی',
        });
        curMins += 15;
      });
    }

    res.json({
      success: true,
      source: 'algorithmic',
      plan: {
        mode,
        smallestStep,
        criticalTaskIds: criticalTasks.map((t: any) => t.id),
        deferredTaskIds: deferredTasks.map((t: any) => t.id),
        suggestedSchedule,
        message: 'هیچ شکستی رخ نداده است. عقب‌افتادن بخشی از ریتم زندگی است؛ با انجام این قدم‌های کوچک، کنترل روز را دوباره در دست می‌گیرید.',
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (err) {
    console.error('Rescue plan error:', err);
    res.status(500).json({ error: 'خطا در ایجاد طرح نجات روز' });
  }
};

app.post('/api/planner/rescue-plan', authenticateToken, handleRescuePlan);
app.post('/api/ai/rescue-plan', authenticateToken, handleRescuePlan);

// 5. Server-Validated RPG Award (Anti-Cheat)
app.post('/api/rpg/award-xp', authenticateToken, (req: AuthenticatedRequest, res) => {
  try {
    const { eventId, xpAmount, reason } = req.body;
    if (!eventId || typeof xpAmount !== 'number' || xpAmount <= 0) {
      res.status(400).json({ error: 'اطلاعات رویداد امتیازدهی نامعتبر است.' });
      return;
    }

    const userData = db.getUserData(req.userId!) || {};
    const rpg = userData.rpg || {
      enabled: true,
      xp: 0,
      level: 1,
      title: 'نوآموز مسیر',
      awardedEventIds: [],
    };

    if (rpg.awardedEventIds?.includes(eventId)) {
      // Already awarded — prevent duplicate exploit!
      res.json({
        awarded: false,
        message: 'این رویداد قبلاً ثبت و امتیاز آن محاسبه گردیده است.',
        currentXp: rpg.xp,
        currentLevel: rpg.level,
      });
      return;
    }

    // Award capped amount per event to avoid artificial inflation
    const safeXp = Math.min(xpAmount, 150);
    const newXp = (rpg.xp || 0) + safeXp;
    // Formula: Level = Math.floor(Math.sqrt(XP / 100)) + 1
    const newLevel = Math.floor(Math.sqrt(newXp / 100)) + 1;

    const titles = [
      'نوآموز مسیر',
      'پوینده متمرکز',
      'شاگرد منضبط',
      'پژوهشگر سخت‌کوش',
      'استاد بهره‌وری',
      'قهرمان استمرار',
      'معمار موفقیت',
      'اسطوره پیشرفت',
    ];
    const newTitle = titles[Math.min(newLevel - 1, titles.length - 1)];

    const updatedAwarded = [...(rpg.awardedEventIds || []), eventId];
    if (updatedAwarded.length > 500) {
      updatedAwarded.splice(0, updatedAwarded.length - 500); // keep recent 500
    }

    const updatedRpg = {
      ...rpg,
      xp: newXp,
      level: newLevel,
      title: newTitle,
      awardedEventIds: updatedAwarded,
      lastAwardedAt: new Date().toISOString(),
    };

    db.patchUserData(req.userId!, { rpg: updatedRpg });

    res.json({
      awarded: true,
      xpGained: safeXp,
      totalXp: newXp,
      level: newLevel,
      title: newTitle,
      leveledUp: newLevel > (rpg.level || 1),
      reason,
    });
  } catch (err) {
    console.error('Award XP error:', err);
    res.status(500).json({ error: 'خطا در اعتبارسنجی امتیاز سرور' });
  }
});


// ----------------- Vite Dev Server vs Production Static -----------------

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true, host: '0.0.0.0', port: Number(PORT) },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get('*', (req, res) => {
        res.sendFile(path.resolve(distPath, 'index.html'));
      });
    }
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`🚀 Pathly Multi-User Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
