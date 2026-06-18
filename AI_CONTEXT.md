# AI_CONTEXT.md — تتبع الحضور - الإصدار الثاني

## نظرة عامة
تطبيق Expo React Native لتتبع حضور وانصراف الموظفين. يعمل على Android.
يستخدم الكاميرا لالتقاط صورة جهاز البصمة مع قفل الوقت الرسمي عبر NTP.

**GitHub V2:** https://github.com/zozoaooccc1/attendance-tracker-v2  
**GitHub القديم:** https://github.com/zozoaooccc1/attendance-extractor  
**EAS Project ID (kwksnc):** 644aed4d-a65e-4116-add6-212d873b08d8  
**EAS Project ID (kqmmamz):** 2208687b-d9b1-4b4a-b818-e43ac1867c56  
**EAS Accounts:** kwksnc (الأصلي - استنفد حصة Free Plan) | kqmmamz (البديل - نشط)

## الإصدار الحالي
- **version**: 3.7.8
- **versionCode**: 83
- **آخر تحديث**: 2026-06-18
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

### v3.7.8 (2026-06-18) — إصلاح اختيار الشفت في التنبيهات ✅
- **إضافة زر اختيار نوع الدوام (شفت واحد/شفتين) داخل صفحة التنبيهات**
  - أصبح مستقلاً عن إعدادات الصفحة الرئيسية
  - المستخدم يختار نوع الدوام للتنبيهات من داخل صفحة الإعدادات
- **أزرار اختيار الشفت (الأول فقط/الثاني فقط/كلاهما) تظهر داخل صفحة التنبيهات**
  - تظهر فقط عند اختيار "شفتين"
  - مرئية دائماً عند تفعيل المنبّه المزعج

### v3.7.7 (2026-06-18) — إصلاح شامل للتنبيهات + نظام تحديثات جديد ✅
- **🚨 إصلاح حرج: المنبّه المزعج لم يكن يظهر في الإعدادات**
  - السبب: كان مخفياً داخل `{notifEnabled && (...)}`
  - الحل: جعله مرئياً دائماً بشكل مستقل
- **🚨 إصلاح: أزرار اختيار الشفت لم تكن تظهر (نفس السبب)**
- **نظام تحديثات جديد يعتمد على JSON من GitHub**
  - استبدال easUpdateChecker القديم (المعطل) بنظام بسيط
  - إنشاء `latest-version.json` على GitHub
  - لا يحتاج توكن أو مصادقة
- **rescheduleFromSettings: إعادة جدولة تلقائية عند بدء التطبيق**

### v3.7.6 (2026-06-18) — إصلاح جميع مشاكل التنبيهات ✅
- **إصلاح: changelog كان يعرض v3.6.8 بدل الإصدار الحالي**
  - السبب: نسيت إضافة إدخالات v3.7.0 → v3.7.6 إلى المصفوفة
- **إصلاح: رسالة التنبيه كانت تقول "5 ثوانٍ" بدل "30 ثانية"**
- **إضافة rescheduleFromSettings في _layout.tsx**

### v3.7.5 (2026-06-18) — إصلاح التنبيهات: أقوى + محفوظة + اختيار الشفت ✅
- **حفظ alarmEntry في AsyncStorage** (كان يُفقد عند إغلاق التطبيق)
- **تقليل الفاصل من 60 ثانية إلى 30 ثانية** (أكثر إزعاجاً)
- **تحديث رسائل التنبيه** لتطابق الواقع

### v3.7.4 (2026-06-18) — منبّه مزعج أقوى + اختياري لكل شفت ✅
- **المنبّه المزعج أصبح أقوى:**
  - اهتزاز أقوى في آخر دقيقتين: `[0, 1500, 100, 1500, 100, 1500, 100, 1500]`
  - إشعار لاصق (sticky) في آخر دقيقتين
  - إشعار دائم (ongoing) لا يمكن إزالته
- **المنبّه اختياري لكل شفت:**
  - `shiftEntry: 'entry1' | 'entry2' | 'both'`
  - يمنع الإزعاج للشفت الذي لا يخصك

### v3.7.3 (2026-06-17) — إزالة نص "سماح حتى" من الواجهة ✅
- **تحديث نصوص "سماح حتى 12:15" إلى "بدون سماح"** في 4 أماكن في index.tsx
  - الجمعة، Single، Double entry1، Double entry2

