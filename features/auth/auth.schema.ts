import * as z from 'zod';

import {
  FIELDS.EMAIL,
  FIELDS.PASSWORD, FIELDS.PASSWORD_CONFIRMATION
} from '@/features/auth/constants/auth.field';
import {
  EMAIL_ERROR_CODES,
  PASSWORD_ERROR_CODES,
  PASSWORD_CONFIRMAITON_ERROR_CODES
} from '@/features/auth/results/auth.validationER.result';
import { LENGTHS } from "@/features/auth/constants/auth.length";

// common schemas-
export const emailSchema = z.email({
  error: EMAIL_ERROR_CODES.INVALID_FORMAT
});
export type Email = z.infer<typeof emailSchema>;

export const passwordSchema = z.string()
  .min(LENGTHS.PASSWORD_MIN, { error: PASSWORD_ERROR_CODES.TOO_SHORT })
  .max(LENGTHS.PASSWORD_MAX, { error: PASSWORD_ERROR_CODES.TOO_LONG })
  .regex(/[a-z]/, { error: PASSWORD_ERROR_CODES.MISSING_LOWERCASE })
  .regex(/[A-Z]/, { error: PASSWORD_ERROR_CODES.MISSING_UPPERCASE })
  .regex(/[0-9]/, { error: PASSWORD_ERROR_CODES.MISSING_NUMBER })
  .regex(/[^a-zA-Z0-9]/, { error: PASSWORD_ERROR_CODES.MISSING_SPECIAL_CHAR })
;
export type Password = z.infer<typeof passwordSchema>;
// -common schemas



// composed schemas-
export const signupFormDataSchema = z.object({
  [FIELDS.EMAIL]: emailSchema,
  [FIELDS.PASSWORD]: passwordSchema,
  [FIELDS.PASSWORD_CONFIRMATION]: z.string()
})
.refine((data) => {
  return data[FIELDS.PASSWORD] === data[FIELDS.PASSWORD_CONFIRMATION];
}, {
  error: PASSWORD_CONFIRMAITON_ERROR_CODES.MISMATCH,
  path: [FIELDS.PASSWORD_CONFIRMATION]
});
export type SignupFormData = z.infer<typeof signupFormDataSchema>;

export const loginFormDataSchema = z.object({
  [FIELDS.EMAIL]: emailSchema,
  [FIELDS.PASSWORD]: passwordSchema
})
export type LoginFormData = z.infer<typeof loginFormDataSchema>;
// -composed schemas