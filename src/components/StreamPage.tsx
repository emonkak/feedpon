import React, { PureComponent } from 'react';
import { Params } from 'react-router/lib/Router';
import { createSelector } from 'reselect';

import Dropdown from 'components/parts/Dropdown';
import EntryList from 'components/parts/EntryList';
import MainLayout from 'components/layouts/MainLayout';
import Navbar from 'components/parts/Navbar';
import SubscribeButton from 'components/parts/SubscribeButton';
import SubscribeMenu from 'components/parts/SubscribeMenu';
import bindActions from 'utils/flux/bindActions';
import connect from 'utils/flux/react/connect';
import { Category, Entry, EntryOrder, Feed, State, Stream, StreamOptions, StreamView, Subscription } from 'messaging/types';
import { Menu, MenuItem } from 'components/parts/Menu';
import { addToCategory, removeFromCategory, subscribe, unsubscribe } from 'messaging/subscriptions/actions';
import { changeStreamView, fetchComments, fetchFullContent, fetchMoreEntries, fetchStream, markAsRead, pinEntry, unpinEntry } from 'messaging/streams/actions';
import { createCategory } from 'messaging/categories/actions';

interface StreamProps {
    categories: Category[];
    isLoaded: boolean;
    isLoading: boolean;
    isScrolling: boolean;
    onAddToCategory: typeof addToCategory;
    onChangeStreamView: typeof changeStreamView,
    onCreateCategory: typeof createCategory;
    onFetchComments: typeof fetchComments;
    onFetchFullContent: typeof fetchFullContent;
    onFetchMoreEntries: typeof fetchMoreEntries;
    onFetchStream: typeof fetchStream;
    onMarkAsRead: typeof markAsRead;
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
    constructor(props: StreamProps, context: any) {
        super(props, context);

        this.state = {
            readEntryIds: new Set()
        };

        this.handleClearReadEntries = this.handleClearReadEntries.bind(this);
        this.handlePinEntry = this.handlePinEntry.bind(this);
        this.handleReadEntry = this.handleReadEntry.bind(this);
    }

    componentWillMount() {
        const { stream, onFetchStream, params } = this.props;

        if (!stream || (stream.streamId !== params['stream_id'])) {
            onFetchStream(params['stream_id']);
        }
    }

