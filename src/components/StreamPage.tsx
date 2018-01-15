import React, { PureComponent } from 'react';
import { Params } from 'react-router/lib/Router';
import { createSelector } from 'reselect';

import * as CacheMap from 'utils/containers/CacheMap';
import CategoryHeader from 'components/parts/CategoryHeader';
import EntryList from 'components/parts/EntryList';
import FeedHeader from 'components/parts/FeedHeader';
import MainLayout from 'components/layouts/MainLayout';
import StreamFooter from 'components/parts/StreamFooter';
import StreamNavbar from 'components/parts/StreamNavbar';
import bindActions from 'utils/flux/bindActions';
import connect from 'utils/flux/react/connect';
import { ALL_STREAM_ID } from 'messaging/streams/constants';
import { Category, Entry, EntryOrderKind, State, Stream, StreamViewKind, Subscription } from 'messaging/types';
import { addToCategory, removeFromCategory, subscribe, unsubscribe } from 'messaging/subscriptions/actions';
import { changeActiveEntry, changeExpandedEntry, resetReadEntry, changeStreamView, selectStream, unselectStream } from 'messaging/ui/actions';
import { changeUnreadKeeping, fetchEntryComments, fetchFullContent, fetchMoreEntries, fetchStream, hideEntryComments, hideFullContents, markAllAsRead, markAsRead, markCategoryAsRead, markFeedAsRead, pinEntry, showEntryComments, showFullContents, unpinEntry, updateHeightCache } from 'messaging/streams/actions';
import { createCategory } from 'messaging/categories/actions';
import { createSortedCategoriesSelector } from 'messaging/categories/selectors';
import { smoothScrollTo } from 'utils/dom/smoothScroll';
import { toggleSidebar } from 'messaging/ui/actions';

interface StreamPageProps {
    activeEntryIndex: number;
    canMarkAllEntriesAsRead: boolean;
    canMarkStreamAsRead: boolean;
    categories: Category[];
    category: Category;
    expandedEntryIndex: number;
    isLoaded: boolean;
    isLoading: boolean;
    keepUnread: boolean;
    onAddToCategory: typeof addToCategory;
    onChangeActiveEntry: typeof changeActiveEntry;
    onChangeExpandedEntry: typeof changeExpandedEntry;
    onChangeStreamView: typeof changeStreamView;
    onChangeUnreadKeeping: typeof changeUnreadKeeping,
    onCreateCategory: typeof createCategory;
    onFetchEntryComments: typeof fetchEntryComments;
    onFetchFullContent: typeof fetchFullContent;
    onFetchMoreEntries: typeof fetchMoreEntries;
    onFetchStream: typeof fetchStream;
    onHideEntryComments: typeof hideEntryComments;
    onHideFullContents: typeof hideFullContents;
    onMarkAllAsRead: typeof markAllAsRead;
    onMarkAsRead: typeof markAsRead;
    onMarkCategoryAsRead: typeof markCategoryAsRead;
    onMarkFeedAsRead: typeof markFeedAsRead;
    onPinEntry: typeof pinEntry;
    onRemoveFromCategory: typeof removeFromCategory;
    onResetReadEntry: typeof resetReadEntry;
    onSelectStream: typeof selectStream;
    onShowEntryComments: typeof showEntryComments;
    onShowFullContents: typeof showFullContents;
    onSubscribe: typeof subscribe;
    onToggleSidebar: typeof toggleSidebar;
    onUnpinEntry: typeof unpinEntry;
    onUnselectStream: typeof unselectStream;
    onUnsubscribe: typeof unsubscribe;
    onUpdateHeightCache: typeof updateHeightCache;
    params: Params;
    readEntries: Entry[];
    shouldFetchStream: boolean;
    stream: Stream | null;
    streamView: StreamViewKind;
    subscription: Subscription | null;
};

class StreamPage extends PureComponent<StreamPageProps, {}> {
    private _entryList: EntryList | null = null;

    constructor(props: StreamPageProps, context: any) {
        super(props, context);

        this.handleChangeActiveEnetry = this.handleChangeActiveEnetry.bind(this);
        this.handleChangeEntryOrderKind = this.handleChangeEntryOrderKind.bind(this);
        this.handleChangeNumberOfEntries = this.handleChangeNumberOfEntries.bind(this);
        this.handleClearReadEntries = this.handleClearReadEntries.bind(this);
        this.handleCloseEntry = this.handleCloseEntry.bind(this);
        this.handleHeightUpdated = this.handleHeightUpdated.bind(this);
        this.handleLoadMoreEntries = this.handleLoadMoreEntries.bind(this);
        this.handleMarkAllEntriesAsRead = this.handleMarkAllEntriesAsRead.bind(this);
        this.handleMarkStreamAsRead = this.handleMarkStreamAsRead.bind(this);
        this.handleReloadEntries = this.handleReloadEntries.bind(this);
        this.handleScrollToEntry = this.handleScrollToEntry.bind(this);
        this.handleToggleOnlyUnread = this.handleToggleOnlyUnread.bind(this);
        this.handleToggleUnreadKeeping = this.handleToggleUnreadKeeping.bind(this);
    }

