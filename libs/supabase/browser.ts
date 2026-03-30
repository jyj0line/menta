import { createBrowserClient } from '@supabase/ssr';

import { sharedEnvs } from '@/getEnvs/getSharedEnvs';
import { type Database } from '@/libs/supabase/types/supabase.type';

export const createSupabseBrowserClient = () => {
  return createBrowserClient<Database>(
    sharedEnvs.NEXT_PUBLIC_SUPABASE_API_PROJECT_URL,
    sharedEnvs.NEXT_PUBLIC_SUPABASE_AK_PUBLISHABLE
  )
};