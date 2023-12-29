import { createHashHistory } from 'history';
import React from 'react';
import { createRoot } from 'react-dom/client';

import prepareSelectors from 'feedpon-messaging/prepareSelectors';
import Bootstrap from 'feedpon-view/Bootstrap';
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
  const preparingStore = prepareStore(context);

  const element = document.getElementById('app')!;
  const root = createRoot(element);

  root.render(
    <Bootstrap preparingStore={preparingStore} history={hashHistory} />,
  );
}

main();
