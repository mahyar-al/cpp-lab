import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import path from 'node:path';
import fs from 'node:fs';
import crypto from 'node:crypto';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { GoogleGenAI } from '@google/genai';
import { db } from './src/server/db.ts';
import type { UserAccount, AIChatMessage, AIConversation } from './src/server/db.ts';
import { formatJalaliFull } from './src/utils/jalali.ts';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;
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

// ----------------- AI Assistant & Smart Planning (Gemini 3.8 Flash) -----------------

let geminiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (geminiClient) return geminiClient;
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  try {
    geminiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
    return geminiClient;
  } catch (err) {
    console.warn('Failed to initialize GoogleGenAI client:', err);
    return null;
  }
}

// Rate limiter in-memory structure: 25 requests/min, 200 requests/day per userId
interface RateLimitRecord {
  minuteTimestamp: number;
  minuteCount: number;
  dayString: string;
  dayCount: number;
}
const aiRateLimits = new Map<string, RateLimitRecord>();

function checkAIRateLimit(userId: string): { allowed: boolean; message?: string } {
  const now = Date.now();
  const todayStr = new Date().toISOString().slice(0, 10);
  let record = aiRateLimits.get(userId);

  if (!record) {
    record = { minuteTimestamp: now, minuteCount: 1, dayString: todayStr, dayCount: 1 };
    aiRateLimits.set(userId, record);
    return { allowed: true };
  }

  if (record.dayString !== todayStr) {
    record.dayString = todayStr;
    record.dayCount = 0;
  }

  if (now - record.minuteTimestamp > 60 * 1000) {
    record.minuteTimestamp = now;
    record.minuteCount = 0;
  }

  const MAX_PER_MIN = Number(process.env.AI_MAX_PER_MINUTE) || 25;
  const MAX_PER_DAY = Number(process.env.AI_MAX_PER_DAY) || 200;

  if (record.minuteCount >= MAX_PER_MIN) {
    return {
      allowed: false,
      message: `تعداد درخواست‌های شما بیش از سقف مجاز (${MAX_PER_MIN} درخواست در دقیقه) است. لطفاً کمی صبر کنید.`,
    };
  }

  if (record.dayCount >= MAX_PER_DAY) {
    return {
      allowed: false,
      message: `سقف مصرف روزانه هوش مصنوعی (${MAX_PER_DAY} درخواست در روز) برای حساب شما به پایان رسیده است.`,
    };
  }

  record.minuteCount += 1;
  record.dayCount += 1;
  return { allowed: true };
}

