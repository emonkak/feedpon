import type { RenderContext, TemplateResult } from '@emonkak/ebit';
import {
  atom,
  component,
  keyed,
  live,
  nonKeyedList,
} from '@emonkak/ebit/directives.js';
import { type LocationActions, RelativeURL } from '@emonkak/ebit/router.js';
import { bindActions } from 'feedpon-flux';
import { getStoreHook } from 'feedpon-flux/ebit';
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

import { MainLayout } from '../common/MainLayout';
import { Navbar } from '../common/components/Navbar';
import { createPreviousHook } from '../common/hooks/previousHook';
import { FeedView } from './FeedView';

export interface SearchPageProps {
  query?: string;
  locationActions: LocationActions;
}

export function SearchPage(
  { query = '', locationActions }: SearchPageProps,
  context: RenderContext,
): TemplateResult {
  const sortedCategoriesSelector = context.useMemo(
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
  } = context.use(
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

  const previousActiveQuery = context.use(createPreviousHook(activeQuery));
  const currentQuery$ = context.useMemo(() => atom(live(query)), []);

  if (
    previousActiveQuery !== null &&
    activeQuery !== previousActiveQuery &&
    activeQuery !== currentQuery$.value.value
  ) {
    currentQuery$.value = live(activeQuery);
  }

  context.useEffect(() => {
    onSearchFeeds(query);
  }, [query]);

  const handleChange = context.useCallback((event: Event) => {
    const newQuery = (event.currentTarget as HTMLInputElement).value;
    currentQuery$.value = live(newQuery);
  }, []);

  const handleSearch = context.useCallback((event: SubmitEvent) => {
    event.preventDefault();

    if (currentQuery$.value.value !== '') {
      locationActions.navigate(
        new RelativeURL(
          '/search/' + encodeURIComponent(currentQuery$.value.value),
        ),
        { replace: true },
      );
    }
  }, []);

  const header = component(Navbar, {
    onToggleSidebar,
    child: context.html`<div className="navbar-title">Search</div>`,
  });

  let searchResult: unknown;

  if (query !== activeQuery) {
    searchResult = keyed(null, 'unmatched');
  } else if (isLoading) {
    searchResult = keyed(
      'loading',
      context.html`
        <ol className="list-group">
          <${nonKeyedList(
            new Array(10),
            () => context.html`
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
          )}>
        </ol>
      `,
    );
  } else if (isLoaded && feeds.length === 0) {
    searchResult = keyed(
      'not_found',
      context.html`
        <p>Your search "<strong>${activeQuery}</strong>" did not match any feeds.</p>
      `,
    );
  } else {
    searchResult = keyed(
      'loaded',
      context.html`
        <ol class="list-group">
          <${nonKeyedList(feeds, (feed) =>
            component(FeedView, {
              categories,
              feed,
              onAddToCategory,
              onCreateCategory,
              onRemoveFromCategory,
              onSubscribe,
              onUnsubscribe,
              subscription: subscriptions[feed.streamId] ?? null,
            }),
          )}>
        </ol>
      `,
    );
  }

  const content = context.html`
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

  return context.html`<${component(MainLayout, {
    header,
    content,
  })}>`;
}
