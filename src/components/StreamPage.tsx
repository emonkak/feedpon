import React, { PureComponent } from 'react';
import classnames from 'classnames';
import { Params } from 'react-router/lib/Router';
import { createSelector } from 'reselect';

import Dropdown from 'components/parts/Dropdown';
import EntryList from 'components/parts/EntryList';
import MainLayout from 'components/layouts/MainLayout';
import Navbar from 'components/parts/Navbar';
import SubscribeDropdown from 'components/parts/SubscribeDropdown';
import bindActions from 'utils/flux/bindActions';
import connect from 'utils/flux/react/connect';
import { Category, Entry, EntryOrder, Feed, State, Stream, StreamOptions, StreamView, Subscription } from 'messaging/types';
import { MenuItem } from 'components/parts/Menu';
import { addToCategory, removeFromCategory, subscribe, unsubscribe } from 'messaging/subscriptions/actions';
import { changeStreamView, changeUnreadKeeping, fetchComments, fetchFullContent, fetchMoreEntries, fetchStream, markAsRead, markCategoryAsRead, markFeedAsRead, pinEntry, unpinEntry } from 'messaging/streams/actions';
import { createCategory } from 'messaging/categories/actions';

interface StreamProps {
    categories: Category[];
    isLoaded: boolean;
    isLoading: boolean;
    isMarking: boolean;
    isScrolling: boolean;
    keepUnread: boolean;
    onAddToCategory: typeof addToCategory;
    onChangeStreamView: typeof changeStreamView,
    onChangeUnreadKeeping: typeof changeUnreadKeeping,
    onCreateCategory: typeof createCategory;
    onFetchComments: typeof fetchComments;
    onFetchFullContent: typeof fetchFullContent;
    onFetchMoreEntries: typeof fetchMoreEntries;
    onFetchStream: typeof fetchStream;
    onMarkAsRead: typeof markAsRead;
    onMarkCategoryAsRead: typeof markCategoryAsRead;
    onMarkFeedAsRead: typeof markFeedAsRead;
    onPinEntry: typeof pinEntry;
    onRemoveFromCategory: typeof removeFromCategory;
    onSubscribe: typeof subscribe;
    onToggleSidebar: () => void,
    onUnpinEntry: typeof unpinEntry;
    onUnsubscribe: typeof unsubscribe;
    params: Params;
    scrollTo: (x: number, y: number) => Promise<void>;
    stream: Stream;
    subscription: Subscription | null;
};

interface StreamState {
    readEntryIds: Set<string | number>;
}

const SCROLL_OFFSET = 48;

class StreamPage extends PureComponent<StreamProps, StreamState> {
    readonly readEntriesSelector = createSelector(
        (props: StreamProps) => props.stream.entries,
        (props: StreamProps, state: StreamState) => state.readEntryIds,
        (entries, readEntryIds) => entries.filter(entry => !entry.markedAsRead && readEntryIds.has(entry.entryId))
    );

    constructor(props: StreamProps, context: any) {
        super(props, context);

        this.state = {
            readEntryIds: new Set()
        };

        this.handleChangeEntryOrder = this.handleChangeEntryOrder.bind(this);
        this.handleChangeStreamView = this.handleChangeStreamView.bind(this);
        this.handleClearReadEntries = this.handleClearReadEntries.bind(this);
        this.handleLoadMoreEntries = this.handleLoadMoreEntries.bind(this);
        this.handleMarkAllAsRead = this.handleMarkAllAsRead.bind(this);
        this.handlePinEntry = this.handlePinEntry.bind(this);
        this.handleReadEntry = this.handleReadEntry.bind(this);
        this.handleReloadEntries = this.handleReloadEntries.bind(this);
        this.handleScrollToEntry = this.handleScrollToEntry.bind(this);
        this.handleToggleOnlyUnread = this.handleToggleOnlyUnread.bind(this);
        this.handleToggleUnreadKeeping = this.handleToggleUnreadKeeping.bind(this);
    }

    componentWillMount() {
        const { stream, onFetchStream, params } = this.props;

        if (!stream || (stream.streamId !== params['stream_id'])) {
            onFetchStream(params['stream_id']);
        }
    }

    componentWillUpdate(nextProps: StreamProps, nextState: {}) {
        const { params } = this.props;

        // When transition to different stream
        if (params['stream_id'] !== nextProps.params['stream_id']) {
            const { keepUnread, onFetchStream, onMarkAsRead, stream } = this.props;

            if (!keepUnread && stream.streamId === params['stream_id']) {
                const readEntries = this.readEntriesSelector(this.props, this.state);

                if (readEntries.length > 0) {
                    onMarkAsRead(readEntries);
                }
            }

            onFetchStream(nextProps.params['stream_id']);
        }
    }

