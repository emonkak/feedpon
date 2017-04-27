import React, { PureComponent } from 'react';
import { Params } from 'react-router/lib/Router';

import Dropdown from 'components/parts/Dropdown';
import EntryList from 'components/parts/EntryList';
import MenuItem from 'components/parts/MenuItem';
import Navbar from 'components/parts/Navbar';
import bindAction from 'utils/bindAction';
import connect from 'utils/react/connect';
import { Category, Feed, FeedSpecification, FeedView, State } from 'messaging/types';
import { changeFeedView, fetchComments, fetchFeed, fetchFullContent, fetchMoreEntries, saveReadEntries } from 'messaging/actions';

interface FeedProps {
    categories: Category[];
    feed: Feed;
    isScrolling: boolean;
    onChangeFeedView: (view: FeedView) => void,
    onFetchComments: (entryId: string, url: string) => void;
    onFetchFeed: (feedId: string, specification?: FeedSpecification) => void;
    onFetchFullContent: (entryId: string, url: string) => void;
    onFetchMoreEntries: (feedId: string, continuation: string, specification: FeedSpecification) => void;
    onSaveReadEntries: (entryIds: string[]) => void;
    onToggleSidebar: () => void,
    params: Params;
    scrollTo: (x: number, y: number) => Promise<void>;
};

interface FeedState {
    readEntryIds: Set<string>;
}

const SCROLL_OFFSET = 48;

class FeedComponent extends PureComponent<FeedProps, FeedState> {
    constructor(props: FeedProps, context: any) {
        super(props, context);

        this.state = {
            readEntryIds: new Set()
        };

        this.handleLoadMoreEntries = this.handleLoadMoreEntries.bind(this);
        this.handleReadEntry = this.handleReadEntry.bind(this);
    }

    componentWillMount() {
        const { feed, onFetchFeed, params } = this.props;

        if (!feed || (feed.feedId !== params['feed_id'])) {
            onFetchFeed(params['feed_id']);
        }
    }

    componentWillUpdate(nextProps: FeedProps, nextState: {}) {
        const { params } = this.props;
        const { readEntryIds } = this.state;

        if (params['feed_id'] !== nextProps.params['feed_id']) {
            const { feed, onFetchFeed, onSaveReadEntries } = this.props;

            if (feed.feedId === params['feed_id']) {
                onSaveReadEntries([...readEntryIds]);
            }

            onFetchFeed(nextProps.params['feed_id']);
        }
    }

    componentWillReceiveProps(nextProps: FeedProps) {
        const { feed } = this.props;

        if (feed.feedId !== nextProps.feed.feedId) {
            this.setState({
                readEntryIds: new Set()
            });
        }
    }

    componentWillUnmount() {
        const { feed, onSaveReadEntries, params } = this.props;
        const { readEntryIds } = this.state;

        if (feed.feedId === params['feed_id']) {
            onSaveReadEntries([...readEntryIds]);
        }
    }

    handleReadEntry(readEntryIds: string[]) {
        this.setState((state) => ({
            readEntryIds: new Set([...state.readEntryIds, ...readEntryIds])
        }));
    }

    handleLoadMoreEntries(event: React.SyntheticEvent<any>) {
        event.preventDefault();

        const { onFetchMoreEntries, feed } = this.props;

        if (feed.feedId && feed.continuation) {
            onFetchMoreEntries(feed.feedId, feed.continuation, feed.specification);
        }
    }

    handleChangeEntryOrder(order: 'newest' | 'oldest') {
        const { feed, onFetchFeed, scrollTo } = this.props;

        if (feed.feedId) {
            scrollTo(0, 0);

            onFetchFeed(feed.feedId, {
                ...feed.specification,
                order
            });
        }
    }

    handleToggleOnlyUnread() {
        const { feed, onFetchFeed } = this.props;

        if (feed.feedId) {
            scrollTo(0, 0);

            onFetchFeed(feed.feedId, {
                ...feed.specification,
                onlyUnread: !feed.specification.onlyUnread
            });
        }
    }

