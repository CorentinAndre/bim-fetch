import "whatwg-fetch";
import "@babel/polyfill";
import {
  getUrl,
  getQuery,
  bodyParser,
  validateStatus,
  bodyResponseParser
} from "./utils";

export default class BimFetch {
  state = {
    /**
     * default Headers as an object, will be converted to Headers right before the request
     * @type {Object}
     */
    baseHeaders: {
      "Content-Type": "application/json",
      Accept: "application/json, text/plain, */*, multipart/form-data"
    },
    /**
     * Default url used when accessing a ressource, if the request doens't start with https
     * @type {String}
     */
    baseUrl: "",
    /**
     * Mode used to fetch data. It can be either:
     * - cors
     * - same-origin
     * - no-cors
     * - navigate
     * @type {String}
     */
    mode: "cors"
  };

  constructor(url) {
    this.setDefaultUrl(url);
  }

  /**
   * Set headers on every request using rest operators.
   * It will handle the case when headers already set needs to be changed.
   * Thanks to rest operators, newHeaders will overwrite old headers values.
   * @param  {Object}  newHeaders Custom headers to be used for the current request
   */
  setHeaders(newHeaders) {
    this.state.baseHeaders = {
      ...this.state.baseHeaders,
      ...newHeaders
    };
  }

  /**
   * Set default url to be used when making fetch requests
   * @param {string} url Default url to be used (https://my-great-api.com)
   */
  setDefaultUrl(url) {
    this.state.baseUrl = url;
  }

  /**
   * Perform a GET request. Parameters are sent as an object and will be parsed and transformed
   * into a valid query
   * @param  {String}  url          Relative or absolute URL of the request
   * @param  {Object}  [params={}]  Parameters to send with the request
   * @param  {Object}  [headers={}] Custom headers
   * @return {Promise}              Return a promise of the result.
   */
  async get(url, params = {}, headers = {}) {
    const fullUrl = getUrl(url, this.state.baseUrl);
    const response = await fetch(fullUrl + getQuery(params), {
      method: "GET",
      headers: new Headers({
        ...this.state.baseHeaders,
        ...headers
      }),
      mode: this.state.mode
    });
    await validateStatus(response, fullUrl, "GET");
    return bodyResponseParser(response);
  }

  /**
   * Perform a POST request. Parameters are sent as an object.
   * @param  {String}  url          Relative or absolute URL of the request
   * @param  {Object}  [params={}]  Parameters to send with the request
   * @param  {Object}  [headers={}] Custom headers
   * @return {Promise}              Return a promise of the result.
   */
  async post(url, bodyToTransform = {}, headers = {}) {
    const body = bodyParser(bodyToTransform);
    const fullUrl = getUrl(url, this.state.baseUrl);
    const response = await fetch(fullUrl, {
      method: "POST",
      headers: new Headers({
        ...this.state.baseHeaders,
        ...headers
      }),
      body,
      mode: this.state.mode
    });
    await validateStatus(response, fullUrl, "POST");
    return bodyResponseParser(response);
  }

  /**
   * Perform a PUT request. Parameters are sent as an object.
   * @param  {String}  url          Relative or absolute URL of the request
   * @param  {Object}  [params={}]  Parameters to send with the request
   * @param  {Object}  [headers={}] Custom headers
   * @return {Promise}              Return a promise of the result.
   */
  async put(url, bodyToTransform, headers = {}) {
    const body = bodyParser(bodyToTransform);
    const fullUrl = getUrl(url, this.state.baseUrl);
    const response = await fetch(fullUrl, {
      method: "PUT",
      headers: new Headers({
        ...this.state.baseHeaders,
        ...headers
      }),
      mode: this.state.mode,
      body
    });
    await validateStatus(response, fullUrl, "PUT");
    return bodyResponseParser(response);
  }

  /**
   * Perform a DELETE request. There should be no parameters to be sent.
   * @param  {String}  url          Relative or absolute URL of the request
   * @param  {Object}  [params={}]  Parameters to send with the request
   * @param  {Object}  [headers={}] Custom headers
   * @return {Promise}              Return a promise of the result.
   */
  async delete(url, headers = {}) {
    const fullUrl = getUrl(url, this.state.baseUrl);
    const response = await fetch(fullUrl, {
      method: "DELETE",
      headers: new Headers({
        ...this.state.baseHeaders,
        ...headers
      }),
      mode: this.state.mode
    });
    return validateStatus(response, fullUrl, "DELETE");
  }
}
