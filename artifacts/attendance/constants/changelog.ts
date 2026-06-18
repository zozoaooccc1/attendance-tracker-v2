export interface ChangelogItem {
  version: string;
  title: string;
  date: string;
  items: { type: 'new' | 'fix' | 'improve'; text: string }[];
}

const changelog: ChangelogItem[] = [
  {
    version: '3.7.8',
    title: 'إصلاح اختيار الشفت في التنبيهات',
    date: '2026-06-18',
    items: [
      { type: 'fix', text: '🚨 إضافة زر اختيار نوع الدوام (شفت واحد/شفتين) داخل صفحة التنبيهات' },
      { type: 'fix', text: '✅ أزرار اختيار الشفت (الأول/الثاني/كلاهما) تظهر داخل صفحة التنبيهات مباشرة' },
      { type: 'fix', text: '✅ التنبيهات أصبحت مستقلة عن إعدادات الصفحة الرئيسية' },
    ],
  },
  {
    version: '3.7.7',
    title: 'إصلاح شامل للتنبيهات + نظام تحديثات جديد',
    date: '2026-06-18',
    items: [
      { type: 'fix',     text: '🚨 إصلاح: المنبّه المزعج لم يكن يظهر في الإعدادات (كان مخفياً داخل notifEnabled)' },
      { type: 'fix',     text: '🚨 إصلاح: أزرار اختيار الشفت لم تكن تظهر (نفس السبب)' },
      { type: 'new',     text: '✅ المنبّه المزعج مرئي دائماً في الإعدادات' },
      { type: 'new',     text: '✅ اختيار الشفت (الأول/الثاني/كلاهما) مرئي دائماً عند تفعيل المنبّه' },
      { type: 'new',     text: '✅ نظام تحديثات جديد يعتمد على JSON من GitHub (سريع وموثوق)' },
      { type: 'fix',     text: '✅ rescheduleFromSettings: إعادة جدولة تلقائية عند بدء التطبيق' },
    ],
  },
  {
    version: '3.7.6',
    title: 'إصلاح التنبيهات + إعادة جدولة تلقائية',
    date: '2026-06-18',
    items: [
      { type: 'fix',     text: '🚨 إصلاح: التنبيهات لم تكن تُعيد الجدولة عند بدء التطبيق' },
      { type: 'fix',     text: '🚨 إصلاح: رسالة التنبيه كانت تقول 5 ثوانٍ بدل 30 ثانية' },
      { type: 'fix',     text: '🚨 إصلاح: changelog كان يعرض v3.6.8 بدل الإصدار الحالي' },
      { type: 'new',     text: '✅ rescheduleFromSettings: إعادة جدولة تلقائية عند بدء التطبيق' },
    ],
  },
  {
    version: '3.7.5',
    title: 'المنبّه المزعج القوي + اختيار الشفت',
    date: '2026-06-18',
    items: [
      { type: 'new',     text: '🚨 المنبّه المزعج: كل 30 ثانية قبل 15 دقيقة من الدوام' },
      { type: 'new',     text: '✅ اختيار الشفت: الأول فقط / الثاني فقط / كلاهما' },
      { type: 'fix',     text: 'حفظ اختيار الشفت في AsyncStorage (لا يُفقد عند إعادة التشغيل)' },
      { type: 'improve', text: 'اهتزاز أقوى في آخر دقيقتين + إشعار لاصق لا يُزال' },
    ],
  },
  {
    version: '3.7.3',
    title: 'إزالة فترة السماح من الواجهة',
    date: '2026-06-17',
    items: [
      { type: 'fix', text: 'تحديث نص "سماح حتى 12:15" إلى "بدون سماح" في الواجهة' },
    ],
  },
  {
    version: '3.7.2',
    title: 'إلغاء جميع فترات السماح',
    date: '2026-06-17',
    items: [
      { type: 'fix', text: '🚨 إلغاء جميع فترات السماح — التأخير يُحتسب فوراً عند موعد الدخول' },
    ],
  },
  {
    version: '3.7.1',
    title: 'إصلاح حفظ الصور نهائياً',
    date: '2026-06-17',
    items: [
      { type: 'fix', text: '🚨 إصلاح: typeof null === object في JavaScript يسبب خطأ Kotlin' },
      { type: 'fix', text: 'enforceSafePrimitive لا تُرجع null أبداً — تحوّله إلى string فارغ' },
    ],
  },
  {
    version: '3.7.0',
    title: 'إصلاح خطأ القراءة (READ)',
    date: '2026-06-17',
    items: [
      { type: 'fix', text: 'إضافة safeReadParams لعمليات القراءة في قاعدة البيانات' },
    ],
  },
  {
    version: '3.6.8',
    title: 'إصلاح حفظ الصور — تحديد السبب',
    date: '2026-06-17',
    items: [
      { type: 'fix', text: '🚨 إصلاح قاطع: تحويل صريح لكل الحقول إلى string في capture.tsx' },
      { type: 'improve', text: 'إضافة سجلات تشخيص تفصيلية في safeRun لتحديد السبب' },
    ],
  },
  {
    version: '3.6.7',
    title: 'إصلاح حفظ الصور (الإصلاح الحقيقي)',
    date: '2026-06-17',
    items: [
      { type: 'fix', text: '🚨 إصلاح حفظ الصور — ترقية expo-file-system إلى v19 واستخدام /legacy API (نفس إصلاح v3.5.6)' },
      { type: 'fix', text: 'الإبقاء على pnpm overrides لـ @types/react — لمنع تكرار react-native-reanimated' },
      { type: 'fix', text: 'الإبقاء على enforceSafePrimitive كشبكة أمان إضافية' },
    ],
  },
  {
    version: '3.6.6',
    title: 'إصلاح حفظ الصور + إعادة المنبّه المزعج',
    date: '2026-06-17',
    items: [
      { type: 'fix',     text: '🚨 إصلاح خطأ حفظ الصور: Cannot convert Object to Kotlin runSync — إضافة شبكة أمان enforceSafePrimitive' },
      { type: 'new',     text: '🚨 إعادة المنبّه المزعج: رسائل متصاعدة (أخضر ← أصفر ← برتقالي ← أحمر)' },
      { type: 'improve', text: 'فاصل المنبّه 60 ثانية بدلاً من 15 ثانية — لتجنب تجاوز حد Android للإشعارات المُجدولة' },
      { type: 'improve', text: 'تحديد عدد أيام المنبّه (3 أيام للشفت الواحد، 2 للشفت المزدوج) — لمنع الكراش' },
    ],
  },
  {
    version: '3.6.5',
    title: 'إصلاح الكراش الحقيقي — تكرار react-native-reanimated',
    date: '2026-06-17',
    items: [
      { type: 'fix', text: '🚨 إصلاح كرash عند الإقلاع — كان react-native-reanimated يُجمَّع مرتين بسبب تضارب @types/react' },
      { type: 'fix', text: 'إجبار @types/react على إصدار واحد (~19.1.10) عبر pnpm overrides' },
    ],
  },
  {
    version: '3.6.4',
    title: 'العودة إلى آخر إصدار مستقر',
    date: '2026-06-17',
    items: [
      { type: 'fix', text: '🚨 إصلاح الكراش — العودة إلى كود v3.5.2 (آخر إصدار مستقر قبل تعديلات الإشعارات)' },
      { type: 'fix', text: 'تم تجاوز جميع التغييرات من fbee2e1 إلى HEAD التي كانت تسبب الكراش' },
    ],
  },
  {
    version: '3.2.0',
    title: 'نظام التحديثات عبر EAS وإصلاحات',
    date: '2026-06-15',
    items: [
      { type: 'new',     text: 'نظام تحديثات جديد يعتمد على EAS بالكامل' },
      { type: 'fix',     text: 'إصلاح كراش عند ترك ملاحظة فارغة' },
      { type: 'fix',     text: 'إصلاح تكرار مفاتيح الترجمة' },
      { type: 'improve', text: 'تحسين موثوقية التحقق من التحديثات' },
    ],
  },
  {
    version: '3.1.8',
    title: 'إصلاحات شاملة للأخطاء',
    date: '2026-06-15',
    items: [
      { type: 'fix',     text: 'إصلاح تعارض تنسيق بيانات الإنجازات' },
      { type: 'fix',     text: 'إصلاح حالة السباق في حفظ بيانات الموظف والإعدادات' },
      { type: 'fix',     text: 'إصلاح حساب الفترة عند بقاء التطبيق مفتوحاً' },
      { type: 'fix',     text: 'إصلاح خطأ التوقيت الصيفي في حساب أطول سلسلة' },
      { type: 'fix',     text: 'إصلاح حساب حجم النسخ الاحتياطي' },
      { type: 'fix',     text: 'تحسين تجزئة رمز PIN بإضافة ملح وتكرار' },
      { type: 'fix',     text: 'إصلاح إمكانية تحقيق إنجاز "أسبوع بلا تأخر"' },
      { type: 'fix',     text: 'إضافة تصديرات مفقودة في نسخة الويب' },
      { type: 'improve', text: 'تطابق حالة اللغة بين السياقات' },
      { type: 'improve', text: 'تحسين معالجة الأخطاء عبر التطبيق' },
    ],
  },
  {
    version: '3.1.5',
    title: 'إصلاح 5 مشاكل',
    date: '2026-06-13',
    items: [
      { type: 'fix',     text: 'حلّ كراش صفحة الموظف' },
      { type: 'fix',     text: 'إصلاح حلقة تثبيت التحديث المتكررة' },
      { type: 'fix',     text: 'المنبّه الصاخب يعمل يومياً لأسبوع كامل' },
      { type: 'improve', text: 'معلومات التحديث باللغة العربية' },
      { type: 'improve', text: 'استقرار عام وتحسينات أداء' },
    ],
  },
  {
    version: '3.1.4',
    title: 'إصلاحات متعددة ودعم اللغات',
    date: '2026-06-13',
    items: [
      { type: 'fix',     text: 'المنبّه الصاخب لكل شفت بشكل مستقل' },
      { type: 'fix',     text: 'اتجاه شريط حجم الخط في وضع RTL' },
      { type: 'fix',     text: 'التقاط الخروج فقط بعد انتهاء الشفت' },
      { type: 'fix',     text: 'إزالة خطأ 403 في الذكاء الاصطناعي' },
      { type: 'new',     text: 'صفحة الموظف هي الصفحة الرئيسية' },
      { type: 'new',     text: 'دعم اللغة الإنجليزية في صفحة الموظف' },
      { type: 'improve', text: 'اسم الفترة: فترة دوام الشركة' },
    ],
  },
  {
    version: '3.1.3',
    title: 'إصلاح الكراش والذكاء الاصطناعي',
    date: '2026-06-12',
    items: [
      { type: 'fix', text: 'إصلاح حلقة الكراش الوهمي عند التشغيل' },
      { type: 'fix', text: 'إصلاح خطأ 403 في مسح الذكاء الاصطناعي' },
    ],
  },
  {
    version: '3.1.2',
    title: 'إصلاح فحص التحديث',
    date: '2026-06-12',
    items: [
      { type: 'fix', text: 'إصلاح زر التحقق من التحديثات' },
    ],
  },
  {
    version: '3.1.1',
    title: 'إصلاح 4 مشاكل',
    date: '2026-06-12',
    items: [
      { type: 'fix', text: 'ضبط حجم الخط بدقة 1% في كل خطوة' },
      { type: 'fix', text: 'حفظ الصفحة الرئيسية المختارة بشكل دائم' },
      { type: 'fix', text: 'نافذة التثبيت تبقى مفتوحة بعد التحميل' },
      { type: 'new', text: 'إمكانية ضبط حد التخزين' },
    ],
  },
  {
    version: '3.1.0',
    title: 'المنبّه الصاخب والتنظيم',
    date: '2026-06-12',
    items: [
      { type: 'new',     text: 'منبّه صاخب كل 30 ثانية قبل موعد الدخول' },
      { type: 'new',     text: 'قناة إشعارات عالية الأولوية' },
      { type: 'fix',     text: 'إزالة تتبع دقائق الوصول المبكر' },
      { type: 'improve', text: 'بطاقة التأخير الشهري بعنوان كامل' },
    ],
  },
  {
    version: '3.0.0',
    title: 'الذكاء الاصطناعي والتخزين والبحث',
    date: '2026-06-12',
    items: [
      { type: 'new',     text: 'شريط تمرير حجم الخط (80%–150%)' },
      { type: 'new',     text: 'وضع التباين العالي' },
      { type: 'new',     text: 'إحصائيات التخزين مع التنظيف' },
      { type: 'new',     text: 'نسخ احتياطي كامل مع الصور' },
      { type: 'new',     text: 'ماسح الذكاء الاصطناعي لاستخراج الوقت' },
      { type: 'new',     text: 'فلاتر متقدمة للسجل' },
      { type: 'improve', text: 'البحث يشمل الملاحظات' },
    ],
  },
  {
    version: '2.8.0',
    title: 'إشعارات OneSignal الفورية',
    date: '2026-06-11',
    items: [
      { type: 'new',     text: 'إشعار فوري عند صدور إصدار جديد' },
      { type: 'improve', text: 'طلب الإذن عند أول تشغيل' },
      { type: 'improve', text: 'مجاني بدون خادم خاص' },
    ],
  },
  {
    version: '2.7.0',
    title: 'نظام التحديث التلقائي',
    date: '2026-06-11',
    items: [
      { type: 'new',     text: 'إشعار التحديث مع رابط التحميل المباشر' },
      { type: 'improve', text: 'إزالة نظام OTA القديم' },
      { type: 'new',     text: 'ملاحظات التأخير في PDF وواتساب وCSV' },
      { type: 'new',     text: 'شارة لملاحظات التأخير' },
    ],
  },
];

export function getVersionChangelog(version: string): ChangelogItem | null {
  return changelog.find(c => c.version === version) ?? null;
}

export function getLatestChangelog(): ChangelogItem | null {
  return changelog[0] ?? null;
}

export const CURRENT_VERSION = '3.7.8';
