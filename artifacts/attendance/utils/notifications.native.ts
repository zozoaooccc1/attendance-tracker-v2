import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ── ثوابت ────────────────────────────────────────────────────────────────────
const NOTIF_SETTINGS_KEY = 'attendance_notif_settings';

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
    // قناة التذكيرات العادية
    await Notifications.setNotificationChannelAsync('attendance-reminders', {
      name: 'تذكيرات الحضور',
      importance: Notifications.AndroidImportance.HIGH,
      sound: 'default',
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#3b82f6',
    });

    // قناة التنبيهات العاجلة
    await Notifications.setNotificationChannelAsync('attendance-urgent', {
      name: 'تنبيهات عاجلة',
      importance: Notifications.AndroidImportance.MAX,
      sound: 'default',
      vibrationPattern: [0, 500, 250, 500],
      lightColor: '#ef4444',
    });

    // 🚨 قناة المنبّه المزعج — أعلى أهمية ممكنة
    await Notifications.setNotificationChannelAsync('attendance-alarm', {
      name: '🚨 منبّه الدوام',
      importance: Notifications.AndroidImportance.MAX,
      sound: 'default',
      vibrationPattern: [0, 1000, 200, 1000, 200, 1000, 200, 1000],
      lightColor: '#ff0000',
      enableLights: true,
      enableVibrate: true,
      bypassDnd: true,
      lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
      showBadge: true,
    });
  } catch {}
}

// ── إذن الإشعارات + إذن الإشعارات الدقيقة (Android 12+) ───────────────────
export async function requestNotificationPermissions(): Promise<boolean> {
  if (Platform.OS === 'web') return false;
  try {
    setupNotificationHandler();
    await ensureChannels();

    // طلب إذن الإشعارات الأساسي
    const { status: existing } = await Notifications.getPermissionsAsync();
    if (existing !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync({
        ios: { allowAlert: true, allowBadge: false, allowSound: true },
      });
      if (status !== 'granted') return false;
    }

    // طلب إذن الإشعارات الدقيقة على Android 12+
    if (Platform.OS === 'android') {
      try {
        const { PlatformConstants } = require('react-native');
        const sdkInt = PlatformConstants?.Version ?? 0;
        if (sdkInt >= 31) {
          // Android 12+ (API 31) — نحتاج إذن SCHEDULE_EXACT_ALARM
          // لكن expo-notifications يتعامل معها داخلياً كـ inexact alarms
          // نستخدم setNotificationChannelAsync بأهمية MAX لضمان الظهور
        }
      } catch {}
    }

    return true;
  } catch {
    return false;
  }
}

// ── حفظ واسترجاع إعدادات الإشعارات ─────────────────────────────────────────
export interface NotifSettings {
  enabled: boolean;
  shift: 'single' | 'double';
  alarmBeforeShift: boolean;
  earlyReminder: boolean;
}

export async function saveNotifSettings(settings: NotifSettings): Promise<void> {
  try {
    await AsyncStorage.setItem(NOTIF_SETTINGS_KEY, JSON.stringify(settings));
  } catch {}
}

export async function loadNotifSettings(): Promise<NotifSettings | null> {
  try {
    const raw = await AsyncStorage.getItem(NOTIF_SETTINGS_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as NotifSettings;
  } catch {
    return null;
  }
}

// ── Cancel all ────────────────────────────────────────────────────────────────
export async function cancelAllAttendanceReminders(): Promise<void> {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch {}
}

// ── Helper: جدولة المنبّه المزعج ليوم واحد ─────────────────────────────────
// 🚨 إشعار مزعج كل 15 ثانية خلال الـ 15 دقيقة قبل الدوام!
async function scheduleAlarmWindowForDate(
  targetDate: Date,
  entryHour: number,
  entryMinute: number,
  shiftLabel: string,
): Promise<void> {
  // كل 15 ثانية على Android = 60 إشعار في 15 دقيقة (مزعج جداً!)
  // كل 30 ثانية على iOS = 30 إشعار (أقصى ما يسمح Apple)
  const INTERVAL_S = Platform.OS === 'android' ? 15 : 30;
  const WINDOW_SECONDS = 15 * 60; // 15 دقيقة

  const count = Math.floor(WINDOW_SECONDS / INTERVAL_S);
  const alarmChannel = Platform.OS === 'android' ? 'attendance-alarm' : undefined;

  const now = new Date();

  const entryTime = new Date(
    targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate(),
    entryHour, entryMinute, 0, 0,
  );
  const windowStart = new Date(entryTime.getTime() - WINDOW_SECONDS * 1000);

  // تجاوز إذا انتهى الوقت
  if (entryTime.getTime() <= now.getTime()) return;

  const batch: Promise<string>[] = [];

  for (let i = 0; i < count; i++) {
    const fireTime = new Date(windowStart.getTime() + i * INTERVAL_S * 1000);
    if (fireTime.getTime() <= now.getTime()) continue;

    const remainingMinutes = Math.ceil((entryTime.getTime() - fireTime.getTime()) / 60000);
    const remainStr = remainingMinutes <= 1 ? 'دقيقة واحدة!' : `${remainingMinutes} دقيقة`;

    // رسائل مختلفة حسب قرب الوقت — كلما اقترب الدوام زاد الإزعاج
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
              sticky: remainingMinutes <= 2, // يبقى الإشعار على الشاشة في آخر دقيقتين
              ongoing: remainingMinutes <= 2, // لا يمكن إزالته بالسحب في آخر دقيقتين
              autoCancel: remainingMinutes > 2,
              vibrate: [0, 1000, 200, 1000],
              lights: true,
              lightColor: remainingMinutes <= 2 ? '#ff0000' : '#3b82f6',
            }
          } : {}),
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: fireTime,
        },
      }).catch(() => ''),
    );

    // معالجة دفعات من 20 لتجنب الضغط
    if (batch.length >= 20) {
      await Promise.all(batch.splice(0, 20));
    }
  }

  if (batch.length > 0) await Promise.all(batch);
}

