/**
 * Tests for ticket-related functions (getTicket, searchTickets, createTicket).
 * These tests mock the global fetch to avoid actual network calls.
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  createTicket,
  getCloudTeamTicketDefaults,
  getTicket,
  searchTickets,
} from './index.js';

import { createMockFetchResponse } from './lib/testFixtures.js';

describe('TDX ticket module', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('getTicket calls makeApiCall and returns ticket', async () => {
    const mockTicket = { ID: 5, Title: 'Test Ticket' };
    (globalThis as unknown as { fetch?: unknown }).fetch = vi
      .fn()
      .mockResolvedValue(
        createMockFetchResponse(mockTicket, {
          contentType: 'application/json',
        })
      );

    const t = await getTicket({
      ticketId: 5,
      authToken: 'T',
      apiBaseUrl: 'https://api.test.com/TDWebApi/api',
      appId: 99,
    });

    expect(t).toEqual(mockTicket);
    const fetchMock = globalThis.fetch as ReturnType<typeof vi.fn>;
    expect(fetchMock).toHaveBeenCalled();
    const calledUrl = fetchMock.mock.calls[0]?.[0] as string;
    expect(calledUrl).toContain('/99/tickets/5');
  });

  it('searchTickets returns mapped results with Uri', async () => {
    const apiResults = [
      { ID: 1, Title: 'Ticket 1', Uri: 'api/99/tickets/1' },
      { ID: 2, Title: 'Ticket 2', Uri: 'api/99/tickets/2' },
    ];
    (globalThis as unknown as { fetch?: unknown }).fetch = vi
      .fn()
      .mockResolvedValue(
        createMockFetchResponse(apiResults, {
          contentType: 'application/json',
        })
      );

    const res = await searchTickets({
      searchText: 'test query',
      authToken: 'T',
      apiBaseUrl: 'https://api.test.com/TDWebApi/api',
      appBaseUrl: 'https://app.test.com/TDNext/Apps',
      appId: 99,
      limit: 10,
    });

    expect(res.length).toBe(2);
    expect(res[0]?.ID).toBe(1);
    // The Uri should be transformed to an app URL
    expect(res[0]?.Uri).toContain('TicketID=1');
    expect(res[1]?.Uri).toContain('TicketID=2');
  });

  it('createTicket posts and returns new ticket data', async () => {
    const createdTicket = { ID: 10, Title: 'New Ticket' };
    const fetchMock = vi.fn().mockResolvedValue(
      createMockFetchResponse(createdTicket, {
        contentType: 'application/json',
      })
    );
    (globalThis as unknown as { fetch?: unknown }).fetch = fetchMock;

    const created = await createTicket({
      authToken: 'T',
      apiBaseUrl: 'https://api.test.com/TDWebApi/api',
      appId: 99,
      ticketData: { Title: 'New' },
    });

    expect(created).toEqual(createdTicket);
    expect(fetchMock).toHaveBeenCalled();
    const calledUrl = fetchMock.mock.calls[0]?.[0] as string;
    expect(calledUrl).toContain('/99/tickets');
    expect(calledUrl).toContain('NotifyRequestor=false');
    const init = fetchMock.mock.calls[0]?.[1] as RequestInit;
    expect(init?.method).toBe('POST');
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

  it('searchTickets returns empty array when API returns non-array', async () => {
    (globalThis as unknown as { fetch?: unknown }).fetch = vi
      .fn()
      .mockResolvedValue(
        createMockFetchResponse(null, { contentType: 'application/json' })
      );

    const res = await searchTickets({
      searchText: 'q',
      authToken: 'T',
      apiBaseUrl: 'https://api.test.com/TDWebApi/api',
      appBaseUrl: 'https://app.test.com/TDNext/Apps',
      appId: 99,
    });
    expect(res).toEqual([]);
  });

  it('searchTickets returns empty array when API returns empty array', async () => {
    (globalThis as unknown as { fetch?: unknown }).fetch = vi
      .fn()
      .mockResolvedValue(
        createMockFetchResponse([], { contentType: 'application/json' })
      );

    const res = await searchTickets({
      searchText: 'q',
      authToken: 'T',
      apiBaseUrl: 'https://api.test.com/TDWebApi/api',
      appBaseUrl: 'https://app.test.com/TDNext/Apps',
      appId: 99,
    });
    expect(res).toEqual([]);
  });
});
