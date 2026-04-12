import { formats } from '@/i18n/request.cnfg';
import { routingConfig } from '@/i18n/routing.cnfg';
import messages from '@/i18n/messages/en.json';

declare module 'next-intl' {
  interface AppConfig {
    Locale: (typeof routingConfig.locales)[number];
    Messages: typeof messages;
    Formats: typeof formats;
  }
}