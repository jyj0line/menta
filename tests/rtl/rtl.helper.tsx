import { render, type RenderOptions } from '@testing-library/react';
import { ReactElement } from 'react';
import { NextIntlClientProvider } from 'next-intl';

import messages from '@/i18n/messages/en.json';
import { routingConfig } from '@/i18n/routing.cnfg';

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <NextIntlClientProvider locale={routingConfig.defaultLocale} messages={messages}>
    {children}
  </NextIntlClientProvider>
);

export const renderWithNextintl = (
  ui: ReactElement,
  options: Omit<RenderOptions, 'wrapper'>
) => {
  return render(ui, { wrapper: Wrapper, ...options });
}