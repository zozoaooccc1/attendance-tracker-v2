import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';

// ── الحصول على مسار تخزين موثوق ──────────────────────────────────────────────
// في بعض أجهزة Android، قد يكون documentDirectory فارغاً عند التشغيل الأول
// لذلك نستخدم cacheDirectory كبديل، أو مسار مباشر كملاذ أخير

let _resolvedBaseDir: string | null = null;

async function getBaseDirectory(): Promise<string> {
  // استخدم القيمة المخزنة مؤقتاً إذا كانت متاحة
  if (_resolvedBaseDir) return _resolvedBaseDir;

  // الأولوية 1: documentDirectory (المسار الرسمي)
  if (FileSystem.documentDirectory) {
    _resolvedBaseDir = FileSystem.documentDirectory;
    return _resolvedBaseDir;
  }

  // الأولوية 2: cacheDirectory (بديل موثوق)
  if (FileSystem.cacheDirectory) {
    console.warn('[imageStorage] documentDirectory فارغ، يتم استخدام cacheDirectory كبديل');
    _resolvedBaseDir = FileSystem.cacheDirectory;
    return _resolvedBaseDir;
  }

  // الأولوية 3: إعادة محاولة بعد تأخير قصير (قد تكون الوحدة لم تتهيأ بعد)
  await new Promise(resolve => setTimeout(resolve, 500));

  if (FileSystem.documentDirectory) {
    _resolvedBaseDir = FileSystem.documentDirectory;
    return _resolvedBaseDir;
  }

  if (FileSystem.cacheDirectory) {
    _resolvedBaseDir = FileSystem.cacheDirectory;
    return _resolvedBaseDir;
  }

  // الأولوية 4: مسار مباشر لنظام Android
  if (Platform.OS === 'android') {
    const directPath = 'file:///data/user/0/com.attendance.app/files/';
    try {
      await FileSystem.makeDirectoryAsync(directPath, { intermediates: true });
      _resolvedBaseDir = directPath;
      return _resolvedBaseDir;
    } catch {
      // المسار المباشر فشل أيضاً
    }
  }

  throw new Error('FileSystem غير متاح: تعذر العثور على مسار تخزين صالح');
}

function getImagesDirSync(): string {
  const base = _resolvedBaseDir ?? FileSystem.documentDirectory ?? FileSystem.cacheDirectory ?? '';
  return `${base}attendance_images/`;
}

export function getImagesDir(): string {
  return getImagesDirSync();
}

export async function ensureImagesDir(): Promise<void> {
  const baseDir = await getBaseDirectory();
  const imagesDir = `${baseDir}attendance_images/`;
  try {
    const info = await FileSystem.getInfoAsync(imagesDir);
    if (!info.exists) {
      await FileSystem.makeDirectoryAsync(imagesDir, { intermediates: true });
    }
  } catch (err) {
    console.error('[imageStorage] فشل إنشاء مجلد الصور:', err);
    // إعادة تعيين المسار المخزن ومحاولة مرة أخرى
    _resolvedBaseDir = null;
    const retryBase = await getBaseDirectory();
    const retryDir = `${retryBase}attendance_images/`;
    const retryInfo = await FileSystem.getInfoAsync(retryDir);
    if (!retryInfo.exists) {
      await FileSystem.makeDirectoryAsync(retryDir, { intermediates: true });
    }
  }
}

export async function saveImage(uri: string, recordId: string): Promise<string> {
  const baseDir = await getBaseDirectory();
  await ensureImagesDir();
  const imagesDir = `${baseDir}attendance_images/`;
  const filename = `${recordId}.jpg`;
  const destPath = imagesDir + filename;

  if (uri.startsWith('http://') || uri.startsWith('https://')) {
    const result = await FileSystem.downloadAsync(uri, destPath);
    if (result.status !== 200) throw new Error(`فشل تنزيل الصورة: HTTP ${result.status}`);
    return destPath;
  }

  // الطريقة 1: نسخ مباشر
  try {
    await FileSystem.copyAsync({ from: uri, to: destPath });
    const info = await FileSystem.getInfoAsync(destPath);
    if (info.exists && 'size' in info && (info as any).size > 0) return destPath;
    throw new Error('الملف فارغ بعد النسخ');
  } catch (copyErr) {
    // الطريقة 2: قراءة كـ base64 ثم كتابة
    try {
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      if (!base64 || base64.length < 100) throw new Error('بيانات الصورة غير صالحة');
      await FileSystem.writeAsStringAsync(destPath, base64, {
        encoding: FileSystem.EncodingType.Base64,
      });
      return destPath;
    } catch (b64Err) {
      // الطريقة 3: نقل بدل نسخ (إذا كان الملف المصدر في نفس النطاق)
      try {
        await FileSystem.moveAsync({ from: uri, to: destPath });
        const moveInfo = await FileSystem.getInfoAsync(destPath);
        if (moveInfo.exists) return destPath;
      } catch {}

      throw new Error(`فشل حفظ الصورة: ${b64Err instanceof Error ? b64Err.message : String(b64Err)}`);
    }
  }
}