    handleScrollToEntry(entryId: string) {
        const scrollElement = document.getElementById('entry-' + entryId);

        if (scrollElement) {
            this.props.scrollTo(0, scrollElement.offsetTop - SCROLL_OFFSET);
        }
    }

    handleClearReadEntries(entryId: string) {
        const { scrollTo } = this.props;

        scrollTo(0, 0).then(() => this.setState({ readEntryIds: new Set() }));
    }

    renderReadEntriesDropdown() {
        const { feed } = this.props;
        const { readEntryIds } = this.state;

        const readEntries = feed.entries.filter(entry => readEntryIds.has(entry.entryId));

        return (
            <Dropdown
                className="navbar-action"
                toggleButton={
                    <a href="#">
                        <i className="icon icon-24 icon-checkmark" />
                        <span className="badge badge-overlap badge-negative">{readEntries.length || ''}</span>
                    </a>
                }
                pullRight={true}>
                <div className="menu-heading">Read entries</div>
                {readEntries.map((entry) => (
                    <MenuItem 
                        onSelect={this.handleScrollToEntry.bind(this, entry.entryId)}
                        key={entry.entryId}
                        primaryText={entry.title} />
                ))}
                <div className="menu-divider" />
                <MenuItem
                    onSelect={this.handleClearReadEntries.bind(this)}
                    isDisabled={readEntries.length === 0}
                    primaryText="Clear all read entries" />
                <div className="menu-divider" />
                <MenuItem
                    isDisabled={feed.entries.length === 0}
                    primaryText="Mark all as read" />
            </Dropdown>
        );
    }

    renderConfigDropdown() {
        const { feed, onChangeFeedView } = this.props;

        return (
            <Dropdown
                className="navbar-action"
                toggleButton={<a href="#"><i className="icon icon-24 icon-more" /></a>}
                pullRight={true}>
                <div className="menu-heading">View</div>
                <MenuItem
                    icon={feed.view === 'expanded' ? <i className="icon icon-16 icon-checkmark" /> : null}
                    primaryText="Expanded view"
                    onSelect={onChangeFeedView.bind(null, 'expanded')} />
                <MenuItem
                    icon={feed.view === 'collapsible' ? <i className="icon icon-16 icon-checkmark" /> : null}
                    primaryText="Collapsible view"
                    onSelect={onChangeFeedView.bind(null, 'collapsible')} />
                <div className="menu-divider" />
                <div className="menu-heading">Order</div>
                <MenuItem
                    icon={feed.specification.order === 'newest' ? <i className="icon icon-16 icon-checkmark" /> : null}
                    primaryText="Newest first"
                    onSelect={this.handleChangeEntryOrder.bind(this, 'newest')} />
                <MenuItem
                    icon={feed.specification.order === 'oldest' ? <i className="icon icon-16 icon-checkmark" /> : null}
                    primaryText="Oldest first"
                    onSelect={this.handleChangeEntryOrder.bind(this, 'oldest')} />
                <div className="menu-divider" />
                <MenuItem
                    icon={feed.specification.onlyUnread ? <i className="icon icon-16 icon-checkmark" /> : null}
                    primaryText="Only unread"
                    onSelect={this.handleToggleOnlyUnread.bind(this)} />
            </Dropdown>
        );
    }

    renderNavbarTitle() {
        const { feed } = this.props;

        if (feed.url) {
            return (
                <a className="link-default" href={feed.url} target="_blank">{feed.title}</a>
            );
        } else {
            return feed.title;
        }
    }

    renderNavbar() {
        const { onToggleSidebar } = this.props;

        return (
            <Navbar onToggleSidebar={onToggleSidebar}>
                <div className="navbar-title" href="#">{this.renderNavbarTitle()}</div>
                <div className="navbar-action">
                    <a href="#"><i className="icon icon-24 icon-refresh" /></a>
                </div>
                {this.renderReadEntriesDropdown()}
                {this.renderConfigDropdown()}
            </Navbar>
        );
    }

