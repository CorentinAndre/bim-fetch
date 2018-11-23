import ResponseError from "./ResponseError";
import HttpError from "./HttpError";

/**
 * Transform object into query parameters
 * @param  {Object} queryParams Parameters of a GET request as an object
 * @return {String}             Query string representation of parameters
 */
export const getQuery = queryParams => {
  if (Object.keys(queryParams).length === 0) {
    return "";
  }
  const parts = [];
  Object.keys(queryParams).forEach(key => {
    if (Array.isArray(queryParams[key])) {
      queryParams[key].forEach(val => {
        parts.push(`${encodeURIComponent(key)}[]=${encodeURIComponent(val)}`);
      });
    } else {
      parts.push(
        `${encodeURIComponent(key)}=${encodeURIComponent(queryParams[key])}`
      );
    }
  });
  return `?${parts.join("&")}`;
};

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
const startsWithSlash = str => str.startsWith("/");

/**
 * Determine the request to be used
 * @param  {String} url     Url sent with the request
 * @param  {String} baseUrl Base url
 * @return {String}         Url to be used for the fetch request
 */
export const getUrl = (url, baseUrl) =>
  startsWithHttps(url) || startsWithSlash(url) ? url : `${baseUrl}/${url}`;

/**
 * Determine and return the body type
 * @param  {Blob || Object || String || URLSearchParams || FormData} bodyToTransform [description]
 * @return {[type]}                 [description]
 */
export const bodyParser = bodyToTransform => {
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
};

/**
 * Parse response body depending on the Content-Type header.
 * @param  {Response} response Response stream sent by the server
 * @return {Promise}          Promise that will be resolved either as JSON (Object) / Text(String) / Blob or FormData
 */
export const bodyResponseParser = response => {
  const contentType = response.headers.get("Content-Type");
  if (contentType.includes("application/json")) {
    console.log("json");
    return response.json();
  }
  if (contentType.includes("text/plain")) {
    console.log("text");
    return response.text();
  }
  if (contentType.includes("application/octet-stream")) {
    console.log("blob");
    return response.blob();
  }
  if (
    contentType.includes("multipart/form-data") ||
    contentType.includes("application/x-www-form-encoded")
  ) {
    console.log("formdata");
    return response.formData();
  }
  throw new ResponseError();

  // FormData => multipart/form-data or application/x-www-form-encoded
  // text => text/plain
  // json => application/json
  // blob => application/octet-stream
};

/**
 * Async function used to validate if the request is out of a defined range.
 * Will throw an HttpError if response's status is out of range.
 * @param  {Object}  response Response returned by fetch request
 * @return {Promise}          Resolve if status is in range, throw an HttpError otherwise
 *                            (same as returning a Promise.reject())
 */
export const validateStatus = async (response, url, method) => {
  if (response.status < 200 || response.status >= 310) {
    const data = await response.json();
    throw new HttpError(data, url, method);
  } else {
    return Promise.resolve();
  }
};
