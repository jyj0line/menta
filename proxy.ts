import { type NextRequest, NextResponse } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { createServerClient } from '@supabase/ssr';

import { sharedEnv } from '@/getEnv/getSharedEnv';
import { routing } from '@/i18n/routing';
import { type Database } from '@/libs/supabase/supabase.type';
import {
  isGuestPathname, isProtectedPathname,
  createLoginUrl, createRootUrl
} from '@/utils/helper.route';

// 1. next-intl
// expected to return NextResponse made of NextRequest
// used in 2. supabase auth
const niProxy = createMiddleware(routing);

// 2. supabase auth
// update session
// verify session auth for path
const niSbProxy = async (
  request: NextRequest,
  niProxy: (request: NextRequest) => NextResponse
) => {
  let niSbResponse = niProxy(request);

  // With Fluid compute, don't put this client in a global environment variable.
  // Always create a new one on each request.
  const supabaseServerClient = createServerClient<Database>(
    sharedEnv.NEXT_PUBLIC_SUPABASE_API_PROJECT_URL,
    sharedEnv.NEXT_PUBLIC_SUPABASE_AK_PUBLISHABLE,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet, headers) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));

          niSbResponse = niProxy(request);
          cookiesToSet.forEach(({ name, value, options }) =>
            niSbResponse.cookies.set(name, value, options)
          )
          Object.entries(headers).forEach(([key, value]) =>
            niSbResponse.headers.set(key, value)
          )
        },
      },
    }
  );

  // Do not run code between createServerClient and supabase.auth.getClaims().
  // A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  // IMPORTANT: If you remove getClaims() and you use server-side rendering with the Supabase client,
  // your users may be randomly logged out.
  const { data } = await supabaseServerClient.auth.getClaims();

  const user = data?.claims;

  const hasProtectedPathname = isProtectedPathname(request.nextUrl.pathname);
  if (!user && hasProtectedPathname) {
    const redirectUrl = createLoginUrl(request.nextUrl);
    return NextResponse.redirect(redirectUrl);
  }

  const hasGuestPathname = isGuestPathname(request.nextUrl.pathname);
  if (user && hasGuestPathname) {
    const redirectUrl = createRootUrl(request.nextUrl);
    return NextResponse.redirect(redirectUrl);
  }

  // IMPORTANT: You *must* return the supabaseResponse object as it is. If you're
  // creating a new response object with NextResponse.next() make sure to:
  // 1. Pass the request in it, like so:
  //    const myNewResponse = NextResponse.next({ request })
  // 2. Copy over the cookies, like so:
  //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
  // 3. Change the myNewResponse object to fit your needs, but avoid changing
  //    the cookies!
  // 4. Finally:
  //    return myNewResponse
  // If this is not done, you may be causing the browser and server to go out
  // of sync and terminate the user's session prematurely!

  return niSbResponse;
}

// 3. set Cache-Control header to prevent caching user session
const hcProxy = (response: NextResponse) => {
  response.headers.set('Cache-Control', 'no-store');
  return response;
}

// 1, 2, and 3
export async function proxy(request: NextRequest) {
  const niSbResponse = await niSbProxy(request, niProxy);

  const niSbHcResponse = hcProxy(niSbResponse);

  return niSbHcResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - supabase
     * - _next
     * - _vercel
     * - favicon.ico (favicon file)
     * - image with svg|png|jpg|jpeg|gif|webp extensions.
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!supabase|_next|_vercel|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ]
}