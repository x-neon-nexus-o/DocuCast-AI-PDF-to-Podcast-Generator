import type { DocRecord, Podcast } from '@/types';

// In dev, the Vite server proxies /api to the FastAPI backend, so the browser
// only ever talks to the same origin (required for the hosted preview). Set
// VITE_API_URL to point somewhere else (e.g. a deployed backend).
const API_BASE: string = (import.meta.env.VITE_API_URL as string | undefined) || '';

const TOKEN_KEY = 'docucast_session_token';

// ---------------------------------------------------------------------------
// Token / session helpers
// ---------------------------------------------------------------------------

export function getToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setToken(token: string): void {
  try {
    localStorage.setItem(TOKEN_KEY, token);
  } catch {
    /* storage unavailable (private mode) */
  }
}

export function clearToken(): void {
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* noop */
  }
}

/** Fired whenever the backend rejects the session (401) so the app can log out. */
export const UNAUTHORIZED_EVENT = 'docucast:unauthorized';

// ---------------------------------------------------------------------------
// API error
// ---------------------------------------------------------------------------

export class ApiError extends Error {
  code: string;
  status: number;

  constructor(message: string, code: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
  }
}

// ---------------------------------------------------------------------------
// fetch wrapper
// ---------------------------------------------------------------------------

interface ApiFetchOptions extends RequestInit {
  auth?: boolean;
}

async function apiFetch<T>(path: string, options: ApiFetchOptions = {}): Promise<T> {
  const { auth = true, ...init } = options;
  const headers = new Headers(init.headers);

  if (init.body && !(init.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  if (auth) {
    const token = getToken();
    if (token) headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE}${path}`, { ...init, headers });

  let data: { detail?: unknown; error?: unknown } | null = null;
  try {
    data = await response.json();
  } catch {
    /* non-JSON response */
  }

  if (!response.ok) {
    const detail = data?.detail ?? data?.error;
    const detailObj = typeof detail === 'object' && detail !== null ? (detail as { message?: string; code?: string }) : null;
    const message = typeof detail === 'string' ? detail : detailObj?.message ?? `Request failed (${response.status})`;
    const code = typeof detail === 'string' ? 'ERROR' : detailObj?.code ?? 'HTTP_ERROR';

    if (response.status === 401 && auth) {
      clearToken();
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event(UNAUTHORIZED_EVENT));
      }
    }
    throw new ApiError(message, code, response.status);
  }
  return data as T;
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface UserInfo {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export interface AuthResponse {
  success: boolean;
  token: string;
  tokenType: string;
  user: UserInfo;
}

export interface PodcastGenerateResponse {
  success: boolean;
  filename?: string;
  script?: string;
  audio?: string;
  audio_format?: string;
  pages_processed?: number;
  processing_time?: number;
  audio_duration?: number;
  model_used?: string;
  saved?: boolean;
  saved_doc_id?: string;
  saved_podcast_id?: string;
  error?: {
    code: string;
    message: string;
  };
}

export interface DocumentPayload {
  name: string;
  type?: string;
  pages?: number;
  status?: string;
  date?: string;
  audioDurationSec?: number | null;
  category?: string;
  sizeMb?: number;
  hasAudio?: boolean;
  favorite?: boolean;
}

export interface PodcastPayload {
  docId?: string | null;
  docName?: string;
  title: string;
  durationSec?: number;
  pages?: number;
  language?: string;
  voice?: string;
  style?: string;
  category?: string;
  date?: string;
  favorite?: boolean;
  downloaded?: boolean;
  coverAccent?: string;
  chapters?: { id: string; title: string; startSec: number }[];
  summary?: { overview: string; keyConcepts: string[]; takeaways: string[] };
  script?: { id: string; speaker: string; text: string; highlight?: string }[];
  audioBase64?: string | null;
  audioFormat?: string;
}

// ---------------------------------------------------------------------------
// Auth API
// ---------------------------------------------------------------------------

export async function signup(name: string, email: string, password: string): Promise<AuthResponse> {
  const res = await apiFetch<AuthResponse>(
    '/api/auth/signup',
    { method: 'POST', body: JSON.stringify({ name, email, password }) },
  );
  setToken(res.token);
  return res;
}

export async function login(email: string, password: string, remember = true): Promise<AuthResponse> {
  const res = await apiFetch<AuthResponse>(
    '/api/auth/login',
    { method: 'POST', body: JSON.stringify({ email, password, remember }) },
  );
  setToken(res.token);
  return res;
}

export async function logout(): Promise<void> {
  try {
    await apiFetch('/api/auth/logout', { method: 'POST' });
  } finally {
    clearToken();
  }
}

export async function getMe(): Promise<UserInfo> {
  return apiFetch<UserInfo>('/api/auth/me');
}

export async function changePassword(currentPassword: string, newPassword: string): Promise<void> {
  await apiFetch('/api/auth/change-password', {
    method: 'POST',
    body: JSON.stringify({ currentPassword, newPassword }),
  });
}

// ---------------------------------------------------------------------------
// Documents API (persisted in MongoDB)
// ---------------------------------------------------------------------------

export async function fetchDocuments(): Promise<DocRecord[]> {
  return apiFetch<DocRecord[]>('/api/documents');
}

export async function createDocument(payload: DocumentPayload): Promise<DocRecord> {
  return apiFetch<DocRecord>('/api/documents', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updateDocument(id: string, patch: Partial<DocumentPayload>): Promise<DocRecord> {
  return apiFetch<DocRecord>(`/api/documents/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(patch),
  });
}

export async function deleteDocument(id: string): Promise<void> {
  await apiFetch(`/api/documents/${id}`, { method: 'DELETE' });
}

// ---------------------------------------------------------------------------
// Podcasts API (persisted in MongoDB)
// ---------------------------------------------------------------------------

export async function fetchPodcasts(): Promise<Podcast[]> {
  return apiFetch<Podcast[]>('/api/podcasts');
}

export async function getPodcast(id: string, includeAudio = false): Promise<Podcast> {
  return apiFetch<Podcast>(`/api/podcasts/${id}?include_audio=${includeAudio}`);
}

export async function savePodcast(payload: PodcastPayload): Promise<Podcast> {
  return apiFetch<Podcast>('/api/podcasts', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updatePodcast(id: string, patch: Partial<PodcastPayload>): Promise<Podcast> {
  return apiFetch<Podcast>(`/api/podcasts/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(patch),
  });
}

export async function deletePodcast(id: string): Promise<void> {
  await apiFetch(`/api/podcasts/${id}`, { method: 'DELETE' });
}

// ---------------------------------------------------------------------------
// Generation API (auth required; result is persisted to MongoDB by the backend)
// ---------------------------------------------------------------------------

export async function generatePodcast(file: File): Promise<PodcastGenerateResponse> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_BASE}/api/podcast/generate`, {
    method: 'POST',
    headers: getToken() ? { Authorization: `Bearer ${getToken()}` } : {},
    body: formData,
  });

  const data = await response.json();
  if (!response.ok) {
    const detail = data?.detail ?? data?.error;
    if (response.status === 401) {
      clearToken();
      if (typeof window !== 'undefined') window.dispatchEvent(new Event(UNAUTHORIZED_EVENT));
    }
    return {
      success: false,
      error: {
        code: typeof detail === 'string' ? 'ERROR' : detail?.code || 'HTTP_ERROR',
        message:
          typeof detail === 'string' ? detail : detail?.message || `Status ${response.status}`,
      },
    };
  }
  return data;
}
