import { KEYS, TYPES, type Type, type Result } from "@/results/result";

import { type ValuesFromObject } from "@/utils/type";

// result > error
// error result is a base type(does not create object.)

export const ERROR_TYPES = {
  VALIDATION: 'validation',
  LOGIN: 'login',
  UNEXPECTED: 'unexpected',
} as const;
export type ErrorType = ValuesFromObject<typeof ERROR_TYPES>;

export type ErrorR<E extends ErrorType> = Result<typeof TYPES.ERROR> & {
  readonly [KEYS.ERROR_TYPE]: E;
}

export const errorR = <E extends ErrorType>(errorType: E): ErrorR<E> => {
  const result = {
    [KEYS.TYPE]: TYPES.ERROR,
    [KEYS.ERROR_TYPE]: errorType
  } satisfies ErrorR<E>;
  return Object.freeze(result);
}

export const isErrorR = <E extends ErrorType>(result: Result<Type>): result is ErrorR<E> => {
  return result[KEYS.TYPE] === TYPES.ERROR;
};