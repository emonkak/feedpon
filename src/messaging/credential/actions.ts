import * as feedly from 'adapters/feedly/types';
import * as feedlyApi from 'adapters/feedly/api';
import { AsyncEvent } from 'messaging/types';

export function authenticate(): AsyncEvent {
    return async ({ dispatch, getState }, { environment }) => {
        const url = feedlyApi.createAuthUrl({
            client_id: environment.clientId,
            redirect_uri: environment.redirectUri,
            response_type: 'code',
            scope: environment.scope
        });

        dispatch({
            type: 'TOKEN_RECEIVING'
        });

        try {
            const redirectUrl = await openWindow(url, (url: string) => url.startsWith(environment.redirectUri));
            const response = feedlyApi.authCallback(redirectUrl);

            if (response.error) {
                throw new Error(response.error);
            }

            const token = await feedlyApi.exchangeToken({
                code: response.code,
                client_id: environment.clientId,
                client_secret: environment.clientSecret,
                redirect_uri: environment.redirectUri,
                grant_type: 'authorization_code'
            });

            dispatch({
                type: 'TOKEN_RECEIVED',
                authorizedAt: Date.now(),
                token
            });
        } catch (error) {
            dispatch({
                type: 'TOKEN_RECEIVING_FAILED'
            });

            throw error;
        }
    };
}

export function revokeToken(): AsyncEvent {
    return async ({ dispatch, getState }, { environment }) => {
        dispatch({
            type: 'TOKEN_REVOKING'
        });

        let { credential } = getState();
        let token = credential.token as feedly.ExchangeTokenResponse;

        if (token) {
            await feedlyApi.revokeToken({
                refresh_token: token.refresh_token,
                client_id: environment.clientId,
                client_secret: environment.clientSecret,
                grant_type: 'revoke_token'
            });
        }

        dispatch({
            type: 'TOKEN_REVOKED'
        });
    };
}

export function getFeedlyToken(): AsyncEvent<feedly.ExchangeTokenResponse> {
    return async ({ dispatch, getState }, { environment }) => {
        let { credential } = getState();
        let token = credential.token as feedly.ExchangeTokenResponse;

        if (!token) {
            throw new Error('Not authenticated yet');
        }

        const now = Date.now();
        const expiredAt = credential.authorizedAt + (token.expires_in * 1000);
        const isExpired = expiredAt < now + 1000 * 60;

        if (isExpired) {
            const refreshToken = await feedlyApi.refreshToken({
                refresh_token: token.refresh_token,
                client_id: environment.clientId,
                client_secret: environment.clientSecret,
                grant_type: 'refresh_token'
            });

            token = {
                ...token,
                ...refreshToken
            };

            dispatch({
                type: 'TOKEN_RECEIVED',
                authorizedAt: now,
                token
            });
        }

        return token;
    };
}

function openWindow(url: string, onTransition: (url: string) => boolean): Promise<string> {
    return new Promise<string>((resolve, reject) => {
        chrome.windows.create({ url, type: 'popup' }, (window) => {
            if (window == null) {
                reject(new Error('Failed to create the window'));
            }

            function handleUpdateTab(tabId: number, changeInfo: chrome.tabs.TabChangeInfo, tab: chrome.tabs.Tab): void {
                if (tab.windowId === window!.id && tab.status === 'complete' && tab.url != null) {
                    if (onTransition(tab.url)) {
                        unregisterListeners();
                        chrome.windows.remove(window!.id);
                        resolve(tab.url);
                    }
                }
            }

            function handleRemoveWindow(windowId: number): void {
                if (windowId === window!.id) {
                    unregisterListeners();
                    reject(new Error('Window did not transition to the expected URL'));
                }
            }

            function unregisterListeners(): void {
                chrome.tabs.onUpdated.removeListener(handleUpdateTab);
                chrome.windows.onRemoved.removeListener(handleRemoveWindow);
            }

            chrome.tabs.onUpdated.addListener(handleUpdateTab);
            chrome.windows.onRemoved.addListener(handleRemoveWindow);
        });
    });
}
