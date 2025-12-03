import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  getAuthToken,
  getCloudTeamTicketDefaults,
  makeApiCall,
  tdxApiUriToAppUrl,
} from './index.js';

import {
  createMockFetchResponse,
  mockGlobalFetch,
} from './lib/testFixtures.js';

describe('TDX utils', () => {
  const ORIGINAL_TLS = process.env.NODE_TLS_REJECT_UNAUTHORIZED;
  beforeEach(() => {
    vi.restoreAllMocks();
  });
  afterEach(() => {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = ORIGINAL_TLS;
  });

  it('getAuthToken returns token when fetch ok', async () => {
    const mockFetch = mockGlobalFetch('SOMETOKEN', {
      contentType: 'text/plain',
    });

    const token = await getAuthToken({
      username: 'u',
      password: 'p',
      apiBaseUrl: 'https://api.test/TDWebApi/api',
      userAgent: 'UA',
    });

    expect(token).toBe('SOMETOKEN');
    expect(mockFetch).toHaveBeenCalled();
    const calledUrl = mockFetch.mock.calls[0]?.[0] as string;
    expect(calledUrl).toContain('/auth/login');
  });

  it('getAuthToken throws on non-ok', async () => {
    mockGlobalFetch('err', {
      ok: false,
      status: 500,
      contentType: 'text/plain',
    });

    await expect(
      getAuthToken({ username: 'u', password: 'p', apiBaseUrl: 'https://x' })
    ).rejects.toThrow(/HTTP error/);
  });

  it('makeApiCall handles JSON and text responses, and sets headers/body correctly', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        createMockFetchResponse(
          { hello: 'json' },
          { contentType: 'application/json; charset=utf-8' }
        )
      )
      .mockResolvedValueOnce(
        createMockFetchResponse('plain', { contentType: 'text/plain' })
      )
      .mockResolvedValueOnce(
        createMockFetchResponse('no', { ok: false, status: 404 })
      );

    (globalThis as unknown as { fetch?: unknown }).fetch = fetchMock;

    // JSON GET
    const j = await makeApiCall({
      apiBaseUrl: 'https://api',
      endpointPath: '/1/x',
      authToken: 'T',
      requestMethod: 'GET',
    });
    expect(j).toEqual({ hello: 'json' });

    // text GET
    const t = await makeApiCall({
      apiBaseUrl: 'https://api',
      endpointPath: '/1/y',
      authToken: 'T',
      requestMethod: 'GET',
    });
    expect(t).toBe('plain');

    // non-ok throws
    await expect(
      makeApiCall({
        apiBaseUrl: 'https://api',
        endpointPath: '/1/z',
        authToken: 'T',
        requestMethod: 'GET',
      })
    ).rejects.toThrow(/HTTP error/);
  });

  it('makeApiCall sets Content-Type and string bodies correctly', async () => {
    const fetchMock = mockGlobalFetch({});

    // object body -> content-type set and stringified
    await makeApiCall({
      apiBaseUrl: 'https://api',
      endpointPath: '/p',
      authToken: 'T',
      requestMethod: 'POST',
      requestBody: { a: 1 },
    });
    const initObj = fetchMock.mock.calls[0]?.[1] as RequestInit;
    expect(initObj?.method).toBe('POST');
    expect((initObj?.headers as Headers)?.get('Content-Type')).toMatch(
      /application\/json/
    );
    expect(initObj?.body).toBe(JSON.stringify({ a: 1 }));

    // string body -> raw string, no additional content-type set by function
    await makeApiCall({
      apiBaseUrl: 'https://api',
      endpointPath: '/q',
      authToken: 'T',
      requestMethod: 'PUT',
      requestBody: 'raw-string',
    });
    const initObj2 = fetchMock.mock.calls[1]?.[1] as RequestInit;
    expect(initObj2?.body).toBe('raw-string');
  });

  it('makeApiCall respects ignoreSslErrors and restores env', async () => {
    mockGlobalFetch('ok', { contentType: 'text/plain' });

    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '1';
    await makeApiCall({
      apiBaseUrl: 'https://api',
      endpointPath: '/ssl',
      authToken: 'T',
      ignoreSslErrors: true,
    });
    expect(process.env.NODE_TLS_REJECT_UNAUTHORIZED).toBe('1');
  });

  it('makeApiCall clears NODE_TLS_REJECT_UNAUTHORIZED when it was undefined before', async () => {
    mockGlobalFetch('ok', { contentType: 'text/plain' });

    // ensure it's undefined
    delete process.env.NODE_TLS_REJECT_UNAUTHORIZED;
    await makeApiCall({
      apiBaseUrl: 'https://api',
      endpointPath: '/ssl',
      authToken: 'T',
      ignoreSslErrors: true,
    });
    expect(process.env.NODE_TLS_REJECT_UNAUTHORIZED).toBeUndefined();
  });

  // Ensure we exercise the nullish fallback path where response.headers.get
  // returns undefined. This hits the `?? ''` on line 123 in `utils.ts` and
  // verifies the non-JSON path is used when Content-Type is missing.
  it('makeApiCall handles undefined content-type header (nullish fallback)', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      headers: { get: () => undefined },
      text: async () => 'no-content-type',
    });
    (globalThis as unknown as { fetch?: unknown }).fetch = mockFetch;

    const res = await makeApiCall({
      apiBaseUrl: 'https://api',
      endpointPath: '/nocontent',
      authToken: 'T',
      requestMethod: 'GET',
    });
    expect(res).toBe('no-content-type');
  });

  it('tdxApiUriToAppUrl maps ticket and kb URIs and returns empty for others', () => {
    const ticket = 'api/99/tickets/123';
    const kb = 'api/98/knowledgebase/456';
    const other = 'api/x/unknown/1';

    const tUrl = tdxApiUriToAppUrl({
      uri: ticket,
      appBaseUrl: 'https://app/TDNext/Apps',
    });
    expect(tUrl).toContain('TicketID=123');

    const kbUrl = tdxApiUriToAppUrl({
      uri: kb,
      appBaseUrl: 'https://app/TDNext/Apps',
    });
    expect(kbUrl).toContain('Portal/KB/ArticleDet');

    const none = tdxApiUriToAppUrl({ uri: other, appBaseUrl: 'https://app' });
    expect(none).toBe('');
  });

  it('getCloudTeamTicketDefaults fetches and returns defaults', async () => {
    const defaults = {
      TypeID: 1,
      Title: 't',
      TypeCategoryID: 2,
      AccountID: 1,
      StatusID: 1,
      PriorityID: 1,
      Classification: 1,
      ResponsibleGroupID: 1,
      ServiceID: 1,
      ServiceCategoryID: 1,
      ServiceOfferingID: 1,
      SourceID: 1,
      Description: 'd',
    };
    (globalThis as unknown as { fetch?: unknown }).fetch = vi
      .fn()
      .mockResolvedValue({
        ok: true,
        json: async () => defaults,
      });
    const res = await getCloudTeamTicketDefaults('https://example/defaults');
    expect(res).toEqual(defaults);
  });
});
