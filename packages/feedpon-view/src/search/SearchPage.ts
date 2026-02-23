import { createComponent, type RenderContext, Repeat } from 'barebind';
import { LocalAtom } from 'barebind/addons/signal';
import { AppStore } from 'feedpon-store';
import * as searchActions from 'feedpon-store/actions/search';
import * as subscriptionActions from 'feedpon-store/actions/subscription';
import * as uiActions from 'feedpon-store/actions/ui';
import { BindActionCreators } from 'store';

import { MainLayout } from '../layout/MainLayout.ts';
import { Navbar } from '../primitives/Navbar.ts';
import { SearchResultView } from './SearchResultView.ts';

export interface SearchPageProps {
  query?: string;
}

export const SearchPage = createComponent(function SearchPage(
  { query }: SearchPageProps,
  $: RenderContext,
): unknown {
  const { state$ } = $.use(AppStore);
  const categories = $.use(state$.get('unsortedCategories'));
  const searchQuery = $.use(state$.get('searchQuery'));
  const searchResults = $.use(state$.get('searchResults'));
  const searching = $.use(state$.get('searching'));
  const subscriptions = $.use(state$.get('subscriptions'));

  const query$ = $.use(LocalAtom(query ?? searchQuery));

  const { searchFeeds } = $.use(BindActionCreators(AppStore, searchActions));
  const {
    createSubscription,
    createCategory,
    updateSubscription,
    deleteSubscription,
  } = $.use(BindActionCreators(AppStore, subscriptionActions));
  const { toggleSidebar } = $.use(BindActionCreators(AppStore, uiActions));

  const handleChange = $.useCallback((event: Event) => {
    query$.value = (event.currentTarget as HTMLInputElement).value;
  }, []);

  const handleSearch = $.useCallback((event: SubmitEvent) => {
    event.preventDefault();
    searchFeeds(query$.value);
  }, []);

  const header = Navbar({
    onSidebarToggle: toggleSidebar,
    children: $.html`<div class="navbar-title">Search</div>`,
  });

  let searchResultList: unknown;

  if (searching) {
    searchResultList = $.html`
      <ol className="list-group">
        <${Repeat({
          elementSelector: () => $.html`
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
          source: new Array(10),
        })}>
      </ol>
    `;
  } else if (searchResults !== null) {
    searchResultList =
      searchResults.length > 0
        ? $.html`
          <ol class="list-group">
            <${Repeat({
              elementSelector: (searchResult) =>
                SearchResultView({
                  categories,
                  onCategoryCreate: createCategory,
                  onSubscriptionCreate: createSubscription,
                  onSubscriptionDelete: deleteSubscription,
                  onSubscriptionUpdate: updateSubscription,
                  searchResult,
                  subscription: subscriptions.get(searchResult.feedId) ?? null,
                }),
              source: searchResults,
            })}>
          </ol>
        `
        : $.html`
          <p>Your search "<strong>${searchQuery}</strong>" did not match any feeds.</p>
        `;
  } else {
    searchResultList = null;
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
            $value=${query$}
            @change=${handleChange}
          >
          <button type="submit" class="button button-positive">
            Search
          </button>
        </div>
      </form>
      <${searchResultList}>
    </div>
  `;

  return MainLayout({
    header,
    content,
  });
});
