import { KEYS, type Type, type Result } from "@/results/result.result";
import { ERROR_TYPES, type ErrorR, errorR, isErrorR } from "@/results/errorR/errorR.result";

// result > error > unexpected

export type UnexpectedER = ErrorR<typeof ERROR_TYPES.UNEXPECTED> & {
};

export const unexpectedER = (): UnexpectedER => {
  const result = {
    ...errorR(ERROR_TYPES.UNEXPECTED),
  } satisfies UnexpectedER;
  return Object.freeze(result);
}

export const isUnexpectedER = (result: Result<Type>): result is UnexpectedER => {
  return isErrorR(result) 
    && result[KEYS.ERROR_TYPE] === ERROR_TYPES.UNEXPECTED;
}