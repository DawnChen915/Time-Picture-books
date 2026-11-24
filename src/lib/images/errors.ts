/** An image failure with a flag saying whether trying the same request again could succeed. */
export class ImageError extends Error {
  constructor(
    message: string,
    readonly retryable: boolean,
  ) {
    super(message);
  }
}
