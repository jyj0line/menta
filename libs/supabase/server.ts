import "server-only";
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

import { sharedEnvs } from '@/getEnvs/getSharedEnvs';
import { type Database } from '@/libs/supabase/types/supabase.type';

export const createSupabaseServerClient = async () => {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    sharedEnvs.NEXT_PUBLIC_SUPABASE_API_PROJECT_URL,
    sharedEnvs.NEXT_PUBLIC_SUPABASE_AK_PUBLISHABLE,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value }) =>
              cookieStore.set(name, value)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have proxy refreshing
            // user sessions.
          }
        },
      }
    }
  )
}