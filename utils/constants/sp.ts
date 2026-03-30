import { ValuesFromObject } from "@/utils/types/util.type";

export const SP_KEYS = {
    NEXT: 'next'
} as const;
export type SpKeys = typeof SP_KEYS;
export type SpKey = ValuesFromObject<SpKeys>;

export type Sps = Record<string, string | string[] | undefined>;