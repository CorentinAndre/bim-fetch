import 'whatwg-fetch';
import 'babel-polyfill';
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
 * Determine and return the body type
 * @param  {Blob || Object || String || URLSearchParams || FormData} bodyToTransform [description]
 * @return {[type]}                 [description]
 */
function bodyParser(bodyToTransform) {
  switch (bodyToTransform.constructor) {
    case Blob:
      return bodyToTransform;
    case URLSearchParams:
      return bodyToTransform;
    case FormData:
      return bodyToTransform;
    case String:
      return bodyToTransform;
    default:
      return JSON.stringify(bodyToTransform);
  }
}

/**
 * Custom error to handle body parsing error
 * @extends Error
 */
class ResponseError extends Error {
  constructor(response) {
    super(`Couldn\t parse Content-Type: ${response.headers.get('Content-Type')}`);
    this.name = 'ResponseError';
  }
}

/**
 * Parse response body depending on the Content-Type header.
 * @param  {Response} response Response stream sent by the server
 * @return {Promise}          Promise that will be resolved either as JSON (Object) / Text(String) / Blob or FormData
 */
function bodyResponseParser(response) {
  const contentType = response.headers.get('Content-Type');
  if (contentType.includes('application/json')) {
    console.log('json');
    return response.json();
  } else if (contentType.includes('text/plain')) {
    console.log('text');
    return response.text();
  } else if (contentType.includes('application/octet-stream')) {
    console.log('blob');
    return response.blob();
  } else if (
    contentType.includes('multipart/form-data')
    || contentType.includes('application/x-www-form-encoded')) {
    console.log('formdata');
    return response.formData();
  }
  throw new ResponseError();

  // FormData => multipart/form-data or application/x-www-form-encoded
  // text => text/plain
  // json => application/json
  // blob => application/octet-stream
}

/**
 * Custom error to handle http errors
 * @extends Error
 */
class HttpError extends Error {
  constructor(response, url, method) {
    console.log(response);
    super(`${response.error_code} when making a ${method} on ressource ${url}.\n ${response.display_message}`);
    this.name = 'HttpError';
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
  async validateStatus(response, url, method) {
    if (response.status < 200 || response.status >= 310) {
      const data = await response.json();
      throw new HttpError(data, url, method);
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
      ...newHeaders,
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
    const fullUrl = getUrl(url, this.baseUrl);
    const response = await fetch(fullUrl + getQuery(params), {
      method: 'GET',
      headers: new Headers({
        ...this.baseHeaders,
        ...headers,
      }),
      mode: this.mode,
    });
    await this.validateStatus(response, fullUrl, 'GET');
    return bodyResponseParser(response);
  },
  /**
   * Perform a POST request. Parameters are sent as an object.
   * @param  {String}  url          Relative or absolute URL of the request
   * @param  {Object}  [params={}]  Parameters to send with the request
   * @param  {Object}  [headers={}] Custom headers
   * @return {Promise}              Return a promise of the result.
   */
  async post(url, bodyToTransform = {}, headers = {}) {
    const body = bodyParser(bodyToTransform);
    const fullUrl = getUrl(url, this.baseUrl);
    const response = await fetch(fullUrl, {
      method: 'POST',
      headers: new Headers({
        ...this.baseHeaders,
        ...headers,
      }),
      body,
      mode: this.mode,
    });
    await this.validateStatus(response, fullUrl, 'POST');
    return bodyResponseParser(response);
  },
  /**
   * Perform a PUT request. Parameters are sent as an object.
   * @param  {String}  url          Relative or absolute URL of the request
   * @param  {Object}  [params={}]  Parameters to send with the request
   * @param  {Object}  [headers={}] Custom headers
   * @return {Promise}              Return a promise of the result.
   */
  async put(url, body, headers = {}) {
    const fullUrl = getUrl(url, this.baseUrl);
    const response = await fetch(fullUrl, {
      method: 'PUT',
      headers: new Headers({
        ...this.baseHeaders,
        ...headers,
      }),
      mode: this.mode,
      body,
    });
    await this.validateStatus(response, fullUrl, 'PUT');
    return bodyResponseParser(response);
  },
  /**
   * Perform a DELETE request. There should be no parameters to be sent.
   * @param  {String}  url          Relative or absolute URL of the request
   * @param  {Object}  [params={}]  Parameters to send with the request
   * @param  {Object}  [headers={}] Custom headers
   * @return {Promise}              Return a promise of the result.
   */
  async delete(url, headers = {}) {
    const fullUrl = getUrl(url, this.baseUrl);
    const response = await fetch(fullUrl, {
      method: 'DELETE',
      headers: new Headers({
        ...this.baseHeaders,
        ...headers,
      }),
      mode: this.mode,
    });
    return this.validateStatus(response, fullUrl, 'DELETE');
  },
};
