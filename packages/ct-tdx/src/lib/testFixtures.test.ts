import { describe, expect, it } from 'vitest';
import {
  createMockFetchResponse,
  mockGlobalFetch,
  mockKbData,
  mockTdxConfig,
  mockTicketData,
  setupCustomMatchers,
  toBeErrorResponse,
} from './testFixtures.js';

describe('testFixtures', () => {
  describe('mockTicketData', () => {
    it('exports mock ticket data with expected properties', () => {
      expect(mockTicketData).toHaveProperty('ID', 123456);
      expect(mockTicketData).toHaveProperty('Title', 'Test Ticket');
      expect(mockTicketData).toHaveProperty('TypeName', 'Service Request');
    });
  });

  describe('mockKbData', () => {
    it('exports mock KB article data with expected properties', () => {
      expect(mockKbData).toHaveProperty('ID', 789);
      expect(mockKbData).toHaveProperty('Subject', 'Test KB Article');
      expect(mockKbData).toHaveProperty('IsPublic', true);
    });
  });

  describe('mockTdxConfig', () => {
    it('exports mock TDX config with expected properties', () => {
      expect(mockTdxConfig).toHaveProperty('username', 'testuser');
      expect(mockTdxConfig).toHaveProperty('apiBaseUrl');
      expect(mockTdxConfig.apiBaseUrl).toContain('TDWebApi/api');
    });
  });

  describe('createMockFetchResponse', () => {
    it('creates a successful JSON response by default', async () => {
      const response = createMockFetchResponse({ data: 'test' });
      expect(response.ok).toBe(true);
      expect(response.status).toBe(200);
      expect(response.statusText).toBe('OK');
      expect(await response.json()).toEqual({ data: 'test' });
    });

    it('creates a text response when data is a string', async () => {
      const response = createMockFetchResponse('plain text', {
        contentType: 'text/plain',
      });
      expect(await response.text()).toBe('plain text');
      expect(response.headers.get('content-type')).toBe('text/plain');
    });

    it('creates an error response when ok is false', async () => {
      const response = createMockFetchResponse('error message', {
        ok: false,
        status: 404,
      });
      expect(response.ok).toBe(false);
      expect(response.status).toBe(404);
      expect(response.statusText).toBe('Bad Request');
    });

    it('defaults to status 400 when ok is false without explicit status', async () => {
      const response = createMockFetchResponse('error', { ok: false });
      expect(response.ok).toBe(false);
      expect(response.status).toBe(400);
    });

    it('returns null for non-content-type headers', () => {
      const response = createMockFetchResponse({ data: 'test' });
      expect(response.headers.get('authorization')).toBeNull();
      expect(response.headers.get('x-custom-header')).toBeNull();
      expect(response.headers.get('accept')).toBeNull();
    });

    it('handles mixed case header names', () => {
      const response = createMockFetchResponse('test', {
        contentType: 'application/xml',
      });
      expect(response.headers.get('Content-Type')).toBe('application/xml');
      expect(response.headers.get('CONTENT-TYPE')).toBe('application/xml');
      expect(response.headers.get('content-type')).toBe('application/xml');
    });

    it('json() parses string data correctly', async () => {
      const jsonString = '{"key":"value","num":42}';
      const response = createMockFetchResponse(jsonString);
      const parsed = await response.json();
      expect(parsed).toEqual({ key: 'value', num: 42 });
    });

    it('json() returns object data directly', async () => {
      const objData = { key: 'value', num: 42 };
      const response = createMockFetchResponse(objData);
      const result = await response.json();
      expect(result).toEqual(objData);
    });
  });

  describe('mockGlobalFetch', () => {
    it('sets global fetch and returns mock function', () => {
      const mockFetch = mockGlobalFetch({ data: 'test' });
      expect(mockFetch).toBeDefined();
      expect(typeof mockFetch).toBe('function');
      expect(globalThis.fetch).toBe(mockFetch);
    });

    it('creates mock with specified options', async () => {
      const mockFetch = mockGlobalFetch('error', {
        ok: false,
        status: 500,
        contentType: 'text/plain',
      });
      const response = await mockFetch();
      expect(response.ok).toBe(false);
      expect(response.status).toBe(500);
    });
  });

  describe('toBeErrorResponse', () => {
    it('passes when value is an error response object', () => {
      const result = toBeErrorResponse({ error: 'Something went wrong' });
      expect(result.pass).toBe(true);
    });

    it('fails when value is not an error response', () => {
      const result = toBeErrorResponse({ success: true });
      expect(result.pass).toBe(false);
    });

    it('fails when error property is not a string', () => {
      const result = toBeErrorResponse({ error: 123 });
      expect(result.pass).toBe(false);
    });

    it('fails when value is null', () => {
      const result = toBeErrorResponse(null);
      expect(result.pass).toBe(false);
    });

    it('generates correct message for passing assertions', () => {
      const result = toBeErrorResponse({ error: 'test error' });
      const message = result.message();
      expect(message).toContain('not ');
      expect(message).toContain('be an error response');
    });

    it('generates correct message for failing assertions', () => {
      const result = toBeErrorResponse({ success: true });
      const message = result.message();
      expect(message).not.toContain('not ');
      expect(message).toContain('be an error response');
    });
  });

  describe('setupCustomMatchers', () => {
    it('extends expect with custom matchers', () => {
      setupCustomMatchers();
      // After setup, we should be able to use the custom matcher
      expect({ error: 'test' }).toBeErrorResponse();
    });

    it('custom matcher works correctly after setup', () => {
      setupCustomMatchers();
      expect(() => {
        expect({ success: true }).toBeErrorResponse();
      }).toThrow();
    });
  });
});
