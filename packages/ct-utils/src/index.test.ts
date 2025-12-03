import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Hoist the mock functions so they can be used both in the mock and in tests
const mockWriteFileSync = vi.hoisted(() => vi.fn());
const mockMkdirSync = vi.hoisted(() => vi.fn());

// Mock the node:fs module
vi.mock('node:fs', () => ({
  default: {
    writeFileSync: mockWriteFileSync,
    mkdirSync: mockMkdirSync,
  },
}));

import { writeDataAsJsonFile } from './index.js';

describe('General Utils', () => {
  beforeEach(() => {
    mockWriteFileSync.mockClear();
    mockMkdirSync.mockClear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('writeDataAsJsonFile', () => {
    it('writes JSON to disk with 2-space indentation and utf-8', async () => {
      const data = { a: 1, b: 'two' };
      const result = await writeDataAsJsonFile({
        data,
        fileName: '/tmp/test.json',
      });

      expect(result).toBe(true);
      expect(mockMkdirSync).toHaveBeenCalledTimes(1);
      expect(mockWriteFileSync).toHaveBeenCalledTimes(1);
      const [filename, content, encoding] =
        mockWriteFileSync.mock.calls[0] ?? [];

      expect(filename).toBe('/tmp/test.json');
      expect(encoding).toBe('utf-8');
      // Should be pretty-printed with 2 spaces
      expect(content).toBe(JSON.stringify(data, null, 2));
    });

    it('returns false on write failures', async () => {
      const error = new Error('Permission denied');
      mockWriteFileSync.mockImplementation(() => {
        throw error;
      });

      const consoleSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});
      const data = { test: 'data' };

      const result = await writeDataAsJsonFile({
        data,
        fileName: '/tmp/readonly.json',
      });

      expect(result).toBe(false);
      expect(consoleSpy).toHaveBeenCalledWith(
        'Error writing JSON file to /tmp/readonly.json:',
        error
      );
      consoleSpy.mockRestore();
    });
  });
});