    componentWillReceiveProps(nextProps: StreamProps) {
        const { stream } = this.props;

        if (stream.streamId !== nextProps.stream.streamId) {
            this.setState({
                readEntryIds: new Set()
            });
        }
    }

    componentWillUnmount() {
        const { keepUnread, onMarkAsRead, params, stream } = this.props;

        if (!keepUnread && stream.streamId === params['stream_id']) {
            const readEntries = this.readEntriesSelector(this.props, this.state);

            if (readEntries.length > 0) {
                onMarkAsRead(readEntries);
            }
        }
    }

    handleChangeEntryOrder(order: EntryOrder) {
        const { stream, onFetchStream, scrollTo } = this.props;

        scrollTo(0, 0);

        onFetchStream(stream.streamId, {
            ...stream.options,
            order
        });
    }

    handleChangeStreamView(view: StreamView) {
        const { onChangeStreamView, stream } = this.props;

        onChangeStreamView(stream.streamId, view);
    }

    handleClearReadEntries() {
        const { scrollTo } = this.props;

        scrollTo(0, 0).then(() => this.setState({ readEntryIds: new Set() }));
    }

    handleLoadMoreEntries() {
        const { keepUnread, onFetchMoreEntries, onMarkAsRead, stream } = this.props;

        if (stream.continuation) {
            onFetchMoreEntries(stream.streamId, stream.continuation, stream.options);
        }

        if (!keepUnread) {
            const readEntries = this.readEntriesSelector(this.props, this.state);

            if (readEntries.length > 0) {
                onMarkAsRead(readEntries);
            }
        }
    }

    handleMarkAllAsRead() {
        const { onMarkCategoryAsRead, onMarkFeedAsRead, stream } = this.props;

        if (stream.category) {
            onMarkCategoryAsRead(stream.category);
        } else if (stream.feed) {
            onMarkFeedAsRead(stream.feed);
        }
    }

    handlePinEntry(entryId: string) {
        const { onPinEntry } = this.props;

        onPinEntry(entryId);
    }

    handleReadEntry(readEntryIds: string[]) {
        this.setState((state) => ({
            readEntryIds: new Set([...state.readEntryIds, ...readEntryIds])
        }));
    }

    handleReloadEntries() {
        const { onFetchStream, scrollTo, stream } = this.props;

        scrollTo(0, 0);

        onFetchStream(stream.streamId, stream.options);
    }

    handleScrollToEntry(entryId: string) {
        const scrollElement = document.getElementById('entry-' + entryId);

        if (scrollElement) {
            this.props.scrollTo(0, scrollElement.offsetTop - SCROLL_OFFSET);
        }
    }

    handleToggleOnlyUnread() {
        const { onFetchStream, scrollTo, stream } = this.props;

        scrollTo(0, 0);

        onFetchStream(stream.streamId, {
            ...stream.options,
            onlyUnread: !stream.options.onlyUnread
        });
    }

    handleToggleUnreadKeeping() {
        const { keepUnread, onChangeUnreadKeeping } = this.props;

        onChangeUnreadKeeping(!keepUnread);
    }

    renderNavbar() {
        const { isLoading, isMarking, keepUnread, onToggleSidebar, stream, subscription } = this.props;
        const readEntries = this.readEntriesSelector(this.props, this.state);
        const canMarkAllAsRead = !!((stream.category || stream.feed) && !isMarking && subscription);

        return (
            <StreamNavbar
                canMarkAllAsRead={canMarkAllAsRead}
                feed={stream.feed}
                isLoading={isLoading}
                keepUnread={keepUnread}
                onChangeEntryOrder={this.handleChangeEntryOrder}
                onChangeStreamView={this.handleChangeStreamView}
                onClearReadEntries={this.handleClearReadEntries}
                onMarkAllAsRead={this.handleMarkAllAsRead}
                onReloadEntries={this.handleReloadEntries}
                onScrollToEntry={this.handleScrollToEntry}
                onToggleOnlyUnread={this.handleToggleOnlyUnread}
                onToggleSidebar={onToggleSidebar}
                onToggleUnreadKeeping={this.handleToggleUnreadKeeping}
                options={stream.options}
                readEntries={readEntries}
                title={stream.title} />
        )
    }

