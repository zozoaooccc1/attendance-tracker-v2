# AI_CONTEXT.md — تتبع الحضور - الإصدار الثاني

## نظرة عامة
تطبيق Expo React Native لتتبع حضور وانصراف الموظفين. يعمل على Android.
يستخدم الكاميرا لالتقاط صورة جهاز البصمة مع قفل الوقت الرسمي عبر NTP.

**GitHub V2:** https://github.com/zozoaooccc1/attendance-tracker-v2  
**GitHub القديم:** https://github.com/zozoaooccc1/attendance-extractor  
**EAS Project ID:** 644aed4d-a65e-4116-add6-212d873b08d8  
**EAS Account:** kwksnc

## الإصدار الحالي
- **version**: 3.5.6
- **versionCode**: 64
- **آخر تحديث**: 2026-06-16
- **Expo SDK**: 54
- **React Native**: 0.81.5
- **New Architecture**: مفعّلة (مطلوبة لـ react-native-reanimated v4)

---

## البنية
```
attendance-v2/
├── artifacts/
│   ├── attendance/          ← تطبيق الموظف (Expo React Native)
│   │   ├── app/             ← شاشات expo-router
│   │   ├── components/      ← مكونات مشتركة
│   │   ├── constants/       ← أنواع، ألوان، إعدادات، سجل تغييرات
│   │   ├── context/         ← React Context (حضور، إعدادات، لغة، سمة، موظف)
│   │   ├── hooks/           ← useColors
│   │   ├── i18n/            ← ترجمات عربي/إنجليزي
│   │   ├── utils/           ← منطق الأعمال (قاعدة بيانات، صور، نسخ احتياطي، إشعارات...)
│   │   ├── server/          ← خادم هبوط الصفحة
│   │   └── scripts/         ← سكربت البناء
│   ├── api-server/          ← Express 5 API Server (port 5000 dev, 8080 prod)
│   └── mockup-sandbox/      ← نماذج واجهة المستخدم
├── lib/
│   ├── api-client-react/    ← عميل API (orval-generated)
│   ├── api-spec/            ← مواصفات OpenAPI
│   ├── api-zod/             ← مخططات Zod
│   └── db/                  ← Drizzle ORM
└── scripts/                 ← سكربتات عامة
```

---

## نقاط API المتاحة
| المسار | الطريقة | الوصف |
|--------|---------|-------|
| `/api/healthz` | GET | فحص صحة الخادم |
| `/api/ai-scan` | POST | الكشّاف الذكي (Gemini) — يحتاج `GEMINI_API_KEY` |
| `/api/notify/eas-webhook` | POST | webhook من EAS عند اكتمال البناء |
| `/api/notify/send` | POST | إرسال إشعار يدوي |

---

## متغيرات البيئة المطلوبة (API Server)
| المتغير | الوصف |
|---------|-------|
| `GEMINI_API_KEY` | مفتاح Google Gemini API لميزة AI Scan |
| `ONESIGNAL_APP_ID` | OneSignal App ID للإشعارات |
| `ONESIGNAL_REST_API_KEY` | OneSignal REST API Key |
| `NOTIFY_SECRET` | مفتاح سري لـ webhook endpoints |
| `DATABASE_URL` | رابط PostgreSQL |

---

## سجل الإصدارات الكامل

### v3.5.6 (2026-06-16) — إصلاح حفظ الصور ✅
- **إصلاح خطأ "لا يمكن الوصول إلى نظام الملفات (FileSystem)" عند حفظ الصور**
  - السبب: expo-file-system v19 غيّر API بالكامل — الدوال القديمة (copyAsync, getInfoAsync...) أصبحت في مسار `expo-file-system/legacy`
  - الحل: ترحيل جميع استدعاءات FileSystem إلى `import * as FileSystem from 'expo-file-system/legacy'`
  - الملفات المتأثرة: `imageStorage.native.ts`, `capture.tsx`, `backup.native.ts`, `AppUpdateModal.tsx`, `record-detail.tsx`, `settings.tsx`, `reports.tsx`
