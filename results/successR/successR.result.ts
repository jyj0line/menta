import { KEYS, TYPES, type Type, type Result } from "@/results/result.result";

// result > success

export type SuccessR<D> = Result<typeof TYPES.SUCCESS> & {
  readonly [KEYS.DATA]: D;
}

export const successR = <D>(data: D): SuccessR<D> => {
  const result = {
    [KEYS.TYPE]: TYPES.SUCCESS,
    [KEYS.DATA]: data
  } satisfies SuccessR<D>;

  return Object.freeze(result);
}

export const isSuccessR = <D>(result: Result<Type>): result is SuccessR<D> => {
  return result[KEYS.TYPE] === TYPES.SUCCESS;
};