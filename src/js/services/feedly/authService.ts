/// <reference path="../../typings/whatwg-fetch.d.ts" />

import * as feedly from './interfaces'
import Gateway from './gateway'
import { IClock } from '../clock/interfaces'
import { ICredentialRepository } from '../../repositories/interfaces'
import { IWindowOpener } from '../window/interfaces'
import { Inject } from '../../di/annotations'

@Inject
export default class AuthService {
    constructor(private credentialRepository: ICredentialRepository,
                private clock: IClock,
                private environment: feedly.IEnvironment,
                private gateway: Gateway) {
    }

    getCredential(): Promise<feedly.Credential> {
        return this.credentialRepository.get()
            .then(credential => {
                if (credential != null) {
                    return this.expiresToken(credential)
                        ? this.refresh(credential.refresh_token)
                        : credential
                } else {
                    return Promise.reject<feedly.Credential>('Not authenticated yet')
                }
            })
    }

    authenticate(windowOpener: IWindowOpener): Promise<feedly.Credential> {
        return this.doAuthenticate(windowOpener)
            .then(response => this.doExchangeToken(response.code))
            .then(response => Object.assign({ authorized: this.clock.now() }, response))
            .then(credential => this.credentialRepository.put(credential).then(() => credential))
    }

    authorized(): Promise<boolean> {
        return this.credentialRepository.get()
            .then(credential => !(credential == null || this.expiresToken(credential)))
    }

    refresh(refreshToken: string): Promise<feedly.Credential> {
        return this.doRefreshToken(refreshToken)
            .then(response =>
                Object.assign({
                    authorized: this.clock.now(),
                    refresh_token: refreshToken
                }, response)
            )
            .then(credential => this.credentialRepository.put(credential).then(() => credential))
    }

    revoke(): Promise<void> {
        return this.credentialRepository.get()
            .then(credential => {
                if (credential) {
                    return Promise.all<any>([
                        this.doRevokeToken(credential.refresh_token),
                        this.credentialRepository.delete()
                    ]).then(() => null)
                } else {
                    return null
                }
            })
    }

    private doAuthenticate(windowOpener: IWindowOpener): Promise<feedly.AuthenticateResponse> {
        const { client_id, redirect_uri, scope } = this.environment
        const escape = encodeURIComponent
        const authUrl = this.environment.endpoint + 'v3/auth/auth' +
            '?response_type=code' +
            '&client_id=' + escape(client_id) +
            '&redirect_uri=' + escape(redirect_uri) +
            '&scope=' + escape(scope)

        return new Promise((resolve, reject) => {
            return windowOpener.open(authUrl, (url, close) => {
                if (url.indexOf(redirect_uri) !== 0) return

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
    }

    private doRefreshToken(refresh_token: string): Promise<feedly.RefreshTokenResponse> {
        const { client_id, client_secret } = this.environment
        return this.gateway.refreshToken({
                refresh_token,
                client_id,
                client_secret,
                grant_type: 'refresh_token'
            })
    }

    private doExchangeToken(code: string): Promise<feedly.ExchangeTokenResponse> {
        const { client_id, client_secret, redirect_uri } = this.environment
        return this.gateway.exchangeToken({
            code,
            client_id,
            client_secret,
            redirect_uri,
            grant_type: 'authorization_code'
        })
    }

    private doRevokeToken(refresh_token: string): Promise<feedly.RevokeTokenResponse> {
        const { client_id, client_secret, redirect_uri } = this.environment
        return this.gateway.revokeToken({
            refresh_token,
            client_id,
            client_secret,
            grant_type: 'revoke_token'
        })
    }

    private expiresToken(credential: feedly.Credential): boolean {
        return credential.authorized + (credential.expires_in * 1000) < this.clock.now()
    }
}