    componentWillMount() {
        const {
            onFetchStream,
            onSelectStream,
            params,
            shouldFetchStream
        } = this.props;

        onSelectStream(params['stream_id']);

        if (shouldFetchStream) {
            onFetchStream(params['stream_id']);
        }
    }

    componentWillUpdate(nextProps: StreamPageProps, nextState: {}) {
        // When transition to different stream
        if (this.props.params['stream_id'] !== nextProps.params['stream_id']) {
            const { keepUnread, onMarkAsRead, readEntries } = this.props;

            if (!keepUnread && readEntries.length > 0) {
                onMarkAsRead(readEntries);
            }

            const { 
                onFetchStream,
                onSelectStream,
                params,
                shouldFetchStream
            } = nextProps;

            onSelectStream(params['stream_id']);

            if (shouldFetchStream) {
                onFetchStream(params['stream_id']);
            }
        }
    }

    componentWillUnmount() {
        const { keepUnread, onMarkAsRead, onUnselectStream, readEntries } = this.props;

        onUnselectStream();

        if (!keepUnread && readEntries.length > 0) {
            onMarkAsRead(readEntries);
        }
    }

    handleChangeActiveEnetry(nextActiveEntryIndex: number) {
        const { stream, onChangeActiveEntry } = this.props;

        if (stream) {
            onChangeActiveEntry(stream.streamId, nextActiveEntryIndex);
        }
    }

    handleChangeEntryOrderKind(entryOrder: EntryOrderKind) {
        const { onFetchStream, stream } = this.props;

        if (stream) {
            smoothScrollTo(window, 0, 0).then(() => {
                onFetchStream(stream.streamId, {
                    ...stream.fetchOptions,
                    entryOrder
                });
            });
        }
    }

    handleChangeNumberOfEntries(numEntries: number) {
        const { onFetchStream, stream } = this.props;

        if (stream) {
            smoothScrollTo(window, 0, 0).then(() => {
                onFetchStream(stream.streamId, {
                    ...stream.fetchOptions,
                    numEntries
                });
            });
        }
    }

    handleClearReadEntries() {
        const { onResetReadEntry, stream } = this.props;

        if (stream) {
            smoothScrollTo(window, 0, 0).then(() => onResetReadEntry(stream.streamId));
        }
    }

    handleCloseEntry() {
        const { onChangeExpandedEntry } = this.props;

        onChangeExpandedEntry(-1);
    }

    handleHeightUpdated(heights: { [id: string]: number }): void {
        const { onUpdateHeightCache, stream } = this.props;

        if (stream) {
            onUpdateHeightCache(stream.streamId, heights);
        }
    }

    handleLoadMoreEntries() {
        const { onFetchMoreEntries, stream } = this.props;

        if (stream && stream.continuation) {
            onFetchMoreEntries(stream.streamId, stream.continuation, stream.fetchOptions);
        }
    }

    handleMarkAllEntriesAsRead() {
        const { stream, onMarkAsRead } = this.props;
        const unreadEntries = stream ? stream.entries.filter((entry) => !entry.markedAsRead) : [];

        if (unreadEntries.length > 0) {
            onMarkAsRead(unreadEntries);
        }
    }

    handleMarkStreamAsRead() {
        const { category, onMarkAllAsRead, onMarkCategoryAsRead, onMarkFeedAsRead, stream, subscription } = this.props;

        if (stream && stream.streamId === ALL_STREAM_ID) {
            onMarkAllAsRead();
        } else if (category) {
            onMarkCategoryAsRead(category);
        } else if (subscription) {
            onMarkFeedAsRead(subscription);
        }
    }

    handleReloadEntries() {
        const { onFetchStream, stream } = this.props;

        if (stream) {
            smoothScrollTo(window, 0, 0).then(() => {
                onFetchStream(stream.streamId, stream.fetchOptions);
            });
        }
    }

    handleScrollToEntry(index: number) {
        if (this._entryList) {
            this._entryList.scrollToIndex(index);
        }
    }

    handleToggleOnlyUnread() {
        const { onFetchStream, stream } = this.props;

        if (stream) {
            smoothScrollTo(window, 0, 0).then(() => {
                onFetchStream(stream.streamId, {
                    ...stream.fetchOptions,
                    onlyUnread: !stream.fetchOptions.onlyUnread
                });
            });
        }
    }