    renderStreamHeader() {
        const { stream } = this.props;

        if (stream.feed) {
            const { categories, onAddToCategory, onCreateCategory, onRemoveFromCategory, onSubscribe, onUnsubscribe, subscription } = this.props;

            return (
                <StreamHeader
                    categories={categories}
                    feed={stream.feed}
                    onAddToCategory={onAddToCategory}
                    onCreateCategory={onCreateCategory}
                    onRemoveFromCategory={onRemoveFromCategory}
                    onSubscribe={onSubscribe}
                    onUnsubscribe={onUnsubscribe}
                    subscription={subscription} />
            );
        }

        return null;
    }

    renderStreamEntries() {
        const {
            isLoaded,
            isLoading,
            isScrolling,
            onFetchComments,
            onFetchFullContent,
            onPinEntry,
            onUnpinEntry,
            scrollTo,
            stream
        } = this.props;

        return (
            <EntryList
                entries={stream ? stream.entries : []}
                isLoading={isLoading && !isLoaded}
                isScrolling={isScrolling}
                onFetchComments={onFetchComments}
                onFetchFullContent={onFetchFullContent}
                onPin={onPinEntry}
                onRead={this.handleReadEntry}
                onUnpin={onUnpinEntry}
                sameOrigin={!!stream.feed}
                scrollTo={scrollTo}
                view={stream.options.view} />
        );
    }

    renderStreamFooter() {
        const { isLoading, isMarking, stream, subscription } = this.props;
        const canMarkAllAsRead = !!((stream.category || stream.feed) && !isMarking && subscription);

        return (
            <StreamFooter
                canMarkAllAsRead={canMarkAllAsRead}
                hasMoreEntries={!!stream.continuation}
                isLoading={isLoading}
                onLoadMoreEntries={this.handleLoadMoreEntries}
                onMarkAllAsRead={this.handleMarkAllAsRead} />
        );
    }

    render() {
        return (
            <MainLayout header={this.renderNavbar()} footer={null}>
                {this.renderStreamHeader()}
                {this.renderStreamEntries()}
                {this.renderStreamFooter()}
            </MainLayout>
        );
    }
}

interface StreamNavbarProps {
    canMarkAllAsRead: boolean;
    feed: Feed | null;
    isLoading: boolean;
    keepUnread: boolean;
    onChangeEntryOrder: (order: EntryOrder) => void,
    onChangeStreamView: (view: StreamView) => void,
    onClearReadEntries: () => void;
    onMarkAllAsRead: () => void;
    onReloadEntries: () => void;
    onScrollToEntry: (entryId: string | number) => void;
    onToggleOnlyUnread: () => void;
    onToggleSidebar: () => void;
    onToggleUnreadKeeping: () => void;
    options: StreamOptions;
    readEntries: Entry[];
    title: string;
}

class StreamNavbar extends PureComponent<StreamNavbarProps, {}> {
    constructor(props: StreamNavbarProps, context: any) {
        super(props, context);
    }

    render() {
        const {
            canMarkAllAsRead,
            feed,
            isLoading,
            keepUnread,
            onChangeEntryOrder,
            onChangeStreamView,
            onClearReadEntries,
            onMarkAllAsRead,
            onReloadEntries,
            onScrollToEntry,
            onToggleOnlyUnread,
            onToggleSidebar,
            onToggleUnreadKeeping,
            options,
            readEntries,
            title
        } = this.props;

        const titleElement = feed && feed.url
            ? <a className="stream-title u-text-truncate" href={feed.url} target="_blank">{title}</a>
            : <span className="stream-title u-text-truncate">{title}</span>;

        return (
            <Navbar onToggleSidebar={onToggleSidebar}>
                <h1 className="navbar-title">
                    {titleElement}
                </h1>
                <button
                    disabled={isLoading}
                    className="navbar-action"
                    onClick={onReloadEntries}>
                    <i className="icon icon-24 icon-refresh" />
                </button>
                <ReadEntriesDropdown
                    canMarkAllAsRead={canMarkAllAsRead}
                    keepUnread={keepUnread}
                    onClearReadEntries={onClearReadEntries}
                    onMarkAllAsRead={onMarkAllAsRead}
                    onScrollToEntry={onScrollToEntry}
                    onToggleUnreadKeeping={onToggleUnreadKeeping}
                    readEntries={readEntries} />
                <StreamOptionsDropdown
                    isLoading={isLoading}
                    onChangeEntryOrder={onChangeEntryOrder}
                    onChangeStreamView={onChangeStreamView}
                    onToggleOnlyUnread={onToggleOnlyUnread}
                    options={options} />
            </Navbar>
        );
    }
}

