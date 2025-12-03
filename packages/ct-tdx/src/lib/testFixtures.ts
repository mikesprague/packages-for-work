import { expect, vi } from 'vitest';

/**
 * Mock ticket data for testing
 */
export const mockTicketData = {
  ID: 123456,
  Title: 'Test Ticket',
  TypeName: 'Service Request',
  StatusName: 'Open',
  Description: 'Test ticket description',
  RequestorName: 'Test User',
  CreatedDate: '2025-01-01T00:00:00Z',
};

/**
 * Mock KB article data for testing
 */
export const mockKbData = {
  ID: 789,
  Subject: 'Test KB Article',
  Body: 'Test KB content body',
  CategoryName: 'Test Category',
  IsPublic: true,
  CreatedDate: '2025-01-01T00:00:00Z',
};

/**
 * Creates a mock fetch response
 */
export const createMockFetchResponse = (
  data: unknown,
  options: {
    ok?: boolean;
    status?: number;
    contentType?: string;
  } = {}
) => {
  const {
    ok = true,
    status = ok ? 200 : 400,
    contentType = 'application/json',
  } = options;

  const body = typeof data === 'string' ? data : JSON.stringify(data);

  return {
    ok,
    status,
    statusText: ok ? 'OK' : 'Bad Request',
    headers: {
      get: (name: string) => {
        if (name.toLowerCase() === 'content-type') {
          return contentType;
        }
        return null;
      },
    },
    text: async () => body,
    json: async () => (typeof data === 'string' ? JSON.parse(data) : data),
  };
};

/**
 * Helper to mock global fetch and automatically clean up
 * Returns the mock function for assertions
 */
export const mockGlobalFetch = (
  response: unknown,
  options?: {
    ok?: boolean;
    status?: number;
    contentType?: string;
  }
) => {
  const mockFetch = vi
    .fn()
    .mockResolvedValue(createMockFetchResponse(response, options));
  (globalThis as unknown as { fetch?: unknown }).fetch = mockFetch;
  return mockFetch;
};

/**
 * Standard TDX API config for testing
 */
export const mockTdxConfig = {
  username: 'testuser',
  password: 'testpass',
  apiBaseUrl: 'https://api.test.example.com/TDWebApi/api',
  userAgent: 'TestAgent/1.0',
};

/**
 * Custom matcher to check if a value is an error response object
 */
export const toBeErrorResponse = (received: unknown) => {
  const isErrorResponse =
    typeof received === 'object' &&
    received !== null &&
    'error' in received &&
    typeof (received as { error: unknown }).error === 'string';

  return {
    pass: isErrorResponse,
    message: () =>
      `expected ${JSON.stringify(received)} to ${isErrorResponse ? 'not ' : ''}be an error response with an error property`,
  };
};

/**
 * Extends Vitest's expect with custom matchers
 */
export const setupCustomMatchers = () => {
  expect.extend({
    toBeErrorResponse,
  });
};

// Extend Vitest's Assertion interface for TypeScript
declare module 'vitest' {
  // biome-ignore lint/suspicious/noExplicitAny: Required for Vitest matcher extension
  interface Assertion<T = any> {
    toBeErrorResponse(): T;
  }
  interface AsymmetricMatchersContaining {
    toBeErrorResponse(): unknown;
  }
}