function buildUserPlannerContext(userId: string): string {
  const userData = db.getUserData(userId) || {};
  const userAccount = db.findUserById(userId);
  const now = new Date();

  // Day index in week (0: Saturday, 1: Sunday, ..., 6: Friday)
  const dayOfWeek = now.getDay();
  const todayIndex = (dayOfWeek + 1) % 7;
  const dayNames = ['شنبه', 'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنج‌شنبه', 'جمعه'];
  const todayName = dayNames[todayIndex];

  let jalaliDateStr = '';
  try {
    jalaliDateStr = formatJalaliFull(now);
  } catch {
    jalaliDateStr = now.toISOString().slice(0, 10);
  }

  const profile = userData.profile || {};
  const dayData = (userData.dayData && userData.dayData[todayIndex]) || { preSchoolTasks: [], postSchoolTasks: [], notes: '' };
  const allTodayTasks = [
    ...(dayData.preSchoolTasks || []).map((t: any) => ({ ...t, period: 'قبل از مدرسه / صبح' })),
    ...(dayData.postSchoolTasks || []).map((t: any) => ({ ...t, period: 'بعد از مدرسه / عصر' })),
  ];

  const pendingHomeworks = (userData.homeworks || []).filter((h: any) => !h.completed);
  const activeGoals = (userData.goals || []).filter((g: any) => g.status !== 'completed');
  const habits = userData.habits || [];
  const skills = userData.skills || [];
  const projects = userData.projects || [];
  const recentExams = (userData.exams || []).filter((e: any) => !e.completed);
  const subjects = userData.subjects || [];
  const notes = (userData.notes || []).slice(0, 4);
  const calendarEvents = (userData.calendarEvents || []).slice(0, 4);
  const studySessions = (userData.studySessions || []).slice(-3);

  return `
[اطلاعات واقعی، زنده و جاری کاربر در پایگاه‌داده Pathly]
نام کاربر: ${userAccount?.name || profile.name || 'کاربر گرامی'}
تاریخ امروز: ${jalaliDateStr} (${todayName})
ساعت فعلی: ${now.toTimeString().slice(0, 5)}

۱. کارهای امروز کاربر (${todayName}):
${allTodayTasks.length > 0 ? allTodayTasks.map((t: any, i: number) => `  ${i + 1}. [${t.completed ? 'انجام شده ✓' : 'انجام نشده ✗'}] «${t.title}» (${t.period}) - اولویت: ${t.priority || 'عادی'}${t.dueTime || t.startTime ? ` - زمان: ${t.dueTime || t.startTime}` : ''}${t.notes ? ` - یادداشت: ${t.notes}` : ''}`).join('\n') : '  هیچ کاری برای امروز ثبت نشده است.'}

۲. تکالیف مدرسه در انتظار انجام:
${pendingHomeworks.length > 0 ? pendingHomeworks.map((h: any, i: number) => `  ${i + 1}. درس «${h.subjectName || 'عمومی'}»: «${h.title}» (مهلت تحویل: ${h.dueDate || 'تعیین نشده'}) - اولویت: ${h.priority || 'عادی'}`).join('\n') : '  تکلیف در انتظاری ثبت نشده است.'}

۳. دروس مدرسه ثبت‌شده در سامانه:
${subjects.length > 0 ? subjects.map((s: any) => `  - درس: «${s.name}»${s.teacher ? ` (معلم: ${s.teacher})` : ''}`).join('\n') : '  درسی تعریف نشده است.'}

۴. آزمون‌ها و امتحانات پیش‌رو:
${recentExams.length > 0 ? recentExams.map((e: any, i: number) => `  ${i + 1}. درس: «${e.subjectName}» - عنوان: «${e.title}» - تاریخ: ${e.date || 'نامشخص'}`).join('\n') : '  آزمون ثبتی در پیش نیست.'}

۵. اهداف فعال:
${activeGoals.length > 0 ? activeGoals.map((g: any, i: number) => `  - هدف: «${g.title}» (دسته‌بندی: ${g.category}) - پیشرفت: ${g.progress || 0}٪`).join('\n') : '  هدف فعالی ثبت نشده است.'}

۶. عادات و استمرار (Streak):
${habits.length > 0 ? habits.map((h: any) => `  - عادت: «${h.title}» (استمرار: ${h.streak || 0} روز پیاپی)`).join('\n') : '  عادتی تعریف نشده است.'}

۷. مهارت‌های در حال توسعه:
${skills.length > 0 ? skills.slice(0, 5).map((s: any) => `  - مهارت: «${s.name}» (سطح فعلی: ${s.currentLevel}، سطح هدف: ${s.targetLevel})`).join('\n') : '  مهارتی ثبت نشده است.'}

۸. پروژه‌های در حال اجرا:
${projects.length > 0 ? projects.slice(0, 4).map((p: any) => `  - پروژه: «${p.title}» (وضعیت: ${p.status})`).join('\n') : '  پروژه‌ای ثبت نشده است.'}

۹. رویدادهای تقویم ثبت‌شده:
${calendarEvents.length > 0 ? calendarEvents.map((ev: any, i: number) => `  ${i + 1}. «${ev.title}» (تاریخ: ${ev.date}${ev.time ? ` ساعت ${ev.time}` : ''})`).join('\n') : '  رویداد تقویمی ثبت نشده است.'}

۱۰. یادداشت‌های اخیر کاربر:
${notes.length > 0 ? notes.map((n: any, i: number) => `  ${i + 1}. «${n.title}» (دسته‌بندی: ${n.category}): ${n.content?.slice(0, 80) || 'بدون متن'}`).join('\n') : '  یادداشتی ثبت نشده است.'}

۱۱. جلسات تمرکز اخیر:
${studySessions.length > 0 ? studySessions.map((ss: any) => `  - درس/فعالیت: «${ss.subjectName}» (مدت: ${ss.actualDurationMin} دقیقه، تاریخ: ${ss.date})`).join('\n') : '  جلسه تمرکز اخیری ثبت نشده است.'}
`;
}

