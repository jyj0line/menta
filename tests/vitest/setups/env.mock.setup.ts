export const MOCK_SHARED_ENVS = {
  NEXT_PUBLIC_NEXTJS_ORIGIN: 'https://example.com',
  NEXT_PUBLIC_SUPABASE_API_PROJECT_URL: 'https://example.supabase.co',
  NEXT_PUBLIC_SUPABASE_AK_PUBLISHABLE: 'sb_publishable_' + 'a'.repeat(31),
} as const;

Object.assign(process.env, MOCK_SHARED_ENVS);