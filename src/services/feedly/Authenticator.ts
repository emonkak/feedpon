import * as feedly from './types';
import Client from './Client';
import localForage from 'localforage';

const CREDENTIAL = 'CREDENTIAL';

export default class Authenticator {
    constructor(private _client: Client) {
    }

    async getCredential(env: feedly.Environment, now: number): Promise<feedly.Credential> {
        const credential = await localForage.getItem<feedly.Credential>(CREDENTIAL);

        if (!credential) {
            return null;
        }

        if (!this._expiresToken(credential, now)) {
            return credential;
        }

        return await this.refresh(env, credential.refresh_token, now);
    }

    async authenticate(env: feedly.Environment,
                       open: (url: string) => Promise<string>,
                       now: number): Promise<feedly.Credential> {
        const { client_id, client_secret, redirect_uri, scope } = env;

        const authorization = await this._client.authenticate({
            response_type: 'code',
            client_id,
            redirect_uri,
            scope,
        }, open);

        const token = await this._client.exchangeToken({
            code: authorization.code,
            client_id,
            client_secret,
            redirect_uri,
            grant_type: 'authorization_code',
        });

        const credential = Object.assign({ authorized: now }, token);

        await localForage.setItem(CREDENTIAL, credential);

        return credential;
    }

    async refresh(env: feedly.Environment, refreshToken: string, now: number): Promise<feedly.Credential> {
        const { client_id, client_secret } = env;

        const token = await this._client.refreshToken({
            refresh_token: refreshToken,
            client_id,
            client_secret,
            grant_type: 'refresh_token',
        });

        const credential = Object.assign({
            authorized: now,
            refresh_token: refreshToken,
        }, token);

        await localForage.setItem(CREDENTIAL, credential);

        return credential;
    }

    async revoke(env: feedly.Environment): Promise<void> {
        const credential = await localForage.getItem<feedly.Credential>(CREDENTIAL);

        if (credential) {
            const { client_id, client_secret } = env;

            await this._client.revokeToken({
                refresh_token: credential.refresh_token,
                client_id,
                client_secret,
                grant_type: 'revoke_token',
            });

            await localForage.removeItem(CREDENTIAL);
        }
    }

    async isAuthorized(now: number): Promise<boolean> {
        const credential = await localForage.getItem<feedly.Credential>(CREDENTIAL);

        return credential && !this._expiresToken(credential, now);
    }

    private _expiresToken(credential: feedly.Credential, now: number): boolean {
        return credential.authorized + (credential.expires_in * 1000) < now + 1000 * 60;
    }
}
