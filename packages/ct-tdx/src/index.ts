// parameters for getAuthToken
export interface GetAuthTokenParams {
  username: string;
  password: string;
  apiBaseUrl: string;
  userAgent?: string;
}

/**
 * @function getAuthToken
 * @summary  async function to retrieve TDX auth token to use in API calls
 * @example  const authToken = await getAuthToken({
 *   username: 'your-username',
 *   password: 'super-secret-string',
 *   apiBaseUrl: 'https://tdx.your.domain/TDWebApi/api'
 * });
 * @param    {GetAuthTokenParams} obj object with parameters
 * @param    {string} obj.username
 * @param    {string} obj.password
 * @param    {string} obj.apiBaseUrl
 * @param    {string} [obj.userAgent='CIT Cloud Team Automation']
 * @returns  {Promise<string>} with authToken data
 */
export const getAuthToken = async ({
  username,
  password,
  apiBaseUrl,
  userAgent = 'CIT Cloud Team Automation',
}: GetAuthTokenParams): Promise<string> => {
  const response = await fetch(`${apiBaseUrl}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'User-Agent': userAgent,
    },
    body: JSON.stringify({
      UserName: username,
      Password: password,
    }),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const token = await response.text();

  return token;
};

// parameters for makeApiCall
export interface MakeApiCallParams {
  apiBaseUrl: string;
  endpointPath: string;
  authToken: string;
  requestMethod?: string;
  requestBody?: unknown;
  ignoreSslErrors?: boolean;
  userAgent?: string;
}

/**
 * @function makeApiCall
 * @summary  async function for making calls to the TDX API
 * @example  const apiData = await makeApiCall({
 *   apiBaseUrl: 'https://tdx.your.domain/TDWebApi/api',
 *   endpointPath: '/people/lookup?searchText=',
 *   authToken,
 *   method: 'GET'
 * });
 * @param    {MakeApiCallParams} obj object with parameters
 * @param    {string} obj.apiBaseUrl
 * @param    {string} obj.endpointPath
 * @param    {string} obj.authToken
 * @param    {string} [obj.requestMethod='OPTIONS']
 * @param    {string} [obj.userAgent='CIT Cloud Team Automation']
 * @param    {Object} [obj.requestBody=null]
 * @returns  {Promise<unknown>} Object with JSON data
 */
export const makeApiCall = async ({
  apiBaseUrl,
  endpointPath,
  authToken,
  requestMethod = 'OPTIONS',
  requestBody = undefined,
  ignoreSslErrors = false,
  userAgent = 'CIT Cloud Team Automation',
}: MakeApiCallParams): Promise<unknown> => {
  const url = `${apiBaseUrl}${endpointPath}`;

  const headers = new Headers({
    Authorization: `Bearer ${authToken}`,
    Accept: 'application/json',
    'User-Agent': userAgent,
  });

  const method = requestMethod.toUpperCase();
  const init: RequestInit = {
    method,
    headers,
  };

  if ((method === 'POST' || method === 'PUT') && requestBody !== undefined) {
    if (typeof requestBody === 'string') {
      init.body = requestBody;
    } else {
      headers.set('Content-Type', 'application/json; charset=utf-8');
      init.body = JSON.stringify(requestBody);
    }
  }

  // Optionally ignore self-signed SSL errors. Note: this toggles a process-wide setting briefly.
  const prevTls = process.env.NODE_TLS_REJECT_UNAUTHORIZED;
  if (ignoreSslErrors) {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
  }

  try {
    const response = await fetch(url, init);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const contentType = response.headers.get('content-type') ?? '';
    if (contentType.includes('application/json')) {
      return await response.json();
    }
    return await response.text();
  } finally {
    if (ignoreSslErrors) {
      if (prevTls === undefined) {
        delete process.env.NODE_TLS_REJECT_UNAUTHORIZED;
      } else {
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = prevTls;
      }
    }
  }
};

export interface TdxApiUriToAppUrlParams {
  uri: string;
  appBaseUrl: string;
}

export const tdxApiUriToAppUrl = ({
  uri,
  appBaseUrl,
}: TdxApiUriToAppUrlParams): string => {
  const match = uri.match(/api\/(\d+)\/(tickets|knowledgebase)\/(\d+)/);
  if (match) {
    const [, appId, type, id] = match;
    if (type === 'tickets') {
      return `${appBaseUrl}/${appId}/Tickets/TicketDet.aspx?TicketID=${id}`;
    }
    if (type === 'knowledgebase') {
      return `${appBaseUrl.replace('TDNext/Apps', 'TDClient')}/${appId}/Portal/KB/ArticleDet?ID=${id}`;
    }
  }
  return '';
};

// parameters for getTicket
export interface GetTicketParams {
  ticketId: number;
  authToken: string;
  apiBaseUrl: string;
  appId: number;
}

/**
 * @function getTicket
 * @summary  async function for getting an individual TDX ticket
 * @example  const ticketData = await getTicket({
 *   ticketId: 123456,
 *   authToken,
 *   apiBaseUrl: 'https://tdx.your.domain/TDWebApi/api',
 *   appId: 99,
 * });
 * @param    {GetTicketParams} obj with parameters
 * @param    {number} obj.ticketId
 * @param    {string} obj.authToken
 * @param    {string} obj.apiBaseUrl
 * @param    {number} obj.appId
 * @returns  {Promise<unknown>} Object with JSON data
 */
export const getTicket = async ({
  ticketId,
  authToken,
  apiBaseUrl,
  appId,
}: GetTicketParams): Promise<unknown> => {
  const ticketData = await makeApiCall({
    apiBaseUrl,
    endpointPath: `/${appId}/tickets/${ticketId}`,
    authToken,
    requestMethod: 'GET',
  });

  return ticketData;
};

// parameters for searchTickets
export interface SearchTicketParams {
  searchText: string;
  limit?: number;
  authToken: string;
  apiBaseUrl: string;
  appBaseUrl: string;
  appId: number;
}

// return type for searchTickets
export type SearchTicketResults = Array<{
  ID: number;
  TypeName: string;
  TypeCategoryName: string;
  ClassificationName: string;
  Title: string;
  AccountName: string;
  StatusName: string;
  PriorityName: string;
  CreatedDate: string;
  ModifiedDate: string;
  RequestorName: string;
  RequestorEmail: string;
  ResponsibleGroupName: string;
  ServiceName: string;
  ServiceOfferingName: string;
  ServiceCategoryName: string;
  Uri: string;
}>; /**
 * @function searchTickets
 * @summary  async function for searching TDX tickets
 * @example  const searchResults = await searchTickets({
 *   searchText: 'example',
 *   limit: 10,
 *   authToken,
 *   apiBaseUrl: 'https://tdx.your.domain/TDWebApi/api',
 *   appId: 99,
 * });
 * @param    {SearchTicketParams} obj with parameters
 * @param    {string} obj.searchText
 * @param    {number} [obj.limit=20]
 * @param    {string} obj.authToken
 * @param    {string} obj.apiBaseUrl
 * @param    {string} obj.appBaseUrl
 * @param    {number} obj.appId
 * @returns  {Promise<SearchTicketResults>} Array of ticket objects
 */
export const searchTickets = async ({
  searchText,
  limit = 20,
  authToken,
  apiBaseUrl,
  appBaseUrl,
  appId,
}: SearchTicketParams): Promise<SearchTicketResults> => {
  const searchResults = await makeApiCall({
    apiBaseUrl,
    endpointPath: `/${appId}/tickets/search`,
    authToken,
    requestMethod: 'POST',
    requestBody: { searchText },
  });

  // return only the limit specified, extract only the required values but leave the array in it's original order
  if (Array.isArray(searchResults) && searchResults.length > 0) {
    return searchResults.slice(0, limit).map((ticket) => ({
      ID: ticket?.ID,
      TypeName: ticket?.TypeName,
      TypeCategoryName: ticket?.TypeCategoryName,
      ClassificationName: ticket?.ClassificationName,
      Title: ticket?.Title,
      AccountName: ticket?.AccountName,
      StatusName: ticket?.StatusName,
      PriorityName: ticket?.PriorityName,
      CreatedDate: ticket?.CreatedDate,
      ModifiedDate: ticket?.ModifiedDate,
      RequestorName: ticket?.RequestorName,
      RequestorEmail: ticket?.RequestorEmail,
      ResponsibleGroupName: ticket?.ResponsibleGroupName,
      ServiceName: ticket?.ServiceName,
      ServiceOfferingName: ticket?.ServiceOfferingName,
      ServiceCategoryName: ticket?.ServiceCategoryName,
      Uri: tdxApiUriToAppUrl({ uri: ticket?.Uri, appBaseUrl }),
    }));
  }

  // should never reach this
  return [];
};

// parameters for createTicket
export interface CreateTicketParams {
  authToken: string;
  apiBaseUrl: string;
  appId: number;
  ticketData: unknown;
}

/**
 * @function createTicket
 * @summary  async function for creating a TDX ticket
 * @example  const newTicket = await createTicket({
 *   authToken,
 *   apiBaseUrl: 'https://tdx.your.domain/TDWebApi/api',
 *   appId: 99,
 *   ticketData: objectWithNewTicketData,
 * });
 * @param    {CreateTicketParams} obj with parameters
 * @param    {string} obj.authToken
 * @param    {string} obj.apiBaseUrl
 * @param    {number} obj.appId
 * @param    {Object} obj.ticketData
 * @returns  {Promise<unknown>} Object with JSON data for new ticket
 */
export const createTicket = async ({
  authToken,
  apiBaseUrl,
  appId,
  ticketData,
}: CreateTicketParams): Promise<unknown> => {
  const newTicketData = await makeApiCall({
    apiBaseUrl,
    endpointPath: `/${appId}/tickets?NotifyRequestor=false`,
    authToken,
    requestMethod: 'POST',
    requestBody: ticketData,
  });

  return newTicketData;
};

// return type for getCloudTeamTicketDefaults
export type NewTicketDefaults = {
  TypeID: number;
  TypeCategoryID: number;
  AccountID: number;
  StatusID: number;
  PriorityID: number;
  Classification: number;
  ResponsibleGroupID: number;
  ServiceID: number;
  ServiceCategoryID: number;
  ServiceOfferingID: number;
  SourceID: number;
  Title: string;
  Description: string;
};

/**
 * @function getCloudTeamTicketDefaults
 * @summary  async function that returns defaults from endpoint in cloud team repo,
 *           useful when creating new tickets because it contains required info
 * @example  await getCloudTeamTicketDefaults();
 * @returns  {Promise<NewTicketDefaults>}
 */
export const getCloudTeamTicketDefaults = async (
  endpointUrl = 'https://cu-cit-cloud-team.github.io/tdx-playground/automated-ticket-defaults'
): Promise<NewTicketDefaults> => {
  const ticketDefaults = await fetch(endpointUrl, {
    headers: {
      Accept: 'application/json',
    },
  }).then(async (response) => await response.json());

  return ticketDefaults as NewTicketDefaults;
};
