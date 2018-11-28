import ResponseError from "./ResponseError";
import HttpError from "./HttpError";

/**
 * Transform object into query parameters
 */
export const getQuery = (queryParams: any) => {
  if (Object.keys(queryParams).length === 0) {
    return "";
  }
  const parts: string[] = [];
  Object.keys(queryParams).forEach(key => {
    if (Array.isArray(queryParams[key])) {
      queryParams[key].forEach((val: any) => {
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
 */
const startsWithHttps = (str: string): boolean => /^https?:/.test(str);

/**
 * Used to determine if the request starts with a slash or not
 */
const startsWithSlash = (str: string): boolean => str.startsWith("/");

/**
 * Determine the request to be used
 */
export const getUrl = (url: string, baseUrl: string): string =>
  startsWithHttps(url) || startsWithSlash(url) ? url : `${baseUrl}/${url}`;

/**
 * Determine and return the body type
 */
export const bodyParser = (
  bodyToTransform:
    | string
    | Blob
    | URLSearchParams
    | FormData
    | ArrayBuffer
    | ReadableStream
):
  | string
  | Blob
  | URLSearchParams
  | FormData
  | ArrayBuffer
  | ReadableStream
  | null
  | undefined => {
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
 */
export const bodyResponseParser = (
  response: Response
): Promise<any> | ResponseError => {
  const contentType = response.headers.get("Content-Type");
  if (!contentType) {
    throw new ResponseError(response);
  }
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
  throw new ResponseError(response);
};

/**
 * Async function used to validate if the request is out of a defined range.
 * Will throw an HttpError if response's status is out of range.
 */
export const validateStatus = async (
  response: Response,
  url: string,
  method: string
): Promise<any> => {
  if (response.status < 200 || response.status >= 310) {
    const data = await response.json();
    throw new HttpError(data, url, method);
  } else {
    return Promise.resolve();
  }
};
