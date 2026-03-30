import { describe, it, expect } from 'vitest';

import { sharedEnvsSchema } from '@/getEnvs/getSharedEnvs.schema';

import { MOCK_SHARED_ENVS } from '@/tests/vitest/setups/mockEnvs';

describe('@/getEnvs/getSharedEnvs.schema.ts', () => {
  describe('sharedEnvsSchema', () => {
    describe('valid: ', () => {
      it('passes.', async () => {
        expect(sharedEnvsSchema.safeParse(MOCK_SHARED_ENVS).success).toBe(true);
      })
    })

    describe('invalid', () => {
      it.each([
        // missing
        {
          case: 'NEXT_PUBLIC_NEXTJS_ORIGIN is missing.',
          input: { ...MOCK_SHARED_ENVS, NEXT_PUBLIC_NEXTJS_ORIGIN: undefined },
        },
        {
          case: 'NEXT_PUBLIC_SUPABASE_API_PROJECT_URL is missing.',
          input: { ...MOCK_SHARED_ENVS, NEXT_PUBLIC_SUPABASE_API_PROJECT_URL: undefined },
        },
        {
          case: 'NEXT_PUBLIC_SUPABASE_AK_PUBLISHABLE is missing.',
          input: { ...MOCK_SHARED_ENVS, NEXT_PUBLIC_SUPABASE_AK_PUBLISHABLE: undefined },
        },
        // invalid url
        {
          case: 'NEXT_PUBLIC_NEXTJS_ORIGIN is not a valid url.',
          input: { ...MOCK_SHARED_ENVS, NEXT_PUBLIC_NEXTJS_ORIGIN: 'not-a-url' },
        },
        {
          case: 'NEXT_PUBLIC_SUPABASE_API_PROJECT_URL is not a valid url.',
          input: { ...MOCK_SHARED_ENVS, NEXT_PUBLIC_SUPABASE_API_PROJECT_URL: 'not-a-url' },
        },
        // invalid format
        {
          case: 'NEXT_PUBLIC_SUPABASE_AK_PUBLISHABLE is an empty string.',
          input: { ...MOCK_SHARED_ENVS, NEXT_PUBLIC_SUPABASE_AK_PUBLISHABLE: '' },
        },
        {
          case: 'NEXT_PUBLIC_SUPABASE_AK_PUBLISHABLE has wrong prefix.',
          input: { ...MOCK_SHARED_ENVS, NEXT_PUBLIC_SUPABASE_AK_PUBLISHABLE: 'sb_secret_' + 'a'.repeat(31) },
        },
        {
          case: 'NEXT_PUBLIC_SUPABASE_AK_PUBLISHABLE suffix is too short.',
          input: { ...MOCK_SHARED_ENVS, NEXT_PUBLIC_SUPABASE_AK_PUBLISHABLE: 'sb_publishable_' + 'a'.repeat(30) },
        },
        {
          case: 'NEXT_PUBLIC_SUPABASE_AK_PUBLISHABLE suffix is too long.',
          input: { ...MOCK_SHARED_ENVS, NEXT_PUBLIC_SUPABASE_AK_PUBLISHABLE: 'sb_publishable_' + 'a'.repeat(32) },
        },
      ])('fails when $case', ({ input: sharedEnvs }) => {
        expect(sharedEnvsSchema.safeParse(sharedEnvs).success).toBe(false);
      });
    });
  })
})