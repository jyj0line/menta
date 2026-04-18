import { type ValuesFromObject } from "@/utils/type";

// result > error > validation

export const EMAIL_ERROR_CODES = {
  INVALID_FORMAT: 'invalid_format'
} as const;
export type EmailErrorCode = ValuesFromObject<typeof EMAIL_ERROR_CODES>;

export const PASSWORD_ERROR_CODES = {
    TOO_SHORT: 'too_short',
    TOO_LONG: 'too_long',
    MISSING_LOWERCASE: 'missing_lowercase',
    MISSING_UPPERCASE: 'missing_uppercase',
    MISSING_NUMBER: 'missing_number',
    MISSING_SPECIAL_CHAR: 'missing_special_char',
} as const;
export type PasswordErrorCode = ValuesFromObject<typeof PASSWORD_ERROR_CODES>;

export const PASSWORD_CONFIRMAITON_ERROR_CODES = {
    MISMATCH: 'mismatch',
} as const;
export type PasswordConfirmationErrorCode = ValuesFromObject<typeof PASSWORD_CONFIRMAITON_ERROR_CODES>;