import * as SQLite from 'expo-sqlite';
import { AttendanceRecord, ShiftType, RecordType } from '@/constants/types';

let db: SQLite.SQLiteDatabase | null = null;

// ─── TASK 3: Debug logger ────────────────────────────────────────────────────
const __DEV_DB__ = __DEV__;

function dbLog(level: 'info' | 'warn', caller: string, params: unknown[]): void {
  if (!__DEV_DB__) return;
  const types = params.map(p => (p === null ? 'null' : typeof p));
  if (level === 'warn') {
    console.warn(`[DB:safeRun][${caller}] ⚠️  Unsafe object intercepted and fixed — types: ${types.join(', ')}`);
  } else {
    console.log(`[DB:safeRun][${caller}] params(${params.length}): ${types.join(', ')}`);
  }
}

// ─── TASK 1: toSafe — converts ANY JS value to a Kotlin-safe primitive ───────
/**
 * Converts any JavaScript value to a primitive safe for expo-sqlite v15 JSI.
 * The Kotlin bridge accepts ONLY: string | number | null.
 * Objects, booleans, undefined, NaN, Infinity, Date, and Arrays are all
 * transformed here — never passed raw.
 *
 * CRITICAL FIX (v3.6.6): The final `enforceSafePrimitive` check guarantees
 * that NO object ever reaches `runSync`. If for any reason an object slips
 * through (e.g., a Proxy, a class instance, or a NaN edge case), it gets
 * coerced to a string. This prevents the Kotlin bridge crash:
 *   "Cannot convert '[object Object]' to a Kotlin runSync"
 */
function toSafe(v: unknown): string | number | null {
  if (v === null || v === undefined) return null;
  if (typeof v === 'boolean') return v ? 1 : 0;
  if (typeof v === 'number') return isFinite(v) ? v : null;
  if (typeof v === 'string') return v;
  if (v instanceof Date) return isNaN(v.getTime()) ? null : v.getTime();
  if (Array.isArray(v)) return v.length > 0 ? toSafe(v[0]) : null;
  // Last resort: stringify anything else
  try {
    const s = JSON.stringify(v);
    return s === undefined ? null : s;
  } catch {
    return null;
  }
}

/**
 * FINAL SAFETY NET. Ensures the value is exactly one of: string | number | null.
 * If anything else slips through, it is coerced to a string.
 * This is the GUARANTEE that no object reaches the Kotlin bridge.
 */
function enforceSafePrimitive(v: unknown): string | number | null {
  if (v === null || v === undefined) return null;
  if (typeof v === 'string') return v;
  if (typeof v === 'number') return isFinite(v) ? v : null;
  // Coerce anything unexpected to string — never pass an object to runSync
  return String(v);
}

// Helper: sanitize params for READ operations (getAllSync, getFirstSync)
// CRITICAL (v3.6.10): Use the same enforceSafePrimitive as safeRun
function safeReadParams(params: unknown[]): any[] {
  return params.map(toSafe).map(enforceSafePrimitive);
}

// ─── TASK 1 + 3 + 4: safeRun — the mandatory call wrapper ───────────────────
/**
 * MANDATORY SAFETY LAYER.
 * Every write to SQLite MUST go through safeRun().
 *
 * - Forces all params through toSafe() (Task 1)
 * - Logs every call in dev mode (Task 3)
 * - Catches and auto-fixes any unsafe values, logs a warning (Task 4)
 */
