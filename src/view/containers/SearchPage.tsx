import React, { PureComponent } from 'react';
import { RouteComponentProps } from 'react-router';

import FeedComponent from 'view/modules/Feed';
import FeedPlaceholder from 'view/modules/FeedPlaceholder';
import MainLayout from 'view/layouts/MainLayout';
import Navbar from 'view/components/Navbar';
import bindActions from 'utils/flux/bindActions';
import connect from 'utils/flux/react/connect';
import { Category, Feed, State, Subscription } from 'messaging/types';
import { addToCategory, removeFromCategory, subscribe, unsubscribe } from 'messaging/subscriptions/actions';
import { createCategory } from 'messaging/categories/actions';
import { createSortedCategoriesSelector } from 'messaging/categories/selectors';
import { searchFeeds } from 'messaging/search/actions';
import { toggleSidebar } from 'messaging/ui/actions';

interface SearchPageProps extends RouteComponentProps<{'query': string}> {
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

interface SearchPageState {
    query: string;
    prevActiveQuery: string;
}

class SearchPage extends PureComponent<SearchPageProps, SearchPageState> {
    static getDerivedStateFromProps(props: SearchPageProps, state: SearchPageState) {
        if (props.activeQuery !== state.prevActiveQuery) {
            return {
                query: props.activeQuery,
                prevActiveQuery: props.activeQuery
            };
        }

        return null;
    }

    constructor(props: SearchPageProps) {
        super(props);

        this.state = {
            query: props.match.params['query'] || '',
            prevActiveQuery: props.activeQuery
        };
    }

    componentDidMount() {
        const { activeQuery } = this.props;
        const { query } = this.state;

        if (query !== '' && query !== activeQuery) {
            const { onSearchFeeds } = this.props;

            onSearchFeeds(query);
        }
    }

    componentDidUpdate(prevProps: SearchPageProps) {
        const { match } = this.props;
        const { match: prevMatch } = prevProps;

        if (match.params['query'] && match.params['query'] !== prevMatch.params['query']) {
            const { onSearchFeeds } = this.props;

            onSearchFeeds(match.params['query']);
        }
    }

    render() {
        return (
            <MainLayout header={this.renderNavbar()}>
                {this.renderContent()}
            </MainLayout>
        );
   }

    private renderNavbar() {
        const { onToggleSidebar } = this.props;

        return (
            <Navbar onToggleSidebar={onToggleSidebar}>
                <div className="navbar-title">Search</div>
            </Navbar>
        );
    }

    private renderFeeds() {
        const { activeQuery, match } = this.props;
        if (match.params['query'] !== activeQuery) {
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
                <p>Your search "<strong>{activeQuery}</strong>" did not match any feeds.</p>
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
            <ol className="list-group">{feedElements}</ol>
        );
    }

    private renderContent() {
        const { query } = this.state;

        return (
            <div className="container u-margin-top-2 u-margin-bottom-4">
                <h1 className="display-1">Search for feeds to subscribe</h1>
                <form className="form" onSubmit={this.handleSearch}>
                    <div className="input-group">
                        <input autoFocus
                               className="form-control"
                               onChange={this.handleChange}
                               placeholder="Search by title, URL, or topic"
                               type="search"
                               value={query} />
                        <button className="button button-positive" type="submit">Search</button>
                    </div>
                </form>
                {this.renderFeeds()}
            </div>
        );
    }

    private handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const query = event.currentTarget.value;

        this.setState({ query });
    }

    private handleSearch = (event: React.FormEvent<any>) => {
        event.preventDefault();

        const { query } = this.state;

        if (query !== '') {
            const { onSearchFeeds, history } = this.props;

            onSearchFeeds(query);

            history.replace('/search/' + encodeURIComponent(query));
        }
    }
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
