import { AsyncRoot, BrowserBackend } from 'barebind';
import {
  ConsoleReporter,
  PerformanceProfiler,
} from 'barebind/extras/profiler';
import { prepareSelectors } from 'feedpon-messaging';
import { App } from 'feedpon-view';
import prepareStore from './prepareStore.js';

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

  const container = document.getElementById('app')!;
  const root = AsyncRoot.create(
    App({ getStore }),
    container,
    new BrowserBackend(),
  );

  DEBUG: {
    root.observe(new PerformanceProfiler(new ConsoleReporter()));
  }

  root.mount();
}

main();
