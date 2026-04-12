import { type Metadata } from 'next';
import { notFound } from 'next/navigation';
import { NextIntlClientProvider, hasLocale } from 'next-intl';
import { getTranslations } from 'next-intl/server';

import "@/css/globals.css";
import { routingConfig } from '@/i18n/routing.cnfg';
import { ORIGINS } from '@/utils/constants/routes/public.route';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('metadata');
  
  return {
    title: {
      template: `%s | ${t('applicationName')}`,
      default: t('applicationName'),
    },
    metadataBase: new URL(ORIGINS.NEXTJS),
    applicationName: t('applicationName')
  };
}

type Props = {
  children: React.ReactNode;
  params: Promise<{locale: string}>;
};
export default async function GlobalLayout({
  children, params
}: Readonly<Props>) {
  // IMPORTANT: ensure that the incoming `locale` is valid
  const { locale } = await params;
  if (!hasLocale(routingConfig.locales, locale)) {
    notFound();
  }

  return (
    <html lang={locale}>
      <body className='h-dvh bg-bg-dft ut-txt-dft text-txt-dft antialiased'>
        <NextIntlClientProvider>{children}</NextIntlClientProvider>
      </body>
    </html>
  );
}