import React, { PureComponent } from 'react';
import Enumerable from '@emonkak/enumerable';

import '@emonkak/enumerable/extensions/groupJoin';
import '@emonkak/enumerable/extensions/select';
import '@emonkak/enumerable/extensions/toArray';

import FeedComponent from 'components/parts/Feed';
import FeedPlaceholder from 'components/parts/FeedPlaceholder';
import Navbar from 'components/parts/Navbar';
import bindActions from 'utils/flux/bindActions';
import connect from 'utils/flux/react/connect';
import { Category, Search, State, Subscription } from 'messaging/types';
import { searchFeeds } from 'messaging/search/actions';
import { createCategory, subscribeFeed, unsubscribeFeed } from 'messaging/subscription/actions';

interface SearchProps {
    categories: Category[];
    onCreateCategory: typeof createCategory;
    onSearchFeeds: typeof searchFeeds;
    onSubscribeFeed: typeof subscribeFeed;
    onToggleSidebar: () => void;
    onUnsubscribeFeed: typeof unsubscribeFeed;
    search: Search;
    subscriptions: Subscription[];
}

class SearchPage extends PureComponent<SearchProps, {}> {
    private searchInput: HTMLInputElement | null = null;

    constructor(props: SearchProps, context: {}) {
        super(props, context);

        this.handleSearch = this.handleSearch.bind(this);
    }

    handleSearch(event: React.SyntheticEvent<any>) {
        event.preventDefault();

        if (this.searchInput && this.searchInput.value) {
            const { onSearchFeeds } = this.props;

            onSearchFeeds(this.searchInput.value);
        }
    }

    renderNavbar() {
        const { onToggleSidebar } = this.props;

        return (
            <Navbar onToggleSidebar={onToggleSidebar}>
                <div className="navbar-title">Search for feeds</div>
            </Navbar>
        );
    }

    renderFeeds() {
        const { search } = this.props;

        if (search.isLoading) {
            return (
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
        }

        if (search.isLoaded && search.feeds.length === 0) {
            return (
                <p>Your search "<strong>{search.query}</strong>" did not match any feeds.</p>
            );
        }

        const { categories, onCreateCategory, onSubscribeFeed, onUnsubscribeFeed, subscriptions } = this.props;

        const feeds = new Enumerable(search.feeds)
            .groupJoin(
                subscriptions,
                (feed) => feed.feedId,
                (subscription) => subscription.feedId,
                (feed, subscriptions) => ({ feed, subscription: subscriptions[0] || null })
            )
            .select(({ feed, subscription }) =>
                <FeedComponent key={feed.feedId}
                               categories={categories}
                               feed={feed}
                               subscription={subscription}
                               onCreateCategory={onCreateCategory}
                               onSubscribe={onSubscribeFeed}
                               onUnsubscribe={onUnsubscribeFeed} />)
            .toArray();

        return (
            <ol className="list-group">{feeds}</ol>
        );
    }

    renderContent() {
        const { search } = this.props;

        return (
            <div className="container">
                <h1 className="display-1">Search for feeds to subscribe</h1>
                <form onSubmit={this.handleSearch}>
                    <div className="input-group">
                        <input
                            ref={(element) => this.searchInput = element}
                            className="form-control"
                            type="search"
                            defaultValue={search.query}
                            placeholder="Search by title, URL, or topic" />
                        <button className="button button-positive" type="submit">Search</button>
                    </div>
                </form>
                {this.renderFeeds()}
            </div>
        );
    }

    render() {
        return (
            <div className="l-main">
                <div className="l-main-header">
                    {this.renderNavbar()}
                </div>
                <div className="l-main-content">
                    {this.renderContent()}
                </div>
            </div>
        );
    }
}

export default connect(
    (state: State) => ({
        categories: state.subscriptions.categories,
        search: state.search,
        subscriptions: state.subscriptions.items
    }),
    (dispatch) => bindActions({
        onCreateCategory: createCategory,
        onSearchFeeds: searchFeeds,
        onSubscribeFeed: subscribeFeed,
        onUnsubscribeFeed: unsubscribeFeed
    }, dispatch)
)(SearchPage);