// 1. Smart Daily Scheduler
app.post('/api/ai/smart-plan', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const { tasks = [], availableMinutes = 300, startTime = '16:00', focusGoal = '' } = req.body;
    const client = getGeminiClient();

    if (client && tasks.length > 0) {
      try {
        const prompt = `شما یک دستیار و معمار هوشمند برنامه‌ریزی تحصیلی و فردی به زبان فارسی هستید.
اطلاعات وظایف امروز کاربر:
${JSON.stringify(tasks, null, 2)}
زمان آزاد مفید: ${availableMinutes} دقیقه. زمان شروع: ${startTime}. هدف تمرکز امروز: ${focusGoal || 'پیشرفت متعادل'}.

لطفاً یک برنامه زمانبندی روزانه بهینه، واقع‌بینانه و بدون خستگی بسازید:
- کارهای با اولویت بالا و انرژی بالا در ابتدای ساعات قرار گیرند.
- بعد از هر ۴۰ تا ۵۰ دقیقه کار، ۱۰ الی ۱۵ دقیقه استراحت در نظر بگیرید.
- وابستگی وظایف را رعایت کنید.
- مجموع زمان وظایف را با زمان آزاد تطبیق دهید و وضعیت امکان‌پذیری را گزارش کنید.

پاسخ را دقیقاً در قالب این ساختار JSON برگردانید (بدون متن اضافی خارج از JSON):
{
  "schedule": [
    {
      "id": "slot_1",
      "taskId": "شناسه تسک یا خالی برای استراحت",
      "title": "عنوان فعالیت یا استراحت",
      "timeSlot": "16:00 - 16:45",
      "durationMin": 45,
      "isBreak": false,
      "energy": "high",
      "note": "توضیح کوتاه کاربردی"
    }
  ],
  "feasibilityStatus": "comfortable" | "tight" | "impossible",
  "feasibilityScore": 85,
  "totalScheduledMinutes": 240,
  "advice": "توصیه عملی به فارسی برای اجرای موفق این برنامه",
  "suggestions": ["پیشنهاد ۱", "پیشنهاد ۲"]
}`;

        const aiResponse = await client.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
          },
        });

        const rawText = aiResponse.text?.trim() || '{}';
        const parsed = JSON.parse(rawText);
        res.json({
          success: true,
          source: 'gemini',
          ...parsed,
        });
        return;
      } catch (aiErr) {
        console.warn('Gemini smart-plan call failed, falling back to algorithmic scheduler:', aiErr);
      }
    }

    // Deterministic Algorithmic Scheduler Fallback
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
    res.status(500).json({ error: 'خطا در تولید هوشمند برنامه روزانه' });
  }
});

