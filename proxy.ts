import { type NextRequest } from 'next/server';
import createMiddleware from 'next-intl/middleware';

import { routingConfig } from '@/i18n/routing.cnfg';
import { updateSupabaseSessionProxy } from '@/libs/supabase/sessionProxy';

const nextintlProxy = createMiddleware(routingConfig);

export async function proxy(request: NextRequest) {
  const response = nextintlProxy(request);

  return await updateSupabaseSessionProxy(request, response);
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