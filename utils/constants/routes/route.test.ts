import { describe, it, expect } from 'vitest';

import { GUEST_ROUTES } from '@/utils/constants/routes/guest.route';
import { PUBLIC_ROUTES } from '@/utils/constants/routes/public.route';
import { PROTECTED_ROUTES } from '@/utils/constants/routes/protected.route';

describe('Route constants', () => {
  const assertNoOverlap = (
    sourceRoutes: string[],
    targetRoutes: string[],
    sourceName: string,
    targetName: string,
  ) => {
    sourceRoutes.forEach(sourceRoute => {
      targetRoutes.forEach(targetRoute => {
        if (targetRoute === '/') {
          expect(
            sourceRoute,
            `${sourceName} route "${sourceRoute}" must not overlap with ${targetName} root route "/"`,
          ).not.toBe('/');
        } else {
          expect(
            sourceRoute,
            `${sourceName} route "${sourceRoute}" must not equal ${targetName} route "${targetRoute}"`,
          ).not.toBe(targetRoute);

          expect(
            sourceRoute.startsWith(`${targetRoute}/`),
            `${sourceName} route "${sourceRoute}" must not be nested under ${targetName} route "${targetRoute}"`,
          ).toBe(false);

          expect(
            targetRoute.startsWith(`${sourceRoute}/`),
            `${targetName} route "${targetRoute}" must not be nested under ${sourceName} route "${sourceRoute}"`,
          ).toBe(false);
        }
      });
    });
  };

  it('does not have overlapping routes between public, protected, and guest routes', () => {
    const guestRoutes = Object.values(GUEST_ROUTES);
    const publicRoutes = Object.values(PUBLIC_ROUTES);
    const protectedRoutes = Object.values(PROTECTED_ROUTES);

    assertNoOverlap(publicRoutes, protectedRoutes, 'public', 'protected');
    assertNoOverlap(publicRoutes, guestRoutes, 'public', 'guest');
    assertNoOverlap(protectedRoutes, guestRoutes, 'protected', 'guest');
  });
});