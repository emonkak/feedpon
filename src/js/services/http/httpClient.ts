/// <reference path="../../typings/whatwg-fetch.d.ts" />

import { IHttpClient } from './interfaces'
import { Inject } from '../../di/annotations'

@Inject
export default class HttpClient implements IHttpClient {
    send(request: Request): Promise<Response> {
        return fetch(request)
    }
}
