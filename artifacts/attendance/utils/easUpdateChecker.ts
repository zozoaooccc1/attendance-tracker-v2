/**
 * easUpdateChecker.ts — v3.7.7
 * ───────────────────────────────
 * نظام تحديثات بسيط يعتمد على ملف JSON على GitHub.
 * لا يحتاج توكن أو مصادقة — سريع وموثوق.
 */
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Linking, Platform } from 'react-native';

const VERSION_CHECK_URL = 'https://raw.githubusercontent.com/zozoaooccc1/attendance-tracker-v2/main/latest-version.json';
const SNOOZE_KEY = 'apk_update_snoozed_v_';

export interface AppUpdateInfo {
  version: string;
  notes: string;
  downloadUrl: string;
}

function parseVer(v: string): number[] {
  return v.replace(/^v/, '').split('.').map(n => parseInt(n, 10) || 0);
}

function isNewer(remote: string, current: string): boolean {
  const r = parseVer(remote);
  const c = parseVer(current);
  for (let i = 0; i < Math.max(r.length, c.length); i++) {
    const ri = r[i] ?? 0;
    const ci = c[i] ?? 0;
    if (ri > ci) return true;
    if (ri < ci) return false;
  }
  return false;
}

export async function checkForAppUpdate(force = false): Promise<AppUpdateInfo | null> {
  try {
    const currentVersion = Constants.expoConfig?.version ?? '0.0.0';

    const res = await Promise.race<Response | 'timeout'>([
      fetch(VERSION_CHECK_URL, { cache: 'no-store' as RequestCache }),
      new Promise<'timeout'>(r => setTimeout(() => r('timeout'), 10_000)),
    ]);

    if (res === 'timeout' || !res.ok) return null;

    const data = await res.json() as {
      version?: string;
      versionCode?: number;
      downloadUrl?: string;
      releaseNotes?: string;
      minRequiredVersion?: string;
      publishedAt?: string;
    };

    if (!data.version || !data.downloadUrl) return null;
    if (!isNewer(data.version, currentVersion)) return null;

    // هل المستخدم أجّل هذا الإصدار؟
    if (!force) {
      const snoozed = await AsyncStorage.getItem(SNOOZE_KEY + data.version);
      if (snoozed) return null;
    }

    return {
      version: data.version,
      notes: data.releaseNotes || 'إصدار جديد متاح',
      downloadUrl: data.downloadUrl,
    };
  } catch {
    return null;
  }
}

export async function snoozeUpdate(version: string): Promise<void> {
  try { await AsyncStorage.setItem(SNOOZE_KEY + version, '1'); } catch {}
}

export async function downloadAndInstall(update: AppUpdateInfo): Promise<void> {
  if (Platform.OS === 'web') {
    try { await Linking.openURL(update.downloadUrl); } catch {}
    return;
  }
  try { await Linking.openURL(update.downloadUrl); } catch {}
}