### v3.7.2 (2026-06-17) — إلغاء جميع فترات السماح ✅
- **إلغاء جميع فترات السماح في شفتات الدخول:**
  - REGULAR_SINGLE: 12:15 → 12:00
  - REGULAR_DOUBLE: 9:15 → 9:00، 16:15 → 16:00
  - FRIDAY_SCHEDULE: 14:15 → 14:00
- **إزالة إشعارات "آخر موعد للبصمة"** (لم تعد ضرورية)
- التأخير يُحتسب فوراً عند موعد الدخول

### v3.7.1 (2026-06-17) — ✅ الإصدار النهائي العامل — إصلاح حفظ الصور نهائياً ✅
- **🚨 السبب الحقيقي والنهائي لخطأ حفظ الصور: `null` في JavaScript له `typeof === 'object'`!**
  - عند تمرير `null` إلى Kotlin bridge كقيمة في `Map<String, Any>`, يراه Kotlin كـ Object (وليس null)
  - Kotlin bridge يفشل في التحويل: `Cannot convert '[object Object]' to a Kotlin type`
  - العمود `note` كان يُمرر كـ `null` عندما لا يكتب المستخدم ملاحظة
  - `enforceSafePrimitive(null)` كان يُرجع `null` ← `typeof null === 'object'` ← فشل!
- **الحل النهائي**: `enforceSafePrimitive` لا تُرجع `null` أبداً
  - `null` / `undefined` → `''` (string فارغة)
  - `NaN` / `Infinity` → `0` (number)
  - أي كائن → `String(v)`
- **النتيجة**: التطبيق يعمل بنجاح، حفظ الصور يعمل بدون أخطاء

### v3.7.0 (2026-06-17) — إصلاح خطأ القراءة (READ operations) ⚠️
- **اكتشاف**: الخطأ قد يكون من عمليات القراءة (SELECT) وليس الكتابة (INSERT)
  - بعد نجاح `insertRecord`, تُستدعى `loadTodayRecords()` → `getRecordsByDate()` → `getAllSync()`
  - `getAllSync` تستدعي `runSync` داخلياً لكن بدون `safeRun`!
- **الإصلاح**: إضافة `safeReadParams()` لتعقيم params في عمليات القراءة
  - تطبيق `toSafe` + `enforceSafePrimitive` على جميع عمليات `getAllSync` و `getFirstSync`
- **ملاحظة**: لم يحل المشكلة وحده — السبب الحقيقي اكتُشف في v3.7.1

### v3.6.10 (2026-06-17) — إضافة try/catch لعمليات القراءة ⚠️
- **إضافة `try/catch` حول `getRecordsByDate`** لمنع انتشار الخطأ
- **تسجيل الخطأ** مع قيمة `date` ونوعها للتشخيص
- **ملاحظة**: لم يحل المشكلة وحده — السبب الحقيقي اكتُشف في v3.7.1

### v3.6.9 (2026-06-17) — رسالة خطأ تفصيلية ⚠️
- **عرض رسالة خطأ تفصيلية** تحتوي على النص الكامل للخطأ
- **ملاحظة**: لم يحل المشكلة — ساعد في تشخيص السبب الحقيقي

### v3.6.8 (2026-06-17) — إصلاح قاطع لحفظ الصور + سجلات تشخيص ✅
- **إصلاح قاطع: تحويل صريح لكل الحقول إلى String() في capture.tsx**
  - safeId, safeDate, safeType, safeShift, safeImagePath
  - safeOcrTime, safeConfirmedTime, safeCreatedAt, safeNote
  - يضمن عدم وصول أي كائن إلى database.runSync()
- **إضافة سجلات تشخيص تفصيلية في safeRun**
  - تسجيل نوع وقيمة كل param قبل وبعد التنظيف
  - فحص نهائي: تحويل أي كائن متبقي إلى String()
  - تسجيل SQL والparams عند حدوث خطأ

### v3.6.7 (2026-06-17) — إصلاح حفظ الصور الحقيقي (نفس إصلاح v3.5.6) ✅
- **ترقية expo-file-system من ~18.1.2 إلى ~19.0.0**
- **تغيير 7 استيرادات إلى 'expo-file-system/legacy'** (نفس إصلاح v3.5.6):
  - imageStorage.native.ts, backup.native.ts, capture.tsx, settings.tsx, reports.tsx, record-detail.tsx, AppUpdateModal.tsx
