export type KeysFromObject<T extends object> = keyof T;
export type ValuesFromObject<T extends object> = T[keyof T];

export type ObjectOfOptionalStringArrayFromObject<T extends object> = {
  [K in keyof T]?: string[];
};

export type DeepPartial<T> =
  T extends object
    ? { [K in keyof T]?: DeepPartial<T[K]> }
    : T;