import * as z from 'zod';

import {
  EMAIL_FIELD,
  PASSWORD_FIELD, PASSWORD_CONFIRMATION_FIELD
} from '@/features/auth/constants/auth.field';
import {
  EMAIL_ERROR_CODES,
  PASSWORD_ERROR_CODES,
  PASSWORD_CONFIRMAITON_ERROR_CODES
} from '@/features/auth/results/auth.validationER.result';
import { PASSWORD_MIN_LENGTH, PASSWORD_MAX_LENGTH } from "@/features/auth/constants/auth.length";

// common schemas-
export const emailSchema = z.email({
  error: EMAIL_ERROR_CODES.INVALID_FORMAT
});
export type Email = z.infer<typeof emailSchema>;

export const passwordSchema = z.string()
  .min(PASSWORD_MIN_LENGTH, { error: PASSWORD_ERROR_CODES.TOO_SHORT })
  .max(PASSWORD_MAX_LENGTH, { error: PASSWORD_ERROR_CODES.TOO_LONG })
  .regex(/[a-z]/, { error: PASSWORD_ERROR_CODES.MISSING_LOWERCASE })
  .regex(/[A-Z]/, { error: PASSWORD_ERROR_CODES.MISSING_UPPERCASE })
  .regex(/[0-9]/, { error: PASSWORD_ERROR_CODES.MISSING_NUMBER })
  .regex(/[^a-zA-Z0-9]/, { error: PASSWORD_ERROR_CODES.MISSING_SPECIAL_CHAR })
;
export type Password = z.infer<typeof passwordSchema>;
// -common schemas



// composed schemas-
export const signupFormDataSchema = z.object({
  [EMAIL_FIELD]: emailSchema,
  [PASSWORD_FIELD]: passwordSchema,
  [PASSWORD_CONFIRMATION_FIELD]: z.string()
})
.refine((data) => {
  return data[PASSWORD_FIELD] === data[PASSWORD_CONFIRMATION_FIELD];
}, {
  error: PASSWORD_CONFIRMAITON_ERROR_CODES.MISMATCH,
  path: [PASSWORD_CONFIRMATION_FIELD]
});
export type SignupFormData = z.infer<typeof signupFormDataSchema>;

export const loginFormDataSchema = z.object({
  [EMAIL_FIELD]: emailSchema,
  [PASSWORD_FIELD]: passwordSchema
})
export type LoginFormData = z.infer<typeof loginFormDataSchema>;
// -composed schemas