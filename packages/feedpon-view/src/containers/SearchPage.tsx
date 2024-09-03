import React, { useEffect, useMemo, useState } from 'react';

import { type LocationActions, RelativeURL } from '@emonkak/ebit/router.js';
import { bindActions } from 'feedpon-flux';
import { useStore } from 'feedpon-flux/react';
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
import Navbar from '../components/Navbar';
import useEvent from '../hooks/useEvent';
import usePrevious from '../hooks/usePrevious';
import MainLayout from '../layouts/MainLayout';
import FeedComponent from '../modules/Feed';
import FeedPlaceholder from '../modules/FeedPlaceholder';

export interface SearchPageProps {
  query?: string;
  locationActions: LocationActions;
}

export function SearchPage({ query = '', locationActions }: SearchPageProps) {
  const sortedCategoriesSelector = useMemo(
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
  } = useStore({
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
  });

  const previousActiveQuery = usePrevious(activeQuery);
  const [currentQuery, setCurrentQuery] = useState(() => query);

  if (
    previousActiveQuery !== null &&
    activeQuery !== previousActiveQuery &&
    activeQuery !== currentQuery
  ) {
    setCurrentQuery(activeQuery);
  }

  useEffect(() => {
    onSearchFeeds(query);
  }, [query]);

  const handleChange = useEvent(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const query = event.currentTarget.value;
      setCurrentQuery(query);
    },
  );

  const handleSearch = useEvent((event: React.FormEvent<any>) => {
    event.preventDefault();

    if (currentQuery !== '') {
      locationActions.navigate(
        new RelativeURL('/search/' + encodeURIComponent(currentQuery)),
        { replace: true },
      );
    }
  });

  const navbar = (
    <Navbar onToggleSidebar={onToggleSidebar}>
      <div className="navbar-title">Search</div>
    </Navbar>
  );

  let feedList: React.ReactElement | null = null;

  if (query !== activeQuery) {
    feedList = null;
  } else if (isLoading) {
    feedList = (
      <ol className="list-group">
        <FeedPlaceholder />
        <FeedPlaceholder />
        <FeedPlaceholder />
        <FeedPlaceholder />
        <FeedPlaceholder />
        <FeedPlaceholder />
        <FeedPlaceholder />
        <FeedPlaceholder />
        <FeedPlaceholder />
        <FeedPlaceholder />
      </ol>
    );
  } else if (isLoaded && feeds.length === 0) {
    feedList = (
      <p>
        Your search "<strong>{activeQuery}</strong>" did not match any feeds.
      </p>
    );
  } else {
    feedList = (
      <ol className="list-group">
        {feeds.map((feed) => (
          <FeedComponent
            categories={categories}
            feed={feed}
            key={feed.feedId}
            onAddToCategory={onAddToCategory}
            onCreateCategory={onCreateCategory}
            onRemoveFromCategory={onRemoveFromCategory}
            onSubscribe={onSubscribe}
            onUnsubscribe={onUnsubscribe}
            subscription={subscriptions[feed.streamId]!}
          />
        ))}
      </ol>
    );
  }

  return (
    <MainLayout header={navbar}>
      <div className="container u-margin-top-2 u-margin-bottom-4">
        <h1 className="display-1">Search for feeds to subscribe</h1>
        <form className="form" onSubmit={handleSearch}>
          <div className="input-group">
            <input
              type="search"
              className="form-control"
              onChange={handleChange}
              placeholder="Search by title, URL, or topic"
              value={currentQuery}
            />
            <button type="submit" className="button button-positive">
              Search
            </button>
          </div>
        </form>
        {feedList}
      </div>
    </MainLayout>
  );
}
