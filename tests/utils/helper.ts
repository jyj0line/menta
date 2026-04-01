import { type SpKey } from "@/utils/constants/sp";

// assert-
export function assertNotNull<T>(value: T | null, message: string): asserts value is T {
  if (value === null) throw new Error(message);
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
type PollUntilOptions<T, F extends T> = {
  checkFnRet: (fnRet: T) => boolean;
  timeout: number;
  interval: number;
  fallback: F;
};
export const pollUntil = async<T, F extends T>(
  fn: () => Promise<T>,
  {
    checkFnRet,
    timeout,
    interval,
    fallback
  }: PollUntilOptions<T, F>
): Promise<T | F> => {
  const deadline = Date.now() + timeout;

  while (Date.now() < deadline) {
    const fnRet = await fn();

    if (checkFnRet(fnRet)) return fnRet;

    await sleep(interval);
  }

  return fallback;
}
// -poll