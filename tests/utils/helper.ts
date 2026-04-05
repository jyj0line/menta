import { type SpKey } from "@/utils/constants/sp";
import { type ValuesFromObject } from "@/utils/types/util.type";

// tesult-
export const KEYS = {
  // tesult
  TYPE: 'type',

  // success tesult
  DATA: 'data',

  // error tesult
  UNKN: 'unkn'
} as const;
export type Key = ValuesFromObject<typeof KEYS>;

export const TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
} as const;
export type Type = ValuesFromObject<typeof TYPES>;

export type Tesult<T extends Type> = {
  readonly [KEYS.TYPE]: T;
}

export type SuccessT<D> = Tesult<typeof TYPES.SUCCESS> & {
  readonly [KEYS.DATA]: D;
}

export const successT = <D>(data: D): SuccessT<D> => {
  const result = {
    [KEYS.TYPE]: TYPES.SUCCESS,
    [KEYS.DATA]: data
  } satisfies SuccessT<D>;

  return Object.freeze(result);
}

export const isSuccessT = <D>(tesult: Tesult<Type>): tesult is SuccessT<D> => {
  return tesult[KEYS.TYPE] === TYPES.SUCCESS;
};

export function assertSuccessT<D>(tesult: Tesult<Type>): asserts tesult is SuccessT<D> {
  if (!isSuccessT(tesult)) throw new Error(`Expected successT, got error: ${JSON.stringify(tesult)}`);
}

export type ErrorT = Tesult<typeof TYPES.ERROR> & {
  readonly [KEYS.UNKN]: unknown;
}

export const errorT = (unkn: unknown): ErrorT => {
  const tesult = {
    [KEYS.TYPE]: TYPES.ERROR,
    [KEYS.UNKN]: unkn
  } satisfies ErrorT;
  return Object.freeze(tesult);
}

export const isErrorT = (tesult: Tesult<Type>): tesult is ErrorT => {
  return tesult[KEYS.TYPE] === TYPES.ERROR;
};

export function assertErrorT(tesult: Tesult<Type>): asserts tesult is ErrorT {
  if (!isErrorT(tesult)) throw new Error(`Expected errorT, got error: ${JSON.stringify(tesult)}`);
}
// -tesult

// assert-
export function assertDefined<T>(value: T | undefined): asserts value is T {
  if (value === undefined) {
    throw new Error(`Expected defined, got error: ${JSON.stringify(value)}`);
  }
}
// -assert

// route-
export const createSpedUrl = (url: string, sps: Record<SpKey, string>): string => {
  const newUrl = new URL(url);
  Object.entries(sps).forEach(([k, v]) => newUrl.searchParams.set(k, v));
  return newUrl.href;
};
// -route

// poll
const sleep = (ms: number) => {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}
type PollUntilOptions<S extends SuccessT<unknown>, E extends ErrorT> = {
  checkFnRet: (fnRet: S | E) => boolean;
  timeout: number;
  interval: number;
  fallback: E;
};
export const pollUntil = async<S extends SuccessT<unknown>, E extends ErrorT>(
  fn: () => Promise<S | E>,
  {
    checkFnRet,
    timeout,
    interval,
    fallback
  }: PollUntilOptions<S, E>
): Promise<S | E> => {
  const deadline = Date.now() + timeout;

  while (Date.now() < deadline) {
    const fnRet = await fn();

    if (checkFnRet(fnRet)) return fnRet;

    await sleep(interval);
  }

  return fallback;
}
// -poll