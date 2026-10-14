import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

export interface UserAccount {
  id: string;
  email: string;
  username: string;
  passwordHash: string;
  name: string;
  role: 'user' | 'admin';
  createdAt: string;
  updatedAt: string;
  avatarUrl?: string;
  securityQuestion?: string;
  securityAnswerHash?: string;
}

export interface UserBackupSnapshot {
  id: string;
  userId: string;
  createdAt: string;
  reason: string;
  data: any;
}

export interface DatabaseSchema {
  version: number;
  users: Record<string, UserAccount>; // id -> UserAccount
  userData: Record<string, any>; // userId -> Full User App State
  snapshots: UserBackupSnapshot[];
  metadata: {
    createdAt: string;
    lastSavedAt: string;
    totalWrites: number;
  };
}

const DB_DIR = path.resolve(process.cwd(), 'data');
const BACKUP_DIR = path.resolve(DB_DIR, 'backups');
const DB_FILE = process.env.DATABASE_PATH || path.resolve(DB_DIR, 'pathly_database.json');

// In-memory representation synchronized with atomic file persistence
class DatabaseService {
  private data: DatabaseSchema = {
    version: 1,
    users: {},
    userData: {},
    snapshots: [],
    metadata: {
      createdAt: new Date().toISOString(),
      lastSavedAt: new Date().toISOString(),
      totalWrites: 0,
    },
  };

  private isInitialized = false;

  constructor() {
    this.init();
  }

  private ensureDirectories() {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }
    if (!fs.existsSync(BACKUP_DIR)) {
      fs.mkdirSync(BACKUP_DIR, { recursive: true });
    }
  }

  private init() {
    if (this.isInitialized) return;
    this.ensureDirectories();

    if (fs.existsSync(DB_FILE)) {
      try {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        this.data = {
          version: parsed.version || 1,
          users: parsed.users || {},
          userData: parsed.userData || {},
          snapshots: parsed.snapshots || [],
          metadata: parsed.metadata || {
            createdAt: new Date().toISOString(),
            lastSavedAt: new Date().toISOString(),
            totalWrites: 0,
          },
        };
      } catch (err) {
        console.error('Failed to parse existing database file, creating backup copy and re-initializing:', err);
        const corruptBackup = path.resolve(BACKUP_DIR, `corrupt_db_${Date.now()}.json`);
        try {
          fs.copyFileSync(DB_FILE, corruptBackup);
        } catch {
          // ignore
        }
        this.persist();
      }
    } else {
      this.persist();
    }
    this.isInitialized = true;
  }

  /**
   * Atomic file persistence using temporary file and rename
   */
  private persist() {
    this.ensureDirectories();
    this.data.metadata.lastSavedAt = new Date().toISOString();
    this.data.metadata.totalWrites += 1;

    const tmpFile = `${DB_FILE}.tmp.${Date.now()}.${crypto.randomBytes(4).toString('hex')}`;
    const serialized = JSON.stringify(this.data, null, 2);

    fs.writeFileSync(tmpFile, serialized, 'utf-8');
    fs.renameSync(tmpFile, DB_FILE);
  }

  // --- User Operations ---
  public getAllUsers(): UserAccount[] {
    return Object.values(this.data.users);
  }

  public findUserById(id: string): UserAccount | null {
    return this.data.users[id] || null;
  }

  public findUserByEmail(email: string): UserAccount | null {
    const normalized = email.trim().toLowerCase();
    return Object.values(this.data.users).find((u) => u.email.toLowerCase() === normalized) || null;
  }

  public findUserByUsername(username: string): UserAccount | null {
    const normalized = username.trim().toLowerCase();
    return Object.values(this.data.users).find((u) => u.username.toLowerCase() === normalized) || null;
  }

  public createUser(user: Omit<UserAccount, 'createdAt' | 'updatedAt'>): UserAccount {
    const now = new Date().toISOString();
    const newUser: UserAccount = {
      ...user,
      createdAt: now,
      updatedAt: now,
    };
    this.data.users[newUser.id] = newUser;
    this.persist();
    return newUser;
  }

  public updateUser(id: string, updates: Partial<UserAccount>): UserAccount | null {
    const user = this.data.users[id];
    if (!user) return null;
    const updated = {
      ...user,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.data.users[id] = updated;
    this.persist();
    return updated;
  }

  public deleteUser(id: string): boolean {
    if (!this.data.users[id]) return false;
    // create safety snapshot before deletion
    if (this.data.userData[id]) {
      this.createSnapshot(id, 'Pre-deletion automatic safety backup');
    }
    delete this.data.users[id];
    delete this.data.userData[id];
    this.persist();
    return true;
  }

  // --- User Data Operations ---
  public getUserData(userId: string): any | null {
    return this.data.userData[userId] || null;
  }

  public saveUserData(userId: string, data: any): void {
    this.data.userData[userId] = {
      ...data,
      userId,
      _lastModified: new Date().toISOString(),
    };
    this.persist();
  }

  public patchUserData(userId: string, partialData: Record<string, any>): any {
    const current = this.data.userData[userId] || {};
    const updated = {
      ...current,
      ...partialData,
      userId,
      _lastModified: new Date().toISOString(),
    };
    this.data.userData[userId] = updated;
    this.persist();
    return updated;
  }

  // --- Snapshot & Backup Operations ---
  public createSnapshot(userId: string, reason: string): UserBackupSnapshot {
    const userData = this.data.userData[userId];
    const snapshot: UserBackupSnapshot = {
      id: crypto.randomUUID(),
      userId,
      createdAt: new Date().toISOString(),
      reason,
      data: JSON.parse(JSON.stringify(userData || {})),
    };
    this.data.snapshots.push(snapshot);
    // Keep at most 20 recent snapshots
    if (this.data.snapshots.length > 50) {
      this.data.snapshots = this.data.snapshots.slice(-50);
    }

    // Also write a standalone backup file to BACKUP_DIR
    try {
      const backupFilename = path.resolve(BACKUP_DIR, `backup_${userId}_${Date.now()}.json`);
      fs.writeFileSync(backupFilename, JSON.stringify(snapshot, null, 2), 'utf-8');
    } catch (err) {
      console.warn('Could not write standalone backup file:', err);
    }

    this.persist();
    return snapshot;
  }

  public getSnapshotsForUser(userId: string): UserBackupSnapshot[] {
    return this.data.snapshots.filter((s) => s.userId === userId);
  }

  public restoreSnapshot(userId: string, snapshotId: string): boolean {
    const snapshot = this.data.snapshots.find((s) => s.id === snapshotId && s.userId === userId);
    if (!snapshot) return false;
    // create safety snapshot of current state first
    this.createSnapshot(userId, 'Pre-restore safety snapshot');
    this.data.userData[userId] = JSON.parse(JSON.stringify(snapshot.data));
    this.persist();
    return true;
  }

  public getStats() {
    return {
      totalUsers: Object.keys(this.data.users).length,
      totalDataSets: Object.keys(this.data.userData).length,
      totalSnapshots: this.data.snapshots.length,
      dbPath: DB_FILE,
      lastSavedAt: this.data.metadata.lastSavedAt,
      totalWrites: this.data.metadata.totalWrites,
    };
  }
}

export const db = new DatabaseService();
