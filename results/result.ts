import { type ValuesFromObject } from "@/utils/type";

// result
// result is a base type(does not create object.)

export const KEYS = {
  // result
  TYPE: 'type',

  // success result
  DATA: 'data',

  // error result
  ERROR_TYPE: 'errorType',

  // validation error result
  FIELD_ERROR_CODES: 'fieldErrorCodes',

  // sign up, login error result
  AUTH_ERROR_CODE: 'authErrorCode',
} as const;
export type Key = ValuesFromObject<typeof KEYS>;

export const TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
} as const;
export type Type = ValuesFromObject<typeof TYPES>;

export type Result<T extends Type> = {
  readonly [KEYS.TYPE]: T;
}