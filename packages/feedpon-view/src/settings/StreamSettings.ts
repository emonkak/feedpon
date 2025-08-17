import { createComponent, type RenderContext } from 'barebind';
import { LocalAtom } from 'barebind/extras/hooks';
import { bindActions } from 'feedpon-flux';
import { getStoreHook } from 'feedpon-flux/barebind.ts';
import type { State, StreamViewKind } from 'feedpon-messaging';
import {
  changeDefaultStreamFetchOptions,
  changeDefaultStreamView,
  changeStreamCacheCapacity,
  changeStreamHistoryOptions,
  clearStreamCaches,
} from 'feedpon-messaging/streams';
import { openAlertDialog } from '../primitives/AlertDialog.ts';

export interface StreamSettingsProps {}

export const StreamSettings = createComponent(function StreamSettings(
  {}: StreamSettingsProps,
  $: RenderContext,
): unknown {
  const {
    cacheCapacity: initialCacheCapacity,
    fetchOptions: initialFetchOptions,
    numStreamHistories: initialNumStreamHistories,
    onChangeDefaultStreamFetchOptions,
    onChangeDefaultStreamView,
    onChangeStreamHistoryOptions,
    onChangeStreamCacheCapacity,
    onClearStreamCaches,
    streamView: initialStreamView,
  } = $.use(
    getStoreHook({
      mapStateToProps: (state: State) => ({
        cacheCapacity: state.streams.items.capacity,
        fetchOptions: state.streams.defaultFetchOptions,
        numStreamHistories: state.histories.recentlyReadStreams.capacity,
        streamView: state.streams.defaultStreamView,
      }),
      mapDispatchToProps: bindActions({
        onChangeDefaultStreamFetchOptions: changeDefaultStreamFetchOptions,
        onChangeDefaultStreamView: changeDefaultStreamView,
        onChangeStreamCacheCapacity: changeStreamCacheCapacity,
        onChangeStreamHistoryOptions: changeStreamHistoryOptions,
        onClearStreamCaches: clearStreamCaches,
      }),
    }),
  );

  const [fetchOptions, setFetchOptions] = $.useState(initialFetchOptions);
  const cacheCapacity$ = $.use(LocalAtom(initialCacheCapacity));
  const numStreamHistories$ = $.use(LocalAtom(initialNumStreamHistories));
  const streamView$ = $.use(LocalAtom(initialStreamView));

  const handleChangeNumStreamHistories = $.useCallback((event: Event) => {
    numStreamHistories$.value = (
      event.currentTarget as HTMLInputElement
    ).valueAsNumber;
  }, []);

  const handleChangeCacheCapacity = $.useCallback((event: Event) => {
    cacheCapacity$.value = (
      event.currentTarget as HTMLInputElement
    ).valueAsNumber;
  }, []);

  const handleChangeFetchOptions = $.useCallback((event: Event) => {
    const target = event.currentTarget as HTMLInputElement;
    const name = target.name;
    const value = target.type === 'checkbox' ? target.checked : target.value;

    setFetchOptions((fetchOptions) => ({
      ...fetchOptions,
      [name]: value,
    }));
  }, []);

  const handleChangeStreamView = $.useCallback((event: Event) => {
    streamView$.value = (event.currentTarget as HTMLInputElement)
      .value as StreamViewKind;
  }, []);

  const handleSubmitFetchOptions = $.useCallback(
    (event: SubmitEvent) => {
      event.preventDefault();
      onChangeDefaultStreamFetchOptions(fetchOptions);
    },
    [onChangeDefaultStreamFetchOptions],
  );

  const handleSubmitStreamView = $.useCallback(
    (event: SubmitEvent) => {
      event.preventDefault();
      onChangeDefaultStreamView(streamView$.value);
    },
    [onChangeDefaultStreamView],
  );

  const handleSubmitHistoryOptions = $.useCallback(
    (event: SubmitEvent) => {
      event.preventDefault();
      onChangeStreamHistoryOptions(numStreamHistories$.value);
    },
    [onChangeStreamHistoryOptions],
  );

  const handleSubmitCacheCapacity = $.useCallback(
    (event: SubmitEvent) => {
      event.preventDefault();
      onChangeStreamCacheCapacity(cacheCapacity$.value);
    },
    [onChangeStreamCacheCapacity],
  );

  const handleClearStreamCaches = $.useCallback(() => {
    openAlertDialog({
      confirmButton: ({ onConfirm }, context) => context.html`
          <button class="button button-negative" type="button" @click=${onConfirm}>Clear</button>
        `,
      cancelButton: ({ onCancel }, context) => context.html`
          <button class="button button-outline-default" type="button" @click=${onCancel}>Cancel</button>
        `,
      onConfirm: () => {
        onClearStreamCaches();
      },
      title: 'Clear stream caches',
      message: 'Are you sure you want to clear stream caches?',
    });
  }, [onClearStreamCaches]);

  return $.html`
    <section class="section">
      <h1 class="display-1">Stream</h1>
      <form class="form" @submit=${handleSubmitFetchOptions}>
        <div class="form-legend">Fetch options</div>
        <div class="form-group">
          <label>
            <div class="form-group-heading">
              Default fetch number of entries
            </div>
            <input
              class="form-control"
              max="1000"
              min="1"
              name="numEntries"
              required
              type="number"
              value=${fetchOptions.numEntries}
              @change=${handleChangeFetchOptions}
            >
          </label>
        </div>
        <div class="form-group">
          <label class="form-check-label">
            <input
              checked=${fetchOptions.onlyUnread}
              class="form-check"
              name="onlyUnread"
              type="checkbox"
              @change=${handleChangeFetchOptions}
            >
            Display only unread entries on default
          </label>
        </div>
        <div class="form-group">
          <div class="form-group-heading">Default entry order</div>
          <label class="form-check-label">
            <input
              checked=${fetchOptions.entryOrder === 'newest'}
              class="form-check"
              name="entryOrder"
              required
              type="radio"
              value="newest"
              @change=${handleChangeFetchOptions}
            >
            Newest
          </label>
          <label class="form-check-label">
            <input
              checked=${fetchOptions.entryOrder === 'oldest'}
              class="form-check"
              name="entryOrder"
              required
              type="radio"
              value="oldest"
              @change=${handleChangeFetchOptions}
            >
            Oldest
          </label>
        </div>
        <div class="form-group">
          <button type="submit" class="button button-outline-positive">
            Save
          </button>
        </div>
      </form>
      <form class="form" @submit=${handleSubmitStreamView}>
        <div class="form-legend">Default stream view</div>
        <div class="form-group">
          <label class="form-check-label">
            <input
              checked=${streamView$.map((value) => value === 'expanded')}
              class="form-check"
              name="defaultStreamView"
              required
              type="radio"
              value="expanded"
              @change=${handleChangeStreamView}
            >
            Expanded
          </label>
          <label class="form-check-label">
            <input
              checked=${streamView$.map((value) => value === 'collapsible')}
              class="form-check"
              name="defaultStreamView"
              required
              type="radio"
              value="collapsible"
              @change=${handleChangeStreamView}
            >
            Collapsible
          </label>
        </div>
        <div class="form-group">
          <button type="submit" class="button button-outline-positive">
            Save
          </button>
        </div>
      </form>
      <form class="form" @submit=${handleSubmitCacheCapacity}>
        <div class="form-legend">Cache options</div>
        <div class="form-group">
          <label>
            <div class="form-group-heading">Cache capacity</div>
            <div class="input-group">
              <input
                class="form-control"
                min="1"
                required
                type="number"
                $value=${cacheCapacity$}
                @change=${handleChangeCacheCapacity}
              >
              <button type="submit" class="button button-outline-positive">
                Save
              </button>
            </div>
          </label>
        </div>
        <div class="form-group">
          <button
            type="button"
            class="button button-outline-negative"
            @click=${handleClearStreamCaches}
          >
            Clear stream caches...
          </button>
        </div>
      </form>
      <form class="form" @submit=${handleSubmitHistoryOptions}>
        <div class="form-legend">History options</div>
        <div class="form-group">
          <label>
            <div class="form-group-heading">
              Number of stream histories to display
            </div>
            <div class="input-group">
              <input
                class="form-control"
                min="1"
                name="numStreamHistories"
                required
                type="number"
                $value=${numStreamHistories$}
                @change=${handleChangeNumStreamHistories}
              >
              <button type="submit" class="button button-outline-positive">
                Save
              </button>
            </div>
          </label>
        </div>
      </form>
    </section>
  `;
});
