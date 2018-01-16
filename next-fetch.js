/**
 * Used to determine if the request starts with http|https or not
 * @param  {String} str string to test
 * @return {Boolean}    true if it starts with http|https, false otherwise
 */
const startsWithHttps = str => /^https?:/.test(str);

/**
 * Used to determine if the request starts with a slash or not
 * @param  {String} str string to test
 * @return {Boolean}    true if it starts with /, false otherwise
 */
const startsWithSlash = str => str.startsWith('/');

/**
 * Transform object into query parameters
 * @param  {Object} queryParams Parameters of a GET request as an object
 * @return {String}             Query string representation of parameters
 */
const getQuery = (queryParams) => {
  if (Object.keys(queryParams).length === 0) {
    return '';
  }
  const parts = [];
  Object.keys(queryParams).forEach((key) => {
    if (Array.isArray(queryParams[key])) {
      queryParams[key].forEach((val) => {
        parts.push(`${encodeURIComponent(key)}[]=${encodeURIComponent(val)}`);
      });
    } else {
      parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(queryParams[key])}`);
    }
  });
  return `?${parts.join('&')}`;
};

/**
 * Determine the request to be used
 * @param  {String} url     Url sent with the request
 * @param  {String} baseUrl Base url
 * @return {String}         Url to be used for the fetch request
 */
function getUrl(url, baseUrl) {
  return startsWithHttps(url) || startsWithSlash(url)
    ? url
    : `${baseUrl}/${url}`;
}

/**
 * Custom error to handle http errors
 * @extends Error
 */
class HttpError extends Error {
  constructor(response) {
    super(`${response.status} for ${response.url}`);
    this.name = 'HttpError';
    this.response = response;
  }
}

export default {
  /**
   * default Headers as an object, will be converted to Headers right before the request
   * @type {Object}
   */
  baseHeaders: {
    'Content-Type': 'application/json',
    Accept: 'application/json, text/plain, */*, multipart/form-data',
  },
  /**
   * Default url used when accessing a ressource, if the request doens't start with https
   * @type {String}
   */
  baseUrl: '',
  /**
   * Mode used to fetch data. It can be either:
   * - cors
   * - same-origin
   * - no-cors
   * - navigate
   * @type {String}
   */
  mode: 'cors',

  /**
   * Async function used to validate if the request is out of a defined range.
   * Will throw an HttpError if response's status is out of range.
   * @param  {Object}  response Response returned by fetch request
   * @return {Promise}          Resolve if status is in range, throw an HttpError otherwise
   *                            (same as returning a Promise.reject())
   */
  async validateStatus(response) {
    if (response.status < 200 || response.status >= 310) {
      const data = await response.json();
      throw new HttpError(data);
    } else {
      return Promise.resolve();
    }
  },

  /**
   * Set headers on every request using rest operators.
   * It will handle the case when headers already set needs to be changed.
   * Thanks to rest operators, newHeaders will overwrite old headers values.
   * @param  {Object}  newHeaders Custom headers to be used for the current request
   */
  setHeaders(newHeaders) {
    this.baseHeaders = {
      ...this.baseHeaders,
      newHeaders,
    };
  },
  /**
   * Set default url to be used when making fetch requests
   * @param {string} url Default url to be used (https://my-great-api.com)
   */
  setDefaultUrl(url) {
    this.baseUrl = url;
  },
  /**
   * Perform a GET request. Parameters are sent as an object and will be parsed and transformed
   * into a valid query
   * @param  {String}  url          Relative or absolute URL of the request
   * @param  {Object}  [params={}]  Parameters to send with the request
   * @param  {Object}  [headers={}] Custom headers
   * @return {Promise}              Return a promise of the result.
   */
  async get(url, params = {}, headers = {}) {
    const response = await fetch(getUrl(url, this.baseUrl) + getQuery(params), {
      method: 'GET',
      headers: new Headers({
        ...this.baseHeaders,
        ...headers,
      }),
      mode: this.mode,
    });
    await this.validateStatus(response);
    return response.json();
  },
  /**
   * Perform a POST request. Parameters are sent as an object.
   * @param  {String}  url          Relative or absolute URL of the request
   * @param  {Object}  [params={}]  Parameters to send with the request
   * @param  {Object}  [headers={}] Custom headers
   * @return {Promise}              Return a promise of the result.
   */
  async post(url, body = {}, headers = {}) {
    const response = await fetch(getUrl(url, this.baseUrl), {
      method: 'POST',
      headers: new Headers({
        ...this.baseHeaders,
        ...headers,
      }),
      mode: this.mode,
      body,
    });
    await this.validateStatus(response);
    return response.json();
  },
  /**
   * Perform a PUT request. Parameters are sent as an object.
   * @param  {String}  url          Relative or absolute URL of the request
   * @param  {Object}  [params={}]  Parameters to send with the request
   * @param  {Object}  [headers={}] Custom headers
   * @return {Promise}              Return a promise of the result.
   */
  async put(url, body, headers = {}) {
    const response = await fetch(getUrl(url, this.baseUrl), {
      method: 'PUT',
      headers: new Headers({
        ...this.baseHeaders,
        ...headers,
      }),
      mode: this.mode,
      body,
    });
    await this.validateStatus(response);
    return response.json();
  },
  /**
   * Perform a DELETE request. There should be no parameters to be sent.
   * @param  {String}  url          Relative or absolute URL of the request
   * @param  {Object}  [params={}]  Parameters to send with the request
   * @param  {Object}  [headers={}] Custom headers
   * @return {Promise}              Return a promise of the result.
   */
  async delete(url, headers = {}) {
    const response = fetch(getUrl(url, this.baseUrl), {
      method: 'DELETE',
      headers: new Headers({
        ...this.baseHeaders,
        ...headers,
      }),
      mode: this.mode,
    });
    await this.validateStatus(response);
    return response.json();
  },
};