    renderHeader() {
        const { feed } = this.props;

        if (feed.isLoading && !feed.isLoaded) {
            return (
                <header className="feed-header">
                    <div className="container">
                        <div className="feed-header-content">
                            <div className="feed-metadata">
                                <span className="placeholder placeholder-animated placeholder-80" />
                                <span className="placeholder placeholder-animated placeholder-40" />
                            </div>
                        </div>
                    </div>
                </header>
            );
        }

        const { categories } = this.props;
        const isSubscribed = feed.subscription != null;
        const categoryId = feed.subscription != null ? feed.subscription.categoryId : null;

        const subscribeButton = isSubscribed
            ?  (
                <Dropdown
                    toggleButton={
                        <a className="button button-outline-default dropdown-arrow" href="#">
                            <i className="icon icon-20 icon-settings" />
                        </a>
                    }
                    pullRight={true}>
                    <div className="menu-heading">Category</div>
                    {categories.map(category => (
                        <MenuItem
                            key={category.categoryId}
                            icon={category.categoryId === categoryId ? <i className="icon icon-16 icon-checkmark" /> : null}
                            primaryText={category.label} />
                    ))}
                    <div className="menu-divider" />
                    <MenuItem primaryText="New Category..." />
                    <div className="menu-divider" />
                    <MenuItem
                        isDisabled={!isSubscribed}
                        primaryText="Unsubscribe" />
                </Dropdown>
            ) : (<a className="button button-outline-positive dropdown-arrow" href="#">Subscribe</a>);

        return (
            <header className="feed-header">
                <div className="container">
                    <div className="feed-header-content">
                        <div className="feed-metadata">
                            <div className="feed-info-list">
                                <span className="feed-info"><strong>{feed.entries.length}</strong> entries</span>
                                <span className="feed-info"><strong>{feed.velocity.toFixed(1)}</strong> entries per week</span>
                                <span className="feed-info"><strong>{feed.subscribers}</strong> subscribers</span>
                            </div>
                            <div className="feed-description">{feed.description}</div>
                        </div>
                        {subscribeButton}
                    </div>
                </div>
            </header>
        );
    }

    renderEntryList() {
        const { feed, isScrolling, onFetchComments, onFetchFullContent, scrollTo } = this.props;
        const { readEntryIds } = this.state;

        return (
            <EntryList
                entries={feed ? feed.entries : []}
                isLoading={feed.isLoading && !feed.isLoaded}
                isScrolling={isScrolling}
                onFetchComments={onFetchComments}
                onFetchFullContent={onFetchFullContent}
                onRead={this.handleReadEntry}
                readEntryIds={readEntryIds}
                scrollTo={scrollTo}
                view={feed.view} />
        );
    }

    renderFooter() {
        const { feed } = this.props;

        if (feed.continuation) {
            if (feed.isLoading) {
                return (
                    <footer className="feed-footer">
                        <i className="icon icon-32 icon-spinner animation-clockwise-rotation" />
                    </footer>
                );
            } else {
                return (
                    <footer className="feed-footer">
                        <a
                            className="link-default"
                            href="#"
                            onClick={this.handleLoadMoreEntries}>
                            Load more entries...
                        </a>
                    </footer>
                );
            }
        } else {
            return (
                <footer className="feed-footer">
                    No more entries here.
                </footer>
            );
        }
    }

    render() {
        return (
            <div className="l-main">
                <div className="l-main-header">
                    {this.renderNavbar()}
                </div>
                <div className="l-main-content">
                    {this.renderHeader()}
                    {this.renderEntryList()}
                    {this.renderFooter()}
                </div>
            </div>
        );
    }
}

export default connect(
    (state: State) => ({
        categories: state.subscriptions.categories,
        feed: state.feed
    }),
    (dispatch) => ({
        onChangeFeedView: bindAction(changeFeedView, dispatch),
        onFetchComments: bindAction(fetchComments, dispatch),
        onFetchFeed: bindAction(fetchFeed, dispatch),
        onFetchFullContent: bindAction(fetchFullContent, dispatch),
        onFetchMoreEntries: bindAction(fetchMoreEntries, dispatch),
        onSaveReadEntries: bindAction(saveReadEntries, dispatch)
    })
)(FeedComponent);