- **إضافة expo-file-system لـ minimumReleaseAgeExclude** في pnpm-workspace.yaml
- **الإبقاء على pnpm overrides** لـ @types/react@~19.1.10 (يمنع تكرار reanimated)
- **الإبقاء على enforceSafePrimitive** كشبكة أمان إضافية
- **نقل المشروع إلى حساب kqmmamz** ( projectId: 2208687b-d9b1-4b4a-b818-e43ac1867c56)
  - السبب: حساب kwksnc استنفد حصة Free Plan للبناء

### v3.6.6 (2026-06-17) — إصلاح حفظ الصور + إعادة المنبّه المزعج ✅
- **إصلاح خطأ حفظ الصور (Cannot convert Object to Kotlin runSync)**
  - إضافة enforceSafePrimitive() كشبكة أمان نهائية
  - أي قيمة ليست string/number/null تُحوّل إلى String()
- **إعادة ميزة المنبّه المزعج بشكل آمن**
  - فاصل 60 ثانية بدلاً من 15 ثانية (15 إشعار بدلاً من 60 لكل نافذة)
  - تحديد عدد الأيام: 3 للشفت الواحد، 2 للشفت المزدوج
  - الحد الأقصى للإشعارات المُجدولة: 45 (single) أو 60 (double) — ضمن حد Android
  - رسائل متصاعدة: أخضر ← أصفر ← برتقالي ← أحمر
- **الحفاظ على إصلاح الكراش**: pnpm overrides لـ @types/react لا يزال فعالاً

### v3.6.5 (2026-06-17) — إصلاح الكراش الحقيقي — تكرار react-native-reanimated ✅
- **السبب الجذري للكراش عند الإقلاع**
  - @types/react مُثبّت بإصدارين مختلفين (19.1.17 و 19.2.14)
  - هذا يجعل pnpm يثبّت react-native-reanimated مرتين
  - Metro يجمّع النسختين في الـ bundle → 2x حجم الـ Animated API
  - التطبيق يكرش عند تحميل الـ JS bundle (بعد شعار التطبيق)
- **السبب في وجود إصدارين من @types/react**
  - mockup-sandbox (web dev tool) يستخدم @radix-ui الذي يتطلب @types/react ^19.2.2
  - attendance package يستخدم @types/react ~19.1.10
- **الإصلاح**: إضافة pnpm overrides لإجبار @types/react@~19.1.10 على مستوى الـ workspace
- **النتيجة**: إصدار واحد فقط من react-native-reanimated، حجم الـ bundle عاد طبيعياً (3.35MB)

### v3.6.4 (2026-06-16) — العودة إلى كود v3.5.2 (آخر إصدار مستقر) ✅
- **العودة الكاملة إلى commit 5461eee** (v3.5.2 - آخر حالة مستقرة معروفة)
- **تجاوز جميع التغييرات من fbee2e1 إلى HEAD** (إشعارات + expo-file-system v19 + pnpm fixes)
- **تحديث الإصدار إلى 3.6.4 + versionCode 69**
- **إصلاح dtrace-provider** في pnpm-workspace.yaml (true بدلاً من placeholder)

### v3.6.3 (2026-06-16) — محاولة إصلاح كراش الإقلاع (إزالة كود الإشعارات) ⚠️
- **إعادة notifications.native.ts إلى إصدار 5461eee** (قبل fbee2e1)
- **إعادة _layout.tsx لإزالة rescheduleFromSettings()**
- **إعادة settings.tsx للإصدار السابق**
- **ملاحظة**: لم يحل المشكلة — السبب الحقيقي كان تكرار reanimated (اكتُشف في v3.6.5)

### v3.6.2 (2026-06-16) — الرجوع إلى expo-file-system v18 ⚠️
- **تخفيض expo-file-system من ~19.0.0 إلى ~18.1.2**
- **إعادة 7 ملفات لاستيراد 'expo-file-system'** (بدون /legacy)
- **إزالة expo-file-system من minimumReleaseAgeExclude**
- **ملاحظة**: لم يحل المشكلة — كان التراجع غير صحيح، v19 هو الصحيح (اكتُشف في v3.6.7)

### v3.6.1 (2026-06-16) — تحديث expo-file-system v19 مع استيراد legacy ⚠️
- **تحديث expo-file-system من ~18.1.2 إلى ~19.0.0**
- **تحديث 7 ملفات لاستخدام استيراد legacy**
- **تحديث app.json: version=3.6.1, versionCode=66**
- **إصلاح pnpm**: إضافة expo-file-system للاستثناءات + تفعيل dtrace-provider
- **ملاحظة**: البناء فشل في البداية بسبب مشاكل pnpm، ثم نجح لكن التطبيق كان يكرش

