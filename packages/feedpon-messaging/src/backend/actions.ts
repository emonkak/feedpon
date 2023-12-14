import * as feedly from 'feedpon-adapters/feedly';
import type { AsyncThunk } from '../index';

export function authenticate(): AsyncThunk {
    return async ({ dispatch }, { environment }) => {
        const url = feedly.createAuthUrl({
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
            const response = feedly.authCallback(redirectUrl);

            if (response.error) {
                throw new Error(response.error);
            }

            const token = await feedly.exchangeToken({
                code: response.code,
                client_id: environment.clientId,
                client_secret: environment.clientSecret,
                redirect_uri: environment.redirectUri,
                grant_type: 'authorization_code'
            });

            dispatch({
                type: 'BACKEND_AUTHENTICATED',
                exportUrl: feedly.createExportOpmlUrl(token.access_token),
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

export function logout(): AsyncThunk {
    return async ({ dispatch, getState }) => {
        dispatch({
            type: 'TOKEN_REVOKING'
        });

        let { backend } = getState();
        let token = backend.token as feedly.ExchangeTokenResponse;

        try {
            if (token) {
                await feedly.logout(token.access_token);
            }
        } finally {
            dispatch({
                type: 'TOKEN_REVOKED'
            });
        }
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

        try {
            const refreshToken = await feedly.refreshToken({
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
                exportUrl: feedly.createExportOpmlUrl(token.access_token),
                authenticatedAt: now,
                token
            });

            return token;
        } catch (error) {
            dispatch({
                type: 'TOKEN_REVOKED'
            });

            throw error;
        }
    };
}

function openWindow(url: string, onTransition: (url: string) => boolean): Promise<string> {
    if (typeof chrome === 'object') {
        return chromeOpenWindow(url, onTransition);
    }
    return Promise.reject(new Error('Can not open the window in this platform.'));
}

function chromeOpenWindow(url: string, onTransition: (url: string) => boolean): Promise<string> {
    return new Promise<string>((resolve, reject) => {
        chrome.windows.create({ url, type: 'popup' }, (window) => {
            if (window == null) {
                reject(new Error('Failed to create the window'));
            }

            const handleUpdateTab = (_tabId: number, _changeInfo: chrome.tabs.TabChangeInfo, tab: chrome.tabs.Tab) => {
                if (tab.windowId === window!.id && tab.status === 'complete' && tab.url != null) {
                    if (onTransition(tab.url)) {
                        unregisterListeners();
                        chrome.windows.remove(window!.id);
                        resolve(tab.url);
                    }
                }
            };

            const handleRemoveWindow = (windowId: number) => {
                if (windowId === window!.id) {
                    unregisterListeners();
                    reject(new Error('Authentication was not completed.'));
                }
            };

            const unregisterListeners = () => {
                chrome.tabs.onUpdated.removeListener(handleUpdateTab);
                chrome.windows.onRemoved.removeListener(handleRemoveWindow);
            };

            chrome.tabs.onUpdated.addListener(handleUpdateTab);
            chrome.windows.onRemoved.addListener(handleRemoveWindow);
        });
    });
}
