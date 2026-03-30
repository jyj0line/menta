import { type Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

import { SignUpForm } from '@/app/[locale]/(guest)/signup/SignupForm';
import { Logo } from "@/components/atoms/Click";
import { DEFAULT_PUBLIC_ROUTES } from '@/utils/constants/routes/public.route';
import { SP_KEYS, type Sps } from '@/utils/constants/sp';
import { getSpValue } from '@/utils/helpers/route.helper';

export async function generateMetadata(): Promise<Metadata> {
  const tMetadata = await getTranslations('metadata');
  const tPageSignup = await getTranslations('page.signup');
  
  return {
    title: tPageSignup('title'),
    description: tPageSignup('description', { applicationName: tMetadata('applicationName')})
  };
}

export default async function SignupPage({
  searchParams
}: {
  searchParams: Promise<Sps>
}) {
  const sps = await searchParams;
  const next = getSpValue(sps, SP_KEYS.NEXT)[0] ?? DEFAULT_PUBLIC_ROUTES.NEXT;

  return (
    <main className='flex flex-col items-center min-h-full p-page'>
      <Logo classNameH='h-(--spacing-80) my-(--spacing-48) fill-svg-dft'/>
      <SignUpForm next={next} className='w-full 600:w-(--bp-600)'/>
    </main>
  )
}