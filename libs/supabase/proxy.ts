import { type NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

import { sharedEnvs } from '@/getEnvs/getSharedEnvs';
import { type Database } from '@/libs/supabase/types/supabase.type';
import {
  isGuestPathname, isProtectedPathname,
  createLoginUrl, createRootUrl
} from '@/utils/helpers/route.helper';

export const updateSupabaseSessionProxy = async (
  request: NextRequest,
  response: NextResponse
) => {
  // With Fluid compute, don't put this client in a global environment variable.
  // Always create a new one on each request.
  const supabaseServerClient = createServerClient<Database>(
    sharedEnvs.NEXT_PUBLIC_SUPABASE_API_PROJECT_URL,
    sharedEnvs.NEXT_PUBLIC_SUPABASE_AK_PUBLISHABLE,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => 
            request.cookies.set({ name, value })
          )
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  );

  // Do not run code between createServerClient and supabase.auth.getClaims().
  // A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  // IMPORTANT: If you remove getClaims() and you use server-side rendering
  // with the Supabase client, your users may be randomly logged out.

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

  return response;
}