import { describe, it, expect, vi } from 'vitest';

import { NextjsCacheService, NextjsRedirectService } from '@/utils/services/common.service';

import { revalidatePath as nextjsRevalidatePath } from 'next/cache';
import { redirect as nextjsRedirect } from 'next/navigation';
import * as routeHelperModule from '@/utils/helpers/route.helper';

const spyOnGetSafePathname = vi.spyOn(routeHelperModule, 'getSafePathname');

describe('@/utils/services/common.service.ts', () => {
  describe('NextjsCacheService', () => {
    it('sanitizes the path with getSafePathname() before calling revalidatePath()', () => {
      const cacheService = new NextjsCacheService();
      const unsafePath = '/some/../unsafe/path';
      const safePath = routeHelperModule.getSafePathname(unsafePath);
      const revalidateType = 'page';

      cacheService.revalidatePathname(unsafePath, revalidateType);

      expect(spyOnGetSafePathname).toHaveBeenCalledWith(unsafePath);
      expect(nextjsRevalidatePath).toHaveBeenCalledWith(safePath, revalidateType);
    });
  });

  describe('NextjsRedirectService', () => {
    it('anitizes the path with getSafePathname() before calling redirect()', () => {
      const redirectService = new NextjsRedirectService();
      const unsafePath = 'javascript:alert("xss")';
      const safePath = routeHelperModule.getSafePathname(unsafePath);

      redirectService.redirect(unsafePath);

      expect(spyOnGetSafePathname).toHaveBeenCalledWith(unsafePath);
      expect(nextjsRedirect).toHaveBeenCalledWith(safePath);
    });
  });
});