interface ReadEntriesMenuProps {
    canMarkAllAsRead: boolean;
    keepUnread: boolean;
    onClearReadEntries: () => void;
    onMarkAllAsRead: () => void;
    onScrollToEntry: (entryId: string) => void;
    onToggleUnreadKeeping: () => void;
    readEntries: Entry[];
}

class ReadEntriesDropdown extends PureComponent<ReadEntriesMenuProps, {}> {
    render() {
        const {
            canMarkAllAsRead,
            keepUnread,
            onClearReadEntries,
            onMarkAllAsRead,
            onScrollToEntry,
            onToggleUnreadKeeping,
            readEntries
        } = this.props;

        return (
            <Dropdown
                toggleButton={
                    <button className="navbar-action">
                        <i className="icon icon-24 icon-checkmark" />
                        <span className={classnames('badge badge-small badge-pill badge-overlap', keepUnread ? 'badge-default' : 'badge-negative' )}>
                            {readEntries.length || ''}
                        </span>
                    </button>
                }>
                <div className="menu-heading">Read entries</div>
                {readEntries.map((entry) => (
                    <MenuItem
                        key={entry.entryId}
                        onSelect={onScrollToEntry}
                        primaryText={entry.title}
                        value={entry.entryId} />
                ))}
                <div className="menu-divider" />
                <MenuItem
                    icon={keepUnread ? <i className="icon icon-16 icon-checkmark" /> : null}
                    onSelect={onToggleUnreadKeeping}
                    primaryText="Keep unread" />
                <div className="menu-divider" />
                <MenuItem
                    isDisabled={readEntries.length === 0}
                    onSelect={onClearReadEntries}
                    primaryText="Clear read entries" />
                <MenuItem
                    isDisabled={!canMarkAllAsRead}
                    onSelect={onMarkAllAsRead}
                    primaryText="Mark all as read in stream..." />
            </Dropdown>
        );
    }
}

interface StreamOptionsDropdownProps {
    isLoading: boolean;
    onChangeEntryOrder: (order: EntryOrder) => void;
    onChangeStreamView: (view: StreamView) => void;
    onClose?: () => void;
    onKeyDown?: (event: React.KeyboardEvent<any>) => void;
    onSelect?: (value?: any) => void;
    onToggleOnlyUnread: () => void;
    options: StreamOptions;
}

class StreamOptionsDropdown extends PureComponent<StreamOptionsDropdownProps, {}> {
    render() {
        const { isLoading, onChangeEntryOrder, onChangeStreamView, onToggleOnlyUnread, options } = this.props;

        const checkmarkIcon = <i className="icon icon-16 icon-checkmark" />;

        return (
            <Dropdown
                toggleButton={
                    <button className="navbar-action">
                        <i className="icon icon-24 icon-menu-2" />
                    </button>
                }>
                <div className="menu-heading">View</div>
                <MenuItem
                    icon={options.view === 'expanded' ? checkmarkIcon : null}
                    onSelect={onChangeStreamView}
                    primaryText="Expanded view"
                    value="expanded" />
                <MenuItem
                    icon={options.view === 'collapsible' ? checkmarkIcon : null}
                    primaryText="Collapsible view"
                    onSelect={onChangeStreamView}
                    value="collapsible" />
                <div className="menu-divider" />
                <div className="menu-heading">Order</div>
                <MenuItem
                    isDisabled={isLoading}
                    icon={options.order === 'newest' ? checkmarkIcon : null}
                    onSelect={onChangeEntryOrder}
                    primaryText="Newest first"
                    value="newest" />
                <MenuItem
                    isDisabled={isLoading}
                    icon={options.order === 'oldest' ? checkmarkIcon : null}
                    onSelect={onChangeEntryOrder}
                    primaryText="Oldest first"
                    value="oldest" />
                <div className="menu-divider" />
                <MenuItem
                    isDisabled={isLoading}
                    icon={options.onlyUnread ? checkmarkIcon : null}
                    primaryText="Only unread"
                    onSelect={onToggleOnlyUnread} />
            </Dropdown>
        );
    }
}

