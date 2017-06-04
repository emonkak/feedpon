import React, { PureComponent } from 'react';
import { Params } from 'react-router/lib/Router';

import Dropdown from 'components/parts/Dropdown';
import EntryList from 'components/parts/EntryList';
import Navbar from 'components/parts/Navbar';
import SubscribeButton from 'components/parts/SubscribeButton';
import SubscribeMenu from 'components/parts/SubscribeMenu';
import bindActions from 'utils/flux/bindActions';
import connect from 'utils/flux/react/connect';
import { Category, EntryOrder, State, Stream, StreamView, Subscription } from 'messaging/types';
import { Menu, MenuItem } from 'components/parts/Menu';
import { addToCategory, removeFromCategory, subscribe, unsubscribe } from 'messaging/subscriptions/actions';
import { changeStreamView, fetchComments, fetchFullContent, fetchMoreEntries, fetchStream, markAsRead, pinEntry, unpinEntry } from 'messaging/streams/actions';
import { createCategory } from 'messaging/categories/actions';

interface StreamProps {
    subscription: Subscription | null;
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

        this.handleChangeEntryOrder = this.handleChangeEntryOrder.bind(this);
        this.handleChangeStreamView = this.handleChangeStreamView.bind(this);
        this.handleClearReadEntries = this.handleClearReadEntries.bind(this);
        this.handleLoadMoreEntries = this.handleLoadMoreEntries.bind(this);
        this.handlePinEntry = this.handlePinEntry.bind(this);
        this.handleReadEntry = this.handleReadEntry.bind(this);
        this.handleReloadEntries = this.handleReloadEntries.bind(this);
        this.handleScrollToEntry = this.handleScrollToEntry.bind(this);
        this.handleToggleOnlyUnread = this.handleToggleOnlyUnread.bind(this);
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
        const { stream, onMarkAsRead, params } = this.props;
        const { readEntryIds } = this.state;

        if (stream.streamId === params['stream_id']) {
            onMarkAsRead([...readEntryIds]);
        }
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

    handleClearReadEntries() {
        const { scrollTo } = this.props;

        scrollTo(0, 0).then(() => this.setState({ readEntryIds: new Set() }));
    }

    handleLoadMoreEntries(event: React.SyntheticEvent<any>) {
        event.preventDefault();

        const { onFetchMoreEntries, stream } = this.props;

        if (stream.streamId && stream.continuation) {
            onFetchMoreEntries(stream.streamId, stream.continuation, stream.options);
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
        const { onFetchStream, stream } = this.props;

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
        const { stream, onFetchStream } = this.props;

        if (stream.streamId) {
            scrollTo(0, 0);

            onFetchStream(stream.streamId, {
                ...stream.options,
                onlyUnread: !stream.options.onlyUnread
            });
        }
    }

    renderReadEntriesMenu() {
        const { stream } = this.props;
        const { readEntryIds } = this.state;

        const readEntries = stream.entries.filter(entry => readEntryIds.has(entry.entryId));

        return (
            <Menu>
                <div className="menu-heading">Read entries</div>
                {readEntries.map((entry) => (
                    <MenuItem
                        key={entry.entryId}
                        onSelect={this.handleScrollToEntry}
                        primaryText={entry.title}
                        value={entry.entryId} />
                ))}
                <div className="menu-divider" />
                <MenuItem
                    isDisabled={readEntries.length === 0}
                    onSelect={this.handleClearReadEntries}
                    primaryText="Clear all read entries" />
                <div className="menu-divider" />
                <MenuItem
                    isDisabled={stream.entries.length === 0}
                    primaryText="Mark all as read" />
            </Menu>
        );
    }

    renderConfigMenu() {
        const { stream } = this.props;

        const checkmarkIcon = <i className="icon icon-16 icon-checkmark" />;

        return (
            <Menu>
                <div className="menu-heading">View</div>
                <MenuItem
                    icon={stream.options.view === 'expanded' ? checkmarkIcon : null}
                    onSelect={this.handleChangeStreamView}
                    primaryText="Expanded view"
                    value="expanded" />
                <MenuItem
                    icon={stream.options.view === 'collapsible' ? checkmarkIcon : null}
                    primaryText="Collapsible view"
                    onSelect={this.handleChangeStreamView}
                    value="collapsible" />
                <div className="menu-divider" />
                <div className="menu-heading">Order</div>
                <MenuItem
                    icon={stream.options.order === 'newest' ? checkmarkIcon : null}
                    onSelect={this.handleChangeEntryOrder}
                    primaryText="Newest first"
                    value="newest" />
                <MenuItem
                    icon={stream.options.order === 'oldest' ? checkmarkIcon : null}
                    onSelect={this.handleChangeEntryOrder}
                    primaryText="Oldest first"
                    value="oldest" />
                <div className="menu-divider" />
                <MenuItem
                    icon={stream.options.onlyUnread ? checkmarkIcon : null}
                    primaryText="Only unread"
                    onSelect={this.handleToggleOnlyUnread} />
            </Menu>
        );
    }

    renderNavbar() {
        const { stream, onToggleSidebar } = this.props;
        const { readEntryIds } = this.state;

        const title = stream.feed
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
                            <span className="badge badge-pill badge-negative badge-overlap">{readEntryIds.size || ''}</span>
                        </button>
                    }
                    menu={this.renderReadEntriesMenu()}
                    pullRight={true} />
                <Dropdown
                    className="navbar-action"
                    toggleButton={<button><i className="icon icon-24 icon-more" /></button>}
                    menu={this.renderConfigMenu()}
                    pullRight={true} />
            </Navbar>
        );
    }

    renderHeader() {
        const { stream } = this.props;

        if (stream.feed) {
            const { categories, onAddToCategory, onCreateCategory, onRemoveFromCategory, onSubscribe, onUnsubscribe, subscription } = this.props;

            return (
                <header className="stream-header">
                    <div className="container">
                        <div className="stream-header-content">
                            <div className="u-margin-right">
                                <div className="list-inline list-inline-dotted">
                                    <div className="list-inline-item u-text-muted">{stream.feed.subscribers} subscribers</div>
                                </div>
                                <div>{stream.feed.description}</div>
                            </div>
                            <Dropdown
                                toggleButton={
                                    <SubscribeButton
                                        isSubscribed={!!subscription}
                                        isLoading={stream.feed.isLoading} />
                                }
                                menu={
                                    <SubscribeMenu
                                        categories={categories}
                                        feed={stream.feed}
                                        onAddToCategory={onAddToCategory}
                                        onCreateCategory={onCreateCategory}
                                        onRemoveFromCategory={onRemoveFromCategory}
                                        onSubscribe={onSubscribe}
                                        onUnsubscribe={onUnsubscribe}
                                        subscription={subscription} />
                                }
                                pullRight={true} />
                        </div>
                    </div>
                </header>
            );
        }

        return null;
    }

    renderEntryList() {
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

    renderFooter() {
        const { isLoading, stream } = this.props;

        if (stream.continuation) {
            if (isLoading) {
                return (
                    <footer className="stream-footer">
                        <i className="icon icon-32 icon-spinner animation-clockwise-rotation" />
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
        categories: state.categories.items,
        isLoaded: state.streams.isLoaded,
        isLoading: state.streams.isLoading,
        stream: state.streams.current,
        subscription: state.subscriptions.items
            .find((subscription) => subscription.streamId === state.streams.current.streamId) || null
    }),
    bindActions({
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
)(StreamPage);
