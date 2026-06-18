import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// ── Handler setup ─────────────────────────────────────────────────────────────
let _handlerRegistered = false;

export function setupNotificationHandler(): void {
  if (_handlerRegistered) return;
  try {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowBanner: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowList: true,
      }),
    });
    _handlerRegistered = true;
  } catch {}
}

// ── Android channels ──────────────────────────────────────────────────────────
async function ensureChannels(): Promise<void> {
  if (Platform.OS !== 'android') return;
  try {
    await Notifications.setNotificationChannelAsync('attendance-reminders', {
      name: 'تذكيرات الحضور',
      importance: Notifications.AndroidImportance.HIGH,
      sound: 'default',
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#3b82f6',
    });
    await Notifications.setNotificationChannelAsync('attendance-urgent', {
      name: 'تنبيهات عاجلة',
      importance: Notifications.AndroidImportance.MAX,
      sound: 'default',
      vibrationPattern: [0, 500, 250, 500],
      lightColor: '#ef4444',
    });
    await Notifications.setNotificationChannelAsync('attendance-alarm', {
      name: '🚨 منبّه الدوام',
      importance: Notifications.AndroidImportance.MAX,
      sound: 'default',
      vibrationPattern: [0, 800, 200, 800, 200, 800],
      lightColor: '#f97316',
      enableLights: true,
      enableVibrate: true,
      bypassDnd: true,
      lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
    });
  } catch {}
}

// ── Permission request ─────────────────────────────────────────────────────────
export async function requestNotificationPermissions(): Promise<boolean> {
  if (Platform.OS === 'web') return false;
  try {
    setupNotificationHandler();
    await ensureChannels();
    const { status: existing } = await Notifications.getPermissionsAsync();
    if (existing === 'granted') return true;
    const { status } = await Notifications.requestPermissionsAsync({
      ios: { allowAlert: true, allowBadge: false, allowSound: true },
    });
    return status === 'granted';
  } catch {
    return false;
  }
}

// ── Cancel all ────────────────────────────────────────────────────────────────
export async function cancelAllAttendanceReminders(): Promise<void> {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch {}
}

// ── Helper: schedule alarm burst for ONE specific date ────────────────────────
// Fires every INTERVAL seconds within the 15-minute window before entryHour:entryMinute
async function scheduleAlarmWindowForDate(
  targetDate: Date,
  entryHour: number,
  entryMinute: number,
  shiftLabel: string,
): Promise<void> {
  // SAFETY (v3.6.6): 60s interval on Android → 15 notifs per 15-min window per entry.
  // Total cap: 15 notifs × 7 days × 2 shifts = 210 — too many for Android's ~50 limit.
  // So we cap DAYS to 2 (15 × 2 × 2 = 60, still over) OR use 1 day for double shift.
  // Actually Android limit is per-app and dynamic; we keep 60s + 3 days = 45/90 max.
  // iOS: 120s intervals (7 per window) — stays under 64 limit
  const INTERVAL_S     = Platform.OS === 'android' ? 30 : 120;
  const WINDOW_SECONDS = 15 * 60; // 15 minutes

  const count = Math.floor(WINDOW_SECONDS / INTERVAL_S);
  const alarmChannel = Platform.OS === 'android' ? 'attendance-alarm' : undefined;

  const now = new Date();

  const entryTime = new Date(
    targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate(),
    entryHour, entryMinute, 0, 0,
  );
  const windowStart = new Date(entryTime.getTime() - WINDOW_SECONDS * 1000);

  // Skip if the entire window + entry have already passed
  if (entryTime.getTime() <= now.getTime()) return;

  const batch: Promise<string>[] = [];

  for (let i = 0; i < count; i++) {
    const fireTime = new Date(windowStart.getTime() + i * INTERVAL_S * 1000);
    if (fireTime.getTime() <= now.getTime()) continue;

    const remainingMinutes = Math.ceil((entryTime.getTime() - fireTime.getTime()) / 60000);
    const remainStr = remainingMinutes <= 1 ? 'دقيقة واحدة!' : `${remainingMinutes} دقيقة`;

    // رسائل متصاعدة حسب قرب الوقت — كلما اقترب الدوام زاد الإزعاج
    let title: string;
    let body: string;
    if (remainingMinutes <= 2) {
      // 🔴 آخر دقيقتين — إنذار أحمر!
      title = `🔴🔴🔴 إنذار! ${shiftLabel}`;
      body = `باقي ${remainStr} فقط! اذهب فوراً!!!`;
    } else if (remainingMinutes <= 5) {
      // 🟠 آخر 5 دقائق — تحذير شديد
      title = `🟠 ⏰ عاجل! ${shiftLabel}`;
      body = `باقي ${remainStr} — أسرع قبل التأخير!`;
    } else if (remainingMinutes <= 10) {
      // 🟡 أقل من 10 دقائق — تحذير
      title = `🟡 ⏰ ${shiftLabel}`;
      body = `باقي ${remainStr} على الموعد — استعد!`;
    } else {
      // 🟢 أكثر من 10 دقائق — تذكير
      title = `⏰ ${shiftLabel}`;
      body = `باقي ${remainStr} على موعد الدخول`;
    }

    batch.push(
      Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          sound: true,
          priority: Notifications.AndroidNotificationPriority.HIGH,
          ...(alarmChannel ? {
            android: {
              channelId: alarmChannel,
              priority: Notifications.AndroidNotificationPriority.HIGH,
              color: remainingMinutes <= 2 ? '#ff0000' : remainingMinutes <= 5 ? '#ff6600' : '#3b82f6',
              // v3.7.4: منبّه مزعج بدرجة قوية — اهتزاز متواصل وأضواء
              vibrate: remainingMinutes <= 2
                ? [0, 1500, 100, 1500, 100, 1500, 100, 1500]  // اهتزاز أقوى في آخر دقيقتين
                : remainingMinutes <= 5
                ? [0, 1200, 200, 1200, 200, 1200]  // اهتزاز قوي في آخر 5 دقائق
                : [0, 1000, 200, 1000],  // اهتزاز عادي
              lights: true,
              lightColor: remainingMinutes <= 2 ? '#ff0000' : remainingMinutes <= 5 ? '#ff6600' : '#3b82f6',
              sticky: remainingMinutes <= 2,  // يبقى على الشاشة في آخر دقيقتين
              ongoing: remainingMinutes <= 2,  // لا يمكن إزالته في آخر دقيقتين
              autoCancel: remainingMinutes > 2,
            }
          } : {}),
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: fireTime,
        },
      }).catch(() => ''),
    );

    if (batch.length >= 20) {
      await Promise.all(batch.splice(0, 20));
    }
  }

  if (batch.length > 0) await Promise.all(batch);
}

