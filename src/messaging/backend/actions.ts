import * as feedly from 'adapters/feedly/types';
import * as feedlyApi from 'adapters/feedly/api';
import { AsyncThunk } from 'messaging/types';

export function authenticate(): AsyncThunk {
    return async ({ dispatch, getState }, { environment }) => {
        const url = feedlyApi.createAuthUrl({
            client_id: environment.clientId,
            redirect_uri: environment.redirectUri,
            response_type: 'code',
            scope: environment.scope
        });

        dispatch({
            type: 'BACKEND_AUTHENTICATING'
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
                type: 'BACKEND_AUTHENTICATED',
                exportUrl: feedlyApi.createExportOpmlUrl(token.access_token),
                authenticatedAt: Date.now(),
                token
            });
        } catch (error) {
            dispatch({
                type: 'BACKEND_AUTHENTICATING_FAILED'
            });

            throw error;
        }
    };
}

export function revokeToken(): AsyncThunk {
    return async ({ dispatch, getState }, { environment }) => {
        dispatch({
            type: 'TOKEN_REVOKING'
        });

        let { backend } = getState();
        let token = backend.token as feedly.ExchangeTokenResponse;

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

export function getFeedlyToken(): AsyncThunk<feedly.ExchangeTokenResponse> {
    return async ({ dispatch, getState }, { environment }) => {
        const { backend } = getState();
        let originalToken = backend.token as feedly.ExchangeTokenResponse;

        if (!originalToken) {
            throw new Error('Not authenticated yet');
        }

        const now = Date.now();
        const expiredAt = backend.authenticatedAt + (originalToken.expires_in * 1000);
        const isExpired = expiredAt < now + 1000 * 60;

        if (!isExpired) {
            return originalToken;
        }

        const refreshToken = await feedlyApi.refreshToken({
            refresh_token: originalToken.refresh_token,
            client_id: environment.clientId,
            client_secret: environment.clientSecret,
            grant_type: 'refresh_token'
        });

        const token = {
            ...originalToken,
            ...refreshToken
        };

        dispatch({
            type: 'BACKEND_AUTHENTICATED',
            exportUrl: feedlyApi.createExportOpmlUrl(token.access_token),
            authenticatedAt: now,
            token
        });

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
