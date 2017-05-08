import { AsyncEvent, Credential } from 'messaging/types';
import { sendNotification } from 'messaging/notification/actions';
import { authCallback, createAuthUrl, exchangeToken, refreshToken } from 'adapters/feedly/api';

export function authenticate(): AsyncEvent<void> {
    return (dispatch, getState) => {
        const { environment } = getState();

        async function handleRedirectUrl(urlString: string): Promise<void> {
            const response = authCallback(urlString);

            if (response.error) {
                sendNotification(
                    'Authentication failed: ' + response.error,
                    'negative'
                )(dispatch, getState);

                return;
            }

            const token = await exchangeToken({
                code: response.code,
                client_id: environment.clientId,
                client_secret: environment.clientSecret,
                redirect_uri: environment.redirectUri,
                grant_type: 'authorization_code'
            });

            const credential = {
                authorizedAt: new Date().toISOString(),
                token
            };

            dispatch({
                type: 'AUTHENTICATED',
                credential
            });
        }

        const url = createAuthUrl({
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

export function getCredential(): AsyncEvent<Promise<Credential>> {
    return async (dispatch, getState) => {
        let { credential } = getState();

        if (!credential) {
            throw new Error('Not authenticated');
        }

        const now = new Date();
        const expiredAt = new Date(credential.authorizedAt).getTime() + (credential.token.expires_in * 1000);
        const isExpired = expiredAt < now.getTime() + 1000 * 60;

        if (isExpired) {
            const { environment } = getState();
            const token = await refreshToken({
                refresh_token: credential.token.refresh_token,
                client_id: environment.clientId,
                client_secret: environment.clientSecret,
                grant_type: 'refresh_token'
            });

            credential = {
                authorizedAt: now.toISOString(),
                token: {
                    ...credential.token,
                    ...token
                }
            }

            dispatch({
                type: 'AUTHENTICATED',
                credential
            });
        }

        return credential;
    };
}

function observeUrlChanging(window: chrome.windows.Window, callback: (url: string) => void): void {
    function handleUpdateTab(tabId: number, changeInfo: chrome.tabs.TabChangeInfo, tab: chrome.tabs.Tab): void {
        if (tab.windowId === window.id && tab.status === 'complete' && tab.url != null) {
            callback(tab.url)
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
