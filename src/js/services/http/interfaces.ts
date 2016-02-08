export const IHttpClient = class {}
export interface IHttpClient {
    send(request: Request): Promise<Response>
}
