export type Middleware = (
  request: Request,
  handler: RequestHandler,
) => Promise<Response>;

export type RequestHandler = (request: Request) => Promise<Response>;

export const defaultMiddleware: Middleware = (
  request: Request,
  handler: RequestHandler,
) => {
  return handler(request);
};

export function composeMiddlewares(middlewares: Middleware[]): Middleware {
  return (request: Request, handler: RequestHandler) => {
    let index = 0;
    const handle: RequestHandler = (request) => {
      return index < middlewares.length
        ? middlewares[index++]!(request, handle)
        : handler(request);
    };
    return handle(request);
  };
}