- **توافق كامل مع expo-file-system v19**
- **تحسين initFileSystem() لإنشاء مجلد الصور عند التهيئة**

### v3.5.5 (2026-06-16) — إصلاح كراش البناء والبنية الجديدة ✅
- **إصلاح كراش بسبب نقص حزمة @babel/traverse — السبب الحقيقي**
  - السبب: `@babel/traverse` غير مثبت → Metro لا يستطيع تحويل الكود → كراش فوري
  - الحل: إضافة `"@babel/traverse": "^7.25.2"` إلى devDependencies
- **تفعيل New Architecture (newArchEnabled: true)**
  - السبب: react-native-reanimated v4 يتطلب New Architecture
  - التغيير: في app.json و gradle.properties
- **إصلاح فشل تجميع الحزمة مع Metro Bundler**

### v3.5.4 (2026-06-16) — إصلاح كراش عند بدء التشغيل ✅
- **إصلاح كراش بسبب فشل تحميل OneSignal**
  - الحل: استبدال الاستيراد المباشر بـ require آمن مع try/catch في `oneSignalService.ts`
- **حماية إضافية لقاعدة البيانات ضد التلف**
  - الحل: إضافة حماية لـ getDatabase() و initDatabase() مع إعادة المحاولة في `database.native.ts`
- **إصلاح تطابق رقم الإصدار**
  - الحل: تصحيح CURRENT_VERSION من 3.2.0 إلى 3.5.4 في `changelog.ts`
- **تحسين استقرار بدء التشغيل**
  - إضافة إعادة محاولة لفشل تهيئة قاعدة البيانات في `AttendanceContext.tsx`
  - حماية من قيم Dimensions = 0 في `responsive.ts`
  - إزالة استيراد database المباشر من `_layout.tsx`
  - حماية INTERNAL_BACKUP_PATH في `backup.native.ts`

### v3.2.0 (2026-06-15) — نظام التحديثات عبر EAS وإصلاحات
- نظام تحديثات جديد يعتمد على EAS بالكامل
- إصلاح كراش عند ترك ملاحظة فارغة (note = undefined → '')
- إصلاح تكرار مفاتيح الترجمة
- تحسين موثوقية التحقق من التحديثات

### v3.1.8 (2026-06-15) — إصلاحات شاملة للأخطاء (28+ إصلاح)
- **CRITICAL**: دمج حالة اللغة المكررة — LanguageContext يفوّض إلى SettingsContext
- **CRITICAL**: إصلاح isSynced null → تحويل `!== 0` إلى `=== 1`
- **CRITICAL**: إصلاح جلب وقت NTP التسلسلي
- **CRITICAL**: إزالة monkey-patch لـ runSync
- **HIGH**: تحويل monthLateCount إلى useMemo
- **HIGH**: إصلاح thisMonth مجمد عند التركيب
- **HIGH**: حماية تغيير الشفت عند وجود سجلات
- **HIGH**: التحقق من الحقول المطلوبة في addRecord()
- **HIGH**: التحقق من NaN في checkLateEntry
- **HIGH**: إصلاح تسرب الذاكرة في capture.tsx (setTimeout)
- **HIGH**: إعادة تعيين AppUpdateModal عند الإغلاق
- **HIGH**: إصلاح تكرار إشعارات التذكير (5 دقائق بعد وقت الدخول)
- **HIGH**: try/catch لـ setPIN في pin-setup
- **HIGH**: إصلاح RestoreModal — catch يمنع إظهار نجاح عند الفشل
- إصلاح تعارض تنسيق بيانات الإنجازات
- إصلاح حالة السباق في حفظ بيانات الموظف والإعدادات
- إصلاح حساب الفترة عند بقاء التطبيق مفتوحاً
- إصلاح خطأ التوقيت الصيفي في حساب أطول سلسلة
- إصلاح حساب حجم النسخ الاحتياطي
- تحسين تجزئة رمز PIN بإضافة ملح وتكرار
- إصلاح إمكانية تحقيق إنجاز "أسبوع بلا تأخر"
- إضافة تصديرات مفقودة في نسخة الويب (backup.web.ts)
- تحسين CalendarScreen — استعلام واحد بدل 31
- إصلاح حساب السلسلة لتخطي الجمعة
- إنشاء backup.web.ts

