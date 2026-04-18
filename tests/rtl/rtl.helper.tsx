import { render, type RenderOptions } from '@testing-library/react';
import { ReactElement } from 'react';
import { NextIntlClientProvider } from 'next-intl';

import messages from '@/i18n/messages/en.json';
import { routing } from '@/i18n/routing';

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <NextIntlClientProvider locale={routing.defaultLocale} messages={messages}>
    {children}
  </NextIntlClientProvider>
);

export const renderWithNextintl = (
  ui: ReactElement,
  options: Omit<RenderOptions, 'wrapper'>
) => {
  return render(ui, { wrapper: Wrapper, ...options });
}