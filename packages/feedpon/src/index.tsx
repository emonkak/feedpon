import { ClientRenderHost, ConcurrentUpdater, createRoot } from '@emonkak/ebit';
import { createHashHistory } from 'history';

import { component } from '@emonkak/ebit/directives.js';
import prepareSelectors from 'feedpon-messaging/prepareSelectors';
import { App } from 'feedpon-view';
import prepareStore from './prepareStore';

function main() {
  const hashHistory = createHashHistory();
  const selectors = prepareSelectors();
  const context = {
    environment: {
      endPoint: 'https://cloud.feedly.com',
      clientId: 'feedly',
      clientSecret: '0XP4XQ07VVMDWBKUHTJM4WUQ',
      scope: 'https://cloud.feedly.com/subscriptions',
      redirectUri: 'https://feedly.com/feedly.html',
    },
    router: hashHistory,
    selectors,
  };
  const getStore = () => prepareStore(context);

  const host = new ClientRenderHost();
  const updater = new ConcurrentUpdater();
  const container = document.getElementById('app')!;
  const root = createRoot(
    component(App, { getStore, history: hashHistory }),
    container,
    { host, updater },
  );

  root.mount();
}

main();
