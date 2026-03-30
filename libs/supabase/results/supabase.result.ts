import { type ValuesFromObject } from '@/utils/types/util.type';

// supabase defined error codes
export const SUPABASE_ERROR_CODES = {
  INVALID_CREDENTIALS: 'invalid_credentials',
} as const;
export type SupabaseErrorCode = ValuesFromObject<typeof SUPABASE_ERROR_CODES>;