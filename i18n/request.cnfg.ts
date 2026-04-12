import { type Formats, hasLocale } from 'next-intl';
import { getRequestConfig } from 'next-intl/server';

import { routingConfig } from '@/i18n/routing.cnfg';

export const formats = {
  dateTime: {
    short: {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }
  },
  number: {
    precise: {
      maximumFractionDigits: 5
    }
  },
  list: {
    enumeration: {
      style: 'long',
      type: 'conjunction'
    }
  }
} satisfies Formats;

export default getRequestConfig(async ({ requestLocale }) => {
  const requestedLocale = await requestLocale;
  const locale = hasLocale(routingConfig.locales, requestedLocale)
    ? requestedLocale
    : routingConfig.defaultLocale;

  return {
    locale: locale,
    messages: (await import(`./messages/${locale}.json`)).default,
    Formats: formats
  };
});