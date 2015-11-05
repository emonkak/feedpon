/// <reference path="../../typings/whatwg-fetch.d.ts" />

import * as feedly from './interfaces'
import CredentialRepository from './credentialRepository'
import { IClock } from '../clock/interfaces'
import { IHttpClient } from '../http/interfaces'
import { IWindowOpener } from '../window/interfaces'
import { Inject } from '../../di/annotations'
import { postRequest } from './requestFactories'

@Inject
export default class Authenticator {
    constructor(private credentialRepository: CredentialRepository,
                private clock: IClock,
                private environment: feedly.IEnvironment,
                private httpClient: IHttpClient,
                private windowOpener: IWindowOpener) {
    }

    authenticate(): Promise<feedly.Credential> {
        return this.credentialRepository.get()
            .then((credential) => {
                if (credential == null) {
                    // Not authenticated yet
                    const { client_id, redirect_uri, scope } = this.environment
                    return this.doAuthenticate({
                        client_id,
                        redirect_uri,
                        scope,
                        response_type: 'code'
                    })
                } else if (this.expiresToken(credential)) {
                    // Requires token refreshing
                    return this.doRefreshToken(credential)
                } else {
                    return credential
                }
            })
    }

    expire(): Promise<void> {
        return this.credentialRepository.get()
            .then<any>(credential => {
                if (credential) {
                    const { client_id, client_secret, redirect_uri } = this.environment
                    const { refresh_token } = credential
                    return Promise.all<any>([
                        this.doRevokeToken({
                            refresh_token,
                            client_id,
                            client_secret,
                            grant_type: 'revoke_token'
                        }),
                        this.credentialRepository.delete()
                    ])
                }
            })
    }

    authorized(): Promise<boolean> {
        return this.credentialRepository.get()
            .then(credential => !(credential == null || this.expiresToken(credential)))
    }

    private doAuthenticate(input: feedly.AuthenticateInput): Promise<feedly.Credential> {
        const escape = encodeURIComponent
        const authUrl = this.environment.endpoint + 'v3/auth/auth' +
            '?response_type=' + escape(input.response_type) +
            '&client_id=' + escape(input.client_id) +
            '&redirect_uri=' + escape(input.redirect_uri) +
            '&scope=' + escape(input.scope) +
            (input.state != null ? '&state=' + escape(input.state) : '')

        return new Promise<feedly.AuthenticateResponse>((resolve, reject) => {
            return this.windowOpener.open(authUrl, (url, close) => {
                if (url.indexOf(input.redirect_uri) !== 1) return

                const matchesForCode = url.match(/[?&]code=([^&]*)/)
                const matchesForState = url.match(/[?&]state=([^&]*)/)
                const matchesForError = url.match(/[?&]error=([^&]*)/)

                if (matchesForCode) {
                    resolve({
                        code: matchesForCode[1],
                        state: matchesForState ? matchesForState[1] : null
                    })
                    close()
                } else if (matchesForError) {
                    reject({
                        error: matchesForError[1],
                        state: matchesForState ? matchesForState[1] : null
                    })
                    close()
                }
            })
        })
        .then((response) => {
            const { client_id, client_secret, redirect_uri } = this.environment
            return this.doExchangeToken({
                code: response.code,
                client_id,
                client_secret,
                redirect_uri,
                grant_type: 'authorization_code'
            })
        })
        .then((response) => {
            const credential = Object.assign({
                authorized: this.clock.now(),
            }, response)

            return this.credentialRepository.put(credential)
        })
    }

    private doExchangeToken(input: feedly.ExchangeTokenInput): Promise<feedly.ExchangeTokenResponse> {
        return this.doPost('v3/auth/token', input)
    }

    private doRefreshToken(credential: feedly.Credential): Promise<feedly.Credential> {
        const { client_id, client_secret } = this.environment
        const { refresh_token } = credential
        return this.doPost('v3/auth/token', {
                refresh_token,
                client_id,
                client_secret,
                grant_type: 'refresh_token',
            })
            .then((response) => {
                let newCredential = Object.assign({
                    authorized: this.clock.now(),
                }, credential, response)

                return this.credentialRepository.put(newCredential)
            })
    }

    private doRevokeToken(input: feedly.RevokeTokenInput): Promise<feedly.RevokeTokenResponse> {
        return this.doPost('v3/auth/token', input)
    }

    private doPost<T>(path: string, data?: { [key: string]: any }): Promise<T> {
        const url = this.environment.endpoint + path
        const request = postRequest(url, data)
        return this.httpClient.send(request).then(response => response.json<T>())
    }

    private expiresToken(credential: feedly.Credential): boolean {
        return credential.authorized + (credential.expires_in * 1000) < this.clock.now()
    }
}
