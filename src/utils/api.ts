import { AuthUser, AIConversation, AIConversationSummary } from '../types';

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

export async function apiCheckAvailability(params: { email?: string; username?: string }) {
  const query = new URLSearchParams();
  if (params.email) query.set('email', params.email);
  if (params.username) query.set('username', params.username);
  return request<{ emailAvailable?: boolean; usernameAvailable?: boolean }>(`/api/auth/check-availability?${query.toString()}`);
}

export async function apiForgotPasswordRequest(identifier: string) {
  return request<{
    success: boolean;
    message: string;
    securityQuestion: string;
    maskedEmail: string;
    expiresInMinutes: number;
    mockVerificationToken?: string;
    infrastructureStatus: {
      smtpConfigured: boolean;
      mode: string;
      notice: string;
    };
  }>('/api/auth/forgot-password-request', {
    method: 'POST',
    body: JSON.stringify({ identifier }),
  });
}

export async function apiResetPasswordToken(payload: {
  identifier: string;
  token: string;
  newPassword: string;
}) {
  return request<{ success: boolean; message: string }>('/api/auth/reset-password-token', {
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

// ----------------- AI Assistant & Smart Planning APIs -----------------

export async function apiGenerateSmartPlan(payload: {
  tasks: any[];
  availableMinutes?: number;
  startTime?: string;
  focusGoal?: string;
}) {
  return request<{
    success: boolean;
    source: 'gemini' | 'algorithmic';
    schedule: Array<{
      id: string;
      taskId?: string;
      title: string;
      timeSlot: string;
      durationMin: number;
      isBreak?: boolean;
      energy?: string;
      note?: string;
    }>;
    feasibilityStatus: 'comfortable' | 'tight' | 'impossible';
    feasibilityScore: number;
    totalScheduledMinutes: number;
    advice: string;
    suggestions: string[];
  }>('/api/ai/smart-plan', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function apiGenerateRescuePlan(payload: {
  mode: '15_min' | '1_hour' | 'rebuild_day';
  remainingTasks: any[];
  currentTime?: string;
}) {
  return request<{
    success: boolean;
    source: 'gemini' | 'algorithmic';
    plan: {
      mode: '15_min' | '1_hour' | 'rebuild_day';
      smallestStep: string;
      criticalTaskIds: string[];
      deferredTaskIds: string[];
      suggestedSchedule: Array<{
        id: string;
        taskId?: string;
        title: string;
        timeSlot: string;
        durationMin: number;
        isBreak?: boolean;
        note?: string;
      }>;
      message: string;
      generatedAt: string;
    };
  }>('/api/ai/rescue-plan', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function apiBreakdownGoal(payload: {
  title: string;
  description?: string;
  targetLevel?: string;
  category?: string;
}) {
  return request<{
    success: boolean;
    source: 'gemini' | 'algorithmic';
    milestones: Array<{ title: string; description: string }>;
    requiredSkills: string[];
    prerequisites: string[];
    immediateTasks: Array<{ title: string; estimatedMinutes: number; priority: 'high' | 'medium' | 'low' }>;
    advice: string;
  }>('/api/ai/goal-breakdown', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function apiGetAIConversations() {
  return request<{ success: boolean; conversations: AIConversationSummary[] }>('/api/ai/conversations');
}

export async function apiCreateAIConversation(title?: string) {
  return request<{ success: boolean; conversation: AIConversation }>('/api/ai/conversations', {
    method: 'POST',
    body: JSON.stringify({ title }),
  });
}

export async function apiGetAIConversation(id: string) {
  return request<{ success: boolean; conversation: AIConversation }>(`/api/ai/conversations/${id}`);
}

export async function apiDeleteAIConversation(id: string) {
  return request<{ success: boolean; message: string }>(`/api/ai/conversations/${id}`, {
    method: 'DELETE',
  });
}

export async function apiClearAIConversation(id: string) {
  return request<{ success: boolean; message: string }>(`/api/ai/conversations/${id}/clear`, {
    method: 'POST',
  });
}

export async function apiUpdateAIConversationTitle(id: string, title: string) {
  return request<{ success: boolean; title: string }>(`/api/ai/conversations/${id}/title`, {
    method: 'PATCH',
    body: JSON.stringify({ title }),
  });
}

export async function apiGetAIConfig() {
  return request<{
    provider: string;
    availableModels: Array<{ id: string; name: string }>;
    defaultModel: string;
    isConfigured: boolean;
  }>('/api/ai/config');
}

export interface StreamChatCallbacks {
  onStart?: (meta: { conversationId: string; userMessage: any }) => void;
  onChunk: (chunk: string) => void;
  onDone?: (meta: { conversationId: string; assistantMessage: any; title?: string }) => void;
  onError?: (errMessage: string) => void;
  signal?: AbortSignal;
}

export async function apiStreamAIChat(
  payload: { message: string; conversationId?: string; model?: string; tone?: string },
  callbacks: StreamChatCallbacks
): Promise<void> {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch('/api/ai/chat/stream', {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
    signal: callbacks.signal,
  });

  if (!response.ok) {
    const errorJson = await response.json().catch(() => ({}));
    const errText = errorJson.error || `خطا در برقراری ارتباط (${response.status})`;
    callbacks.onError?.(errText);
    throw new Error(errText);
  }

  if (!response.body) {
    throw new Error('ReadableStream not supported by browser.');
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder('utf-8');
  let buffer = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || !trimmed.startsWith('data:')) continue;

        const dataStr = trimmed.slice(5).trim();
        try {
          const parsed = JSON.parse(dataStr);
          if (parsed.type === 'start') {
            callbacks.onStart?.(parsed);
          } else if (parsed.type === 'chunk') {
            callbacks.onChunk(parsed.text);
          } else if (parsed.type === 'done') {
            callbacks.onDone?.(parsed);
          } else if (parsed.type === 'error') {
            callbacks.onError?.(parsed.error);
          }
        } catch {
          // ignore parsing error on malformed chunk
        }
      }
    }
  } catch (err: any) {
    if (err.name === 'AbortError') {
      return;
    }
    callbacks.onError?.(err.message || 'خطا در دریافت جریان پاسخ');
    throw err;
  }
}

export async function apiSendAIChat(message: string, conversationId?: string, model?: string, tone?: string) {
  return request<{
    success: boolean;
    source: 'gemini';
    model: string;
    conversationId: string;
    title: string;
    reply: string;
  }>('/api/ai/chat', {
    method: 'POST',
    body: JSON.stringify({ message, conversationId, model, tone }),
  });
}

// ----------------- Server-Validated RPG XP Award -----------------

export async function apiAwardXP(eventId: string, xpAmount: number, reason: string) {
  return request<{
    awarded: boolean;
    xpGained?: number;
    totalXp: number;
    level: number;
    title: string;
    leveledUp?: boolean;
    reason?: string;
    message?: string;
  }>('/api/rpg/award-xp', {
    method: 'POST',
    body: JSON.stringify({ eventId, xpAmount, reason }),
  });
}