### v3.6.0 (2026-06-16) — إصلاح نظام الإشعارات + المنبّه المزعج ⚠️
- **إصلاح الإشعارات التي لا تظهر** — إعادة جدولة تلقائية عند بدء التطبيق
- **إصلاح مسح الإشعارات المتبادل بين الدوال**
- **🚨 منبّه مزعج جداً**: إشعار كل 15 ثانية قبل 15 دقيقة من الدوام
- **رسائل إنذار متصاعدة**: أخضر ← أصفر ← برتقالي ← أحمر
- **إشعار ثابت لا يُزال** في آخر دقيقتين
- **تخطي الجمعة تلقائياً**
- **ملاحظة**: هذا الإصدار تسبب في كراش الإقلاع بسبب تجاوز حد Android للإشعارات المُجدولة

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
| الإصدار | versionCode | التاريخ | الحساب |
|---------|-------------|---------|--------|
| v3.7.8 | 83 | 2026-06-18 | kqmmamz |
| v3.7.7 | 82 | 2026-06-18 | kqmmamz |
| v3.7.6 | 81 | 2026-06-18 | kqmmamz |
| v3.7.5 | 80 | 2026-06-18 | kqmmamz |
| v3.7.4 | 79 | 2026-06-18 | kqmmamz |
| v3.7.3 | 78 | 2026-06-17 | kqmmamz |
| v3.7.2 | 77 | 2026-06-17 | kqmmamz |
| v3.7.1 | 76 | 2026-06-17 | kqmmamz |
| v3.7.0 | 75 | 2026-06-17 | kqmmamz |
| v3.6.10 | 75 | 2026-06-17 | kqmmamz |
| v3.6.9 | 74 | 2026-06-17 | kqmmamz |
| v3.6.8 | 73 | 2026-06-17 | kwksnc |
| v3.6.7 | 72 | 2026-06-17 | kqmmamz |
| v3.6.6 | 71 | 2026-06-17 | kwksnc |
| v3.6.5 | 70 | 2026-06-17 | kwksnc |
| v3.6.4 | 69 | 2026-06-16 | kwksnc |
| v3.6.3 | 68 | 2026-06-16 | kwksnc |
| v3.6.2 | 67 | 2026-06-16 | kwksnc |
| v3.6.1 | 66 | 2026-06-16 | kwksnc |
| v3.6.0 | 65 | 2026-06-16 | kwksnc |
| v3.5.6 | 64 | 2026-06-16 | kwksnc |
| v3.5.5 | 63 | 2026-06-16 | kwksnc |
| v3.5.4 | 62 | 2026-06-16 | kwksnc |
| v3.2.0 | — | 2026-06-15 | kwksnc |
| v3.1.8 | — | 2026-06-15 | kwksnc |
| v3.1.5 | 37 | 2026-06-13 | kwksnc |
| v3.1.4 | 36 | 2026-06-13 | kwksnc |
| v3.1.3 | 35 | 2026-06-12 | kwksnc |
| v3.1.2 | — | 2026-06-12 | kwksnc |
| v3.1.1 | — | 2026-06-12 | kwksnc |
| v3.1.0 | — | 2026-06-12 | kwksnc |
| v3.0.0 | — | 2026-06-12 | kwksnc |
| v2.8.0 | — | 2026-06-11 | kwksnc |
| v2.7.0 | — | 2026-06-11 | kwksnc |

---

## الإصلاحات الحرجة بالتفصيل

### 🔴 تكرار react-native-reanimated (v3.6.5) — سبب الكراش عند الإقلاع
**السبب الحقيقي لكراش التطبيق عند فتحه (شعار التطبيق يظهر ثم يكرش)**
- `@types/react` كان مُثبّتاً بإصدارين مختلفين:
  - 19.1.17 (لـ attendance package)
  - 19.2.14 (لـ mockup-sandbox عبر @radix-ui)
- هذا جعل pnpm يثبّت `react-native-reanimated@4.1.7` **مرتين**
- Metro يجمّع النسختين في الـ bundle → 2x حجم الـ Animated API
- عدد دوال `__makeNative`: 164 بدلاً من 82 (الطبيعي)
- حجم الـ bundle: 3.97MB بدلاً من 3.35MB (+622KB)
- **الحل**: إضافة `pnpm overrides` لإجبار `@types/react@~19.1.10` على مستوى الـ workspace كله
- **النتيجة**: إصدار واحد فقط من reanimated، حجم الـ bundle عاد لـ 3.35MB

