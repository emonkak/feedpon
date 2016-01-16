/// <reference path="../../typings/whatwg-fetch.d.ts" />

import { IHttpClient } from '../http/interfaces'
import { Redirection, IRedirectionRepository } from './interfaces'
import { Inject } from '../../shared/di/annotations'

@Inject
export default class UrlExpander {
    constructor(private _httpClient: IHttpClient,
                private _redirectionRepository: IRedirectionRepository) {
    }

    async expand(url: string): Promise<Redirection> {
        const redirection = await this._redirectionRepository.get(url)
        if (redirection) {
            return redirection
        }

        const newRedirection = await this._doExpand(url)

        await this._redirectionRepository.put(newRedirection)

        return newRedirection
    }

    private async _doExpand(url: string) {
        const request = new Request(url, { method: 'HEAD' })
        const response = await this._httpClient.send(request)
        return { url, redirectUrl: response.url }
    }
}
