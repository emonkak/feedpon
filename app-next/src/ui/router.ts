import type { VElement } from 'barebind';
import { decoded, Router, route } from 'barebind/addons/router';
import { startSession } from '../state/actions.ts';
import type { AppStore } from '../state/store.ts';
import { IndexPage } from './index/IndexPage.ts';
import { StreamPage } from './stream/StreamPage.ts';

export type Loader = (
  store: AppStore,
  signal: AbortSignal,
) => Promise<VElement>;

export const router = new Router<Loader>([
  route([''], () => async () => {
    return IndexPage({});
  }),
  route(['streams', decoded], ([streamId]) => async (store, signal) => {
    const session = await store.dispatch(startSession(streamId, signal));
    return StreamPage({ session });
  }),
]);