// ── PUBLIC: جدولة المنبّه المزعج قبل الدوام ────────────────────────────────
export async function scheduleAlarmBurst(
  shiftType: 'single' | 'double',
): Promise<void> {
  if (Platform.OS === 'web') return;
  try {
    setupNotificationHandler();
    await ensureChannels();
    // لا نمسح كل الإشعارات — فقط نضيف المنبّه المزعج
    // التذكيرات اليومية تبقى كما هي

    const now = new Date();
    const DAYS = Platform.OS === 'android' ? 7 : 4;

    for (let dayOffset = 0; dayOffset < DAYS; dayOffset++) {
      const targetDate = new Date(
        now.getFullYear(), now.getMonth(), now.getDate() + dayOffset,
      );

      // تخطي الجمعة
      if (targetDate.getDay() === 5) continue;

      if (shiftType === 'single') {
        await scheduleAlarmWindowForDate(targetDate, 12, 0, 'موعد بصمة الدخول');
      } else {
        await scheduleAlarmWindowForDate(targetDate, 9,  0, 'دخول الشفت الأول');
        await scheduleAlarmWindowForDate(targetDate, 16, 0, 'دخول الشفت الثاني');
      }
    }

    console.log('[Notifications] تم جدولة المنبّه المزعج بنجاح');
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

    const early = Math.max(0, Math.min(earlyMinutes, 30));
    const channel        = Platform.OS === 'android' ? 'attendance-reminders' : undefined;
    const urgentChannel  = Platform.OS === 'android' ? 'attendance-urgent'    : undefined;

    // تذكير قبل الدخول
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

    // تحذير قبل انتهاء فترة السماح
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '⚠️ آخر موعد للبصمة',
        body: 'الوقت ينفد — آخر 15 دقيقة قبل احتساب التأخير (12:15 م)',
        sound: true,
        ...(urgentChannel ? { android: { channelId: urgentChannel } } : {}),
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: 12,
        minute: 5,
      },
    });

    // تذكير الخروج
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

    console.log('[Notifications] تم جدولة تذكيرات الشفت الواحد');
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

    const early = Math.max(0, Math.min(earlyMinutes, 30));
    const channel        = Platform.OS === 'android' ? 'attendance-reminders' : undefined;
    const urgentChannel  = Platform.OS === 'android' ? 'attendance-urgent'    : undefined;

    // دخول الشفت الأول
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

    // تحذير الشفت الأول
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '⚠️ آخر موعد — الشفت الأول',
        body: 'آخر 15 دقيقة قبل احتساب التأخير في الشفت الأول (9:15 ص)',
        sound: true,
        ...(urgentChannel ? { android: { channelId: urgentChannel } } : {}),
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: 9,
        minute: 5,
      },
    });

    // خروج الشفت الأول
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

    // دخول الشفت الثاني
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

    // تحذير الشفت الثاني
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '⚠️ آخر موعد — الشفت الثاني',
        body: 'آخر 15 دقيقة قبل احتساب التأخير في الشفت الثاني (4:15 م)',
        sound: true,
        ...(urgentChannel ? { android: { channelId: urgentChannel } } : {}),
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: 16,
        minute: 5,
      },
    });

    // خروج الشفت الثاني
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

    console.log('[Notifications] تم جدولة تذكيرات الشفت المزدوج');
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
        priority: Notifications.AndroidNotificationPriority.HIGH,
        ...(channel ? { android: { channelId: channel } } : {}),
      },
      trigger: null,
    });
  } catch (err) {
    console.warn('[Notifications] sendImmediateAlert error:', err);
  }
}

// ── 🔄 إعادة جدولة الإشعارات من الإعدادات المحفوظة (تُستدعى عند بدء التطبيق) ──
export async function rescheduleFromSettings(): Promise<void> {
  if (Platform.OS === 'web') return;
  try {
    const settings = await loadNotifSettings();
    if (!settings || !settings.enabled) return;

    setupNotificationHandler();
    await ensureChannels();

    // نمسح الإشعارات القديمة أولاً
    await cancelAllAttendanceReminders();

    // نعيد جدولة التذكيرات اليومية
    if (settings.shift === 'single') {
      await scheduleSingleShiftReminders(settings.earlyReminder ? 5 : 0);
    } else {
      await scheduleDoubleShiftReminders(settings.earlyReminder ? 5 : 0);
    }

    // نعيد جدولة المنبّه المزعج إذا كان مفعّلاً
    if (settings.alarmBeforeShift) {
      await scheduleAlarmBurst(settings.shift);
    }

    console.log('[Notifications] تمت إعادة جدولة الإشعارات من الإعدادات المحفوظة');
  } catch (err) {
    console.warn('[Notifications] rescheduleFromSettings error:', err);
  }
}
