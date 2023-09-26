import https from 'https';
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';

/**
 * @function getAuthToken
 * @summary  async function to retrieve TDX auth token to use in API calls
 * @example  const authToken = await getAuthToken({
 *   username: 'your-username',
 *   password: 'super-secret-string',
 *   apiBaseUrl: 'https://tdx.your.domain/TDWebApi/api'
 * });
 * @param    {getAuthTokenParams} obj object with parameters
 * @param    {string} obj.username
 * @param    {string} obj.password
 * @param    {string} obj.apiBaseUrl
 * @param    {string} [obj.userAgent='CIT Cloud Team Automation']
 * @returns  {Promise<string>} with authToken data
 */
export interface getAuthTokenParams {
  username: string;
  password: string;
  apiBaseUrl: string;
  userAgent?: string;
}
export const getAuthToken = async ({
  username,
  password,
  apiBaseUrl,
  userAgent = 'CIT Cloud Team Automation',
}: getAuthTokenParams): Promise<string> => {
  const getTokenConfig: AxiosRequestConfig = {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'User-Agent': userAgent,
    },
    url: `${apiBaseUrl}/auth/login`,
    method: 'POST',
    data: {
      UserName: username,
      Password: password,
    },
  };

  const token = await axios(getTokenConfig).then((response) => response.data);

  return token;
};

/**
 * @function makeApiCall
 * @summary  async function for making calls to the TDX API
 * @example  const apiData = await makeApiCall({
 *   apiBaseUrl: 'https://tdx.your.domain/TDWebApi/api',
 *   endpointPath: '/people/lookup?searchText=',
 *   authToken,
 *   method: 'GET'
 * });
 * @param    {makeApiCallParams} obj object with parameters
 * @param    {string} obj.apiBaseUrl
 * @param    {string} obj.endpointPath
 * @param    {string} obj.authToken
 * @param    {string} [obj.requestMethod='OPTIONS']
 * @param    {string} [obj.userAgent='CIT Cloud Team Automation']
 * @param    {Object} [obj.requestBody=null]
 * @returns  {Promise<any>} Object with JSON data
 */

export interface makeApiCallParams {
  apiBaseUrl: string;
  endpointPath: string;
  authToken: string;
  requestMethod?: string;
  requestBody?: string;
  ignoreSslErrors?: boolean;
  userAgent?: string;
}

export const makeApiCall = async ({
  apiBaseUrl,
  endpointPath,
  authToken,
  requestMethod = 'OPTIONS',
  requestBody = undefined,
  ignoreSslErrors = false,
  userAgent = 'CIT Cloud Team Automation',
}: makeApiCallParams): Promise<any> => {
  const httpClientConfig: AxiosRequestConfig = {
    headers: {
      Authorization: `Bearer ${authToken}`,
      Accept: 'application/json',
      'User-Agent': userAgent,
    },
    url: `${apiBaseUrl}${endpointPath}`,
    method: `${requestMethod}`,
  };
  if (ignoreSslErrors) {
    // ignore the self-signed ssl errors
    httpClientConfig.httpsAgent = new https.Agent({
      rejectUnauthorized: false,
    });
  }
  if (
    (requestMethod.toUpperCase() === 'POST' ||
      requestMethod.toUpperCase() === 'PUT') &&
    requestBody
  ) {
    httpClientConfig.data = requestBody;
  }

  const apiData = await axios(httpClientConfig).then(
    (response) => response.data
  );

  return apiData;
};

/**
 * @function getTicket
 * @summary  async function for getting an individual TDX ticket
 * @example  const ticketData = await getTicket({
 *   ticketId: 123456,
 *   authToken,
 *   apiBaseUrl: 'https://tdx.your.domain/TDWebApi/api',
 *   appId: 99,
 * });
 * @param    {getTicketParams} obj with parameters
 * @param    {number} obj.ticketId
 * @param    {string} obj.authToken
 * @param    {string} obj.apiBaseUrl
 * @param    {number} obj.appId
 * @returns  {Promise<any>} Object with JSON data
 */

export interface getTicketParams {
  ticketId: number;
  authToken: string;
  apiBaseUrl: string;
  appId: number;
}

export const getTicket = async ({
  ticketId,
  authToken,
  apiBaseUrl,
  appId,
}: getTicketParams): Promise<any> => {
  const ticketData = await makeApiCall({
    apiBaseUrl,
    endpointPath: `/${appId}/tickets/${ticketId}`,
    authToken,
    requestMethod: 'GET',
  });

  return ticketData;
};

/**
 * @function createTicket
 * @summary  async function for creating a TDX ticket
 * @example  const newTicket = await createTicket({
 *   authToken,
 *   apiBaseUrl: 'https://tdx.your.domain/TDWebApi/api',
 *   appId: 99,
 *   ticketData: objectWithNewTicketData,
 * });
 * @param    {createTicketParams} obj with parameters
 * @param    {string} obj.authToken
 * @param    {string} obj.apiBaseUrl
 * @param    {number} obj.appId
 * @param    {Object} obj.ticketData
 * @returns  {Promise<any>} Object with JSON data for new ticket
 */

export interface createTicketParams {
  authToken: string;
  apiBaseUrl: string;
  appId: number;
  ticketData: any;
}

export const createTicket = async ({
  authToken,
  apiBaseUrl,
  appId,
  ticketData,
}: createTicketParams): Promise<any> => {
  const newTicketData = await makeApiCall({
    apiBaseUrl,
    endpointPath: `/${appId}/tickets?NotifyRequestor=false`,
    authToken,
    requestMethod: 'POST',
    requestBody: ticketData,
  });

  return newTicketData;
};

/**
 * @function getCloudTeamTicketDefaults
 * @summary  async function that returns defaults from endpoint in this repo
 * @example  await getCloudTeamTicketDefaults('https://url-for-endpoint.with/automated-ticket-defaults.json');
 * @returns  {Object} with JSON data
 */
export const getCloudTeamTicketDefaults = async (
  endpointUrl: string
): Promise<any> => {
  const ticketDefaults = await axios(endpointUrl).then(
    (response) => response.data
  );

  return ticketDefaults;
};