    handleToggleUnreadKeeping() {
        const { keepUnread, onChangeUnreadKeeping } = this.props;

        onChangeUnreadKeeping(!keepUnread);
    }

    renderNavbar() {
        const {
            activeEntryIndex,
            canMarkStreamAsRead,
            expandedEntryIndex,
            isLoading,
            keepUnread,
            onChangeStreamView,
            onToggleSidebar,
            stream,
            streamView
        } = this.props;

        return (
            <StreamNavbar
                activeEntryIndex={activeEntryIndex}
                canMarkStreamAsRead={canMarkStreamAsRead}
                entries={stream ? stream.entries : []}
                feed={stream ? stream.feed : null}
                fetchOptions={stream ? stream.fetchOptions : null}
                isExpanded={expandedEntryIndex > -1}
                isLoading={isLoading}
                keepUnread={keepUnread}
                onChangeEntryOrderKind={this.handleChangeEntryOrderKind}
                onChangeNumberOfEntries={this.handleChangeNumberOfEntries}
                onChangeStreamView={onChangeStreamView}
                onClearReadPosition={this.handleClearReadEntries}
                onCloseEntry={this.handleCloseEntry}
                onMarkStreamAsRead={this.handleMarkStreamAsRead}
                onReloadEntries={this.handleReloadEntries}
                onScrollToEntry={this.handleScrollToEntry}
                onToggleOnlyUnread={this.handleToggleOnlyUnread}
                onToggleSidebar={onToggleSidebar}
                onToggleUnreadKeeping={this.handleToggleUnreadKeeping}
                readEntryIndex={stream ? stream.readEntryIndex : -1}
                streamView={streamView}
                title={stream ? stream.title : ''} />
        );
    }

    renderStreamHeader() {
        const {
            categories,
            category,
            onAddToCategory,
            onCreateCategory,
            onRemoveFromCategory,
            onSubscribe,
            onUnsubscribe,
            stream,
            subscription
        } = this.props;

        if (stream) {
            const numUnreads = stream.entries
                .reduce((acc, entry) => acc + (entry.markedAsRead ? 0 : 1), 0);

            if (stream.feed) {
                return (
                    <FeedHeader
                        categories={categories}
                        feed={stream.feed}
                        hasMoreEntries={!!stream.continuation}
                        numEntries={stream.entries.length}
                        numUnreads={numUnreads}
                        onAddToCategory={onAddToCategory}
                        onCreateCategory={onCreateCategory}
                        onRemoveFromCategory={onRemoveFromCategory}
                        onSubscribe={onSubscribe}
                        onUnsubscribe={onUnsubscribe}
                        subscription={subscription} />
                );
            }

            if (category) {
                return (
                    <CategoryHeader
                        category={category}
                        hasMoreEntries={!!stream.continuation}
                        numEntries={stream.entries.length}
                        numUnreads={numUnreads} />
                );
            }
        }

        return null;
    }

    renderStreamEntries() {
        const {
            activeEntryIndex,
            expandedEntryIndex,
            isLoaded,
            isLoading,
            onChangeExpandedEntry,
            onFetchEntryComments,
            onFetchFullContent,
            onHideEntryComments,
            onHideFullContents,
            onPinEntry,
            onShowEntryComments,
            onShowFullContents,
            onUnpinEntry,
            stream,
            streamView
        } = this.props;

        return (
            <EntryList
                activeEntryIndex={activeEntryIndex}
                entries={stream ? stream.entries : []}
                expandedEntryIndex={expandedEntryIndex}
                heightCache={stream ? stream.heightCache : {}}
                isLoaded={isLoaded}
                isLoading={isLoading}
                onChangeActiveEntry={this.handleChangeActiveEnetry}
                onExpand={onChangeExpandedEntry}
                onFetchComments={onFetchEntryComments}
                onFetchFullContent={onFetchFullContent}
                onHeightUpdated={this.handleHeightUpdated}
                onHideComments={onHideEntryComments}
                onHideFullContents={onHideFullContents}
                onPin={onPinEntry}
                onShowComments={onShowEntryComments}
                onShowFullContents={onShowFullContents}
                onUnpin={onUnpinEntry}
                ref={this._handleEntryList}
                sameOrigin={!!(stream && stream.feed)}
                streamView={streamView} />
        );
    }

    renderFooter() {
        const { canMarkAllEntriesAsRead, isLoading, stream } = this.props;

        return (
            <StreamFooter
                canMarkAllEntriesAsRead={canMarkAllEntriesAsRead}
                hasMoreEntries={!!(stream && stream.continuation)}
                isLoading={isLoading}
                onLoadMoreEntries={this.handleLoadMoreEntries}
                onMarkAllEntiresAsRead={this.handleMarkAllEntriesAsRead} />
        );
    }

