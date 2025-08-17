import { createComponent, type RenderContext, Repeat } from 'barebind';
import { LocalAtom } from 'barebind/extras/hooks';
import { type HistoryNavigator, RelativeURL } from 'barebind/extras/router';
import { bindActions } from 'feedpon-flux';
import { getStoreHook } from 'feedpon-flux/barebind.ts';
import type { State } from 'feedpon-messaging';
import {
  createCategory,
  createSortedCategoriesSelector,
} from 'feedpon-messaging/categories';
import { searchFeeds } from 'feedpon-messaging/search';
import {
  addToCategory,
  removeFromCategory,
  subscribe,
  unsubscribe,
} from 'feedpon-messaging/subscriptions';
import { toggleSidebar } from 'feedpon-messaging/ui';
import { createPreviousHook } from '../common/hooks/previousHook.ts';
import { MainLayout } from '../common/MainLayout.ts';
import { Navbar } from '../common/Navbar.ts';
import { FeedView } from './FeedView.ts';

export interface SearchPageProps {
  defaultQuery?: string;
  navigator: HistoryNavigator;
}

export const SearchPage = createComponent(function SearchPage(
  { defaultQuery = '', navigator }: SearchPageProps,
  $: RenderContext,
): unknown {
  const sortedCategoriesSelector = $.useMemo(
    () => createSortedCategoriesSelector(),
    [],
  );
  const {
    activeQuery,
    categories,
    feeds,
    isLoaded,
    isLoading,
    onAddToCategory,
    onCreateCategory,
    onRemoveFromCategory,
    onSearchFeeds,
    onSubscribe,
    onToggleSidebar,
    onUnsubscribe,
    subscriptions,
  } = $.use(
    getStoreHook({
      mapStateToProps: (state: State) => ({
        activeQuery: state.search.query,
        categories: sortedCategoriesSelector(state),
        feeds: state.search.feeds,
        isLoaded: state.search.isLoaded,
        isLoading: state.search.isLoading,
        subscriptions: state.subscriptions.items,
      }),
      mapDispatchToProps: bindActions({
        onAddToCategory: addToCategory,
        onCreateCategory: createCategory,
        onRemoveFromCategory: removeFromCategory,
        onSearchFeeds: searchFeeds,
        onSubscribe: subscribe,
        onToggleSidebar: toggleSidebar,
        onUnsubscribe: unsubscribe,
      }),
    }),
  );

  const previousActiveQuery = $.use(createPreviousHook(activeQuery));
  const currentQuery$ = $.use(LocalAtom(defaultQuery));

  if (
    previousActiveQuery !== null &&
    activeQuery !== previousActiveQuery &&
    activeQuery !== currentQuery$.value
  ) {
    currentQuery$.value = activeQuery;
  }

  $.useEffect(() => {
    if (defaultQuery !== '') {
      onSearchFeeds(defaultQuery);
    }
  }, [defaultQuery]);

  const handleChange = $.useCallback((event: Event) => {
    const newValue = (event.currentTarget as HTMLInputElement).value;
    currentQuery$.value = newValue;
  }, []);

  const handleSearch = $.useCallback((event: SubmitEvent) => {
    event.preventDefault();

    if (currentQuery$.value !== '') {
      navigator.navigate(
        new RelativeURL('/search/' + encodeURIComponent(currentQuery$.value)),
        { replace: true },
      );
    }
  }, []);

  const header = Navbar({
    onToggleSidebar,
    children: $.html`<div class="navbar-title">Search</div>`,
  });

  let searchResult: unknown;

  if (activeQuery === '' || activeQuery !== defaultQuery) {
    searchResult = null;
  } else if (isLoading) {
    searchResult = $.html`
      <ol className="list-group">
        <${Repeat({
          source: new Array(10),
          valueSelector: () => $.html`
            <li class="list-group-item">
              <div class="link-strong">
                <span class="placeholder placeholder-40 animation-shining"></span>
              </div>
              <div class="u-text-7">
                <span class="placeholder placeholder-10 animation-shining"></span>
              </div>
              <div class="u-text-muted">
                <span class="placeholder placeholder-100 animation-shining"></span>
                <span class="placeholder placeholder-60 animation-shining"></span>
              </div>
            </li>
          `,
        })}>
      </ol>
    `;
  } else if (isLoaded && feeds.length === 0) {
    searchResult = $.html`
      <p>Your search "<strong>${activeQuery}</strong>" did not match any feeds.</p>
    `;
  } else {
    searchResult = $.html`
      <ol class="list-group">
        <${Repeat({
          source: feeds,
          valueSelector: (feed) =>
            FeedView({
              categories,
              feed,
              onAddToCategory,
              onCreateCategory,
              onRemoveFromCategory,
              onSubscribe,
              onUnsubscribe,
              subscription: subscriptions[feed.streamId] ?? null,
            }),
        })}>
      </ol>
    `;
  }

  const content = $.html`
    <div class="container u-margin-top-2 u-margin-bottom-4">
      <h1 class="display-1">Search for feeds to subscribe</h1>
      <form class="form" @submit=${handleSearch}>
        <div class="input-group">
          <input
            class="form-control"
            placeholder="Search by title, URL, or topic"
            type="search"
            .value=${currentQuery$}
            @change=${handleChange}
          >
          <button type="submit" class="button button-positive">
            Search
          </button>
        </div>
      </form>
      <${searchResult}>
    </div>
  `;

  return MainLayout({
    header,
    content,
  });
});