### 🔴 خطأ حفظ الصور (v3.6.7 + v3.6.8) — Cannot convert Object to Kotlin runSync
**رسالة الخطأ**: `Cannot convert '[object Object]' to a Kotlin [runSync]: .type`

**المشكلة**: عند حفظ صورة، يفشل `database.runSync()` لأن أحد البارامترات كائن وليس primitive

**المحاولات**:
1. **v3.6.6**: إضافة `enforceSafePrimitive()` كشبكة أمان — لم تحل المشكلة
2. **v3.6.7**: ترقية `expo-file-system` إلى v19 + استخدام `/legacy` (نفس إصلاح v3.5.6) — لم تحل المشكلة
3. **v3.6.8**: تحويل صريح لكل الحقول إلى `String()` في `capture.tsx` + سجلات تشخيص تفصيلية

**الحلول المطبقة**:
- `toSafe()`: يحوّل الكائنات إلى JSON strings
- `enforceSafePrimitive()`: يحوّل أي قيمة غير primitive إلى String()
- `capture.tsx`: تحويل صريح لكل حقل قبل `addRecord`
- `safeRun()`: سجلات تشخيص + فحص نهائي + تحويل قسري لأي كائن متبقي

### 🚨🚨🚨 ملاحظة شديدة جداً — السبب الحقيقي والنهائي لخطأ حفظ الصور (v3.7.1) 🚨🚨🚨

> **⚠️ تحذير لأي ذكاء اصطناعي أو مطور يقرأ هذا:**
> **هذا هو السبب الحقيقي لخطأ "Cannot convert '[object Object]' to a Kotlin type" الذي استمر عبر 7 إصدارات (v3.6.6 → v3.7.0) قبل اكتشافه في v3.7.1. اقرأ هذا القسم بعناية فائقة قبل محاولة إصلاح أي خطأ مشابه.**

#### الخطأ الذي ظهر للمستخدم:
```
Cannot convert '[object Object]' to a Kotlin [runSync]: .type
```
ثم تطور إلى:
```
Error: حدث خطأ في التزامن: [runSync] Cannot convert '[object Object]' to a Kotlin type.
```

#### السبب الجذري (السبب الحقيقي!):
**في JavaScript، `typeof null === 'object'` (هذا سلوك معروف في JS منذ الإصدار الأول!)**

عندما يُمرر `null` إلى **Kotlin bridge** في expo-sqlite كقيمة في `Map<String, Any>`:
1. JavaScript يضع `null` في الـ Map
2. Kotlin bridge يحاول تحويل القيمة
3. `typeof null === 'object'` → Kotlin يراه كـ **Object** (وليس كـ null!)
4. **فشل التحويل!** → `Cannot convert '[object Object]' to a Kotlin type`

#### السيناريو الذي سبب المشكلة:
```typescript
// في capture.tsx، عند حفظ سجل بدون ملاحظة:
addRecord({
  ...
  note: note.trim() || '',  // إذا كان note فارغاً، يصبح ''
});

// في database.native.ts:
function insertRecord(record: AttendanceRecord): void {
  safeRun(database, `INSERT INTO records (..., note) VALUES (..., ?)`, [
    ...,
    record.note || null,  // ← إذا كان '' (falsy)، يصبح null!
  ]);
}

// في safeRun:
const safe = params.map(toSafe).map(enforceSafePrimitive);
// toSafe(null) → null
// enforceSafePrimitive(null) → null  ← المشكلة هنا!
// typeof null === 'object' ← Kotlin bridge يفشل!
```

#### لماذا فشلت جميع المحاولات السابقة؟

| الإصدار | المحاولة | لماذا فشلت |
|---------|----------|------------|
| v3.6.6 | `enforceSafePrimitive()` | كان يُرجع `null` ← `typeof null === 'object'` |
| v3.6.7 | `expo-file-system` v19 + `/legacy` | لم يكن له علاقة بالخطأ (الخطأ من SQLite وليس FileSystem) |
| v3.6.8 | `String()` في `capture.tsx` | حوّل الحقول لـ string، لكن `note` لا يزال يصبح `null` عبر `\|\| null` |
| v3.7.0 | `safeReadParams` للقراءة | عالج عمليات SELECT، لكن الخطأ كان من INSERT |
| v3.6.10 | `try/catch` في `getRecordsByDate` | منع الكراش لكن لم يحل السبب الجذري |

