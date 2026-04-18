import { isAuthApiError } from '@supabase/supabase-js';

import { LOGIN_ERROR_CODES, type LoginER, loginER } from '@/features/auth/results/auth.loginER.result';
import { FIELDS } from '@/features/auth/constants/auth.field';

import { createSupabaseServerClient as importedCreateSupabaseServerClient} from '@/libs/supabase/serverClient';
import { SUPABASE_ERROR_CODES } from '@/libs/supabase/results/supabase.result';

import { type SuccessR, successR } from '@/results/successR/successR.result';
import { type UnexpectedER, unexpectedER } from '@/results/errorR/unexpectedER.result';

import { ORIGINS } from '@/utils/constants/routes/public.route';
import { getSafePathname } from '@/utils/helper.route';
import { logging } from '@/utils/logging';

export type SignupServiceR = 
  SuccessR<Record<typeof FIELDS.EMAIL, string>>
  | UnexpectedER
;
export type LoginServiceR = 
  SuccessR<true>
  | LoginER
  | UnexpectedER
;
export interface AuthService {
  signup(email: string, password: string, emailRedirectTo: string): Promise<SignupServiceR>;
  login(email: string, password: string): Promise<LoginServiceR>;
}

export class SupabaseAuthService implements AuthService {
  constructor(
    private createSupabaseServerClient: typeof importedCreateSupabaseServerClient
  ) {}

  async signup(email: string, password: string, emailRedirectTo: string) {
    const serverClient = await this.createSupabaseServerClient();
    const { data, error } = await serverClient.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${ORIGINS.NEXTJS}${getSafePathname(emailRedirectTo)}`
      }
    });

    if (data) return successR({ [FIELDS.EMAIL]: email });

    logging(error);
    return unexpectedER();
  }

  async login(email: string, password: string) {
    const serverClient = await this.createSupabaseServerClient();
    const { data, error } = await serverClient.auth.signInWithPassword({ email, password });

    if (data) return successR(true as const);

    if (isAuthApiError(error) && error.code === SUPABASE_ERROR_CODES.INVALID_CREDENTIALS) {
      return loginER(LOGIN_ERROR_CODES.INVALID_CREDENTIALS);
    }

    logging(error);
    return unexpectedER();
  }
}