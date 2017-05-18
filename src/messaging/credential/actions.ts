import * as feedly from 'adapters/feedly/types';
import * as feedlyApi from 'adapters/feedly/api';
import { AsyncEvent } from 'messaging/types';
import { sendNotification } from 'messaging/notification/actions';

export function authenticate(): AsyncEvent {
    return (dispatch, getState, { environment }) => {
        async function handleRedirectUrl(urlString: string): Promise<void> {
            const response = feedlyApi.authCallback(urlString);

            if (response.error) {
                dispatch(sendNotification(
                    'Authentication failed: ' + response.error,
                    'negative'
                ));

                return;
            }

            const token = await feedlyApi.exchangeToken({
                code: response.code,
                client_id: environment.clientId,
                client_secret: environment.clientSecret,
                redirect_uri: environment.redirectUri,
                grant_type: 'authorization_code'
            });

            dispatch({
                type: 'AUTHENTICATED',
                authorizedAt: new Date().toISOString(),
                token
            });
        }

        const url = feedlyApi.createAuthUrl({
            client_id: environment.clientId,
            redirect_uri: environment.redirectUri,
            response_type: 'code',
            scope: environment.scope
        });

        chrome.windows.create({ url, type: 'popup' }, (window: chrome.windows.Window) => {
            observeUrlChanging(window, (url: string) => {
                if (!url.startsWith(environment.redirectUri)) {
                    return;
                }

                chrome.windows.remove(window.id);

                handleRedirectUrl(url);
            });
        });
    };
}

export function getFeedlyToken(): AsyncEvent<Promise<feedly.ExchangeTokenResponse>> {
    return async (dispatch, getState, { environment }) => {
        let { credential } = getState();

        if (!credential.token || !credential.authorizedAt) {
            throw new Error('Not authenticated');
        }

        let token = credential.token as feedly.ExchangeTokenResponse;

        const now = new Date();
        const expiredAt = new Date(credential.authorizedAt).getTime() + (token.expires_in * 1000);
        const isExpired = expiredAt < now.getTime() + 1000 * 60;

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
                type: 'AUTHENTICATED',
                authorizedAt: now.toISOString(),
                token
            });
        }

        return token;
    };
}

function observeUrlChanging(window: chrome.windows.Window, callback: (url: string) => void): void {
    function handleUpdateTab(tabId: number, changeInfo: chrome.tabs.TabChangeInfo, tab: chrome.tabs.Tab): void {
        if (tab.windowId === window.id && tab.status === 'complete' && tab.url != null) {
            callback(tab.url);
        }
    }

    function handleRemoveWindow(windowId: number): void {
        if (windowId === window.id) {
            unregisterListeners();
        }
    }

    function unregisterListeners(): void {
        chrome.tabs.onUpdated.removeListener(handleUpdateTab);
        chrome.windows.onRemoved.removeListener(handleRemoveWindow);
    }

    chrome.tabs.onUpdated.addListener(handleUpdateTab);
    chrome.windows.onRemoved.addListener(handleRemoveWindow);
}
