import { type NextRequest } from 'next/server';

import { GUEST_ROUTES, type GuestRoutes } from '@/utils/constants/routes/guest.route';
import { PROTECTED_ROUTES, type ProtectedRoutes } from '@/utils/constants/routes/protected.route';
import {
  ORIGINS,
  PUBLIC_ROUTES, type PublicRoutes, DEFAULT_PUBLIC_ROUTES
} from '@/utils/constants/routes/public.route';
import { SP_KEYS, type SpKey, type Sps } from '@/utils/constants/sp';
import { ValuesFromObject } from '@/utils/type';

const ROUTES = {
  ...GUEST_ROUTES,
  ...PROTECTED_ROUTES,
  ...PUBLIC_ROUTES,
} as const;
type Routes = typeof ROUTES;
type Route = ValuesFromObject<Routes>;



const FALLBACK_PATHNAME: Route = DEFAULT_PUBLIC_ROUTES.NEXT;



export const getTrustedOrigin = (
  nextUrl: NextRequest["nextUrl"],
): string => {
  return Object.values(ORIGINS).includes(nextUrl.origin)
    ? nextUrl.origin
    : ORIGINS.NEXTJS;
};

export const getSafePathname = (input: string): string => {
  if (typeof input !== 'string') {
    return FALLBACK_PATHNAME;
  }

  const trimmedInput = input.trim();

  let url: URL;
  try {
    url = new URL(trimmedInput);
  } catch {
    try {
      url = new URL(trimmedInput, ORIGINS.NEXTJS);
    } catch {
      return FALLBACK_PATHNAME;
    }
  }

  if (url.origin !== ORIGINS.NEXTJS) {
    return FALLBACK_PATHNAME;
  }

  const pathname = url.pathname;
  if (pathname.startsWith('//') || decodeURIComponent(pathname).startsWith('//')) {
    return FALLBACK_PATHNAME;
  }

  return pathname.startsWith('/') ? pathname : FALLBACK_PATHNAME;
};



const matchesRoutes = (path: string, routes: GuestRoutes | ProtectedRoutes | PublicRoutes): boolean => {
  const safePathname = getSafePathname(path);

  return Object.values(routes).some((route) => {
    if (route === '/') return safePathname === '/';
    return safePathname === route || safePathname.startsWith(`${route}/`);
  });
};
export const isGuestPathname = (path: string) => matchesRoutes(path, GUEST_ROUTES);
export const isPublicPathname = (path: string) => matchesRoutes(path, PUBLIC_ROUTES);
export const isProtectedPathname = (path: string) => matchesRoutes(path, PROTECTED_ROUTES);



export const createLoginUrl = (nextUrl: NextRequest["nextUrl"]): URL => {
  const url = new URL(GUEST_ROUTES.LOGIN, getTrustedOrigin(nextUrl));

  const safeNext = getSafePathname(nextUrl.pathname);
  url.searchParams.set(SP_KEYS.NEXT, safeNext);

  return url;
};

export const createRootUrl = (nextUrl: NextRequest["nextUrl"]): URL => {
  return new URL(PUBLIC_ROUTES.ROOT, getTrustedOrigin(nextUrl));
};



export const getSpValue = (
  sps: Sps,
  spKey: SpKey
): string[] => {
  const value = sps[spKey];
  if (value === undefined) return [];
  return Array.isArray(value) ? value : [value];
}