import { defineRouting } from 'next-intl/routing';
 
export const routing = defineRouting({
  locales: ['en', 'ko'],
  defaultLocale: 'en',
  localePrefix: 'never',
  localeDetection: true,
  localeCookie: true
});