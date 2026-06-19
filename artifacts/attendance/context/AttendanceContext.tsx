import React, { createContext, useContext, useState, useCallback, useEffect, useMemo } from 'react';
import { AttendanceRecord, ShiftType } from '@/constants/types';
import {
  initDatabase,
  insertRecord,
  getRecordsByDate,
  getAllDates,
  getRecordsByMonth,
  getRecordsByDateRange,
  deleteRecordsBeforeDate,
  deleteRecordById,
} from '@/utils/database';
import { getCompanyPeriod, CompanyPeriod } from '@/utils/timeService';

export { getCompanyPeriod, CompanyPeriod };

interface AttendanceContextType {
  todayRecords: AttendanceRecord[];
  allDates: string[];
  shiftType: ShiftType;
  setShiftType: (type: ShiftType) => void;
  addRecord: (record: AttendanceRecord) => void;
  getRecordForDate: (date: string) => AttendanceRecord[];
  getRecordForMonth: (year: number, month: number) => AttendanceRecord[];
  getRecordsByMonth: (year: number, month: number) => AttendanceRecord[];
  getRecordForPeriod: (startDate: string, endDate: string) => AttendanceRecord[];
  deleteOldRecords: (beforeDateStr: string) => string[];
  deleteRecord: (id: string) => string | null;
  refreshToday: () => void;
  refreshDates: () => void;
  currentCompanyPeriod: CompanyPeriod;
  isDbReady: boolean;
}

const AttendanceContext = createContext<AttendanceContextType | null>(null);

function todayStr(): string {
  // v3.7.9: مهلة ساعتين بعد منتصف الليل — السجلات تُسجل لليوم السابق حتى 2:00 ص
  const d = new Date();
  const hour = d.getHours();
  // إذا كانت الساعة بين 00:00 و 02:00 (بعد منتصف الليل)، اعتبر التاريخ لليوم السابق
  if (hour < 2) {
    const yesterday = new Date(d.getFullYear(), d.getMonth(), d.getDate() - 1);
    return `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;
  }
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function AttendanceProvider({ children }: { children: React.ReactNode }) {
  const [isDbReady, setIsDbReady] = useState(false);
  const [todayRecords, setTodayRecords] = useState<AttendanceRecord[]>([]);
  const [allDates, setAllDates] = useState<string[]>([]);
  const [shiftType, setShiftType] = useState<ShiftType>('single');

  // إعادة حساب الفترة عند تغيير التاريخ (يُحدَّث عند التركيز)
  const [periodDate, setPeriodDate] = useState(() => new Date());
  const currentCompanyPeriod = useMemo(() => getCompanyPeriod(periodDate), [periodDate]);

  useEffect(() => {
    try {
      initDatabase();
      setIsDbReady(true);
      loadTodayRecords();
      loadAllDates();
    } catch (e) {
      console.error('DB init error:', e);
    }
  }, []);

  // تحديث الفترة والسجلات يومياً — لكن بعد مهلة الساعتين (2:00 ص بدلاً من 12:00 ص)
  useEffect(() => {
    const now = new Date();
    const hour = now.getHours();
    let nextSwitch: Date;
    if (hour < 2) {
      // نحن في مهلة منتصف الليل — التبديل التالي عند 2:00 ص
      nextSwitch = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 2, 0, 0);
    } else {
      // التبديل التالي عند 2:00 ص في اليوم التالي
      nextSwitch = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 2, 0, 0);
    }
    const msUntilSwitch = nextSwitch.getTime() - now.getTime();
    const timer = setTimeout(() => {
      setPeriodDate(new Date());
      loadTodayRecords();
      loadAllDates();
    }, msUntilSwitch + 1000); // ثانية واحدة بعد 2:00 ص
    return () => clearTimeout(timer);
  }, [periodDate]);

  const loadTodayRecords = useCallback(() => {
    try {
      const records = getRecordsByDate(todayStr());
      setTodayRecords(records);
      if (records.length > 0) setShiftType(records[0].shiftType);
    } catch (e) {
      console.warn('[AttendanceContext] loadTodayRecords error:', e);
    }
  }, []);

  const loadAllDates = useCallback(() => {
    try {
      setAllDates(getAllDates());
    } catch (e) {
      console.warn('[AttendanceContext] loadAllDates error:', e);
    }
  }, []);

  const addRecord = useCallback((record: AttendanceRecord) => {
    // التحقق من الحقول المطلوبة
    if (!record.id || !record.date || !record.type || !record.shiftType || !record.confirmedTime || !record.createdAt) {
      throw new Error('فشل حفظ السجل: بيانات ناقصة');
    }
    try {
      insertRecord(record);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      throw new Error(`فشل حفظ السجل: ${msg}`);
    }
    loadTodayRecords();
    loadAllDates();
  }, [loadTodayRecords, loadAllDates]);

  const getRecordForDate = useCallback((date: string): AttendanceRecord[] => {
    try { return getRecordsByDate(date); } catch { return []; }
  }, []);

  const getRecordForMonth = useCallback((year: number, month: number): AttendanceRecord[] => {
    try { return getRecordsByMonth(year, month); } catch { return []; }
  }, []);

  const getRecordForPeriod = useCallback((startDate: string, endDate: string): AttendanceRecord[] => {
    try { return getRecordsByDateRange(startDate, endDate); } catch { return []; }
  }, []);

  const deleteOldRecords = useCallback((beforeDateStr: string): string[] => {
    try {
      const paths = deleteRecordsBeforeDate(beforeDateStr);
      loadAllDates();
      loadTodayRecords();
      return paths;
    } catch { return []; }
  }, [loadAllDates, loadTodayRecords]);

  const deleteRecord = useCallback((id: string): string | null => {
    try {
      const imagePath = deleteRecordById(id);
      loadTodayRecords();
      loadAllDates();
      return imagePath;
    } catch { return null; }
  }, [loadTodayRecords, loadAllDates]);

  return (
    <AttendanceContext.Provider value={{
      todayRecords, allDates, shiftType, setShiftType,
      addRecord, getRecordForDate, getRecordForMonth,
      getRecordsByMonth: getRecordForMonth,
      getRecordForPeriod, deleteOldRecords, deleteRecord,
      refreshToday: loadTodayRecords, refreshDates: loadAllDates,
      currentCompanyPeriod, isDbReady,
    }}>
      {children}
    </AttendanceContext.Provider>
  );
}

export function useAttendance() {
  const ctx = useContext(AttendanceContext);
  if (!ctx) throw new Error('useAttendance must be used inside AttendanceProvider');
  return ctx;
}
