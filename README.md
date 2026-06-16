# تتبع الحضور - الإصدار الثاني | Attendance Tracker V2

نظام متكامل لتتبع حضور الموظفين مع لوحة تحكم إدارية.

## المكونات

- 📱 **تطبيق الموظف** (`artifacts/attendance/`) - تطبيق React Native/Expo لالتقاط صور جهاز البصمة
- 🖥️ **خادم API** (`artifacts/api-server/`) - خادم Express.js للإشعارات والخدمات
- 🗄️ **مكتبة قاعدة البيانات** (`lib/db/`) - Drizzle ORM
- 🌐 **مكتبة API** (`lib/api-client-react/`, `lib/api-zod/`) - عميل API

## التقنيات

- Expo SDK 54 / React Native 0.81
- TypeScript
- expo-sqlite
- expo-file-system
- OneSignal
- pnpm workspace

## التثبيت

```bash
pnpm install
cd artifacts/attendance
pnpm start
```

## البناء

```bash
cd artifacts/attendance
eas build --platform android --profile preview
```
