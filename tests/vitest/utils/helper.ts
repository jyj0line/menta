import { expect } from "vitest";
import * as z from 'zod';

export function assertSafeParseSuccess<T>(
  result: z.ZodSafeParseResult<T>
): asserts result is z.ZodSafeParseSuccess<T> {
  expect(result.success).toBe(true);
  if (!result.success) {
    throw new Error(`Parse failed: ${result.error.message}`);
  }
}

export function assertSafeParseError<T>(
  result: z.ZodSafeParseResult<T>
): asserts result is z.ZodSafeParseError<T> {
  expect(result.success).toBe(false);
  if (result.success) {
    throw new Error(`Parse succeeded unexpectedly: ${JSON.stringify(result.data)}`);
  }
}