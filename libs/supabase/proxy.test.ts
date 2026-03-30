import { vi, describe, it, expect } from 'vitest';
import { createMockRequest } from '@/tests/utils/mock';

import { updateSupabaseSessionProxy } from '@/libs/supabase/proxy';

import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import { type Database } from '@/libs/supabase/types/supabase.type';
import { GUEST_ROUTES } from '@/utils/constants/routes/guest.route';
import { ORIGINS, PUBLIC_ROUTES } from '@/utils/constants/routes/public.route';
import { PROTECTED_ROUTES } from '@/utils/constants/routes/protected.route';
import { type DeepPartial } from '@/utils/types/util.type';

describe('utils/supabase/proxy.ts', () => {
  describe('updateSupabaseSessionProxy', () => {
    type MockClaim = DeepPartial<Awaited<ReturnType<ReturnType<typeof createServerClient<Database>>['auth']['getClaims']>>>;
    const mockAuthenticatedClaim: MockClaim = {
      data: { claims: {} },
      error: null,
    };
    const mockUnauthenticatedClaim: MockClaim = {
      data: null,
      error: null, // unauthenticated, but not the Supabase AuthError case
    };

    const setupSupabaseMock = (isAuthenticated: boolean) => {
      vi.mocked(createServerClient).mockReturnValue({
        auth: {
          getClaims: vi.fn().mockResolvedValue(isAuthenticated ? mockAuthenticatedClaim : mockUnauthenticatedClaim),
        },
      });
    };

    describe('when the request is authenticated ', () => {
      describe('and the pathname is guest, ', () => {
        it.each(Object.values(GUEST_ROUTES))(
          '%s: redirects to root.',
          async (guestPathname) => {
            setupSupabaseMock(true);
            const mockRequest = createMockRequest(guestPathname, ORIGINS.NEXTJS);

            const response = await updateSupabaseSessionProxy(
              mockRequest,
              NextResponse.next(),
            );

            expect(response.status).toBe(307);
            expect(response.headers.get('location')).toContain('/');
          }
        );
      });
      
      describe('and the pathname is protected, ', () => {
        it.each(Object.values(PROTECTED_ROUTES))(
          'allows access.',
          async (protectedPathname) => {
            setupSupabaseMock(true);
            const mockRequest = createMockRequest(protectedPathname, ORIGINS.NEXTJS);

            const response = await updateSupabaseSessionProxy(mockRequest, NextResponse.next());

            expect(response.status).toBe(200);
            expect(response.headers.get('location')).toBeNull();
          }
        );
      });

      describe('and the pathname is public, ', () => {
        it.each(Object.values(PUBLIC_ROUTES))(
          'allows access.',
          async (publicPathname) => {
            setupSupabaseMock(true);
            const mockRequest = createMockRequest(publicPathname, ORIGINS.NEXTJS);

            const response = await updateSupabaseSessionProxy(mockRequest, NextResponse.next());

            expect(response.status).toBe(200);
            expect(response.headers.get('location')).toBeNull();
          }
        )
      });
    });
    
    describe('when the request is unauthenticated ', () => {
      describe('and the pathname is guest, ', () => {
        it.each(Object.values(GUEST_ROUTES))(
          '%s: allows access.',
          async (guestPathname) => {
            setupSupabaseMock(false);
            const mockRequest = createMockRequest(guestPathname, ORIGINS.NEXTJS);

            const response = await updateSupabaseSessionProxy(
              mockRequest,
              NextResponse.next(),
            );

            expect(response.status).toBe(200);
            expect(response.headers.get('location')).toBeNull();
          }
        );
      });

      describe('and the pathname is protected, ', () => {
        it.each(Object.values(PROTECTED_ROUTES))(
          'redirects to the public login route.',
          async (protectedPathname) => {
            setupSupabaseMock(false);
            const mockRequest = createMockRequest(protectedPathname, ORIGINS.NEXTJS);
            
            const response = await updateSupabaseSessionProxy(mockRequest, NextResponse.next());

            expect(response.status).toBe(307);
            expect(response.headers.get('location')).toContain(GUEST_ROUTES.LOGIN);
          }
        );
      });

      describe('and the pathname is public, ', () => {
        it.each(Object.values(PUBLIC_ROUTES))(
          'allows access.',
          async (publicPathname) => {
            setupSupabaseMock(false);
            const mockRequest = createMockRequest(publicPathname, ORIGINS.NEXTJS);

            const response = await updateSupabaseSessionProxy(mockRequest, NextResponse.next());

            expect(response.status).toBe(200);
            expect(response.headers.get('location')).toBeNull();
          }
        );
      });
    });
  })
});