// 2. Rescue Mode Planner
app.post('/api/ai/rescue-plan', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const { mode = '1_hour', remainingTasks = [], currentTime = '18:00' } = req.body;
    const client = getGeminiClient();

    if (client && remainingTasks.length > 0) {
      try {
        const prompt = `شما یک مشاور ارشد و مهربان مدیریت زمان و نجات روز (Rescue Mode) به زبان فارسی هستید.
کاربر دچار عقب‌افتادگی یا کمبود زمان شده و نباید احساس شکست، اضطراب یا سرزنش کند.
حالت انتخابی: «${mode === '15_min' ? 'فقط ۱۵ دقیقه وقت دارم' : mode === '1_hour' ? 'یک ساعت وقت دارم' : 'بازسازی واقع‌بینانه باقی روز'}».
ساعت فعلی: ${currentTime}
کارهای باقیمانده:
${JSON.stringify(remainingTasks, null, 2)}

مأموریت شما:
۱. تفکیک دقیق کارهای «حیاتی» از کارهای «قابل‌تعویق به فردا بدون عذاب وجدان».
۲. تعیین مشخص «کوچک‌ترین قدم مفید برای شروع» (اقدام ۵ الی ۱۰ دقیقه‌ای جهت غلبه بر اینرسی).
۳. ارائه برنامه کوتاه و نجات‌بخش متناسب با حالت انتخابی.
۴. لحن کاملاً حمایتی و غیرقضاوت‌گر.

پاسخ را در این قالب دقیق JSON برگردانید:
{
  "mode": "${mode}",
  "smallestStep": "اقدام مشخص و کوچک ۵ دقیقه‌ای",
  "criticalTaskIds": ["شناسه کارهای حیاتی"],
  "deferredTaskIds": ["شناسه کارهای قابل تعویق"],
  "suggestedSchedule": [
    {
      "id": "step_1",
      "taskId": "شناسه تسک",
      "title": "عنوان مرحله",
      "timeSlot": "18:00 - 18:25",
      "durationMin": 25,
      "isBreak": false,
      "note": "توضیح کوتاه"
    }
  ],
  "message": "پیام انگیزشی صمیمی و آرامش‌بخش برای کاربر"
}`;

        const aiResponse = await client.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: { responseMimeType: 'application/json' },
        });

        const raw = aiResponse.text?.trim() || '{}';
        const parsed = JSON.parse(raw);
        res.json({
          success: true,
          source: 'gemini',
          plan: {
            ...parsed,
            generatedAt: new Date().toISOString(),
          },
        });
        return;
      } catch (aiErr) {
        console.warn('Gemini rescue-plan call failed, using heuristic rescue:', aiErr);
      }
    }

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
});

// 3. Goal Breakdown Assistant
app.post('/api/ai/goal-breakdown', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const { title, description = '', targetLevel = 'پیشرفته', category = 'skill' } = req.body;
    const client = getGeminiClient();

    if (client && title) {
      try {
        const prompt = `شما مشاور ارشد تجزیه اهداف و یادگیری به زبان فارسی هستید.
کاربر می‌خواهد به این هدف برسد:
عنوان: «${title}»
توضیحات: «${description}»
دسته‌بندی: ${category}
سطح مورد انتظار: ${targetLevel}

لطفاً این هدف بزرگ را به نقشه راه و قطعات اجرایی کوچک تبدیل کنید:
۱. ۳ الی ۵ نقطه عطف (Milestone) متوالی و قابل سنجش.
۲. مهارت‌های ضروری و پیش‌نیازها.
۳. ۳ وظیفه عملی و فوری برای شروع همین هفته.

پاسخ در قالب JSON زیر:
{
  "milestones": [
    { "title": "عنوان نقطه عطف", "description": "توضیح هدف" }
  ],
  "requiredSkills": ["مهارت ۱", "مهارت ۲"],
  "prerequisites": ["پیش‌نیاز ۱"],
  "immediateTasks": [
    { "title": "عنوان اقدام مشخص", "estimatedMinutes": 45, "priority": "high" }
  ],
  "advice": "توصیه کلیدی برای حفظ انگیزه و جلوگیری از خستگی"
}`;

        const aiResponse = await client.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: { responseMimeType: 'application/json' },
        });

        const parsed = JSON.parse(aiResponse.text?.trim() || '{}');
        res.json({ success: true, source: 'gemini', ...parsed });
        return;
      } catch (aiErr) {
        console.warn('Gemini goal-breakdown call failed, fallback used:', aiErr);
      }
    }

    // Heuristic Fallback
    res.json({
      success: true,
      source: 'algorithmic',
      milestones: [
        { title: `شناخت مبانی و مفاهیم پایه‌ای ${title}`, description: 'بررسی سرفصل‌ها و تسلط بر اصطلاحات اولیه' },
        { title: `تمرین‌های کاربردی و حل ۱۰ مسئله مرتبط با ${title}`, description: 'پیاده‌سازی نخستین نمونه‌ها' },
        { title: `اجرای پروژه جامع و سنجش تسلط نهایی در سطح ${targetLevel}`, description: 'تثبیت یادگیری و رفع نقاط ضعف' },
      ],
      requiredSkills: [`مفاهیم پایه ${title}`, 'حل مسئله ساختاریافته', 'مستندسازی و یادداشت‌برداری'],
      prerequisites: ['آشنایی اولیه با موضوع'],
      immediateTasks: [
        { title: `جمع‌آوری و انتخاب بهترین منبع یادگیری برای «${title}»`, estimatedMinutes: 30, priority: 'high' },
        { title: `مطالعه و خلاصه نویسی فصل اول یا بخش اول از «${title}»`, estimatedMinutes: 45, priority: 'high' },
        { title: `حل اولین نمونه عملی یا تمرین کوتاه مرتبط`, estimatedMinutes: 40, priority: 'medium' },
      ],
      advice: 'برای رسیدن به این هدف، تداوم روزانه ۲۰ الی ۳۰ دقیقه بسیار مؤثرتر از مطالعه فشرده چند ساعته در یک روز است.',
    });
  } catch (err) {
    console.error('Goal breakdown error:', err);
    res.status(500).json({ error: 'خطا در تجزیه هوشمند هدف' });
  }
});