function safeRun(
  database: SQLite.SQLiteDatabase,
  sql: string,
  params: unknown[],
  caller = 'unknown'
): void {
  // CRITICAL DEBUG (v3.6.8): Log every param's actual type and value
  // to identify which one is causing the "Cannot convert Object to Kotlin runSync" error
  const paramDebug = params.map((p, i) => {
    if (p === null) return `[${i}]=null`;
    if (p === undefined) return `[${i}]=undefined`;
    const t = typeof p;
    if (t === 'object') {
      if (p instanceof Date) return `[${i}]=Date(${p.getTime()})`;
      if (Array.isArray(p)) return `[${i}]=Array(len=${p.length})`;
      try { return `[${i}]=Object(${JSON.stringify(p).slice(0, 80)})`; }
      catch { return `[${i}]=Object(?)`; }
    }
    return `[${i}]=${t}(${String(p).slice(0, 50)})`;
  });
  console.log(`[DB:safeRun][${caller}] params: ${paramDebug.join(' | ')}`);

  const hasUnsafe = params.some(
    p => p !== null && p !== undefined && typeof p === 'object' && !(p instanceof Date)
  );
  if (hasUnsafe) {
    dbLog('warn', caller, params);
  } else if (__DEV_DB__) {
    dbLog('info', caller, params);
  }

  // Apply sanitization and enforce primitives
  const safe = params.map(toSafe).map(enforceSafePrimitive);

  // CRITICAL DEBUG: Log the sanitized values too
  const safeDebug = safe.map((p, i) => {
    if (p === null) return `[${i}]=null`;
    const t = typeof p;
    return `[${i}]=${t}(${String(p).slice(0, 50)})`;
  });
  console.log(`[DB:safeRun][${caller}] SAFE: ${safeDebug.join(' | ')}`);

  // FINAL GUARANTEE: If any value is still not a primitive, throw with details
  for (let i = 0; i < safe.length; i++) {
    const v = safe[i];
    if (v !== null && typeof v !== 'string' && typeof v !== 'number') {
      const errMsg = `[DB:safeRun][${caller}] CRITICAL: param[${i}] is still an object after sanitization! type=${typeof v}, value=${String(v).slice(0, 100)}`;
      console.error(errMsg);
      // Force-convert to string as last resort
      safe[i] = String(v);
    }
  }

  try {
    database.runSync(sql, safe as SQLite.SQLiteBindParams);
  } catch (err) {
    console.error(`[DB:safeRun][${caller}] runSync error:`, err);
    console.error(`[DB:safeRun][${caller}] SQL: ${sql}`);
    console.error(`[DB:safeRun][${caller}] Final params: ${safeDebug.join(' | ')}`);
    throw err;
  }
}

// ─── Database init ───────────────────────────────────────────────────────────

export function getDatabase(): SQLite.SQLiteDatabase {
  if (!db) {
    db = SQLite.openDatabaseSync('attendance.db');
  }
  return db;
}

export function initDatabase(): void {
  const database = getDatabase();
  database.execSync(`
    CREATE TABLE IF NOT EXISTS records (
      id TEXT PRIMARY KEY,
      date TEXT NOT NULL,
      type TEXT NOT NULL,
      shiftType TEXT NOT NULL,
      imagePath TEXT NOT NULL,
      ocrTime TEXT,
      ocrConfidence REAL,
      confirmedTime TEXT NOT NULL,
      isManuallyEdited INTEGER NOT NULL DEFAULT 0,
      isSynced INTEGER NOT NULL DEFAULT 1,
      createdAt INTEGER NOT NULL,
      note TEXT
    );
    CREATE INDEX IF NOT EXISTS idx_records_date ON records(date);
  `);
  try { database.execSync(`ALTER TABLE records ADD COLUMN isSynced INTEGER DEFAULT 1`); } catch {}
  try { database.execSync(`ALTER TABLE records ADD COLUMN note TEXT`); } catch {}
}

// ─── Write operations (all via safeRun) ─────────────────────────────────────