    render() {
        return (
            <MainLayout header={this.renderNavbar()} footer={this.renderFooter()}>
                {this.renderStreamHeader()}
                {this.renderStreamEntries()}
            </MainLayout>
        );
    }

    private _handleEntryList = (entryList: EntryList | null) => {
        this._entryList = entryList;
    }
}

export default connect(() => {
    const categoriesSelector = createSortedCategoriesSelector();

    const streamSelector = createSelector(
        (state: State) => state.streams.items,
        (state: State, props: StreamPageProps) => props.params['stream_id'],
        (streams, streamId) => CacheMap.get(streams, streamId) || null
    );

    const entriesSelector = createSelector(
        streamSelector,
        (stream) => stream ? stream.entries : []
    );

    const readEntriesSelector = createSelector(
        streamSelector,
        (stream) => stream ? stream.entries.slice(0, stream.readEntryIndex + 1).filter((entry) => !entry.markedAsRead) : []
    );

    const subscriptionSelector: (state: State, props: StreamPageProps) => Subscription | null = createSelector(
        (state: State) => state.subscriptions.items,
        (state: State, props: StreamPageProps) => props.params['stream_id'],
        (subscriptions, streamId) => subscriptions[streamId] || null
    );

    const categorySelector: (state: State, props: StreamPageProps) => Category | null = createSelector(
        (state: State) => state.categories.items,
        (state: State, props: StreamPageProps) => props.params['stream_id'],
        (categories, streamId) => categories[streamId] || null
    );

    const canMarkAllEntriesAsReadSelector = createSelector(
        entriesSelector,
        (state: State) => state.streams.isMarking,
        (entries, isMarking) => {
            return !isMarking && entries.some((entry) => !entry.markedAsRead);
        }
    );

    const canMarkStreamAsReadSelector = createSelector(
        streamSelector,
        subscriptionSelector,
        categorySelector,
        (state: State) => state.streams.isMarking,
        (stream, subscription, category, isMarking) => {
            return !isMarking && ((stream && stream.streamId === ALL_STREAM_ID) || subscription !== null || category !== null);
        }
    );

    const shouldFetchStreamSelector = createSelector(
        streamSelector,
        (state: State) => state.streams.isLoaded,
        (state: State) => state.subscriptions.lastUpdatedAt,
        (stream, isLoaded, lastUpdateOfsubscriptions) => {
            return !stream || !isLoaded || lastUpdateOfsubscriptions > stream.fetchedAt;
        }
    );

    return {
        mapStateToProps: (state: State, props: StreamPageProps) => ({
            activeEntryIndex: state.ui.activeEntryIndex,
            canMarkAllEntriesAsRead: canMarkAllEntriesAsReadSelector(state, props),
            canMarkStreamAsRead: canMarkStreamAsReadSelector(state, props),
            categories: categoriesSelector(state),
            category: categorySelector(state, props),
            expandedEntryIndex: state.ui.expandedEntryIndex,
            isLoaded: state.streams.isLoaded,
            isLoading: state.streams.isLoading,
            keepUnread: state.streams.keepUnread,
            readEntries: readEntriesSelector(state, props),
            shouldFetchStream: shouldFetchStreamSelector(state, props),
            stream: streamSelector(state, props),
            streamView: state.ui.streamView,
            subscription: subscriptionSelector(state, props) as Subscription | null
        }),
        mapDispatchToProps: bindActions({
            onAddToCategory: addToCategory,
            onChangeActiveEntry: changeActiveEntry,
            onChangeExpandedEntry: changeExpandedEntry,
            onChangeStreamView: changeStreamView,
            onChangeUnreadKeeping: changeUnreadKeeping,
            onCreateCategory: createCategory,
            onFetchEntryComments: fetchEntryComments,
            onFetchFullContent: fetchFullContent,
            onFetchMoreEntries: fetchMoreEntries,
            onFetchStream: fetchStream,
            onHideEntryComments: hideEntryComments,
            onHideFullContents: hideFullContents,
            onMarkAllAsRead: markAllAsRead,
            onMarkAsRead: markAsRead,
            onMarkCategoryAsRead: markCategoryAsRead,
            onMarkFeedAsRead: markFeedAsRead,
            onPinEntry: pinEntry,
            onRemoveFromCategory: removeFromCategory,
            onResetReadEntry: resetReadEntry,
            onSelectStream: selectStream,
            onShowEntryComments: showEntryComments,
            onShowFullContents: showFullContents,
            onSubscribe: subscribe,
            onToggleSidebar: toggleSidebar,
            onUnpinEntry: unpinEntry,
            onUnselectStream: unselectStream,
            onUnsubscribe: unsubscribe,
            onUpdateHeightCache: updateHeightCache
        })
    };
})(StreamPage);
