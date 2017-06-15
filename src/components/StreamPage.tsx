import React, { PureComponent } from 'react';
import classnames from 'classnames';
import shallowEqual from 'fbjs/lib/shallowEqual';
import { History, Location } from 'history';
import { Params } from 'react-router/lib/Router';
import { createSelector } from 'reselect';

import ConfirmModal from 'components/parts/ConfirmModal';
import Dropdown from 'components/parts/Dropdown';
import EntryList from 'components/parts/EntryList';
import MainLayout from 'components/layouts/MainLayout';
import MenuItem from 'components/parts/MenuItem';
import ModalButton from 'components/parts/ModalButton';
import Navbar from 'components/parts/Navbar';
import Portal from 'components/parts/Portal';
import SubscribeDropdown from 'components/parts/SubscribeDropdown';
import bindActions from 'utils/flux/bindActions';
import connect from 'utils/flux/react/connect';
import { Category, Entry, EntryOrder, Feed, State, Stream, StreamOptions, StreamView, Subscription } from 'messaging/types';
import { addToCategory, removeFromCategory, subscribe, unsubscribe } from 'messaging/subscriptions/actions';
import { changeUnreadKeeping, fetchComments, fetchFullContent, fetchMoreEntries, fetchStream, markAsRead, markCategoryAsRead, markFeedAsRead, pinEntry, unpinEntry } from 'messaging/streams/actions';
import { createCategory } from 'messaging/categories/actions';

interface StreamPageProps {
    categories: Category[];
    isLoaded: boolean;
    isLoading: boolean;
    isMarking: boolean;
    isScrolling: boolean;
    keepUnread: boolean;
    location: Location;
    onAddToCategory: typeof addToCategory;
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
    router: History;
    scrollTo: (x: number, y: number) => Promise<void>;
    stream: Stream;
    streamOptions: StreamOptions;
    streamView: StreamView;
    subscription: Subscription | null;
};

interface StreamState {
    readEntryIds: Set<string | number>;
}

const SCROLL_OFFSET = 48;

class StreamPage extends PureComponent<StreamPageProps, StreamState> {
    readEntriesSelector = createSelector(
        (props: StreamPageProps) => props.stream.entries,
        (props: StreamPageProps, state: StreamState) => state.readEntryIds,
        (entries, readEntryIds) => entries.filter(entry => !entry.markedAsRead && readEntryIds.has(entry.entryId))
    );

    constructor(props: StreamPageProps, context: any) {
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
        const { onFetchStream, params, stream, streamOptions } = this.props;

        if (stream.streamId !== params['stream_id']
            || !shallowEqual(stream.options, streamOptions)) {
            onFetchStream(params['stream_id'], streamOptions);
        }
    }

    componentWillUpdate(nextProps: StreamPageProps, nextState: {}) {
        const { params, streamOptions } = this.props;

        // When transition to different stream
        if (params['stream_id'] !== nextProps.params['stream_id']
            || !shallowEqual(streamOptions, nextProps.streamOptions)) {
            const { keepUnread, onFetchStream, onMarkAsRead } = this.props;

            if (!keepUnread) {
                const readEntries = this.readEntriesSelector(this.props, this.state);

                if (readEntries.length > 0) {
                    onMarkAsRead(readEntries);
                }
            }

            onFetchStream(nextProps.params['stream_id'], nextProps.streamOptions);
        }
    }

    componentWillReceiveProps(nextProps: StreamPageProps) {
        const { stream } = this.props;

        if (stream.streamId !== nextProps.stream.streamId) {
            this.setState({
                readEntryIds: new Set()
            });
        }
    }

    componentWillUnmount() {
        const { keepUnread, onMarkAsRead } = this.props;

        if (!keepUnread) {
            const readEntries = this.readEntriesSelector(this.props, this.state);

            if (readEntries.length > 0) {
                onMarkAsRead(readEntries);
            }
        }
    }

    handleChangeEntryOrder(entryOrder: EntryOrder) {
        const { location, router, scrollTo } = this.props;

        scrollTo(0, 0);

        router.replace({
            pathname: location.pathname,
            query: {
                ...location.query,
                entryOrder
            }
        });
    }

