import * as feedly from './interfaces';
import Gateway from './Gateway';
import Inject from '../../shared/di/annotations/Inject';
import { IClock } from '../clock/interfaces';
import { IWindowOpener } from '../window/interfaces';
import { ScalarObservable } from 'rxjs/observable/ScalarObservable';
import { _throw } from 'rxjs/observable/throw';
import { empty } from 'rxjs/observable/empty';

import 'rxjs/add/operator/concatMap';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/first';
import 'rxjs/add/operator/toPromise';

@Inject
export default class Authenticator {
    constructor(private _credentialRepository: feedly.ICredentialRepository,
                private _clock: IClock,
                private _environment: feedly.IEnvironment,
                private _gateway: Gateway) {
    }

    async getCredential(): Promise<feedly.Credential> {
        const credential = await this._credentialRepository.get();
        if (credential) {
            return this._expiresToken(credential)
                ? this.refresh(credential.refresh_token)
                : credential;
        } else {
            return null;
        }
    }

    async authenticate(windowOpener: IWindowOpener): Promise<feedly.Credential> {
        const authorization = await this._doAuthenticate(windowOpener);
        if (authorization) {
            const token = await this._doExchangeToken(authorization.code);
            const credential = Object.assign({ authorized: this._clock.now() }, token);
            await this._credentialRepository.put(credential);
            return credential;
        } else {
            return null;
        }
    }

    async authorized(): Promise<boolean> {
        const credential = await this._credentialRepository.get();
        return credential && !this._expiresToken(credential);
    }

    async refresh(refreshToken: string): Promise<feedly.Credential> {
        const token = await this._doRefreshToken(refreshToken);
        const credential = Object.assign({
            authorized: this._clock.now(),
            refresh_token: refreshToken
        }, token);
        await this._credentialRepository.put(credential);
        return credential;
    }

    async revoke(): Promise<void> {
        const credential = await this._credentialRepository.get();
        if (credential) {
            await Promise.all<any>([
                this._doRevokeToken(credential.refresh_token),
                this._credentialRepository.delete()
            ]);
        }
    }

    private _doAuthenticate(windowOpener: IWindowOpener): Promise<feedly.AuthenticateResponse> {
        const { client_id, redirect_uri, scope } = this._environment;
        const escape = encodeURIComponent;
        const authUrl = this._environment.endpoint + 'v3/auth/auth' +
            '?response_type=code' +
            '&client_id=' + escape(client_id) +
            '&redirect_uri=' + escape(redirect_uri) +
            '&scope=' + escape(scope);

        return windowOpener.open(authUrl)
            .filter(url => url.indexOf(redirect_uri) === 0)
            .concatMap(url => {
                const matchesForCode = url.match(/[?&]code=([^&]*)/);
                const matchesForError = url.match(/[?&]error=([^&]*)/);
                const matchesForState = url.match(/[?&]state=([^&]*)/);

                if (matchesForCode) {
                    return ScalarObservable.create({
                        code: matchesForCode[1],
                        state: matchesForState ? matchesForState[1] : null
                    });
                } else if (matchesForError) {
                    return _throw({
                        error: matchesForError[1],
                        state: matchesForState ? matchesForState[1] : null
                    });
                } else {
                    return empty();
                }
            })
            .first()
            .toPromise();
    }

    private _doRefreshToken(refresh_token: string): Promise<feedly.RefreshTokenResponse> {
        const { client_id, client_secret } = this._environment;
        return this._gateway.refreshToken({
            refresh_token,
            client_id,
            client_secret,
            grant_type: 'refresh_token'
        });
    }

    private _doExchangeToken(code: string): Promise<feedly.ExchangeTokenResponse> {
        const { client_id, client_secret, redirect_uri } = this._environment;
        return this._gateway.exchangeToken({
            code,
            client_id,
            client_secret,
            redirect_uri,
            grant_type: 'authorization_code'
        });
    }

    private _doRevokeToken(refresh_token: string): Promise<feedly.RevokeTokenResponse> {
        const { client_id, client_secret } = this._environment;
        return this._gateway.revokeToken({
            refresh_token,
            client_id,
            client_secret,
            grant_type: 'revoke_token'
        });
    }

    private _expiresToken(credential: feedly.Credential): boolean {
        return credential.authorized + (credential.expires_in * 1000) < this._clock.now() + 1000 * 60;
    }
}
