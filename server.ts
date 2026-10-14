import express, { Request, Response, NextFunction } from 'express';
import path from 'node:path';
import fs from 'node:fs';
import crypto from 'node:crypto';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db, UserAccount } from './src/server/db.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
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