### v3.1.5 (2026-06-13) — إصلاح 5 مشاكل
- حلّ كراش صفحة الموظف (useLanguage غير مستورد)
- إصلاح حلقة تثبيت التحديث المتكررة
- المنبّه الصاخب يعمل يومياً لأسبوع كامل
- معلومات التحديث باللغة العربية
- استقرار عام وتحسينات أداء

### v3.1.4 (2026-06-13) — إصلاحات متعددة ودعم اللغات
- المنبّه الصاخب لكل شفت بشكل مستقل
- اتجاه شريط حجم الخط في وضع RTL
- التقاط الخروج فقط بعد انتهاء الشفت
- إزالة خطأ 403 في الذكاء الاصطناعي
- صفحة الموظف هي الصفحة الرئيسية
- دعم اللغة الإنجليزية في صفحة الموظف

### v3.1.3 (2026-06-12) — إصلاح الكراش والذكاء الاصطناعي
- إصلاح حلقة الكراش الوهمي عند التشغيل (crashGuard.ts)
- إصلاح خطأ 403 في مسح الذكاء الاصطناعي (EXPO_PUBLIC_API_URL)

### v3.1.2 (2026-06-12) — إصلاح فحص التحديث
- إصلاح زر التحقق من التحديثات

### v3.1.1 (2026-06-12) — إصلاح 4 مشاكل
- ضبط حجم الخط بدقة 1% في كل خطوة
- حفظ الصفحة الرئيسية المختارة بشكل دائم
- نافذة التثبيت تبقى مفتوحة بعد التحميل
- إمكانية ضبط حد التخزين

### v3.1.0 (2026-06-12) — المنبّه الصاخب والتنظيم
- منبّه صاخب كل 30 ثانية قبل موعد الدخول
- قناة إشعارات عالية الأولوية
- إزالة تتبع دقائق الوصول المبكر
- بطاقة التأخير الشهري بعنوان كامل

### v3.0.0 (2026-06-12) — الذكاء الاصطناعي والتخزين والبحث
- شريط تمرير حجم الخط (80%–150%)
- وضع التباين العالي
- إحصائيات التخزين مع التنظيف
- نسخ احتياطي كامل مع الصور
- ماسح الذكاء الاصطناعي لاستخراج الوقت
- فلاتر متقدمة للسجل

### v2.8.0 (2026-06-11) — إشعارات OneSignal الفورية
- إشعار فوري عند صدور إصدار جديد
- طلب الإذن عند أول تشغيل

### v2.7.0 (2026-06-11) — نظام التحديث التلقائي
- إشعار التحديث مع رابط التحميل المباشر
- إزالة نظام OTA القديم
- ملاحظات التأخير في PDF وواتساب وCSV

---

## Version Bumps
| الإصدار | versionCode | التاريخ |
|---------|-------------|---------|
| v3.5.6 | 64 | 2026-06-16 |
| v3.5.5 | 63 | 2026-06-16 |
| v3.5.4 | 62 | 2026-06-16 |
| v3.2.0 | — | 2026-06-15 |
| v3.1.8 | — | 2026-06-15 |
| v3.1.5 | 37 | 2026-06-13 |
| v3.1.4 | 36 | 2026-06-13 |
| v3.1.3 | 35 | 2026-06-12 |
| v3.1.2 | — | 2026-06-12 |
| v3.1.1 | — | 2026-06-12 |
| v3.1.0 | — | 2026-06-12 |
| v3.0.0 | — | 2026-06-12 |
| v2.8.0 | — | 2026-06-11 |
| v2.7.0 | — | 2026-06-11 |

---

## الإصلاحات الحرجة بالتفصيل

