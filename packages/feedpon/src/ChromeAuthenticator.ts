import type {
  FeedlyAuthCode,
  FeedlyAuthenticator,
} from 'feedpon-store/apis/feedly';

export class ChromeAuthenticator implements FeedlyAuthenticator {
  async authenticate(
    authenticationUrl: string,
    redirectUrl: string,
  ): Promise<FeedlyAuthCode> {
    const window = await chrome.windows.create({
      url: authenticationUrl,
      type: 'popup',
    });

    if (window === undefined) {
      throw new Error('Failed to create the window');
    }

    return new Promise((resolve, reject) => {
      const handleTabUpdated = (
        _tabId: number,
        _changeInfo: chrome.tabs.OnUpdatedInfo,
        tab: chrome.tabs.Tab,
      ) => {
        if (
          tab.windowId === window.id &&
          tab.status === 'complete' &&
          tab.url !== undefined &&
          tab.url.startsWith(redirectUrl)
        ) {
          unregisterListeners();
          chrome.windows.remove(window.id);
          const url = new URL(tab.url);
          if (url.searchParams.has('error')) {
            reject(
              new Error(
                'An error occurred while authenticating: ' +
                  url.searchParams.get('error'),
              ),
            );
          } else if (!url.searchParams.has('code')) {
            reject(new Error('Authentication has been failed.'));
          } else {
            resolve(url.searchParams.get('code')!);
          }
        }
      };

      const handleWindowRemoved = (windowId: number) => {
        if (windowId === window.id) {
          unregisterListeners();
          reject(new Error('Authentication has been aborted.'));
        }
      };

      const unregisterListeners = () => {
        chrome.tabs.onUpdated.removeListener(handleTabUpdated);
        chrome.windows.onRemoved.removeListener(handleWindowRemoved);
      };

      chrome.tabs.onUpdated.addListener(handleTabUpdated);
      chrome.windows.onRemoved.addListener(handleWindowRemoved);
    });
  }
}
