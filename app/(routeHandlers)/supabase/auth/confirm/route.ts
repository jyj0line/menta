import { type NextRequest } from 'next/server';
import { type EmailOtpType as SupabaseEmailOtpType } from '@supabase/supabase-js';
import * as z from 'zod';

import { createSupabaseServerClient } from '@/libs/supabase/server';
import { PUBLIC_ROUTES, DEFAULT_PUBLIC_ROUTES } from '@/utils/constants/routes/public.route';
import { SP_KEYS } from '@/utils/constants/sp';
import { getSafePathname } from '@/utils/helpers/route.helper';
import { logging } from '@/utils/loggings/logging';
import { NextjsRedirectService } from '@/utils/services/common.service';

const emailOtpTypeSchema = z.enum(['signup', 'invite', 'magiclink', 'recovery', 'email_change', 'email']);

export async function GET(request: NextRequest) {
  const redirectService = new NextjsRedirectService();

  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get('token_hash');
  const type = searchParams.get('type');
  const next = getSafePathname(searchParams.get(SP_KEYS.NEXT) ?? DEFAULT_PUBLIC_ROUTES.NEXT);

  const parsedTypeRes = emailOtpTypeSchema.safeParse(type);
  if (parsedTypeRes.success && token_hash) {
    const supabaseServerClient = await createSupabaseServerClient();
    const parsedType: SupabaseEmailOtpType = parsedTypeRes.data;
    
    const { error } = await supabaseServerClient.auth.verifyOtp({
      type: parsedType,
      token_hash,
    });
    if (error) {
      logging(error);
      redirectService.redirect(PUBLIC_ROUTES.ERROR);
    }
  }

  redirectService.redirect(next);
}