import type { VElement } from 'barebind';
import { decoded, Router, route } from 'barebind/addons/router';
import { startSession } from '../state/actions.ts';
import type { AppStore } from '../state/store.ts';
import { IndexPage } from './index/index-page.ts';
import { StreamPage } from './stream/stream-page.ts';

export type PageLoader = (
  store: AppStore,
  signal: AbortSignal,
) => Promise<VElement>;

export function createRouter(): Router<PageLoader> {
  return new Router<PageLoader>([
    route([''], () => async () => {
      return IndexPage({});
    }),
    route(['streams', decoded], ([streamId]) => async (store, signal) => {
      const session = await store.dispatch(startSession(streamId, signal));
      return StreamPage({ session });
    }),
  ]);
}
