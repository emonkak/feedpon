/// <reference path="../../typings/whatwg-fetch.d.ts" />

export const IHttpClient = class {}
export interface IHttpClient {
    send(request: Request): Promise<Response>
}
