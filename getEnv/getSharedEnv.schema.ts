import { z } from 'zod';

export const sharedEnvSchema = z.object({
  NEXT_PUBLIC_NEXTJS_ORIGIN: z.url({
    error: 'NEXT_PUBLIC_NEXTJS_ORIGIN is invalid.'
  }),

  NEXT_PUBLIC_SUPABASE_API_PROJECT_URL: z.url({
    error: 'NEXT_PUBLIC_SUPABASE_API_PROJECT_URL is invalid.'
  }),
  NEXT_PUBLIC_SUPABASE_AK_PUBLISHABLE: z.string().regex(/^sb_publishable_.{31}$/, {
    error: 'NEXT_PUBLIC_SUPABASE_AK_PUBLISHABLE is invalid.'
  })
});