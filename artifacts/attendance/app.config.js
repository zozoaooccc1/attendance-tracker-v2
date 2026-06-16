import appJson from './app.json';

const IS_DEV = process.env.APP_VARIANT === 'development';

export default {
  ...appJson.expo,
  name: IS_DEV ? 'حضور DEV' : appJson.expo.name,
  android: {
    ...appJson.expo.android,
    package: IS_DEV ? 'com.attendance.app.dev' : appJson.expo.android.package,
  },
  extra: {
    ...appJson.expo.extra,
    appVariant: IS_DEV ? 'development' : 'production',
    // توكن EAS لفحص التحديثات — يُضمَّن وقت البناء فقط
    // لا يستخدم EXPO_TOKEN الأصلي (محجوز لـ EAS CLI)
    easUpdateToken: process.env.EAS_UPDATE_TOKEN ?? '',
  },
};
