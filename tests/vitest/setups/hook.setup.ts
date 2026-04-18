import { vi, beforeEach } from 'vitest';
import { cleanup } from '@testing-library/react';

beforeEach(() => {
  vi.resetAllMocks();
  cleanup();
})