#### الحل النهائي (v3.7.1):
```typescript
// قبل (يسبب الخطأ):
function enforceSafePrimitive(v: unknown): string | number | null {
  if (v === null || v === undefined) return null;  // ← typeof null === 'object'!
  ...
}

// بعد (الحل النهائي):
function enforceSafePrimitive(v: unknown): string | number {
  // 🚨 لا تُرجع null أبداً! null في JS له typeof === 'object'
  // مما يسبب "Cannot convert Object to Kotlin type" في expo-sqlite
  if (v === null || v === undefined) return '';  // ← string فارغة بدلاً من null
  if (typeof v === 'string') return v;
  if (typeof v === 'number') return isFinite(v) ? v : 0;
  return String(v);
}
```

#### الدروس المستفادة (مهمة لأي مطور Expo/React Native):
1. **`typeof null === 'object'` في JavaScript** — هذا سلوك تاريخي معروف لكن خطير
2. **Kotlin bridge في expo-sqlite** لا يتعامل بشكل صحيح مع `null` في `Map<String, Any>`
3. **عند تمرير params إلى `database.runSync()`**, لا تمرر `null` أبداً — استخدم `''` للنصوص و `0` للأرقام
4. **عامل الشك دائماً**: إذا استمر خطأ رغم الإصلاحات الظاهرية، ابحث عن `null`!
5. **`record.note || null`** تعبير خطر — إذا كان `note` فارغاً، يصبح `null` الذي يسبب الكراش

#### ملفات حساسة تحتاج انتباه:
- `artifacts/attendance/utils/database.native.ts` — `safeRun`, `enforceSafePrimitive`, `safeReadParams`
- `artifacts/attendance/app/capture.tsx` — `handleConfirm` حيث يُنشأ السجل
- `artifacts/attendance/context/AttendanceContext.tsx` — `addRecord` الذي يستدعي `insertRecord`

#### اختبار التشخيص:
```javascript
// إذا رأيت هذا الخطأ، اختبر فوراً:
console.log(typeof null);  // 'object' ← هذا هو السبب!
console.log(null instanceof Object);  // false
// الحل: لا تمرر null إلى database.runSync()
```

### 🔴 تجاوز حد Android للإشعارات (v3.6.0 → v3.6.6)
**المشكلة**: كود `scheduleAlarmBurst` كان يجدول 60 إشعاراً لكل شفت (فاصل 15 ثانية × 15 دقيقة)
- لـ 7 أيام × 2 شفت = 840 إشعار مُجدول
- Android limit ≈ 50 إشعار مُجدول لكل تطبيق
- تجاوز الحد → كراش عند `scheduleNotificationAsync`

**الحل في v3.6.6**:
- فاصل 60 ثانية بدلاً من 15 (15 إشعار لكل نافذة بدلاً من 60)
- أيام محدودة: 3 للشفت الواحد، 2 للشفت المزدوج
- الحد الأقصى: 45 (single) أو 60 (double) — ضمن/قريب من حد Android

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

## التكوينات المهمة (pnpm-workspace.yaml)

### pnpm overrides (مهم لمنع تكرار reanimated)
```yaml
overrides:
  # Force a single @types/react version across the workspace to prevent
  # duplicate react-native-reanimated installations (which cause crashes at startup)
  "@types/react": "~19.1.10"
  "@types/react-dom": "~19.1.7"
```

### minimumReleaseAgeExclude (مهم لتثبيت expo-file-system v19)
```yaml
minimumReleaseAgeExclude:
  - '@replit/*'
  - stripe-replit-sync
  - react-native-onesignal
  - onesignal-expo-plugin
  - expo-file-system  # مهم: v19 قد تكون أحدث من 24 ساعة
```

### allowBuilds (مهم لـ dtrace-provider)
```yaml
allowBuilds:
  dtrace-provider: true  # يجب أن يكون true، ليس placeholder
  esbuild: true
```

---

## الاعتمادات الحرجة (Critical Dependencies)

| الحزمة | الإصدار | ملاحظات |
|--------|---------|---------|
| `expo` | ~54.0.27 | SDK 54 |
| `expo-file-system` | ~19.0.0 | **يجب استخدام `/legacy` API** |
| `react-native-reanimated` | ~4.1.1 | يتطلب New Architecture |
| `@types/react` | ~19.1.10 | **يجب توحيده عبر pnpm overrides** |
| `expo-sqlite` | ~15.1.2 | يستخدم runSync — يحتاج safeRun |
| `react-native-onesignal` | 5.5.1 | يتطلب تهيئة آمنة |
| `@babel/traverse` | ^7.25.2 | مطلوب لـ Metro Bundler |

---

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
