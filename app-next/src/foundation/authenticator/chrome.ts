import type { Authenticator } from './types.ts';

export class ChromeAuthenticator implements Authenticator {
  async authenticate(
    authenticationURL: string,
    redirectURL: string,
  ): Promise<string> {
    const window = await chrome.windows.create({
      url: authenticationURL,
      type: 'popup',
    });

    if (window === undefined) {
      throw new Error('Failed to create an authentication window.');
    }

    try {
      for await (const tab of observeTabs(window.id!)) {
        if (tab.status === 'complete' && tab.url?.startsWith(redirectURL)) {
          const url = new URL(tab.url);
          if (url.searchParams.has('error')) {
            throw new Error(
              'An error occurred while authenticating: ' +
                url.searchParams.get('error'),
            );
          }
          if (!url.searchParams.has('code')) {
            throw new Error('Authentication has been failed.');
          }
          return url.searchParams.get('code')!;
        }
      }
    } finally {
      chrome.windows.remove(window.id!);
    }

    DEBUG: {
      throw new Error('Unreachable');
    }
  }
}

async function* observeTabs(
  targetWindowId: number,
): AsyncGenerator<chrome.tabs.Tab, never> {
  let controller = Promise.withResolvers<chrome.tabs.Tab>();

  const handleTabUpdated = (
    _tabId: number,
    _changeInfo: chrome.tabs.OnUpdatedInfo,
    tab: chrome.tabs.Tab,
  ) => {
    if (tab.windowId === targetWindowId) {
      controller.resolve(tab);
    }
  };

  const handleWindowRemoved = (windowId: number) => {
    if (windowId === targetWindowId) {
      controller.reject(new Error('Authentication has been aborted.'));
    }
  };

  chrome.tabs.onUpdated.addListener(handleTabUpdated);
  chrome.windows.onRemoved.addListener(handleWindowRemoved);

  try {
    while (true) {
      yield await controller.promise;
      controller = Promise.withResolvers();
    }
  } finally {
    chrome.tabs.onUpdated.removeListener(handleTabUpdated);
    chrome.windows.onRemoved.removeListener(handleWindowRemoved);
  }
}