    handleChangeStreamView(streamView: StreamView) {
        const { location, router } = this.props;

        router.replace({
            pathname: location.pathname,
            query: {
                ...location.query,
                streamView
            }
        });
    }

    handleClearReadEntries() {
        const { scrollTo } = this.props;

        scrollTo(0, 0).then(() => this.setState({ readEntryIds: new Set() }));
    }

    handleLoadMoreEntries() {
        const { keepUnread, onFetchMoreEntries, onMarkAsRead, stream, streamOptions } = this.props;

        if (stream.continuation) {
            onFetchMoreEntries(stream.streamId, stream.continuation, streamOptions);
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
        const { onFetchStream, scrollTo, stream, streamOptions } = this.props;

        scrollTo(0, 0);

        onFetchStream(stream.streamId, streamOptions);
    }

    handleScrollToEntry(entryId: string) {
        const scrollElement = document.getElementById('entry-' + entryId);

        if (scrollElement) {
            this.props.scrollTo(0, scrollElement.offsetTop - SCROLL_OFFSET);
        }
    }

    handleToggleOnlyUnread() {
        const { location, router, scrollTo, streamOptions } = this.props;

        scrollTo(0, 0);

        router.replace({
            pathname: location.pathname,
            query: {
                ...location.query,
                onlyUnread: !streamOptions.onlyUnread ? '1' : '0'
            }
        });
    }

    handleToggleUnreadKeeping() {
        const { keepUnread, onChangeUnreadKeeping } = this.props;

        onChangeUnreadKeeping(!keepUnread);
    }

    renderNavbar() {
        const {
            isLoading,
            isMarking,
            keepUnread,
            onToggleSidebar,
            stream,
            streamOptions,
            streamView,
            subscription
        } = this.props;
        const readEntries = this.readEntriesSelector(this.props, this.state);
        const canMarkAllAsRead = !!((stream.feed && subscription) || stream.category) && !isMarking;

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
                options={streamOptions}
                readEntries={readEntries}
                streamView={streamView}
                title={stream.title} />
        );
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
            stream,
            streamView
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
                streamView={streamView} />
        );
    }

    renderStreamFooter() {
        const { isLoading, isMarking, stream, subscription } = this.props;
        const canMarkAllAsRead = !!((stream.feed && subscription) || stream.category) && !isMarking;

        return (
            <StreamFooter
                canMarkAllAsRead={canMarkAllAsRead}
                hasMoreEntries={!!stream.continuation}
                isLoading={isLoading}
                onLoadMoreEntries={this.handleLoadMoreEntries}
                onMarkAllAsRead={this.handleMarkAllAsRead}
                title={stream.title} />
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
    streamView: StreamView;
    title: string;
}

class StreamNavbar extends PureComponent<StreamNavbarProps, {}> {
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
            streamView,
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
                    readEntries={readEntries}
                    title={title} />
                <StreamOptionsDropdown
                    isLoading={isLoading}
                    onChangeEntryOrder={onChangeEntryOrder}
                    onChangeStreamView={onChangeStreamView}
                    onToggleOnlyUnread={onToggleOnlyUnread}
                    options={options}
                    streamView={streamView} />
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
    title: string;
}

interface ReadEntriesDropdownState {
    markAllAsReadModalIsOpened: boolean;
}

class ReadEntriesDropdown extends PureComponent<ReadEntriesMenuProps, ReadEntriesDropdownState> {
    constructor(props: ReadEntriesMenuProps, context: any) {
        super(props, context);

        this.state = { 
            markAllAsReadModalIsOpened: false
        };

        this.handleOpenMarkAllAsReadModal = this.handleOpenMarkAllAsReadModal.bind(this);
        this.handleCloseMarkAllAsReadModal = this.handleCloseMarkAllAsReadModal.bind(this);
    }

    handleOpenMarkAllAsReadModal() {
        this.setState({
            markAllAsReadModalIsOpened: true
        });
    }

    handleCloseMarkAllAsReadModal() {
        this.setState({
            markAllAsReadModalIsOpened: false
        });
    }

    render() {
        const {
            canMarkAllAsRead,
            keepUnread,
            onClearReadEntries,
            onMarkAllAsRead,
            onScrollToEntry,
            onToggleUnreadKeeping,
            readEntries,
            title
        } = this.props;
        const { markAllAsReadModalIsOpened } = this.state;

        return (
            <Portal overlay={
                <ConfirmModal
                    isOpened={markAllAsReadModalIsOpened}
                    onClose={this.handleCloseMarkAllAsReadModal}
                    message="Are you sure you want to mark as read in this stream?"
                    confirmButtonClassName="button button-positive"
                    confirmButtonLabel="Mark all as read"
                    onConfirm={onMarkAllAsRead}
                    title={`Mark all as read in "${title}"`} />
            }>
                <Dropdown
                    toggleButton={
                        <button className="navbar-action">
                            <i className="icon icon-24 icon-checkmark" />
                            <span className={classnames('badge badge-small badge-pill badge-overlap', keepUnread ? 'badge-default' : 'badge-negative')}>
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
                        onSelect={this.handleOpenMarkAllAsReadModal}
                        primaryText="Mark all as read in stream..." />
                </Dropdown>
            </Portal>
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
    streamView: StreamView;
}

class StreamOptionsDropdown extends PureComponent<StreamOptionsDropdownProps, {}> {
    render() {
        const {
            isLoading,
            onChangeEntryOrder,
            onChangeStreamView,
            onToggleOnlyUnread,
            options,
            streamView
        } = this.props;

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
                    icon={streamView === 'expanded' ? checkmarkIcon : null}
                    onSelect={onChangeStreamView}
                    primaryText="Expanded view"
                    value="expanded" />
                <MenuItem
                    icon={streamView === 'collapsible' ? checkmarkIcon : null}
                    primaryText="Collapsible view"
                    onSelect={onChangeStreamView}
                    value="collapsible" />
                <div className="menu-divider" />
                <div className="menu-heading">Order</div>
                <MenuItem
                    isDisabled={isLoading}
                    icon={options.entryOrder === 'newest' ? checkmarkIcon : null}
                    onSelect={onChangeEntryOrder}
                    primaryText="Newest first"
                    value="newest" />
                <MenuItem
                    isDisabled={isLoading}
                    icon={options.entryOrder === 'oldest' ? checkmarkIcon : null}
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
    title: string;
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
            onMarkAllAsRead,
            title
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
                        <ModalButton
                            button={
                                <button
                                    className="button button-positive"
                                    disabled={!canMarkAllAsRead}>
                                    Mark all as read
                                </button>
                            }
                            modal={
                                <ConfirmModal
                                    message="Are you sure you want to mark as read in this stream?"
                                    confirmButtonClassName="button button-positive"
                                    confirmButtonLabel="Mark all as read"
                                    onConfirm={onMarkAllAsRead}
                                    title={`Mark all as read in "${title}"`} />
                            } />
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

    const streamOptionsSelector = createSelector(
        (state: State) => state.streamSettings.defaultOptions,
        (state: State, props: StreamPageProps) => props.location.query,
        (defaultOptions, query) => {
            const options = Object.assign({}, defaultOptions);

            if (query.numEntries != null) {
                options.numEntries = parseInt(query.numEntries);
            }

            if (query.onlyUnread != null) {
                options.onlyUnread = !!query.onlyUnread;
            }

            if (query.entryOrder === 'newest' || query.entryOrder === 'oldest') {
                options.entryOrder = query.entryOrder as EntryOrder;
            }

            return options;
        }
    );

    const streamViewSelector = createSelector(
        (state: State) => state.streamSettings.defaultStreamView,
        (state: State, props: StreamPageProps) => props.location.query,
        (defaultStreamView, query) => {
            return (query.streamView === 'expanded' || query.streamView === 'collapsible')
                ? query.streamView as StreamView
                : defaultStreamView;
        }
    );

    return {
        mapStateToProps: (state: State, props: StreamPageProps) => ({
            categories: state.categories.items,
            isLoaded: state.streams.isLoaded,
            isLoading: state.streams.isLoading,
            isMarking: state.streams.isMarking,
            isScrolling: state.ui.isScrolling,
            keepUnread: state.streams.keepUnread,
            stream: state.streams.current,
            streamOptions: streamOptionsSelector(state, props),
            streamView: streamViewSelector(state, props),
            subscription: subscriptionSelector(state)
        }),
        mapDispatchToProps: bindActions({
            onAddToCategory: addToCategory,
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