### 🔴 كراش @babel/traverse (v3.5.5)
**السبب الحقيقي لكراش التطبيق عند بدء التشغيل**
- Metro Bundler يحتاج `@babel/traverse` لمعالجة `react-native-reanimated/plugin` في babel.config.js
- بدونها: فشل تجميع الكود → كراش فوري عند فتح التطبيق
- **الحل**: `pnpm add -D @babel/traverse@^7.25.2`

### 🔴 خطأ FileSystem عند حفظ الصور (v3.5.6)
**لا يمكن الوصول إلى نظام الملفات (FileSystem)**
- expo-file-system v19 غيّر API بالكامل:
  - القديم: `import * as FileSystem from 'expo-file-system'` → دوال مثل copyAsync, getInfoAsync
  - الجديد: `import * as FileSystem from 'expo-file-system/legacy'` → نفس الدوال القديمة
  - المسار الرئيسي الجديد يستخدم كائنات File/Directory بدل الدوال
- **الحل**: ترحيل جميع الاستيرادات إلى `expo-file-system/legacy`
- الملفات: imageStorage.native.ts, capture.tsx, backup.native.ts, AppUpdateModal.tsx, record-detail.tsx, settings.tsx, reports.tsx

### 🔴 OneSignal كراش (v3.5.4)
- الاستيراد المباشر يفشل إذا لم تكن الوحدة متاحة
- **الحل**: require ديناميكي مع try/catch في oneSignalService.ts

### 🔴 كراش الملاحظة الفارغة (v3.2.0)
- تمرير `undefined` عبر Kotlin bridge يسبب كراش
- **الحل**: تحويل الملاحظة الفارغة إلى `''` في capture.tsx و `null` في database.native.ts

---

## الملفات الحساسة
| الملف | الوصف | يجب استبعاده |
|-------|-------|-------------|
| `attendance-upload.keystore` | مفتاح توقيع Android | ✅ من .gitignore |
| `google-services.json` | إعدادات Firebase/OneSignal | ✅ من .gitignore |
| `eas.json` | إعدادات EAS + EXPO_TOKEN | ❌ مطلوب للبناء |

---

## أوامر مفيدة
```bash
# تثبيت التبعيات
cd artifacts/attendance && pnpm install

# فحص TypeScript
pnpm typecheck

# تجميع الحزمة (اختبار محلي)
npx expo export --platform android

# بناء APK عبر EAS
EXPO_TOKEN=your_token npx eas-cli build --platform android --profile preview --non-interactive

# مراقبة حالة البناء
EXPO_TOKEN=your_token npx eas-cli build:list --limit 5 --platform android

# إلغاء بناء
EXPO_TOKEN=your_token npx eas-cli build:cancel BUILD_ID
```

---

## الخطة المستقبلية — الإصدار الثاني (V2)

### الهدف: نظام إداري مركزي
تحويل التطبيق من محلي فقط إلى نظام متكامل مع لوحة تحكم إدارية.

### البنية المقترحة
```
70 موظف (تطبيق) → Supabase + Cloudinary → لوحة تحكم الإدارة (ويب)
```

### المكونات المطلوبة
1. **تعديل تطبيق الموظف**: إضافة تسجيل دخول + رفع البيانات والصور للخادم
2. **خادم Supabase**: قاعدة بيانات PostgreSQL + API + مصادقة
3. **Cloudinary**: تخزين الصور (25 GB مجاني)
4. **لوحة تحكم ويب**: Next.js على Vercel — عرض السجلات والصور والتقارير

### جداول قاعدة البيانات المقترحة
- `employees`: id, name, employee_number, shift_type, department, is_active
- `attendance_records`: id, employee_id, date, type, shift_type, official_time, image_url, is_late, late_minutes, is_synced, note

### حساب المساحة (70 موظف)
- 420 صورة/يوم × 50 KB (مضغوط) = 21 MB/يوم = 630 MB/شهر
- Cloudinary (25 GB مجاني) يكفي 3+ سنوات ✅
