import {
  $customHook,
  type CustomHookObject,
  type RenderContext,
} from 'barebind';
import type { Difference, Reactive } from 'barebind/extras/reactive';

import type { FeedlyClient } from './apis/feedly.ts';
import type { HatenaBookmarkClient } from './apis/hatenaBookmark.ts';
import type { WedataClient } from './apis/wedata.ts';
import { ImmutableMap } from './collections/ImmutableMap.ts';
import type { Patch, PersistentStore } from './persistent/types.ts';
import { type AuthContext, AuthState } from './states/auth.ts';
import { type SearchContext, SearchState } from './states/search.ts';
import { type StreamContext, StreamState } from './states/stream.ts';
import {
  type SubscriptionContext,
  SubscriptionState,
} from './states/subscription.ts';
import {
  type CommandHandler,
  type CommandId,
  type UIContext,
  UIState,
} from './states/ui.ts';
import { isPromiseLike } from './utils/isPromiseLike.ts';
import { requestPersistentCallback } from './utils/requestPersistentCallback.ts';

export type AppAction<T> = (context: AppContext) => T;

export interface AppContext
  extends AuthContext,
    SearchContext,
    StreamContext,
    SubscriptionContext,
    UIContext {
  feedlyClient: FeedlyClient;
  hatenaBookmarkClient: HatenaBookmarkClient;
  state$: Reactive<AppState>;
  persistentStore: PersistentStore;
  commandHandler: CommandHandler<AppContext>;
  wedataClient: WedataClient;
}

export class AppCommandHandler implements CommandHandler<AppContext> {
  scrollDown({ state$ }: AppContext): void {
    const { scrollDistanceRatio, scrollBehavior } = state$.get('uiState').value;

    scrollBy({
      left: 0,
      top: -document.documentElement.clientHeight / scrollDistanceRatio,
      behavior: scrollBehavior,
    });
  }

  scrollUp({ state$ }: AppContext): void {
    const { scrollDistanceRatio, scrollBehavior } = state$.get('uiState').value;

    scrollBy({
      left: 0,
      top: document.documentElement.clientHeight / scrollDistanceRatio,
      behavior: scrollBehavior,
    });
  }
}

export class AppState {
  readonly authState = new AuthState();
  readonly searchState = new SearchState();
  readonly streamState = new StreamState();
  readonly subscriptionState = new SubscriptionState();
  readonly uiState = new UIState();
  readonly version: number = 1;
}

export class AppStore implements CustomHookObject<void> {
  private readonly _context: AppContext;

  static [$customHook](context: RenderContext): AppStore {
    const value = context.getSharedContext(AppStore);

    if (!(value instanceof AppStore)) {
      throw new Error('AppStore is not registered in this context.');
    }

    return value;
  }

  constructor(context: AppContext) {
    this._context = context;
  }

  [$customHook](context: RenderContext): void {
    context.setSharedContext(this.constructor, this);
  }

  get state$(): Reactive<AppState> {
    return this._context.state$;
  }

  dispatch<TResult>(action: AppAction<TResult>): TResult {
    const { persistentStore, state$ } = this._context;
    const { version } = state$.value;
    const saveStateDifferences = () => {
      const patches = state$
        .takeDifferences()
        .map((difference) => toPatch(difference, version));
      if (patches.length > 0) {
        persistentStore.addPatches(patches);
      }
    };
    const result = action(this._context);
    if (isPromiseLike(result)) {
      result.then(() => {
        requestPersistentCallback(saveStateDifferences);
      });
    } else {
      requestPersistentCallback(saveStateDifferences);
    }
    return result;
  }

  async restoreState(): Promise<void> {
    const { persistentStore, state$ } = this._context;
    const { version } = state$.value;
    const patches = await persistentStore.findPatches();

    for (let i = 0, l = patches.length; i < l; i++) {
      const statePatch = patches[i]!;
      if (statePatch.version === version) {
        const difference = toDifference(statePatch);
        state$.applyDifference(difference);
      }
    }
  }

  invokeCommand<TCommandId extends CommandId>(
    commandId: TCommandId,
  ): ReturnType<CommandHandler<AppContext>[TCommandId]> {
    return this._context.commandHandler[commandId](this._context) as ReturnType<
      CommandHandler<AppContext>[TCommandId]
    >;
  }
}

function toDifference(statePatch: Patch): Difference {
  switch (statePatch.type) {
    case 'ImmutableMap':
      return {
        path: statePatch.path,
        value: ImmutableMap.from(
          statePatch.value as Iterable<[unknown, unknown]>,
        ),
      };
    default:
      return statePatch;
  }
}

function toPatch(difference: Difference, version: number): Patch {
  if (difference.value instanceof ImmutableMap) {
    return {
      path: difference.path,
      value: Array.from(difference.value),
      type: 'ImmutableMap',
      version,
    };
  } else {
    return {
      path: difference.path,
      value: difference.value,
      version,
    };
  }
}
