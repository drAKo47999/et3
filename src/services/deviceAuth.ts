// Google sign-in for the Android app using the OAuth "device" flow.
// (Firebase's popup sign-in cannot work inside an Android WebView.)
import { CapacitorHttp } from '@capacitor/core';

const SCOPES = [
  'openid',
  'email',
  'profile',
  'https://www.googleapis.com/auth/drive.file',
  'https://www.googleapis.com/auth/drive.appdata',
].join(' ');

const K_ID = 'monet_gclient_id';
const K_SECRET = 'monet_gclient_secret';
const K_REFRESH = 'monet_grefresh';
const K_USER = 'monet_guser';

export interface AppUser {
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
}

export interface DeviceCode {
  deviceCode: string;
  userCode: string;
  verificationUrl: string;
  expiresAt: number;
  interval: number;
}

const get = (k: string) => {
  try { return localStorage.getItem(k) || ''; } catch { return ''; }
};
const set = (k: string, v: string) => {
  try { v ? localStorage.setItem(k, v) : localStorage.removeItem(k); } catch { /* ignore */ }
};

export const getClientConfig = () => ({ clientId: get(K_ID), clientSecret: get(K_SECRET) });
export const saveClientConfig = (clientId: string, clientSecret: string) => {
  set(K_ID, clientId.trim());
  set(K_SECRET, clientSecret.trim());
};
export const hasClientConfig = () => !!(get(K_ID) && get(K_SECRET));

let accessToken: string | null = null;
let expiresAt = 0;

async function post(url: string, data: Record<string, string>) {
  const res = await CapacitorHttp.post({
    url,
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    data,
  });
  const body = typeof res.data === 'string' ? safeJson(res.data) : res.data;
  return { status: res.status, body: body || {} };
}

function safeJson(s: string) {
  try { return JSON.parse(s); } catch { return {}; }
}

export async function requestDeviceCode(): Promise<DeviceCode> {
  const { clientId } = getClientConfig();
  if (!clientId) throw new Error('Google client ID is not set up yet.');
  const { status, body } = await post('https://oauth2.googleapis.com/device/code', {
    client_id: clientId,
    scope: SCOPES,
  });
  if (status !== 200 || !body.device_code) {
    throw new Error(body.error_description || body.error || `Google refused the request (${status}). Check the client ID.`);
  }
  return {
    deviceCode: body.device_code,
    userCode: body.user_code,
    verificationUrl: body.verification_url || 'https://www.google.com/device',
    expiresAt: Date.now() + (body.expires_in || 1800) * 1000,
    interval: body.interval || 5,
  };
}

/** Polls until the user approves. Resolves with the signed-in user. */
export async function pollForSignIn(dc: DeviceCode, isCancelled: () => boolean): Promise<AppUser> {
  const { clientId, clientSecret } = getClientConfig();
  let interval = dc.interval;
  while (Date.now() < dc.expiresAt) {
    await new Promise((r) => setTimeout(r, interval * 1000));
    if (isCancelled()) throw new Error('cancelled');
    const { body } = await post('https://oauth2.googleapis.com/token', {
      client_id: clientId,
      client_secret: clientSecret,
      device_code: dc.deviceCode,
      grant_type: 'urn:ietf:params:oauth:grant-type:device_code',
    });
    if (body.access_token) {
      accessToken = body.access_token;
      expiresAt = Date.now() + (body.expires_in || 3600) * 1000 - 60000;
      if (body.refresh_token) set(K_REFRESH, body.refresh_token);
      const user = await fetchUser(body.access_token);
      set(K_USER, JSON.stringify(user));
      return user;
    }
    if (body.error === 'authorization_pending') continue;
    if (body.error === 'slow_down') { interval += 5; continue; }
    if (body.error === 'access_denied') throw new Error('Sign-in was denied.');
    if (body.error === 'expired_token') throw new Error('The code expired. Please try again.');
    throw new Error(body.error_description || body.error || 'Sign-in failed.');
  }
  throw new Error('The code expired. Please try again.');
}

async function fetchUser(token: string): Promise<AppUser> {
  const res = await CapacitorHttp.get({
    url: 'https://www.googleapis.com/oauth2/v3/userinfo',
    headers: { Authorization: `Bearer ${token}` },
  });
  const d = typeof res.data === 'string' ? safeJson(res.data) : res.data || {};
  return { displayName: d.name || null, email: d.email || null, photoURL: d.picture || null };
}

export function getSavedUser(): AppUser | null {
  if (!get(K_REFRESH)) return null;
  try { return JSON.parse(get(K_USER)) as AppUser; } catch { return null; }
}

/** Returns a valid access token, refreshing it when needed. */
export async function getValidToken(): Promise<string | null> {
  if (accessToken && Date.now() < expiresAt) return accessToken;
  const refresh = get(K_REFRESH);
  if (!refresh) return null;
  const { clientId, clientSecret } = getClientConfig();
  const { body } = await post('https://oauth2.googleapis.com/token', {
    client_id: clientId,
    client_secret: clientSecret,
    refresh_token: refresh,
    grant_type: 'refresh_token',
  });
  if (body.access_token) {
    accessToken = body.access_token;
    expiresAt = Date.now() + (body.expires_in || 3600) * 1000 - 60000;
    return accessToken;
  }
  if (body.error === 'invalid_grant') signOutDevice();
  return null;
}

export function signOutDevice() {
  accessToken = null;
  expiresAt = 0;
  set(K_REFRESH, '');
  set(K_USER, '');
}