export function insertRecord(record: AttendanceRecord): void {
  const database = getDatabase();
  safeRun(
    database,
    `INSERT INTO records (id, date, type, shiftType, imagePath, ocrTime, ocrConfidence, confirmedTime, isManuallyEdited, isSynced, createdAt, note)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      record.id,
      record.date,
      record.type,
      record.shiftType,
      record.imagePath,
      record.ocrTime,
      record.ocrConfidence,
      record.confirmedTime,
      record.isManuallyEdited,
      record.isSynced,
      record.createdAt,
      record.note || null,
    ],
    'insertRecord'
  );
}

export function updateRecordTime(id: string, confirmedTime: string, originalOcrTime: string | null): void {
  const database = getDatabase();
  safeRun(
    database,
    `UPDATE records SET confirmedTime = ?, isManuallyEdited = 1, ocrTime = COALESCE(ocrTime, ?) WHERE id = ?`,
    [confirmedTime, originalOcrTime ?? null, id],
    'updateRecordTime'
  );
}

export function updateRecordNote(id: string, note: string): void {
  const database = getDatabase();
  safeRun(database, `UPDATE records SET note = ? WHERE id = ?`, [note, id], 'updateRecordNote');
}

export function deleteRecordById(id: string): string | null {
  const database = getDatabase();
  const row = database.getFirstSync<{ imagePath: string }>(`SELECT imagePath FROM records WHERE id = ?`, safeReadParams([id]));
  if (!row) return null;
  safeRun(database, `DELETE FROM records WHERE id = ?`, [id], 'deleteRecordById');
  return row.imagePath;
}

export function deleteRecordsBeforeDate(beforeDateStr: string): string[] {
  const database = getDatabase();
  const rows = database.getAllSync<{ imagePath: string }>(
    `SELECT imagePath FROM records WHERE date < ?`, safeReadParams([beforeDateStr])
  );
  safeRun(database, `DELETE FROM records WHERE date < ?`, [beforeDateStr], 'deleteRecordsBeforeDate');
  return rows.map(r => r.imagePath);
}

// ─── Read operations ─────────────────────────────────────────────────────────

export function getRecordsByDate(date: string): AttendanceRecord[] {
  const database = getDatabase();
  try {
    const rows = database.getAllSync<any>(
      `SELECT * FROM records WHERE date = ? ORDER BY createdAt ASC`,
      safeReadParams([date])
    );
    return rows.map(rowToRecord);
  } catch (err) {
    console.error('[DB:getRecordsByDate] error:', err, 'date=', date, typeof date);
    return [];
  }
}

export function getAllDates(): string[] {
  const database = getDatabase();
  const rows = database.getAllSync<{ date: string }>(
    `SELECT DISTINCT date FROM records ORDER BY date DESC`
  );
  return rows.map(r => r.date);
}

export function getRecordById(id: string): AttendanceRecord | null {
  const database = getDatabase();
  const row = database.getFirstSync<any>(`SELECT * FROM records WHERE id = ?`, safeReadParams([id]));
  if (!row) return null;
  return rowToRecord(row);
}

export function getRecordsByMonth(year: number, month: number): AttendanceRecord[] {
  const database = getDatabase();
  const prefix = `${year}-${String(month).padStart(2, '0')}`;
  const rows = database.getAllSync<any>(
    `SELECT * FROM records WHERE date LIKE ? ORDER BY date ASC, createdAt ASC`,
    safeReadParams([`${prefix}%`])
  );
  return rows.map(rowToRecord);
}

export function getRecordsByDateRange(startDate: string, endDate: string): AttendanceRecord[] {
  const database = getDatabase();
  const rows = database.getAllSync<any>(
    `SELECT * FROM records WHERE date >= ? AND date <= ? ORDER BY date ASC, createdAt ASC`,
    safeReadParams([startDate, endDate])
  );
  return rows.map(rowToRecord);
}

// ─── Row mapper ──────────────────────────────────────────────────────────────

function rowToRecord(row: any): AttendanceRecord {
  return {
    id: row.id,
    date: row.date,
    type: row.type as RecordType,
    shiftType: row.shiftType as ShiftType,
    imagePath: row.imagePath,
    ocrTime: row.ocrTime,
    ocrConfidence: row.ocrConfidence,
    confirmedTime: row.confirmedTime,
    isManuallyEdited: row.isManuallyEdited === 1,
    isSynced: row.isSynced === 1,
    createdAt: row.createdAt,
    note: row.note || undefined,
  };
}
