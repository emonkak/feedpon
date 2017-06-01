import Enumerable from '@emonkak/enumerable';
import React, { PureComponent } from 'react';
import { History } from 'history';
import { Params } from 'react-router/lib/Router';

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
import { createCategory, subscribeFeed, unsubscribeFeed } from 'messaging/subscriptions/actions';

interface SearchPageProps {
    categories: Category[];
    onCreateCategory: typeof createCategory;
    onSearchFeeds: typeof searchFeeds;
    onSubscribeFeed: typeof subscribeFeed;
    onToggleSidebar: () => void;
    onUnsubscribeFeed: typeof unsubscribeFeed;
    params: Params;
    router: History;
    search: Search;
    subscriptions: Subscription[];
}

class SearchPage extends PureComponent<SearchPageProps, {}> {
    private searchInput: HTMLInputElement;

    constructor(props: SearchPageProps, context: {}) {
        super(props, context);

        this.handleSearch = this.handleSearch.bind(this);
    }

    componentWillMount() {
        const { onSearchFeeds, params, search } = this.props;

        if (params['query'] && params['query'] !== search.query) {
            onSearchFeeds(params['query']);
        }
    }

    componentWillReceiveProps(nextProps: SearchPageProps) {
        const { onSearchFeeds, search } = nextProps;

        if (nextProps.params['query'] !== search.query) {
            const query = nextProps.params['query'] || '';

            this.searchInput.value = query;

            if (query) {
                onSearchFeeds(query);
            }
        }
    }

    handleSearch(event: React.SyntheticEvent<any>) {
        event.preventDefault();

        if (this.searchInput.value) {
            const { onSearchFeeds, router } = this.props;
            const query = this.searchInput.value;

            onSearchFeeds(query);

            router.replace('/search/' + encodeURIComponent(query));
        }
    }

    renderNavbar() {
        const { onToggleSidebar } = this.props;

        return (
            <Navbar onToggleSidebar={onToggleSidebar}>
                <div className="navbar-title">Search</div>
            </Navbar>
        );
    }

    renderFeeds() {
        const { params, search } = this.props;

        if (params['query'] !== search.query) {
            return null;
        }

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
        const { params } = this.props;

        return (
            <div className="container">
                <h1 className="display-1">Search for feeds to subscribe</h1>
                <form onSubmit={this.handleSearch}>
                    <div className="input-group">
                        <input autoFocus
                               ref={(element) => this.searchInput = element}
                               className="form-control"
                               type="search"
                               defaultValue={params['query'] || ''}
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
        categories: state.subscriptions.categories.items,
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
