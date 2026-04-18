import { type Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

import { Logo } from "@/components/atoms/Click";
import { DEFAULT_PUBLIC_ROUTES } from '@/utils/constants/routes/public.route';
import { SP_KEYS, type Sps } from '@/utils/constants/sp';
import { getSpValue } from '@/utils/helper.route';

export async function generateMetadata(): Promise<Metadata> {
  const tMetadata = await getTranslations('metadata');
  const tPageLogin = await getTranslations('page.login');
  
  return {
    title: tPageLogin('title'),
    description: tPageLogin('description', { applicationName: tMetadata('applicationName')})
  };
}

export default async function LoginPage({
  searchParams
}: {
  searchParams: Promise<Sps>
}) {
  const sps = await searchParams;
  const next = getSpValue(sps, SP_KEYS.NEXT)[0] ?? DEFAULT_PUBLIC_ROUTES.NEXT;

  return (
    <main className='flex flex-col items-center min-h-full p-page-p16'>
      <Logo classNameH='h-(--spacing-80) my-(--spacing-48) fill-svg-dft'/>
      login
    </main>
  )
}