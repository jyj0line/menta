export type KeysFromObject<T extends Object> = keyof T;
export type ValuesFromObject<T extends Object> = T[keyof T];

export type ObjectOfOptionalStringArrayFromObject<T extends Object> = {
  [K in keyof T]?: string[];
};

export type DeepPartial<T> =
  T extends object
    ? { [K in keyof T]?: DeepPartial<T[K]> }
    : T;