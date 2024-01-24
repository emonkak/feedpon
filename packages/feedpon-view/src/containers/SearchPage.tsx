import React, { useState, useEffect } from 'react';
import { useParams, useHistory } from 'react-router';

import FeedComponent from '../modules/Feed';
import FeedPlaceholder from '../modules/FeedPlaceholder';
import MainLayout from '../layouts/MainLayout';
import Navbar from '../components/Navbar';
import { bindActions } from 'feedpon-flux';
import connect from 'feedpon-flux/react/connect';
import type { Category, Feed, State, Subscription } from 'feedpon-messaging';
import {
  addToCategory,
  removeFromCategory,
  subscribe,
  unsubscribe,
} from 'feedpon-messaging/subscriptions';
import {
  createCategory,
  createSortedCategoriesSelector,
} from 'feedpon-messaging/categories';
import { searchFeeds } from 'feedpon-messaging/search';
import { toggleSidebar } from 'feedpon-messaging/ui';
import useEvent from '../hooks/useEvent';
import usePrevious from '../hooks/usePrevious';

interface SearchPageProps {
  activeQuery: string;
  categories: Category[];
  feeds: Feed[];
  isLoaded: boolean;
  isLoading: boolean;
  onAddToCategory: typeof addToCategory;
  onCreateCategory: typeof createCategory;
  onRemoveFromCategory: typeof removeFromCategory;
  onSearchFeeds: typeof searchFeeds;
  onSubscribe: typeof subscribe;
  onToggleSidebar: typeof toggleSidebar;
  onUnsubscribe: typeof unsubscribe;
  subscriptions: { [key: string]: Subscription };
}

function SearchPage({
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
}: SearchPageProps) {
  const params = useParams<{ query: string }>();
  const history = useHistory();

  const previousActiveQuery = usePrevious(activeQuery);
  const [currentQuery, setCurrentQuery] = useState(() =>
    decodeURIComponent(params.query ?? ''),
  );

  if (activeQuery !== previousActiveQuery) {
    setCurrentQuery(activeQuery);
  }

  useEffect(() => {
    onSearchFeeds(params.query);
  }, [params.query]);

  const handleChange = useEvent(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const query = event.currentTarget.value;
      setCurrentQuery(query);
    },
  );

  const handleSearch = useEvent((event: React.FormEvent<any>) => {
    event.preventDefault();

    if (currentQuery !== '') {
      history.replace('/search/' + encodeURIComponent(currentQuery));
    }
  });

  const navbar = (
    <Navbar onToggleSidebar={onToggleSidebar}>
      <div className="navbar-title">Search</div>
    </Navbar>
  );

  let feedList;

  if (decodeURIComponent(params.query) !== activeQuery) {
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
              autoFocus
              className="form-control"
              onChange={handleChange}
              placeholder="Search by title, URL, or topic"
              type="search"
              value={currentQuery}
            />
            <button className="button button-positive" type="submit">
              Search
            </button>
          </div>
        </form>
        {feedList}
      </div>
    </MainLayout>
  );
}

export default connect(() => {
  const sortedCategoriesSelector = createSortedCategoriesSelector();

  return {
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
  };
})(SearchPage);
