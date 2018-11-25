/* eslint-disable prefer-class-properties/prefer-class-properties */

/**
 * Custom error to handle body parsing error
 * @extends Error
 */
export default class ResponseError extends Error {
  constructor(response: Response) {
    super(
      `Couldn\t parse Content-Type: ${response.headers.get("Content-Type")}`
    );
    this.name = "ResponseError";
  }
}
