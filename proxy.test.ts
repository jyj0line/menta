import { vi, describe, it, expect, beforeEach } from 'vitest';
import { createMockRequest } from '@/tests/utils/mock';

import { proxy } from '@/proxy';

import { NextResponse } from 'next/server';
import { updateSupabaseSessionProxy } from '@/libs/supabase/proxy';
import { PROTECTED_ROUTES } from '@/utils/constants/routes/protected.route';
import { ORIGINS } from '@/utils/constants/routes/public.route';

const mockCreateMiddleware = vi.hoisted(() => vi.fn());

const mockNextintlResponse = new NextResponse(null, { status: 200 });
const mockFinalResponse = new NextResponse(null, { status: 200 });

vi.mock('next-intl/middleware', () => ({
  default: vi.fn(() => mockCreateMiddleware),
}));

vi.mock('@/libs/supabase/proxy', () => ({
  updateSupabaseSessionProxy: vi.fn(),
}));

describe('proxy', () => {
  beforeEach(() => {
    mockCreateMiddleware.mockReturnValue(mockNextintlResponse);
    vi.mocked(updateSupabaseSessionProxy).mockResolvedValue(mockFinalResponse);
  });

  it('passes the request to updateSupabaseSessionProxy with the next-intl response.', async () => {
    const request = createMockRequest(PROTECTED_ROUTES.MY, ORIGINS.NEXTJS);

    const result = await proxy(request);

    expect(mockCreateMiddleware).toHaveBeenCalledWith(request);
    expect(updateSupabaseSessionProxy).toHaveBeenCalledWith(
      request,
      mockNextintlResponse,
    );
    expect(result).toBe(mockFinalResponse);
  });
});