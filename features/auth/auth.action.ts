'use server';

import { SupabaseAuthService } from '@/features/auth/auth.service';
import {
  type SignupUsecaseR, signupUsecase,
  type LoginUsecaseR, loginUsecase
} from '@/features/auth/auth.usecase';

import { createSupabaseServerClient } from '@/libs/supabase/server';

import { unexpectedER } from '@/results/errorR/unexpectedER.result';

import { logging } from '@/utils/loggings/logging';
import { NextjsCacheService } from '@/utils/services/common.service';

export type SignupActionState = SignupUsecaseR | undefined;
export const signupAction = async (
  next: string,
  prevState: SignupActionState, 
  formData: FormData
): Promise<SignupActionState> => {
  "use server";

  try {
    return await signupUsecase(
      formData,
      next,
      new SupabaseAuthService(createSupabaseServerClient),
      new NextjsCacheService()
    );
  } catch (error) {
    logging(error);
    return unexpectedER();
  }
}

export type LoginActionState = LoginUsecaseR | undefined;
export const loginAction = async (
  prevState: LoginActionState, 
  formData: FormData
): Promise<LoginActionState> => {
  "use server";

  try {
    return await loginUsecase(
      formData,
      new SupabaseAuthService(createSupabaseServerClient),
      new NextjsCacheService()
    );
  } catch (error) {
    logging(error);
    return unexpectedER();
  }
}