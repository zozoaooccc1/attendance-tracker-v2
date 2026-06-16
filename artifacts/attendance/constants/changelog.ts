export interface ChangelogItem {
  version: string;
  title: string;
  date: string;
  items: { type: 'new' | 'fix' | 'improve'; text: string }[];
}

const changelog: ChangelogItem[] = [
  {
    version: '3.6.1',
    title: 'إصلاح حفظ الصور + الإشعارات',
    date: '2026-06-17',
    items: [
      { type: 'fix',     text: 'إصلاح حفظ الصور — ترحيل لـ expo-file-system v19 legacy API' },
      { type: 'fix',     text: 'إصلاح الإشعارات التي لا تظهر أبداً — إعادة جدولة تلقائية عند بدء التطبيق' },
      { type: 'fix',     text: 'إصلاح مسح الإشعارات المتبادل بين الدوال' },
      { type: 'fix',     text: 'إصلاح مشكلة إذن SCHEDULE_EXACT_ALARM على Android 12+' },
      { type: 'new',     text: '🚨 منبّه مزعج جداً — إشعار كل 15 ثانية قبل 15 دقيقة من الدوام' },
      { type: 'new',     text: 'رسائل إنذار متصاعدة: أخضر ← أصفر ← برتقالي ← أحمر' },
      { type: 'new',     text: 'إشعار ثابت لا يُزال في آخر دقيقتين قبل الدوام' },
      { type: 'improve', text: 'تخطي يوم الجمعة تلقائياً في جدولة المنبّه' },
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

export const CURRENT_VERSION = '3.6.1';
