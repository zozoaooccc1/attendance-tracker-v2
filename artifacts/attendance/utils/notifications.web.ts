import { ShiftType } from '@/constants/types';

export interface NotifSettings {
  enabled: boolean;
  shift: 'single' | 'double';
  alarmBeforeShift: boolean;
  earlyReminder: boolean;
}

export function setupNotificationHandler(): void {}
export async function requestNotificationPermissions(): Promise<boolean> { return false; }
export async function scheduleSingleShiftReminders(): Promise<void> {}
export async function scheduleDoubleShiftReminders(): Promise<void> {}
export async function schedulePersistentReminders(_shiftType: ShiftType): Promise<void> {}
export async function scheduleCheckInReminder(_h: number, _m: number): Promise<string | null> { return null; }
export async function scheduleCheckOutReminder(_h: number, _m: number): Promise<string | null> { return null; }
export async function sendImmediateAlert(_t: string, _b: string): Promise<void> {}
export async function cancelAllAttendanceReminders(): Promise<void> {}
export async function scheduleAlarmBurst(_shiftType: ShiftType): Promise<void> {}
export async function saveNotifSettings(_settings: NotifSettings): Promise<void> {}
export async function loadNotifSettings(): Promise<NotifSettings | null> { return null; }
export async function rescheduleFromSettings(): Promise<void> {}
