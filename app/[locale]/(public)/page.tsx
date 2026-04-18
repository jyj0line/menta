import { type Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

import { createSupabseBrowserClient } from '@/libs/supabase/browserClient';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('page.root');
  
  return {
    title: { 
      absolute: t('title.absolute')
    },
    description: t('description')
  };
}

export default async function RootPage() {
  const supabaseBrowserClient = createSupabseBrowserClient();
  const { data } = await supabaseBrowserClient.auth.getUser()

  return (
    <div>
      <main>
        <p>Hello {data?.user?.email}</p>
      </main>
    </div>
  );
}