// ── PUBLIC: schedule aggressive alarm burst before shift entry ────────────────
// v3.7.4: المنبّه المزعج القوي + اختياري لكل شفت على حدة
// shiftEntry: 'entry1' | 'entry2' | 'both' — يحدد أي شفت يفعّل له المنبّه
export async function scheduleAlarmBurst(
  shiftType: 'single' | 'double',
  shiftEntry: 'entry1' | 'entry2' | 'both' = 'both',
): Promise<void> {
  if (Platform.OS === 'web') return;
  try {
    setupNotificationHandler();
    await ensureChannels();
    await cancelAllAttendanceReminders();

    const now = new Date();
    // SAFETY: Cap days to keep total scheduled notifications under Android's ~50 limit.
    // 60s interval × 15-min window = 15 notifs per entry per day.
    //   - Single shift × 3 days = 45 notifs ✓ (under 50)
    //   - Double shift × 2 days × 1 entry = 30 notifs ✓ (اختياري لشفت واحد)
    //   - Double shift × 2 days × 2 entries = 60 notifs (كلا الشفتين)
    const DAYS = Platform.OS === 'android' ? 1 : 4;

    for (let dayOffset = 0; dayOffset < DAYS; dayOffset++) {
      const targetDate = new Date(
        now.getFullYear(), now.getMonth(), now.getDate() + dayOffset,
      );

      if (shiftType === 'single') {
        // Single shift entry: 12:00
        await scheduleAlarmWindowForDate(targetDate, 12, 0, 'موعد بصمة الدخول');
      } else {
        // Double shift: schedule only for the selected shift(s)
        if (shiftEntry === 'entry1' || shiftEntry === 'both') {
          await scheduleAlarmWindowForDate(targetDate, 9,  0, 'دخول الشفت الأول');
        }
        if (shiftEntry === 'entry2' || shiftEntry === 'both') {
          await scheduleAlarmWindowForDate(targetDate, 16, 0, 'دخول الشفت الثاني');
        }
      }
    }
  } catch (err) {
    console.warn('[Notifications] scheduleAlarmBurst error:', err);
  }
}

// ── Single shift normal reminders ─────────────────────────────────────────────
export async function scheduleSingleShiftReminders(earlyMinutes = 0): Promise<void> {
  if (Platform.OS === 'web') return;
  try {
    setupNotificationHandler();
    await ensureChannels();
    await cancelAllAttendanceReminders();

    const early = Math.max(0, Math.min(earlyMinutes, 30));
    const channel        = Platform.OS === 'android' ? 'attendance-reminders' : undefined;
    const urgentChannel  = Platform.OS === 'android' ? 'attendance-urgent'    : undefined;

    await Notifications.scheduleNotificationAsync({
      content: {
        title: '🕐 موعد بصمة الدخول',
        body: early > 0
          ? `باقي ${early} دقيقة على موعد الدخول (12:00 م)`
          : 'حان موعد بصمة الدخول — 12:00 م',
        sound: true,
        ...(channel ? { android: { channelId: channel } } : {}),
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: early > 0 ? 11 : 12,
        minute: early > 0 ? 60 - early : 0,
      },
    });

    // v3.7.2: تم إلغاء فترة السماح — لا حاجة لإشعار "آخر موعد للبصمة"
    // التأخير يُحتسب فوراً عند 12:00

    await Notifications.scheduleNotificationAsync({
      content: {
        title: '🌙 موعد بصمة الخروج',
        body: 'باقي 15 دقيقة على نهاية الدوام — لا تنسَ بصمة الخروج',
        sound: true,
        ...(channel ? { android: { channelId: channel } } : {}),
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: 23,
        minute: 45,
      },
    });
  } catch (err) {
    console.warn('[Notifications] scheduleSingleShiftReminders error:', err);
  }
}