    componentWillUpdate(nextProps: StreamProps, nextState: {}) {
        const { params } = this.props;
        const { readEntryIds } = this.state;

        if (params['stream_id'] !== nextProps.params['stream_id']) {
            const { stream, onFetchStream, onMarkAsRead } = this.props;

            if (stream.streamId === params['stream_id']) {
                onMarkAsRead([...readEntryIds]);
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
        const { onMarkAsRead, params, stream } = this.props;
        const { readEntryIds } = this.state;

        if (stream.streamId === params['stream_id']) {
            onMarkAsRead([...readEntryIds]);
        }
    }

    handleClearReadEntries() {
        const { scrollTo } = this.props;

        scrollTo(0, 0).then(() => this.setState({ readEntryIds: new Set() }));
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

    renderNavbar() {
        const { onChangeStreamView, onFetchStream, onToggleSidebar, scrollTo, stream } = this.props;
        const { readEntryIds } = this.state;

        return (
            <StreamNavbar
                onChangeStreamView={onChangeStreamView}
                onClearReadEntries={this.handleClearReadEntries}
                onFetchStream={onFetchStream}
                onToggleSidebar={onToggleSidebar}
                readEntryIds={readEntryIds}
                scrollTo={scrollTo}
                stream={stream} />
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
        const { isLoaded, isLoading, isScrolling, onFetchComments, onFetchFullContent, onPinEntry, onUnpinEntry, scrollTo, stream } = this.props;
        const { readEntryIds } = this.state;

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
                readEntryIds={readEntryIds}
                sameOrigin={!!stream.feed}
                scrollTo={scrollTo}
                view={stream.options.view} />
        );
    }

    renderStreamFooter() {
        const { isLoading, onFetchMoreEntries, stream } = this.props;

        return (
            <StreamFooter
                isLoading={isLoading}
                onFetchMoreEntries={onFetchMoreEntries}
                stream={stream} />
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
    onChangeStreamView: typeof changeStreamView,
    onClearReadEntries: () => void;
    onFetchStream: typeof fetchStream;
    onToggleSidebar: () => void;
    readEntryIds: Set<string | number>;
    scrollTo: (x: number, y: number) => Promise<void>;
    stream: Stream;
}

class StreamNavbar extends PureComponent<StreamNavbarProps, {}> {
    constructor(props: StreamNavbarProps, context: any) {
        super(props, context);

        this.handleChangeEntryOrder = this.handleChangeEntryOrder.bind(this);
        this.handleChangeStreamView = this.handleChangeStreamView.bind(this);
        this.handleReloadEntries = this.handleReloadEntries.bind(this);
        this.handleScrollToEntry = this.handleScrollToEntry.bind(this);
        this.handleToggleOnlyUnread = this.handleToggleOnlyUnread.bind(this);
    }

    handleChangeEntryOrder(order: EntryOrder) {
        const { stream, onFetchStream, scrollTo } = this.props;

        if (stream.streamId) {
            scrollTo(0, 0);

            onFetchStream(stream.streamId, {
                ...stream.options,
                order
            });
        }
    }

    handleChangeStreamView(view: StreamView) {
        const { onChangeStreamView, stream } = this.props;

        if (stream.streamId) {
            onChangeStreamView(stream.streamId, view);
        }
    }

    handleReloadEntries() {
        const { onFetchStream, scrollTo, stream } = this.props;

        if (stream.streamId) {
            scrollTo(0, 0);

            onFetchStream(stream.streamId, stream.options);
        }
    }

    handleScrollToEntry(entryId: string) {
        const scrollElement = document.getElementById('entry-' + entryId);

        if (scrollElement) {
            this.props.scrollTo(0, scrollElement.offsetTop - SCROLL_OFFSET);
        }
    }

    handleToggleOnlyUnread() {
        const { onFetchStream, scrollTo, stream } = this.props;

        if (stream.streamId) {
            scrollTo(0, 0);

            onFetchStream(stream.streamId, {
                ...stream.options,
                onlyUnread: !stream.options.onlyUnread
            });
        }
    }

    render() {
        const { onClearReadEntries, onToggleSidebar, readEntryIds, stream } = this.props;

        const title = stream.feed && stream.feed.url
            ? <a className="stream-title u-text-truncate" href={stream.feed.url} target="_blank">{stream.title}</a>
            : <span className="stream-title u-text-truncate">{stream.title}</span>;


        return (
            <Navbar onToggleSidebar={onToggleSidebar}>
                <h1 className="navbar-title">
                    {title}
                </h1>
                <div className="navbar-action">
                    <button onClick={this.handleReloadEntries}><i className="icon icon-24 icon-refresh" /></button>
                </div>
                <Dropdown
                    className="navbar-action"
                    toggleButton={
                        <button>
                            <i className="icon icon-24 icon-checkmark" />
                            <span className="badge badge-small badge-pill badge-negative badge-overlap">{readEntryIds.size || ''}</span>
                        </button>
                    }
                    menu={
                        <ReadEntriesMenu
                            entries={stream.entries}
                            onClearReadEntries={onClearReadEntries}
                            onScrollToEntry={this.handleScrollToEntry}
                            readEntryIds={readEntryIds} />
                    } />
                <Dropdown
                    className="navbar-action"
                    toggleButton={<button><i className="icon icon-24 icon-more" /></button>}
                    menu={
                        <StreamOptionsMenu
                            onChangeEntryOrder={this.handleChangeEntryOrder}
                            onChangeStreamView={this.handleChangeStreamView}
                            onToggleOnlyUnread={this.handleToggleOnlyUnread}
                            options={stream.options} />
                    } />
            </Navbar>
        );
    }
}

interface ReadEntriesMenuProps {
    entries: Entry[];
    onClearReadEntries: () => void;
    onClose?: () => void;
    onKeyDown?: (event: React.KeyboardEvent<any>) => void;
    onScrollToEntry: (entryId: string) => void;
    onSelect?: (value?: any) => void;
    readEntryIds: Set<string | number>;
}

class ReadEntriesMenu extends PureComponent<ReadEntriesMenuProps, {}> {
    render() {
        const { entries, onClearReadEntries, onClose, onKeyDown, onScrollToEntry, onSelect, readEntryIds } = this.props;

        const readEntries = entries.filter(entry => readEntryIds.has(entry.entryId));

        return (
            <Menu
                onClose={onClose}
                onKeyDown={onKeyDown}
                onSelect={onSelect}>
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
                    isDisabled={readEntries.length === 0}
                    onSelect={onClearReadEntries}
                    primaryText="Clear all read entries" />
                <div className="menu-divider" />
                <MenuItem
                    isDisabled={entries.length === 0}
                    primaryText="Mark all as read" />
            </Menu>
        )
    }
}

interface StreamOptionsMenuProps {
    onChangeEntryOrder: (order: EntryOrder) => void;
    onChangeStreamView: (view: StreamView) => void;
    onClose?: () => void;
    onKeyDown?: (event: React.KeyboardEvent<any>) => void;
    onSelect?: (value?: any) => void;
    onToggleOnlyUnread: () => void;
    options: StreamOptions;
}

class StreamOptionsMenu extends PureComponent<StreamOptionsMenuProps, {}> {
    render() {
        const { onChangeEntryOrder, onChangeStreamView, onClose, onKeyDown, onSelect, onToggleOnlyUnread, options } = this.props;

        const checkmarkIcon = <i className="icon icon-16 icon-checkmark" />;

        return (
            <Menu
                onClose={onClose}
                onKeyDown={onKeyDown}
                onSelect={onSelect}>
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
                    icon={options.order === 'newest' ? checkmarkIcon : null}
                    onSelect={onChangeEntryOrder}
                    primaryText="Newest first"
                    value="newest" />
                <MenuItem
                    icon={options.order === 'oldest' ? checkmarkIcon : null}
                    onSelect={onChangeEntryOrder}
                    primaryText="Oldest first"
                    value="oldest" />
                <div className="menu-divider" />
                <MenuItem
                    icon={options.onlyUnread ? checkmarkIcon : null}
                    primaryText="Only unread"
                    onSelect={onToggleOnlyUnread} />
            </Menu>
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
                        <Dropdown
                            toggleButton={
                                <SubscribeButton
                                    isSubscribed={!!subscription}
                                    isLoading={feed.isLoading} />
                            }
                            menu={
                                <SubscribeMenu
                                    categories={categories}
                                    feed={feed}
                                    onAddToCategory={onAddToCategory}
                                    onCreateCategory={onCreateCategory}
                                    onRemoveFromCategory={onRemoveFromCategory}
                                    onSubscribe={onSubscribe}
                                    onUnsubscribe={onUnsubscribe}
                                    subscription={subscription} />
                            } />
                    </div>
                </div>
            </header>
        )
    }
}

interface StreamFooterProps {
    isLoading: boolean;
    onFetchMoreEntries: typeof fetchMoreEntries;
    stream: Stream;
}

class StreamFooter extends PureComponent<StreamFooterProps, {}> {
    constructor(props: StreamFooterProps, context: any) {
        super(props, context);

        this.handleLoadMoreEntries = this.handleLoadMoreEntries.bind(this);
    }

    handleLoadMoreEntries(event: React.SyntheticEvent<any>) {
        event.preventDefault();

        const { onFetchMoreEntries, stream } = this.props;

        if (stream.streamId && stream.continuation) {
            onFetchMoreEntries(stream.streamId, stream.continuation, stream.options);
        }
    }

    render() {
        const { isLoading, stream } = this.props;

        if (stream.continuation) {
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
                    No more entries here.
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
            isScrolling: state.ui.isScrolling,
            stream: state.streams.current,
            subscription: subscriptionSelector(state)
        }),
        mapDispatchToProps: bindActions({
            onAddToCategory: addToCategory,
            onChangeStreamView: changeStreamView,
            onCreateCategory: createCategory,
            onFetchComments: fetchComments,
            onFetchFullContent: fetchFullContent,
            onFetchMoreEntries: fetchMoreEntries,
            onFetchStream: fetchStream,
            onMarkAsRead: markAsRead,
            onPinEntry: pinEntry,
            onRemoveFromCategory: removeFromCategory,
            onSubscribe: subscribe,
            onUnpinEntry: unpinEntry,
            onUnsubscribe: unsubscribe
        })
    };
})(StreamPage);
