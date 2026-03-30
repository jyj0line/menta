import { describe, it, expect } from 'vitest';
import { createMockRequest } from '@/tests/utils/mock';

import {
  getTrustedOrigin, getSafePathname,
  isGuestPathname, isProtectedPathname, isPublicPathname,
  createLoginUrl, createRootUrl,
  getSpValue
} from '@/utils/helpers/route.helper';

import { GUEST_ROUTES } from '@/utils/constants/routes/guest.route';
import { PROTECTED_ROUTES } from '@/utils/constants/routes/protected.route';
import { ORIGINS, PUBLIC_ROUTES, DEFAULT_PUBLIC_ROUTES } from '@/utils/constants/routes/public.route';
import { SP_KEYS, type Sps } from "@/utils/constants/sp";

describe('@/utils/helpers/route.helper.ts', () => {
  describe('getTrustedOrigin() ', () => {
    it('returns the request origin when it matches a trusted origin.', () => {
      const { nextUrl } = createMockRequest('/', ORIGINS.NEXTJS);

      expect(getTrustedOrigin(nextUrl)).toBe(ORIGINS.NEXTJS);
    });

    it('returns the default NEXTJS trusted origin when the request origin is not trusted.', () => {
      const { nextUrl } = createMockRequest('/', 'https://untrusted.com');
      expect(getTrustedOrigin(nextUrl)).toBe(ORIGINS.NEXTJS);
    });

    it('returns the default NEXTJS trusted origin when the request origin is an external HTTP URL.', () => {
      const { nextUrl } = createMockRequest('/', 'http://malicious.com');
      expect(getTrustedOrigin(nextUrl)).toBe(ORIGINS.NEXTJS);
    });
  });

  describe('getSafePathname() ', () => {
    describe('safe paths: ', () => {
      it('returns safe pathname as-is.', () => {
        const safePath = '/dashboard';
        expect(getSafePathname(safePath)).toBe(safePath);
      });

      it('returns root pathname as-is.', () => {
        const rootPath = '/';
        expect(getSafePathname(rootPath)).toBe(rootPath);
      });

      it('returns nested pathname as-is.', () => {
        const nestedPath = '/dashboard/settings/profile';
        expect(getSafePathname(nestedPath)).toBe(nestedPath);
      });

      it('preserves special characters in the pathname.', () => {
        const pathWithSpecialCharacters = '/user/@username';
        expect(getSafePathname(pathWithSpecialCharacters)).toBe(pathWithSpecialCharacters);
      });

      it('preserves percent-encoded characters in the pathname.', () => {
        const pathWithEncodedCharacters = '/%ED%85%8C%EC%8A%A4%ED%8A%B8';
        expect(getSafePathname(pathWithEncodedCharacters)).toBe(pathWithEncodedCharacters);
      });

      it('preserves relative pathname that do not start with a leading slash.', () => {
        const path = 'dashboard/settings';
        expect(getSafePathname(path)).toBe(`/${path}`);
      });
    });

    describe('unsafe paths: ', () => {
      describe('normalization: ', () => {
        it('strips search parameters from the pathname.', () => {
          expect(getSafePathname('/search?q=test')).toBe('/search');
        });

        it('strips hash fragments from the pathname.', () => {
          expect(getSafePathname('/docs#introduction')).toBe('/docs');
        });

        it('normalizes path containing dot segments.', () => {
          expect(getSafePathname('/docs/../admin')).toBe('/admin');
        });

        it('normalizes invalid path characters like backslashes.', () => {
          expect(getSafePathname('/\\evil.com')).toBe('/');
        });

        it('normalizes encoded dot segments.', () => {
          expect(getSafePathname('/docs/%2E%2E/admin')).toBe('/admin');
        });
      })

      describe('rejected path: ', () => {
        it('returns fallback for the protocol-relative URLs to prevent open redirects.', () => {
          expect(getSafePathname('//malicious.com/phishing')).toBe(DEFAULT_PUBLIC_ROUTES.NEXT);
        });

        it('returns fallback for paths with triple leading slashes to prevent bypass attempts.', () => {
          expect(getSafePathname('///evil.com')).toBe(DEFAULT_PUBLIC_ROUTES.NEXT);
        });

        it('returns fallback for encoded protocol-relative paths to prevent bypass attempts.', () => {
          expect(getSafePathname('/%2F%2Fevil.com')).toBe(DEFAULT_PUBLIC_ROUTES.NEXT);
        });
        
        it('returns fallback for the absolute HTTPS URLs pointing to external domains.', () => {
          expect(getSafePathname('https://external.com')).toBe(DEFAULT_PUBLIC_ROUTES.NEXT);
        });

        it('returns fallback for the absolute HTTP URLs pointing to external domains.', () => {
          expect(getSafePathname('http://example.com')).toBe(DEFAULT_PUBLIC_ROUTES.NEXT);
        });

        it('returns fallback for the javascript: that execute code immediately.', () => {
          expect(getSafePathname('javascript:alert(1)')).toBe(DEFAULT_PUBLIC_ROUTES.NEXT);
        });

        it('returns fallback for the data: that load executable HTML documents.', () => {
          expect(getSafePathname('data:text/html,<script>alert(1)</script>')).toBe(DEFAULT_PUBLIC_ROUTES.NEXT);
        });
      });
    });

    describe('empty string path or invalid type paths: ', () => {
      it.each([
        '',
        undefined,
        null,
        true,
        false,
        123,
        [],
        {},
        () => {},
      ])('returns fallback for empty string path or on-string path',
        (path) => {
          expect(getSafePathname(path as any)).toBe(DEFAULT_PUBLIC_ROUTES.NEXT);
        }
      );
    });
  });

  describe('isGuestPathname() ', () => {
    describe('guest routes: ', () => {
      it.each(Object.values(GUEST_ROUTES))(
        'returns true when the pathname exactly matches a configured guest route.',
        (guestPathname) => {
          expect(isGuestPathname(guestPathname)).toBe(true);
        }
      );

      it.each(Object.values(GUEST_ROUTES))(
        'returns true when the pathname is nested under a configured guest route.',
        (guestRoute) => {
          expect(isGuestPathname(`${guestRoute}/nested`)).toBe(true);
          expect(isGuestPathname(`${guestRoute}/deeply/nested`)).toBe(true);
        }
      );

      it.each(Object.values(GUEST_ROUTES))(
        'returns true when the pathname matches a configured guest route, regardless of query, hash, and trailing slashes.',
        (guestPathname) => {
          expect(isGuestPathname(`${guestPathname}/`)).toBe(true);
          expect(isGuestPathname(`${guestPathname}?redirect=/dashboard`)).toBe(true);
          expect(isGuestPathname(`${guestPathname}#hash`)).toBe(true);
        }
      );
    });

    describe('non-guest routes: ', () => {
      it.each(Object.values(PROTECTED_ROUTES))(
        'returns false when the given pathname does not match any configured guest route.',
        (protectedPathname) => {
          expect(isGuestPathname(protectedPathname)).toBe(false);
        }
      );
    });

    describe('path traversal attack: ', () => {
      it('returns false when traversing from a guest route to a protected route.', () => {
        expect(isGuestPathname(`${GUEST_ROUTES.LOGIN}/..${PROTECTED_ROUTES.MY}`)).toBe(false);
      });

      it('returns false when traversing from a guest route to a public route.', () => {
        expect(isGuestPathname(`${GUEST_ROUTES.LOGIN}/..${PUBLIC_ROUTES.ERROR}`)).toBe(false);
      });
    });
  });

  describe('isProtectedPathname() ', () => {
    describe('protected routes: ', () => {
      it.each(Object.values(PROTECTED_ROUTES))(
        'returns true when the pathname exactly matches a configured protected route.',
        (protectedPathname) => {
          expect(isProtectedPathname(protectedPathname)).toBe(true);
        }
      );

      it.each(Object.values(PROTECTED_ROUTES))(
        'returns true when the pathname is nested under a configured protected route.',
        (protectedRoute) => {
          expect(isProtectedPathname(`${protectedRoute}/nested`)).toBe(true);
          expect(isProtectedPathname(`${protectedRoute}/deeply/nested`)).toBe(true);
        }
      );

      it.each(Object.values(PROTECTED_ROUTES))(
        'returns true when the pathname matches a configured protected route, regardless of query, hash, and trailing slashes.',
        (protectedPathname) => {
          expect(isProtectedPathname(`${protectedPathname}/`)).toBe(true);
          expect(isProtectedPathname(`${protectedPathname}?redirect=/dashboard`)).toBe(true);
          expect(isProtectedPathname(`${protectedPathname}#hash`)).toBe(true);
        }
      );
    });

    describe('non-protected routes: ', () => {
      it.each(Object.values(GUEST_ROUTES))(
        'returns false when the given pathname does not match any configured protected route.',
        (guestPathname) => {
          expect(isProtectedPathname(guestPathname)).toBe(false);
        }
      );
    });

    describe('path traversal attack: ', () => {
      it('returns false when traversing from a protected route to a guest route.', () => {
        expect(isProtectedPathname(`${PROTECTED_ROUTES.MY}/..${GUEST_ROUTES.LOGIN}`)).toBe(false);
      });

      it('returns false when traversing from a protected route to a public route.', () => {
        expect(isProtectedPathname(`${PROTECTED_ROUTES.MY}/..${PUBLIC_ROUTES.ERROR}`)).toBe(false);
      });
    });
  });

  describe('isPublicPathname() ', () => {
    describe('public routes: ', () => {
      describe('common or non-root routes: ', () => {
        it.each(Object.values(PUBLIC_ROUTES))(
          'returns true when the pathname exactly matches a configured public route.',
          (publicPathname) => {
            expect(isPublicPathname(publicPathname)).toBe(true);
          }
        );

        it.each(Object.values(PUBLIC_ROUTES).filter((route) => route !== '/'))(
          'returns true when the pathname is nested under a configured public route.',
          (publicRoute) => {
            expect(isPublicPathname(`${publicRoute}/nested`)).toBe(true);
            expect(isPublicPathname(`${publicRoute}/deeply/nested`)).toBe(true);
          }
        );

        it.each(Object.values(PUBLIC_ROUTES).filter((route) => route !== '/'))(
          'returns true when the pathname matches a configured public route, regardless of query, hash, and trailing slashes.',
          (publicPathname) => {
            expect(isPublicPathname(`${publicPathname}/`)).toBe(true);
            expect(isPublicPathname(`${publicPathname}//`)).toBe(true);
            expect(isPublicPathname(`${publicPathname}?redirect=/dashboard`)).toBe(true);
            expect(isPublicPathname(`${publicPathname}#hash`)).toBe(true);
          }
        );
      });

      describe('only for the root route: ', () => {
        it('treats the root route("/") as an exact match and does not match it as a prefix for other pathnames.', () => {
          expect(isPublicPathname('/')).toBe(true);
          expect(isPublicPathname('/anything-else')).toBe(false);
        });

        it('returns true when the root pathname matches, regardless of query and hash.', () => {
          expect(isPublicPathname('/?redirect=/dashboard')).toBe(true);
          expect(isPublicPathname('/#hash')).toBe(true);
        });
      });
    });

    describe('protected routes', () => {
      it.each(Object.values(PROTECTED_ROUTES))(
        'returns false when the given pathname does not match any configured public route.',
        (protectedPathname) => {
          expect(isPublicPathname(protectedPathname)).toBe(false);
        }
      );
    });

    describe('path traversal attack: ', () => {
      it('returns false when traversing from a public route to a guest route.', () => {
        expect(isPublicPathname(`${PUBLIC_ROUTES.ERROR}/..${GUEST_ROUTES.LOGIN}`)).toBe(false);
      });

      it('returns false when traversing from a public route to a protected route.', () => {
        expect(isPublicPathname(`${PUBLIC_ROUTES.ERROR}/..${PROTECTED_ROUTES.MY}`)).toBe(false);
      });
    });
  });

  describe('createLoginUrl() ', () => {
    it('replaces the requested pathname with the public login route, stores the original pathname in "next" sp, and removes all other sp/fragments.', () => {
      //given
      const nextPathname = '/dashboard'
      const { nextUrl } = createMockRequest(`${nextPathname}?extra=param#section`, ORIGINS.NEXTJS);

      //when
      const redirectUrl = createLoginUrl(nextUrl);

      //then
      expect(redirectUrl.origin).toBe(ORIGINS.NEXTJS);
      expect(redirectUrl.pathname).toBe(GUEST_ROUTES.LOGIN);
      expect(Object.fromEntries(redirectUrl.searchParams)).toEqual({
        [SP_KEYS.NEXT]: getSafePathname(nextPathname),
      });
      expect(redirectUrl.hash).toBe('');
    });
  });

  describe('createRootUrl() ', () => {
    it('replaces the requested pathname with the root route while stripping all original sps and fragments.', () => {
      //given
      const { nextUrl } = createMockRequest(`${GUEST_ROUTES.LOGIN}?error=fail#retry`, ORIGINS.NEXTJS);

      //when
      const redirectUrl = createRootUrl(nextUrl);

      //then
      expect(redirectUrl.origin).toBe(ORIGINS.NEXTJS);
      expect(redirectUrl.pathname).toBe(PUBLIC_ROUTES.ROOT);
      expect(redirectUrl.searchParams.size).toBe(0);
      expect(redirectUrl.hash).toBe('');
    });
  });

  describe('getSpValue() ', () => {
    describe('value exists: ', () => {
      it('returns a single string value wrapped in an array.', () => {
        const sps: Sps = { [SP_KEYS.NEXT]: '/dashboard' };
        expect(getSpValue(sps, SP_KEYS.NEXT)).toEqual(['/dashboard']);
      });

      it('returns a string array value as-is.', () => {
        const sps: Sps = { [SP_KEYS.NEXT]: ['/dashboard', '/profile'] };
        expect(getSpValue(sps, SP_KEYS.NEXT)).toEqual(['/dashboard', '/profile']);
      });

      it('returns an empty array when the value is an empty array.', () => {
        const sps: Sps = { [SP_KEYS.NEXT]: [] };
        expect(getSpValue(sps, SP_KEYS.NEXT)).toEqual([]);
      });
    });

    describe('value does not exist: ', () => {
      it('returns an empty array when the key is absent from the record.', () => {
        const sps: Sps = {};
        expect(getSpValue(sps, SP_KEYS.NEXT)).toEqual([]);
      });

      it('returns an empty array when the value is explicitly undefined.', () => {
        const sps: Sps = { [SP_KEYS.NEXT]: undefined };
        expect(getSpValue(sps, SP_KEYS.NEXT)).toEqual([]);
      });
    });
  });
});