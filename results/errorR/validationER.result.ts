import * as z from 'zod';

import { KEYS, type Type, type Result } from "@/results/result";
import { ERROR_TYPES, type ErrorR, errorR, isErrorR } from "@/results/errorR/errorR.result";

import { type SuccessR, successR } from '@/results/successR/successR.result';

// result > error > validation

export type FieldErrorCodes<T extends Record<string, unknown>> = {
  [K in keyof T]?: string[];
};

export type ValidationER<T extends Record<string, unknown>> = ErrorR<typeof ERROR_TYPES.VALIDATION> & {
  readonly [KEYS.FIELD_ERROR_CODES]: FieldErrorCodes<T>;
};

export const validationER = <T extends Record<string, unknown>>(fieldErrors: FieldErrorCodes<T>): ValidationER<T> => {
  const result = {
    ...errorR(ERROR_TYPES.VALIDATION),
    [KEYS.FIELD_ERROR_CODES]: fieldErrors
  } satisfies ValidationER<T>;
  return Object.freeze(result);
};

export const isValidationER = <T extends Record<string, unknown>>(result: Result<Type>): result is ValidationER<T> => {
  return isErrorR(result)
    && result[KEYS.ERROR_TYPE] === ERROR_TYPES.VALIDATION;
};

export const validateFormData = <T extends Record<string, unknown>>(
  formData: FormData,
  schema: z.ZodType<T>
): SuccessR<T> | ValidationER<T> => {
  const data = Object.fromEntries(formData.entries());
  const parsedData = schema.safeParse(data);

  if (!parsedData.success) {
    return validationER(z.flattenError(parsedData.error).fieldErrors);
  }

  return successR(parsedData.data);
};