interface StreamHeaderProps {
    categories: Category[];
    feed: Feed;
    onAddToCategory: typeof addToCategory;
    onCreateCategory: typeof createCategory;
    onRemoveFromCategory: typeof removeFromCategory;
    onSubscribe: typeof subscribe;
    onUnsubscribe: typeof unsubscribe;
    subscription: Subscription | null;
}

class StreamHeader extends PureComponent<StreamHeaderProps, {}> {
    render() {
        const { categories, feed, onAddToCategory, onCreateCategory, onRemoveFromCategory, onSubscribe, onUnsubscribe, subscription } = this.props;

        return (
            <header className="stream-header">
                <div className="container">
                    <div className="u-flex u-flex-align-items-center u-flex-justify-content-between">
                        <div className="u-margin-right-2">
                            <div className="list-inline list-inline-dotted">
                                <div className="list-inline-item u-text-muted">{feed.subscribers} subscribers</div>
                            </div>
                            <div>{feed.description}</div>
                            <div><a target="_blank" href={feed.feedUrl}>{feed.feedUrl}</a></div>
                        </div>
                        <SubscribeDropdown
                            categories={categories}
                            feed={feed}
                            onAddToCategory={onAddToCategory}
                            onCreateCategory={onCreateCategory}
                            onRemoveFromCategory={onRemoveFromCategory}
                            onSubscribe={onSubscribe}
                            onUnsubscribe={onUnsubscribe}
                            subscription={subscription} />
                    </div>
                </div>
            </header>
        )
    }
}

interface StreamFooterProps {
    canMarkAllAsRead: boolean;
    hasMoreEntries: boolean;
    isLoading: boolean;
    onLoadMoreEntries: () => void;
    onMarkAllAsRead: () => void;
}

class StreamFooter extends PureComponent<StreamFooterProps, {}> {
    constructor(props: StreamFooterProps, context: any) {
        super(props, context);

        this.handleLoadMoreEntries = this.handleLoadMoreEntries.bind(this);
    }

    handleLoadMoreEntries(event: React.MouseEvent<any>) {
        event.preventDefault();

        const { onLoadMoreEntries } = this.props;

        onLoadMoreEntries();
    }

    render() {
        const {
            canMarkAllAsRead,
            hasMoreEntries,
            isLoading,
            onMarkAllAsRead
        } = this.props;

        if (hasMoreEntries) {
            if (isLoading) {
                return (
                    <footer className="stream-footer">
                        <i className="icon icon-32 icon-spinner icon-rotating" />
                    </footer>
                );
            } else {
                return (
                    <footer className="stream-footer">
                        <a
                            className="link-strong"
                            href="#"
                            onClick={this.handleLoadMoreEntries}>
                            Load more entries...
                        </a>
                    </footer>
                );
            }
        } else {
            return (
                <footer className="stream-footer">
                    <p>No more entries here.</p>
                    <p>
                        <button
                            className="button button-positive"
                            disabled={!canMarkAllAsRead}
                            onClick={onMarkAllAsRead}>
                            Mark all as read
                        </button>
                    </p>
                </footer>
            );
        }
    }
}

export default connect(() => {
    const subscriptionSelector = createSelector(
        (state: State) => state.subscriptions.items,
        (state: State) => state.streams.current.streamId,
        (subscriptions, streamId) =>
            subscriptions.find((subscription) => subscription.streamId === streamId) || null
    );

    return {
        mapStateToProps: (state: State) => ({
            categories: state.categories.items,
            isLoaded: state.streams.isLoaded,
            isLoading: state.streams.isLoading,
            isMarking: state.streams.isMarking,
            isScrolling: state.ui.isScrolling,
            keepUnread: state.streams.keepUnread,
            stream: state.streams.current,
            subscription: subscriptionSelector(state)
        }),
        mapDispatchToProps: bindActions({
            onAddToCategory: addToCategory,
            onChangeStreamView: changeStreamView,
            onChangeUnreadKeeping: changeUnreadKeeping,
            onCreateCategory: createCategory,
            onFetchComments: fetchComments,
            onFetchFullContent: fetchFullContent,
            onFetchMoreEntries: fetchMoreEntries,
            onFetchStream: fetchStream,
            onMarkAsRead: markAsRead,
            onMarkCategoryAsRead: markCategoryAsRead,
            onMarkFeedAsRead: markFeedAsRead,
            onPinEntry: pinEntry,
            onRemoveFromCategory: removeFromCategory,
            onSubscribe: subscribe,
            onUnpinEntry: unpinEntry,
            onUnsubscribe: unsubscribe
        })
    };
})(StreamPage);
