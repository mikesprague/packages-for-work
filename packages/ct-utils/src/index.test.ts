import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Hoist the mock function so it can be used both in the mock and in tests
const mockWriteFileSync = vi.hoisted(() => vi.fn());

// Mock the node:fs module with a cleaner approach
vi.mock('node:fs', () => ({
  default: {
    writeFileSync: mockWriteFileSync,
  },
}));

import { writeDataAsJsonFile } from './index.js';

describe('General Utils', () => {
  beforeEach(() => {
    mockWriteFileSync.mockClear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('writeDataAsJsonFile', () => {
    it('writes JSON to disk with 2-space indentation and utf-8', async () => {
      const data = { a: 1, b: 'two' };
      await writeDataAsJsonFile({ data, fileName: '/tmp/test.json' });

      expect(mockWriteFileSync).toHaveBeenCalledTimes(1);
      const [filename, content, encoding] =
        mockWriteFileSync.mock.calls[0] ?? [];

      expect(filename).toBe('/tmp/test.json');
      expect(encoding).toBe('utf-8');
      // Should be pretty-printed with 2 spaces
      expect(content).toBe(JSON.stringify(data, null, 2));
    });

    it('handles write failures', async () => {
      const error = new Error('Permission denied');
      mockWriteFileSync.mockImplementation(() => {
        throw error;
      });

      const data = { test: 'data' };

      await expect(
        writeDataAsJsonFile({ data, fileName: '/tmp/readonly.json' })
      ).rejects.toThrow('Permission denied');
    });
  });
});
