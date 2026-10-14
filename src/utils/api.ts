import { AuthUser } from '../types';

const TOKEN_KEY = 'pathly_auth_token_v3';

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string | null): void {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(endpoint, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    // If unauthorized, token is either invalid or expired
    if (token) {
      setStoredToken(null);
      window.dispatchEvent(new CustomEvent('pathly_auth_expired'));
    }
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || `خطای سرور (${response.status})`);
  }

  return data as T;
}

export async function apiCheckHealth() {
  return request<{ status: string; timestamp: string; stats: any }>('/api/health');
}

export async function apiRegister(payload: {
  email: string;
  username: string;
  password: string;
  name: string;
  securityQuestion?: string;
  securityAnswer?: string;
}) {
  const res = await request<{ message: string; token: string; user: AuthUser }>('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  setStoredToken(res.token);
  return res;
}

export async function apiLogin(identifier: string, password: string) {
  const res = await request<{ message: string; token: string; user: AuthUser }>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ identifier, password }),
  });
  setStoredToken(res.token);
  return res;
}

export async function apiGetMe(): Promise<{ user: AuthUser }> {
  return request<{ user: AuthUser }>('/api/auth/me');
}

export async function apiUpdateProfile(payload: {
  name?: string;
  avatarUrl?: string;
  securityQuestion?: string;
  securityAnswer?: string;
}) {
  return request<{ message: string; user: AuthUser }>('/api/auth/profile', {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export async function apiChangePassword(oldPassword: string, newPassword: string) {
  return request<{ message: string }>('/api/auth/change-password', {
    method: 'POST',
    body: JSON.stringify({ oldPassword, newPassword }),
  });
}

export async function apiResetPassword(payload: {
  identifier: string;
  securityAnswer: string;
  newPassword: string;
}) {
  return request<{ message: string }>('/api/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function apiDeleteAccount(password: string) {
  const res = await request<{ message: string }>('/api/auth/account', {
    method: 'DELETE',
    body: JSON.stringify({ password }),
  });
  setStoredToken(null);
  return res;
}

export async function apiFetchUserData(): Promise<{ exists: boolean; data: any }> {
  return request<{ exists: boolean; data: any }>('/api/data');
}

export async function apiSaveUserData(data: any): Promise<{ success: boolean; lastSaved: string }> {
  return request<{ success: boolean; lastSaved: string }>('/api/data', {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function apiPatchUserData(domain: string, content: any): Promise<{ success: boolean }> {
  return request<{ success: boolean }>(`/api/data/${domain}`, {
    method: 'PATCH',
    body: JSON.stringify(content),
  });
}

export async function apiExportBackup() {
  const token = getStoredToken();
  const res = await fetch('/api/backup/export', {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) throw new Error('خطا در دریافت پشتیبان از سرور');
  return res.blob();
}

export async function apiImportBackup(backupData: any) {
  return request<{ success: boolean; message: string }>('/api/backup/import', {
    method: 'POST',
    body: JSON.stringify({ backup: backupData }),
  });
}

export async function apiGetSnapshots() {
  return request<{ snapshots: Array<{ id: string; createdAt: string; reason: string }> }>('/api/backup/snapshots');
}

export async function apiRestoreSnapshot(snapshotId: string) {
  return request<{ success: boolean; message: string }>('/api/backup/restore-snapshot', {
    method: 'POST',
    body: JSON.stringify({ snapshotId }),
  });
}

export async function apiCreateSnapshot(reason?: string) {
  return request<{ success: boolean; message: string; snapshot: { id: string; createdAt: string; reason: string } }>('/api/backup/create-snapshot', {
    method: 'POST',
    body: JSON.stringify({ reason }),
  });
}

export async function apiGetAdminUsers() {
  return request<{ users: Array<AuthUser> }>('/api/admin/users');
}
