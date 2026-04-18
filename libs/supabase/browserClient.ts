import { createBrowserClient } from '@supabase/ssr';

import { sharedEnv } from '@/getEnv/getSharedEnv';
import { type Database } from '@/libs/supabase/supabase.type';

export const createSupabseBrowserClient = () => {
  return createBrowserClient<Database>(
    sharedEnv.NEXT_PUBLIC_SUPABASE_API_PROJECT_URL,
    sharedEnv.NEXT_PUBLIC_SUPABASE_AK_PUBLISHABLE
  )
};