// ----------------- AI Conversations & Real-Time Streaming Chat -----------------

// List conversations for authenticated user
app.get('/api/ai/conversations', authenticateToken, (req: AuthenticatedRequest, res) => {
  try {
    const convs = db.getConversations(req.userId!);
    const summaries = convs.map((c) => ({
      id: c.id,
      title: c.title,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
      messageCount: c.messages.length,
      lastMessagePreview: c.messages.length > 0 ? c.messages[c.messages.length - 1].text.slice(0, 60) : '',
    }));
    res.json({ success: true, conversations: summaries });
  } catch (err: any) {
    console.error('Error fetching conversations:', err.message || err);
    res.status(500).json({ error: 'خطا در دریافت لیست مکالمات' });
  }
});

// Create new conversation
app.post('/api/ai/conversations', authenticateToken, (req: AuthenticatedRequest, res) => {
  try {
    const title = req.body?.title;
    const newConv = db.createConversation(req.userId!, title);
    res.status(201).json({ success: true, conversation: newConv });
  } catch (err: any) {
    console.error('Error creating conversation:', err.message || err);
    res.status(500).json({ error: 'خطا در ساخت مکالمه جدید' });
  }
});

// Get single conversation details with messages
app.get('/api/ai/conversations/:id', authenticateToken, (req: AuthenticatedRequest, res) => {
  try {
    const conv = db.getConversation(req.userId!, req.params.id);
    if (!conv) {
      res.status(404).json({ error: 'مکالمه مورد نظر یافت نشد.' });
      return;
    }
    res.json({ success: true, conversation: conv });
  } catch (err: any) {
    res.status(500).json({ error: 'خطا در بارگذاری مکالمه' });
  }
});

// Delete conversation
app.delete('/api/ai/conversations/:id', authenticateToken, (req: AuthenticatedRequest, res) => {
  try {
    const deleted = db.deleteConversation(req.userId!, req.params.id);
    if (!deleted) {
      res.status(404).json({ error: 'مکالمه یافت نشد یا متعلق به شما نیست.' });
      return;
    }
    res.json({ success: true, message: 'مکالمه با موفقیت حذف گردید.' });
  } catch (err: any) {
    res.status(500).json({ error: 'خطا در حذف مکالمه' });
  }
});

// Clear messages in conversation
app.post('/api/ai/conversations/:id/clear', authenticateToken, (req: AuthenticatedRequest, res) => {
  try {
    const cleared = db.clearConversation(req.userId!, req.params.id);
    if (!cleared) {
      res.status(404).json({ error: 'مکالمه یافت نشد.' });
      return;
    }
    res.json({ success: true, message: 'تاریخچه پیام‌های مکالمه پاکسازی شد.' });
  } catch (err: any) {
    res.status(500).json({ error: 'خطا در پاکسازی مکالمه' });
  }
});

// Rename conversation title
app.patch('/api/ai/conversations/:id/title', authenticateToken, (req: AuthenticatedRequest, res) => {
  try {
    const { title } = req.body || {};
    if (!title || typeof title !== 'string' || !title.trim()) {
      res.status(400).json({ error: 'عنوان وارد شده معتبر نمی‌باشد.' });
      return;
    }
    const ok = db.updateConversationTitle(req.userId!, req.params.id, title.trim());
    if (!ok) {
      res.status(404).json({ error: 'مکالمه یافت نشد.' });
      return;
    }
    res.json({ success: true, title: title.trim() });
  } catch (err: any) {
    res.status(500).json({ error: 'خطا در ویرایش عنوان مکالمه' });
  }
});

