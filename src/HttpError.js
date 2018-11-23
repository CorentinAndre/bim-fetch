/* eslint-disable prefer-class-properties/prefer-class-properties */

/**
 * Custom error to handle http errors
 * @extends Error
 */
export default class HttpError extends Error {
  constructor(response, url, method) {
    console.log(response);
    super(
      `Error when making a ${method} on ressource ${url}.\nSee response property of the error to access server logs.`
    );
    this.response = response;
    this.name = "HttpError";
  }
}
