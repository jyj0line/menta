import { describe, it, expect } from 'vitest';

import en from '@/i18n/messages/en.json';
import ko from '@/i18n/messages/ko.json';

describe('Translation completeness', () => {
  const getKeys = (obj: any, prefix = ''): string[] => {
    return Object.keys(obj).flatMap(key => {
      const newPrefix = prefix ? `${prefix}.${key}` : key;
      return typeof obj[key] === 'object' 
        ? getKeys(obj[key], newPrefix) 
        : [newPrefix];
    });
  };

  it('has the same keys across all locales', () => {
    const enKeys = getKeys(en).sort();
    const koKeys = getKeys(ko).sort();

    expect(koKeys).toEqual(enKeys);
  });
});