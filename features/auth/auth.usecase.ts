import {
  signupFormDataSchema, type SignupFormData,
  loginFormDataSchema
} from '@/features/auth/auth.schema';
import { type AuthService, type SignupServiceR, type LoginServiceR } from '@/features/auth/auth.service';
import { loginER, LOGIN_ERROR_CODES } from '@/features/auth/results/auth.loginER.result';

import { isSuccessR } from '@/results/successR/successR.result';
import { type ValidationER, validateFormData } from '@/results/errorR/validationER.result';

import { CacheService } from '@/utils/services/common.service';

export type SignupUsecaseR =
  | ValidationER<SignupFormData>
  | SignupServiceR
;
export const signupUsecase = async (
  formData: FormData,
  next: string,
  authService: AuthService,
  cacheService: CacheService
): Promise<SignupUsecaseR> => {
  const validateSignUpFormDataR = validateFormData(formData, signupFormDataSchema);
  if (!isSuccessR(validateSignUpFormDataR)) {
    return validateSignUpFormDataR;
  }

  const signupServiceR = await authService.signup(
    validateSignUpFormDataR.data.email,
    validateSignUpFormDataR.data.password,
    next
  );

  if (!isSuccessR(signupServiceR)) {
    return signupServiceR;
  }

  cacheService.revalidatePathname('/', 'layout');

  return signupServiceR;
}

export type LoginUsecaseR = LoginServiceR;
export const loginUsecase = async (
  formData: FormData,
  authService: AuthService,
  cacheService: CacheService,
): Promise<LoginUsecaseR> => {
  const validateLoginFormDataR = validateFormData(formData, loginFormDataSchema);
  if (!isSuccessR(validateLoginFormDataR)) {
    return loginER(LOGIN_ERROR_CODES.INVALID_CREDENTIALS);
  }

  const loginServiceR = await authService.login(
    validateLoginFormDataR.data.email,
    validateLoginFormDataR.data.password
  );

  if (!isSuccessR(loginServiceR)) {
    return loginServiceR;
  }

  cacheService.revalidatePathname('/', 'layout');

  return loginServiceR;
}