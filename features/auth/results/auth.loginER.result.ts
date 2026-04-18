import { KEYS, type Type, type Result } from "@/results/result";
import { ERROR_TYPES, type ErrorR, errorR, isErrorR } from "@/results/errorR/errorR.result";

import { SUPABASE_ERROR_CODES } from "@/libs/supabase/results/supabase.result";

import { type ValuesFromObject } from '@/utils/type';

// result > error > login

export const LOGIN_ERROR_CODES = {
  INVALID_CREDENTIALS: SUPABASE_ERROR_CODES.INVALID_CREDENTIALS
} as const;
export type LoginErrorCode = ValuesFromObject<typeof LOGIN_ERROR_CODES>;

export type LoginER = ErrorR<typeof ERROR_TYPES.LOGIN> & {
  readonly [KEYS.AUTH_ERROR_CODE]: LoginErrorCode
}

export const loginER = (authErrorCode: LoginErrorCode): LoginER => {
  const result = {
    ...errorR(ERROR_TYPES.LOGIN),
    [KEYS.AUTH_ERROR_CODE]: authErrorCode
  } satisfies LoginER;
  return Object.freeze(result);
}

export const isLoginER = (result: Result<Type>): result is LoginER => {
  return isErrorR(result) 
    && result[KEYS.ERROR_TYPE] === ERROR_TYPES.LOGIN;
}