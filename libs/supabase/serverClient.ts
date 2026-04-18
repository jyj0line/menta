import "server-only";
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

import { sharedEnv } from '@/getEnv/getSharedEnv';
import { type Database } from '@/libs/supabase/supabase.type';

export const createSupabaseServerClient = async () => {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    sharedEnv.NEXT_PUBLIC_SUPABASE_API_PROJECT_URL,
    sharedEnv.NEXT_PUBLIC_SUPABASE_AK_PUBLISHABLE,
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