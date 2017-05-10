import React, { PureComponent } from 'react';

import FeedComponent from 'components/parts/Feed';
import FeedPlaceholder from 'components/parts/FeedPlaceholder';
import Navbar from 'components/parts/Navbar';
import bindAction from 'utils/bindAction';
import connect from 'utils/react/connect';
import { Category, Search, State } from 'messaging/types';
import { searchFeeds } from 'messaging/search/actions';

interface SearchProps {
    categories: Category[];
    onSearchFeeds: (query: string) => void;
    onToggleSidebar: () => void;
    search: Search;
}

class SearchPage extends PureComponent<SearchProps, {}> {
    private searchInput: HTMLInputElement | null = null;

    constructor(props: SearchProps, context: {}) {
        super(props, context);

        this.handleSearch = this.handleSearch.bind(this);
        this.handleSubscribe = this.handleSubscribe.bind(this);
        this.handleUnsubscribe = this.handleUnsubscribe.bind(this);
    }

    handleSearch(event: React.SyntheticEvent<any>) {
        event.preventDefault();

        if (this.searchInput && this.searchInput.value) {
            const { onSearchFeeds } = this.props;

            onSearchFeeds(this.searchInput.value);
        }
    }

    handleSubscribe(feedId: number, categoryIds: (string | number)[]) {
        console.log({ feedId, categoryIds });
    }

    handleUnsubscribe(feedId: number) {
        console.log({ feedId });
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

        const { categories } = this.props;

        return (
            <ol className="list-group">
                {search.feeds.map((feed) =>
                    <FeedComponent
                        key={feed.feedId}
                        categories={categories}
                        feed={feed}
                        onSubscribe={this.handleSubscribe}
                        onUnsubscribe={this.handleUnsubscribe} />)}
            </ol>
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
        search: state.search
    }),
    (dispatch) => ({
        onSearchFeeds: bindAction(searchFeeds, dispatch)
    })
)(SearchPage);