// AI Model and Service Configuration (Provider, available models, connection status)
app.get('/api/ai/config', authenticateToken, (_req: AuthenticatedRequest, res) => {
  res.json({
    provider: 'Google Gemini',
    availableModels: [
      { id: 'gemini-3.8-flash', name: 'Gemini 3.8 Flash (پیشنهادی - هوشمند، سریع و زنده)' },
      { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash (پاسخ بسیار سریع و سبک)' },
      { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro (استدلال عمیق و تفصیلی)' },
    ],
    defaultModel: process.env.GEMINI_MODEL || 'gemini-3.8-flash',
    isConfigured: !!process.env.GEMINI_API_KEY,
  });
});

// Real-Time Streaming Chat Endpoint (Server-Sent Events)
app.post('/api/ai/chat/stream', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const { message, conversationId, model, tone } = req.body;
    if (!message || typeof message !== 'string' || !message.trim()) {
      res.status(400).json({ error: 'متن پیام الزامی است.' });
      return;
    }

    const trimmedMessage = message.trim();
    if (trimmedMessage.length > 4000) {
      res.status(400).json({ error: 'طول پیام نمی‌تواند بیش از ۴۰۰۰ کاراکتر باشد.' });
      return;
    }

    // Rate limiting & quota enforcement per user
    const rateCheck = checkAIRateLimit(req.userId!);
    if (!rateCheck.allowed) {
      res.status(429).json({ error: rateCheck.message });
      return;
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      res.status(503).json({
        error: 'کلید ارتباط با مدل هوش مصنوعی (GEMINI_API_KEY) روی سرور یافت نشد. لطفاً کلید معتبر Gemini API را تنظیم فرمایید.',
      });
      return;
    }

    // Find or create conversation
    let conv = conversationId ? db.getConversation(req.userId!, conversationId) : null;
    if (!conv) {
      conv = db.createConversation(req.userId!);
    }

    // Multi-turn sliding memory window (last 12 turns)
    const historyMessages = conv.messages.slice(-12);
    const contents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];

    for (const m of historyMessages) {
      contents.push({
        role: m.sender === 'user' ? 'user' : 'model',
        parts: [{ text: m.text }],
      });
    }

    // Append the incoming user prompt
    contents.push({
      role: 'user',
      parts: [{ text: trimmedMessage }],
    });

    // Real dynamic user planner context
    const plannerContext = buildUserPlannerContext(req.userId!);

    // Validated customizable model selection
    const ALLOWED_MODELS = ['gemini-3.8-flash', 'gemini-2.5-flash', 'gemini-2.5-pro'];
    const modelName = model && ALLOWED_MODELS.includes(model)
      ? model
      : (process.env.GEMINI_MODEL || 'gemini-3.8-flash');

    const toneInstruction =
      tone === 'academic'
        ? '\nلحن پاسخ‌دهی: مشاور منضبط، علمی، ساختاریافته و تمرکز بر عمل‌گرایی و برنامه‌ریزی بدون حاشیه.'
        : tone === 'motivational'
        ? '\nلحن پاسخ‌دهی: مربی پرانرژی، امیدبخش، الهام‌بخش، تقویت‌کننده اراده و انگیزه برای شروع.'
        : '\nلحن پاسخ‌دهی: متوازن، صمیمی، آرامش‌بخش، شفاف و دقیق.';

    const systemInstruction = `شما «مسیرساز هوشمند Pathly»، دستیار ارشد هوش مصنوعی اختصاصی، زنده و تعاملی کاربر در سامانه برنامه‌ریزی جامع تحصیلی و فردی Pathly هستید.
شما مانند یک مشاور برجسته، دقیق، دلسوز و متعهد به زبان فارسی روان، جذاب و استاندارد پاسخ می‌دهید.${toneInstruction}

اطلاعات واقعی و برخط کاربر از پایگاه‌داده Pathly به شرح زیر است:
${plannerContext}

اصول بنیادین پاسخ‌دهی:
۱. پاسخ شما کاملاً برخط، تازه و متناسب با سؤال فعلی کاربر و زمینه مکالمه است. هیچ پاسخ ثابت یا کلیشه‌ای ندهید.
۲. اتصال به اطلاعات واقعی: اگر کاربر در مورد برنامه امروز، تکالیف در انتظار، دروس، امتحانات، اهداف، عادات یا پروژه‌ها پرسید، بر اساس داده‌های واقعی بالا پاسخ دهید.
۳. درستی و صداقت داده‌ها: اگر اطلاعات خواسته‌شده در برنامه‌ریز کاربر وجود ندارد، صریحاً و با لحنی همدلانه بفرمایید که این مورد هنوز در برنامه‌ریز او ثبت نشده است؛ هرگز وظیفه خیالی یا امتحان فرضی نسازید.
۴. حافظه مکالمه: اگر کاربر به پیام‌های قبلی گفتگو اشاره کرد (مثل «همان برنامه را تغییر بده» یا «برای مورد دوم بیشتر توضیح بده»)، متناسب با تاریخچه مکالمه فوراً عمل کنید.
۵. ساختاردهی خروجی با Markdown:
   - از عناوین موضوعی (## و ###)
   - از لیست‌های بولت‌دار (- ) یا شماره‌دار (1. 2.)
   - برای کلیدواژه‌های اصلی از **بولد**
   - برای جدول زمانی و زمان‌بندی‌ها از جدول تمیز Markdown (| ساعت | فعالیت | اولویت |)
   - برای کدهای برنامه‌نویسی یا اصطلاحات فنی انگلیسی از \`\`\` با ذکر زبان استفاده کنید.
۶. در هنگام خستگی یا عقب‌افتادگی کاربر، بدون سرزنش، تکنیک گام‌های ۵ دقیقه‌ای و کاهش فشار ذهنی را به کار بگیرید.`;

    // Instantiate GoogleGenAI client (User-Agent header required by system skill)
    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    // Setup Server-Sent Events (SSE) streaming headers
    res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders?.();

    // Record user message into DB immediately
    const userMsg: AIChatMessage = {
      id: `msg_${Date.now()}_u`,
      sender: 'user',
      text: trimmedMessage,
      timestamp: new Date().toISOString(),
    };
    db.addMessageToConversation(req.userId!, conv.id, userMsg);

    // Send start event to client
    res.write(`data: ${JSON.stringify({ type: 'start', conversationId: conv.id, userMessage: userMsg })}\n\n`);

    let isAborted = false;
    req.on('close', () => {
      isAborted = true;
    });

    const responseStream = await ai.models.generateContentStream({
      model: modelName,
      contents,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    let fullAssistantText = '';

    for await (const chunk of responseStream) {
      if (isAborted) break;
      const text = chunk.text;
      if (text) {
        fullAssistantText += text;
        res.write(`data: ${JSON.stringify({ type: 'chunk', text })}\n\n`);
      }
    }

    if (fullAssistantText.trim()) {
      const assistantMsg: AIChatMessage = {
        id: `msg_${Date.now()}_a`,
        sender: 'assistant',
        text: fullAssistantText,
        timestamp: new Date().toISOString(),
      };
      const updatedConv = db.addMessageToConversation(req.userId!, conv.id, assistantMsg);

      res.write(
        `data: ${JSON.stringify({
          type: 'done',
          conversationId: conv.id,
          assistantMessage: assistantMsg,
          title: updatedConv?.title || conv.title,
        })}\n\n`
      );
    }

    res.end();
  } catch (err: any) {
    console.error('Gemini streaming error:', err.message || err);
    const errorMessage =
      err?.message?.includes('API_KEY_INVALID') || err?.status === 400
        ? 'کلید Gemini API نامعتبر است. لطفاً متغیر GEMINI_API_KEY را در تنظیمات بررسی نمایید.'
        : err?.status === 429
        ? 'سقف مصرف یا محدودیت نرخ درخواست Gemini API تکمیل شده است. لطفاً کمی بعد امتحان کنید.'
        : `خطا در ارتباط با مدل هوش مصنوعی: ${err.message || 'پاسخی دریافت نشد'}`;

    if (res.headersSent) {
      res.write(`data: ${JSON.stringify({ type: 'error', error: errorMessage })}\n\n`);
      res.end();
    } else {
      res.status(500).json({ error: errorMessage });
    }
  }
});

// Non-streaming chat endpoint (backward-compatible, real Gemini with planner context)
app.post('/api/ai/chat', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const { message, conversationId, model, tone } = req.body;
    if (!message || typeof message !== 'string' || !message.trim()) {
      res.status(400).json({ error: 'پیام کاربر الزامی است.' });
      return;
    }

    const rateCheck = checkAIRateLimit(req.userId!);
    if (!rateCheck.allowed) {
      res.status(429).json({ error: rateCheck.message });
      return;
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      res.status(503).json({
        error: 'کلید ارتباط با مدل هوش مصنوعی (GEMINI_API_KEY) روی سرور یافت نشد.',
      });
      return;
    }

    let conv = conversationId ? db.getConversation(req.userId!, conversationId) : null;
    if (!conv) {
      conv = db.createConversation(req.userId!);
    }

    const historyMessages = conv.messages.slice(-12);
    const contents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];

    for (const m of historyMessages) {
      contents.push({
        role: m.sender === 'user' ? 'user' : 'model',
        parts: [{ text: m.text }],
      });
    }

    contents.push({
      role: 'user',
      parts: [{ text: message.trim() }],
    });

    const plannerContext = buildUserPlannerContext(req.userId!);

    const ALLOWED_MODELS = ['gemini-3.8-flash', 'gemini-2.5-flash', 'gemini-2.5-pro'];
    const modelName = model && ALLOWED_MODELS.includes(model)
      ? model
      : (process.env.GEMINI_MODEL || 'gemini-3.8-flash');

    const toneInstruction =
      tone === 'academic'
        ? '\nلحن پاسخ‌دهی: مشاور منضبط، علمی و ساختاریافته.'
        : tone === 'motivational'
        ? '\nلحن پاسخ‌دهی: مربی پرانرژی و انگیزشی.'
        : '\nلحن پاسخ‌دهی: متوازن، صمیمی و دقیق.';

    const systemInstruction = `شما «مسیرساز هوشمند Pathly»، دستیار شخصی و برنامه‌ریز زنده کاربر در Pathly هستید.${toneInstruction}
اطلاعات واقعی و جاری کاربر:
${plannerContext}
پاسخ تازه، واقعی و متناسب با سؤال کاربر به فارسی تولید کنید. از اطلاعات واقعی بالا استفاده کنید و در صورت عدم وجود داده، صادقانه بفرمایید داده‌ای ثبت نشده است.`;

    const client = new GoogleGenAI({
      apiKey,
      httpOptions: { headers: { 'User-Agent': 'aistudio-build' } },
    });

    const aiResponse = await client.models.generateContent({
      model: modelName,
      contents,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    const reply = aiResponse.text?.trim() || 'پاسخی از مدل دریافت نشد.';

    const userMsg: AIChatMessage = {
      id: `msg_${Date.now()}_u`,
      sender: 'user',
      text: message.trim(),
      timestamp: new Date().toISOString(),
    };
    const assistantMsg: AIChatMessage = {
      id: `msg_${Date.now()}_a`,
      sender: 'assistant',
      text: reply,
      timestamp: new Date().toISOString(),
    };

    db.addMessageToConversation(req.userId!, conv.id, userMsg);
    const updatedConv = db.addMessageToConversation(req.userId!, conv.id, assistantMsg);

    res.json({
      success: true,
      source: 'gemini',
      model: modelName,
      conversationId: conv.id,
      title: updatedConv?.title || conv.title,
      reply,
    });
  } catch (err: any) {
    console.error('Chat error:', err.message || err);
    res.status(500).json({ error: `خطا در ارتباط با مدل هوش مصنوعی: ${err.message || 'خطای سرور'}` });
  }
});

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
