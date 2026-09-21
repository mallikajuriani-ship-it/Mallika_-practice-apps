import { AnalysisHistoryItem, AnalysisResult, DatabaseStats, User } from '../types';

const TOKEN_KEY = 'cpg_radar_auth_token';

export function getStoredToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export const getAuthToken = getStoredToken;

export function setStoredToken(token: string): void {
  try {
    localStorage.setItem(TOKEN_KEY, token);
  } catch (err) {
    console.error('Failed to store auth token:', err);
  }
}

export function clearStoredToken(): void {
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch (err) {
    console.error('Failed to clear auth token:', err);
  }
}

function getAuthHeaders(): HeadersInit {
  const token = getStoredToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

// --- AUTHENTICATION API CALLS ---

export async function loginUser(email: string, password: string): Promise<{ user: User; token: string }> {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Login failed');
  }
  setStoredToken(data.token);
  return data;
}

export async function registerUser(params: {
  email: string;
  password: string;
  name: string;
  role?: string;
  department?: string;
}): Promise<{ user: User; token: string }> {
  const res = await fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Registration failed');
  }
  setStoredToken(data.token);
  return data;
}

export async function quickDemoLogin(role: 'director' | 'category' = 'director'): Promise<{ user: User; token: string }> {
  const res = await fetch('/api/auth/demo', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ role }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Demo login failed');
  }
  setStoredToken(data.token);
  return data;
}

export async function getCurrentUser(): Promise<User | null> {
  const token = getStoredToken();
  if (!token) return null;
  try {
    const res = await fetch('/api/auth/me', {
      headers: getAuthHeaders(),
    });
    if (!res.ok) {
      clearStoredToken();
      return null;
    }
    const data = await res.json();
    return data.user || null;
  } catch (err) {
    console.warn('Failed to verify session:', err);
    return null;
  }
}

export async function logoutUser(): Promise<void> {
  try {
    await fetch('/api/auth/logout', {
      method: 'POST',
      headers: getAuthHeaders(),
    });
  } catch (err) {
    console.warn('Logout request warning:', err);
  } finally {
    clearStoredToken();
  }
}

// --- DATABASE ANALYSES API CALLS ---

export async function fetchDatabaseAnalyses(query?: string): Promise<AnalysisHistoryItem[]> {
  try {
    const url = query ? `/api/analyses?q=${encodeURIComponent(query)}` : '/api/analyses';
    const res = await fetch(url, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) {
      throw new Error(`Server returned ${res.status}`);
    }
    const data = await res.json();
    const records = data.analyses || [];
    return records.map((r: any) => ({
      id: r.id,
      client: r.clientBrand || r.client || '',
      retailer: r.retailer || '',
      documentName: r.documentName || '',
      analysisDate: r.analysisDate || new Date(r.createdAt || Date.now()).toLocaleDateString(),
      timestamp: r.timestamp || r.createdAt || Date.now(),
      totalChanges: r.totalChanges || r.data?.changes?.length || 0,
      highImpactCount: r.highImpactCount || r.data?.executiveSummary?.highImpactCount || 0,
      mediumImpactCount: r.mediumImpactCount || r.data?.executiveSummary?.mediumImpactCount || 0,
      lowImpactCount: r.lowImpactCount || r.data?.executiveSummary?.lowImpactCount || 0,
      data: r.data || r,
    }));
  } catch (err) {
    console.warn('Failed to fetch from DB API, using fallback:', err);
    return [];
  }
}

export async function saveAnalysisToDatabase(analysis: AnalysisResult): Promise<boolean> {
  try {
    const res = await fetch('/api/analyses', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(analysis),
    });
    return res.ok;
  } catch (err) {
    console.error('Failed to save analysis to database API:', err);
    return false;
  }
}

export const createDatabaseAnalysis = saveAnalysisToDatabase;

export async function deleteAnalysisFromDatabase(id: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/analyses/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return res.ok;
  } catch (err) {
    console.error('Failed to delete analysis from database:', err);
    return false;
  }
}

export const deleteDatabaseAnalysis = deleteAnalysisFromDatabase;

export async function updateDatabaseActionStatus(
  analysisId: string,
  actionId: string,
  status: 'pending' | 'in_progress' | 'completed'
): Promise<boolean> {
  try {
    const res = await fetch(`/api/analyses/${encodeURIComponent(analysisId)}/actions/${encodeURIComponent(actionId)}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status }),
    });
    return res.ok;
  } catch (err) {
    console.error('Failed to update action status in database:', err);
    return false;
  }
}

export async function fetchDatabaseStats(): Promise<DatabaseStats | null> {
  try {
    const res = await fetch('/api/database/stats', {
      headers: getAuthHeaders(),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.stats;
  } catch (err) {
    console.warn('Failed to fetch DB stats:', err);
    return null;
  }
}