export async function getImageUri(imagePath: string): Promise<string> {
  return imagePath;
}

export async function deleteImage(imagePath: string): Promise<void> {
  try {
    const info = await FileSystem.getInfoAsync(imagePath);
    if (info.exists) await FileSystem.deleteAsync(imagePath);
  } catch {}
}

// ── إحصاء الصور + حجمها ─────────────────────────────────────────────────────
export async function getImagesStats(): Promise<{ count: number; totalMB: number }> {
  try {
    const imagesDir = getImagesDirSync();
    const dirInfo = await FileSystem.getInfoAsync(imagesDir);
    if (!dirInfo.exists) return { count: 0, totalMB: 0 };

    const files = await FileSystem.readDirectoryAsync(imagesDir);
    let totalBytes = 0;

    for (const file of files) {
      try {
        const info = await FileSystem.getInfoAsync(imagesDir + file, { size: true });
        if (info.exists && 'size' in info) totalBytes += (info as any).size ?? 0;
      } catch {}
    }

    return {
      count: files.length,
      totalMB: Math.round((totalBytes / (1024 * 1024)) * 10) / 10,
    };
  } catch {
    return { count: 0, totalMB: 0 };
  }
}

// ── حذف الصور الأقدم من X أشهر ──────────────────────────────────────────────
export async function deleteImagesOlderThan(months: number): Promise<number> {
  try {
    const imagesDir = getImagesDirSync();
    const dirInfo = await FileSystem.getInfoAsync(imagesDir);
    if (!dirInfo.exists) return 0;

    const files = await FileSystem.readDirectoryAsync(imagesDir);
    const cutoffMs = Date.now() - months * 30 * 24 * 60 * 60 * 1000;
    let deleted = 0;

    for (const file of files) {
      try {
        const info = await FileSystem.getInfoAsync(imagesDir + file, { size: true });
        if (!info.exists) continue;
        // استخدم modificationTime إذا متاح، وإلا استنتج من اسم الملف
        let fileTime = 0;
        if ('modificationTime' in info) {
          fileTime = ((info as any).modificationTime ?? 0) * 1000;
        } else {
          // recordId يبدأ بـ Date.now().toString(36) — ~8 حروف
          const idPart = file.replace('.jpg', '').substring(0, 9);
          const ts = parseInt(idPart, 36);
          if (!isNaN(ts) && ts > 1e12 && ts < 2e12) fileTime = ts;
        }
        if (fileTime > 0 && fileTime < cutoffMs) {
          await FileSystem.deleteAsync(imagesDir + file, { idempotent: true });
          deleted++;
        }
      } catch {}
    }
    return deleted;
  } catch {
    return 0;
  }
}

// ── قراءة صورة كـ base64 (للنسخ الاحتياطية الشاملة) ─────────────────────────
export async function readImageAsBase64(imagePath: string): Promise<string | null> {
  try {
    const info = await FileSystem.getInfoAsync(imagePath);
    if (!info.exists) return null;
    return await FileSystem.readAsStringAsync(imagePath, {
      encoding: FileSystem.EncodingType.Base64,
    });
  } catch {
    return null;
  }
}

// ── كتابة صورة من base64 ──────────────────────────────────────────────────────
export async function writeImageFromBase64(recordId: string, base64: string): Promise<string | null> {
  try {
    const baseDir = await getBaseDirectory();
    await ensureImagesDir();
    const destPath = `${baseDir}attendance_images/${recordId}.jpg`;
    await FileSystem.writeAsStringAsync(destPath, base64, {
      encoding: FileSystem.EncodingType.Base64,
    });
    return destPath;
  } catch {
    return null;
  }
}

// ── تهيئة FileSystem عند بدء التطبيق ──────────────────────────────────────────
export async function initFileSystem(): Promise<void> {
  try {
    await getBaseDirectory();
    console.log('[imageStorage] تم تهيئة FileSystem بنجاح، المسار:', _resolvedBaseDir);
  } catch (err) {
    console.error('[imageStorage] فشل تهيئة FileSystem:', err);
  }
}
