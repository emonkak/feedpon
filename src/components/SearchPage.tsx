import React, { PureComponent } from 'react';
import { History } from 'history';
import { Params } from 'react-router/lib/Router';

import FeedComponent from 'components/parts/Feed';
import FeedPlaceholder from 'components/parts/FeedPlaceholder';
import MainLayout from 'components/layouts/MainLayout';
import Navbar from 'components/widgets/Navbar';
import bindActions from 'utils/flux/bindActions';
import connect from 'utils/flux/react/connect';
import { Category, Feed, State, Subscription } from 'messaging/types';
import { addToCategory, removeFromCategory, subscribe, unsubscribe } from 'messaging/subscriptions/actions';
import { createSortedCategoriesSelector } from 'messaging/categories/selectors';
import { createCategory } from 'messaging/categories/actions';
import { toggleSidebar } from 'messaging/ui/actions';
import { searchFeeds } from 'messaging/search/actions';

interface SearchPageProps {
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
    params: Params;
    query: string;
    router: History;
    subscriptions: { [key: string]: Subscription };
}

class SearchPage extends PureComponent<SearchPageProps, {}> {
    private searchInput: HTMLInputElement | null = null;

    constructor(props: SearchPageProps, context: {}) {
        super(props, context);

        this.handleSearch = this.handleSearch.bind(this);
    }

    componentWillMount() {
        const { onSearchFeeds, params, query } = this.props;

        if (params['query'] && params['query'] !== query) {
            onSearchFeeds(params['query']);
        }
    }

    componentWillReceiveProps(nextProps: SearchPageProps) {
        if (!this.searchInput) {
            return;
        }

        const { onSearchFeeds, query } = nextProps;

        if (nextProps.params['query'] !== query) {
            const query = nextProps.params['query'] || '';

            this.searchInput.value = query;

            if (query) {
                onSearchFeeds(query);
            }
        }
    }

    handleSearch(event: React.FormEvent<any>) {
        if (!this.searchInput) {
            return;
        }

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
        const { params, query } = this.props;

        if (params['query'] !== query) {
            return null;
        }

        const { isLoading } = this.props;

        if (isLoading) {
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

        const { feeds, isLoaded } = this.props;

        if (isLoaded && feeds.length === 0) {
            return (
                <p>Your search "<strong>{query}</strong>" did not match any feeds.</p>
            );
        }

        const { categories, onAddToCategory, onCreateCategory, onRemoveFromCategory, onSubscribe, onUnsubscribe, subscriptions } = this.props;

        const feedElements = feeds.map((feed) =>
            <FeedComponent
                categories={categories}
                feed={feed}
                key={feed.feedId}
                onAddToCategory={onAddToCategory}
                onCreateCategory={onCreateCategory}
                onRemoveFromCategory={onRemoveFromCategory}
                onSubscribe={onSubscribe}
                onUnsubscribe={onUnsubscribe}
                subscription={subscriptions[feed.streamId]} />
        );

        return (
            <ol className="list-group">
                {feedElements}
            </ol>
        );
    }

    renderContent() {
        const { params } = this.props;

        return (
            <div className="container u-margin-top-2 u-margin-bottom-4">
                <h1 className="display-1">Search for feeds to subscribe</h1>
                <form className="form" onSubmit={this.handleSearch}>
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
            <MainLayout header={this.renderNavbar()}>
                {this.renderContent()}
            </MainLayout>
        );
   }
}

export default connect(() => {
    const sortedCategoriesSelector = createSortedCategoriesSelector();

    return {
        mapStateToProps: (state: State) => ({
            categories: sortedCategoriesSelector(state),
            feeds: state.search.feeds,
            isLoaded: state.search.isLoaded,
            isLoading: state.search.isLoading,
            query: state.search.query,
            subscriptions: state.subscriptions.items
        }),
        mapDispatchToProps: bindActions({
            onAddToCategory: addToCategory,
            onCreateCategory: createCategory,
            onRemoveFromCategory: removeFromCategory,
            onSearchFeeds: searchFeeds,
            onSubscribe: subscribe,
            onToggleSidebar: toggleSidebar,
            onUnsubscribe: unsubscribe
        })
    };
})(SearchPage);
