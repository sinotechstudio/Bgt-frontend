import { Tournament, Wallet, Transaction, Team, User, NotificationItem, Participant, TeamInvitation } from '../types';

let authToken: string | null = typeof window !== 'undefined' ? localStorage.getItem('esports_auth_token') : null;
let onUnauthorizedCallback: (() => void) | null = null;

export const setAuthToken = (token: string | null) => {
  authToken = token;
  if (typeof window !== 'undefined') {
    if (token) {
      localStorage.setItem('esports_auth_token', token);
    } else {
      localStorage.removeItem('esports_auth_token');
    }
  }
};

export const getAuthToken = () => authToken;

export const registerUnauthorizedHandler = (cb: () => void) => {
  onUnauthorizedCallback = cb;
};

// API Base configuration
const API_BASE = '/api';

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers || {});
  headers.set('Content-Type', 'application/json');

  if (authToken) {
    headers.set('Authorization', `Bearer ${authToken}`);
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (res.status === 401) {
    setAuthToken(null);
    if (onUnauthorizedCallback) {
      onUnauthorizedCallback();
    }
    throw new Error('Session expired or unauthorized. Please log in again.');
  }

  const json = await res.json().catch(() => ({}));

  if (!res.ok) {
    const errorMsg = json.message || `Request failed with status ${res.status}`;
    const err: any = new Error(errorMsg);
    err.status = res.status;
    err.code = json.code;
    throw err;
  }

  return json;
}

export const api = {
  // Auth
  auth: {
    login: (credentials: { email: string; password: string }) =>
      request<{ status: string; message: string; token: string; user: User }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      }),
    register: (data: { name: string; email: string; password: string; gamerTag?: string }) =>
      request<{ status: string; message: string; token: string; user: User; requireVerification?: boolean }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    me: () => request<{ status: string; user: User }>('/auth/me'),
    verifyEmail: (code: string) =>
      request<{ status: string; message: string }>('/auth/verify-email', {
        method: 'POST',
        body: JSON.stringify({ code }),
      }),
    forgotPassword: (email: string) =>
      request<{ status: string; message: string }>('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
      }),
    resetPassword: (token: string, newPassword: string) =>
      request<{ status: string; message: string }>('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ token, newPassword }),
      }),
    logout: () =>
      request<{ status: string; message: string }>('/auth/logout', {
        method: 'POST',
      }),
    changePassword: (data: { currentPassword: string; newPassword: string }) =>
      request<{ status: string; message: string }>('/auth/change-password', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    updateProfile: (data: Partial<User>) =>
      request<{ status: string; message: string; user: User }>('/auth/profile', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  },

  // Tournaments
  tournaments: {
    list: (params?: { game?: string; status?: string; search?: string; sort?: string; maxEntryFee?: number }) => {
      const q = new URLSearchParams();
      if (params?.game) q.set('game', params.game);
      if (params?.status) q.set('status', params.status);
      if (params?.search) q.set('search', params.search);
      if (params?.sort) q.set('sort', params.sort);
      if (params?.maxEntryFee !== undefined) q.set('maxEntryFee', String(params.maxEntryFee));
      const query = q.toString() ? `?${q.toString()}` : '';
      return request<{ status: string; data: Tournament[]; total: number }>(`/tournaments${query}`);
    },
    getById: (id: number | string) =>
      request<{ status: string; data: Tournament }>(`/tournaments/${id}`),
    get: (id: number | string) =>
      request<{ status: string; data: Tournament }>(`/tournaments/${id}`),
    getParticipants: (id: number | string) =>
      request<{ status: string; data: Participant[] }>(`/tournaments/${id}/participants`),
    join: (id: number | string) =>
      request<{ status: string; message: string; data: { tournamentId: number; remainingBalance: number; participants: number } }>(
        `/tournaments/${id}/join`,
        { method: 'POST' }
      ),
  },

  // Wallet
  wallet: {
    get: () => request<{ status: string; data: Wallet }>('/wallet'),
    getTransactions: (params?: { type?: string; status?: string; search?: string }) => {
      const q = new URLSearchParams();
      if (params?.type) q.set('type', params.type);
      if (params?.status) q.set('status', params.status);
      if (params?.search) q.set('search', params.search);
      const query = q.toString() ? `?${q.toString()}` : '';
      return request<{ status: string; data: Transaction[]; total: number }>(`/wallet/transactions${query}`);
    },
    deposit: (payload: { amount: number; method: string; referenceId?: string }) =>
      request<{ status: string; message: string; data: { balance: number; transaction: Transaction } }>('/wallet/deposit', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    withdraw: (payload: { amount: number; method: string; accountDetails: string }) =>
      request<{ status: string; message: string; data: { balance: number; transaction: Transaction } }>('/wallet/withdraw', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
  },

  // Team
  team: {
    get: () => request<{ status: string; data: Team }>('/team'),
    create: (data: { name: string; tag: string; description?: string; logo?: string }) =>
      request<{ status: string; message: string; data: Team }>('/team/create', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    invite: (data: { gamerTag: string; role?: string }) =>
      request<{ status: string; message: string; data: any }>('/team/invite', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    removeMember: (memberId: number) =>
      request<{ status: string; message: string }>(`/team/members/${memberId}/remove`, {
        method: 'POST',
      }),
    acceptInvite: (inviteId: number) =>
      request<{ status: string; message: string }>(`/team/invitations/${inviteId}/accept`, {
        method: 'POST',
      }),
    declineInvite: (inviteId: number) =>
      request<{ status: string; message: string }>(`/team/invitations/${inviteId}/decline`, {
        method: 'POST',
      }),
    getInvitations: () =>
      request<{ status: string; data: TeamInvitation[] }>('/team/invitations'),
    leave: () =>
      request<{ status: string; message: string }>('/team/leave', {
        method: 'POST',
      }),
  },

  // Profile
  profile: {
    get: () => request<{ status: string; data: User }>('/profile'),
    update: (data: Partial<User>) =>
      request<{ status: string; message: string; data: User }>('/profile', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  },

  // Notifications
  notifications: {
    list: () =>
      request<{ status: string; data: NotificationItem[]; unreadCount: number }>('/notifications'),
    markRead: (id: string) =>
      request<{ status: string }>(`/notifications/${id}/read`, { method: 'POST' }),
    markAllRead: () =>
      request<{ status: string; message: string }>('/notifications/read-all', { method: 'POST' }),
  },

  // Real-time Event Simulation
  simulate: (type: 'join_event' | 'live_score' | 'deposit_received' | 'new_tournament') =>
    request<{ status: string; message: string; [key: string]: any }>('/realtime/simulate', {
      method: 'POST',
      body: JSON.stringify({ type }),
    }),
};