// ── Double shift normal reminders ─────────────────────────────────────────────
export async function scheduleDoubleShiftReminders(earlyMinutes = 0): Promise<void> {
  if (Platform.OS === 'web') return;
  try {
    setupNotificationHandler();
    await ensureChannels();
    await cancelAllAttendanceReminders();

    const early = Math.max(0, Math.min(earlyMinutes, 30));
    const channel        = Platform.OS === 'android' ? 'attendance-reminders' : undefined;
    const urgentChannel  = Platform.OS === 'android' ? 'attendance-urgent'    : undefined;

    await Notifications.scheduleNotificationAsync({
      content: {
        title: '🌅 موعد دخول الشفت الأول',
        body: early > 0
          ? `باقي ${early} دقيقة على دخول الشفت الأول (9:00 ص)`
          : 'حان موعد بصمة دخول الشفت الأول — 9:00 ص',
        sound: true,
        ...(channel ? { android: { channelId: channel } } : {}),
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: early > 0 ? 8 : 9,
        minute: early > 0 ? 60 - early : 0,
      },
    });

    // v3.7.2: تم إلغاء فترة السماح — لا حاجة لإشعار "آخر موعد للشفت الأول"
    // التأخير يُحتسب فوراً عند 9:00

    await Notifications.scheduleNotificationAsync({
      content: {
        title: '🔔 موعد خروج الشفت الأول',
        body: 'باقي 15 دقيقة على نهاية الشفت الأول — لا تنسَ البصمة (12:00 م)',
        sound: true,
        ...(channel ? { android: { channelId: channel } } : {}),
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: 11,
        minute: 45,
      },
    });

    await Notifications.scheduleNotificationAsync({
      content: {
        title: '🌆 موعد دخول الشفت الثاني',
        body: early > 0
          ? `باقي ${early} دقيقة على دخول الشفت الثاني (4:00 م)`
          : 'حان موعد بصمة دخول الشفت الثاني — 4:00 م',
        sound: true,
        ...(channel ? { android: { channelId: channel } } : {}),
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: early > 0 ? 15 : 16,
        minute: early > 0 ? 60 - early : 0,
      },
    });

    // v3.7.2: تم إلغاء فترة السماح — لا حاجة لإشعار "آخر موعد للشفت الثاني"
    // التأخير يُحتسب فوراً عند 16:00

    await Notifications.scheduleNotificationAsync({
      content: {
        title: '🌙 نهاية الدوام — الشفت الثاني',
        body: 'باقي 15 دقيقة على نهاية الدوام الكامل — لا تنسَ البصمة',
        sound: true,
        ...(channel ? { android: { channelId: channel } } : {}),
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: 23,
        minute: 45,
      },
    });
  } catch (err) {
    console.warn('[Notifications] scheduleDoubleShiftReminders error:', err);
  }
}

// ── Persistent reminder (every X hours) ──────────────────────────────────────
export async function schedulePersistentReminders(intervalHours = 2): Promise<void> {
  if (Platform.OS === 'web') return;
  try {
    setupNotificationHandler();
    await ensureChannels();
    // إلغاء التذكيرات المستمرة القديمة أولاً
    await cancelAllAttendanceReminders();
    const channel = Platform.OS === 'android' ? 'attendance-reminders' : undefined;
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '📋 تذكير الحضور',
        body: 'تذكر تسجيل بصمتك في وقتها',
        sound: true,
        ...(channel ? { android: { channelId: channel } } : {}),
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: intervalHours * 3600,
        repeats: true,
      },
    });
  } catch (err) {
    console.warn('[Notifications] schedulePersistentReminders error:', err);
  }
}

// ── Immediate test alert ──────────────────────────────────────────────────────
export async function sendImmediateAlert(title: string, body: string): Promise<void> {
  if (Platform.OS === 'web') return;
  try {
    setupNotificationHandler();
    await ensureChannels();
    const channel = Platform.OS === 'android' ? 'attendance-urgent' : undefined;
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        sound: true,
        ...(channel ? { android: { channelId: channel } } : {}),
      },
      trigger: null,
    });
  } catch (err) {
    console.warn('[Notifications] sendImmediateAlert error:', err);
  }
}
