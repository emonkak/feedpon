import { BrowserRenderHost, ConcurrentUpdater, createRoot } from '@emonkak/ebit';

import { component } from '@emonkak/ebit/directives.js';
import prepareSelectors from 'feedpon-messaging/prepareSelectors';
import { App } from 'feedpon-view';
import prepareStore from './prepareStore';

function main() {
  const selectors = prepareSelectors();
  const context = {
    environment: {
      endPoint: 'https://cloud.feedly.com',
      clientId: 'feedly',
      clientSecret: '0XP4XQ07VVMDWBKUHTJM4WUQ',
      scope: 'https://cloud.feedly.com/subscriptions',
      redirectUri: 'https://feedly.com/feedly.html',
    },
    selectors,
  };
  const getStore = () => prepareStore(context);

  const host = new BrowserRenderHost();
  const updater = new ConcurrentUpdater();
  const container = document.getElementById('app')!;
  const root = createRoot(component(App, { getStore }), container, {
    host,
    updater,
  });

  root.mount();
}

main();
