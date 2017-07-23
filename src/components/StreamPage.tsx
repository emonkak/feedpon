import React, { PureComponent } from 'react';
import shallowEqual from 'fbjs/lib/shallowEqual';
import { History, Location } from 'history';
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
import { Category, Entry, EntryOrderKind, State, Stream, StreamFetchOptions, StreamViewKind, Subscription } from 'messaging/types';
import { addToCategory, removeFromCategory, subscribe, unsubscribe } from 'messaging/subscriptions/actions';
import { changeActiveEntry, changeExpandedEntry, changeReadEntry, changeStreamView, selectStream, unselectStream } from 'messaging/ui/actions';
import { changeUnreadKeeping, fetchEntryComments, fetchFullContent, fetchMoreEntries, fetchStream, hideEntryComments, hideFullContents, markAllAsRead, markAsRead, markCategoryAsRead, markFeedAsRead, pinEntry, showEntryComments, showFullContents, unpinEntry } from 'messaging/streams/actions';
import { createCategory } from 'messaging/categories/actions';
import { createSortedCategoriesSelector } from 'messaging/categories/selectors';
import { scrollTo, toggleSidebar } from 'messaging/ui/actions';
import { ALL_STREAM_ID } from 'messaging/streams/constants';

interface StreamPageProps {
    activeEntryIndex: number;
    canMarkStreamAsRead: boolean;
    categories: Category[];
    category: Category;
    categoryUnreadCount: number;
    expandedEntryIndex: number;
    fetchOptions: StreamFetchOptions;
    isLoaded: boolean;
    isLoading: boolean;
    isScrolling: boolean;
    keepUnread: boolean;
    location: Location;
    onAddToCategory: typeof addToCategory;
    onChangeActiveEntry: typeof changeActiveEntry;
    onChangeExpandedEntry: typeof changeExpandedEntry;
    onChangeReadEntry: typeof changeReadEntry;
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
    onScrollTo: typeof scrollTo;
    onSelectStream: typeof selectStream;
    onShowEntryComments: typeof showEntryComments;
    onShowFullContents: typeof showFullContents;
    onSubscribe: typeof subscribe;
    onToggleSidebar: typeof toggleSidebar;
    onUnpinEntry: typeof unpinEntry;
    onUnselectStream: typeof unselectStream;
    onUnsubscribe: typeof unsubscribe;
    params: Params;
    readEntries: Entry[];
    readEntryIndex: number;
    router: History;
    shouldFetchStream: boolean;
    stream: Stream | null;
    streamView: StreamViewKind;
    subscription: Subscription | null;
};

const SCROLL_OFFSET = 48;

class StreamPage extends PureComponent<StreamPageProps, {}> {
    constructor(props: StreamPageProps, context: any) {
        super(props, context);

        this.handleChangeActiveEnetry = this.handleChangeActiveEnetry.bind(this);
        this.handleChangeEntryOrderKind = this.handleChangeEntryOrderKind.bind(this);
        this.handleClearReadEntries = this.handleClearReadEntries.bind(this);
        this.handleCloseEntry = this.handleCloseEntry.bind(this);
        this.handleLoadMoreEntries = this.handleLoadMoreEntries.bind(this);
        this.handleMarkAllAsRead = this.handleMarkAllAsRead.bind(this);
        this.handleMarkStreamAsRead = this.handleMarkStreamAsRead.bind(this);
        this.handleReloadEntries = this.handleReloadEntries.bind(this);
        this.handleScrollToEntry = this.handleScrollToEntry.bind(this);
        this.handleToggleOnlyUnread = this.handleToggleOnlyUnread.bind(this);
        this.handleToggleUnreadKeeping = this.handleToggleUnreadKeeping.bind(this);
    }

    componentWillMount() {
        const {
            fetchOptions,
            onFetchStream,
            onSelectStream,
            params,
            shouldFetchStream
        } = this.props;

        onSelectStream(params['stream_id']);

        if (shouldFetchStream) {
            onFetchStream(params['stream_id'], fetchOptions);
        }
    }

    componentWillUpdate(nextProps: StreamPageProps, nextState: {}) {
        // When transition to different stream
        if (this.props.location.pathname !== nextProps.location.pathname
            || !shallowEqual(this.props.location.query, nextProps.location.query)) {
            const { keepUnread, onMarkAsRead, readEntries } = this.props;

            if (!keepUnread && readEntries.length > 0) {
                onMarkAsRead(readEntries);
            }

            const { 
                fetchOptions,
                onFetchStream,
                onSelectStream,
                params,
                shouldFetchStream
            } = nextProps;

            onSelectStream(params['stream_id']);

            if (shouldFetchStream) {
                onFetchStream(params['stream_id'], fetchOptions);
            }
        }

        if (this.props.activeEntryIndex !== nextProps.activeEntryIndex) {
            if (nextProps.activeEntryIndex > -1) {
                const { onChangeReadEntry, readEntryIndex } = nextProps;
                const nextReadEntryIndex = nextProps.activeEntryIndex - 1;

                if (nextReadEntryIndex > readEntryIndex) {
                    onChangeReadEntry(nextReadEntryIndex);
                }
            }
        }
    }

    componentDidUpdate(prevProps: StreamPageProps, prevState: {}) {
        const { activeEntryIndex, expandedEntryIndex } = this.props;

        if (expandedEntryIndex !== prevProps.expandedEntryIndex) {
            if (expandedEntryIndex > -1) {
                this.scrollToEntry(expandedEntryIndex);
            } else {
                this.scrollToEntry(prevProps.expandedEntryIndex);
            }
        } else if (this.props.streamView !== prevProps.streamView) {
            this.scrollToEntry(activeEntryIndex);
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
        const { activeEntryIndex, onChangeActiveEntry } = this.props;

        if (activeEntryIndex !== nextActiveEntryIndex) {
            onChangeActiveEntry(nextActiveEntryIndex);
        }
    }

    handleChangeEntryOrderKind(entryOrder: EntryOrderKind) {
        const { location, onScrollTo, router } = this.props;

        onScrollTo(0, 0);

        router.replace({
            pathname: location.pathname,
            query: {
                ...location.query,
                entryOrder
            }
        });
    }

    handleClearReadEntries() {
        const { onChangeReadEntry, onScrollTo } = this.props;

        onScrollTo(0, 0, () => onChangeReadEntry(-1));
    }

    handleCloseEntry() {
        const { onChangeExpandedEntry } = this.props;

        onChangeExpandedEntry(-1);
    }

    handleLoadMoreEntries() {
        const { fetchOptions, keepUnread, onFetchMoreEntries, onMarkAsRead, readEntries, stream } = this.props;

        if (stream) {
            if (stream.continuation) {
                onFetchMoreEntries(stream.streamId, stream.continuation, fetchOptions);
            }

            if (!keepUnread && readEntries.length > 0) {
                onMarkAsRead(readEntries);
            }
        }
    }

    handleMarkAllAsRead() {
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
        const { fetchOptions, onFetchStream, onScrollTo, stream } = this.props;

        if (stream) {
            onScrollTo(0, 0, () => {
                onFetchStream(stream.streamId, fetchOptions);
            });
        }
    }

    handleScrollToEntry(entryId: string) {
        const { stream } = this.props;
        const entries = stream ? stream.entries : [];
        const entryIndex = entries.findIndex((entry) => entry.entryId === entryId);

        this.scrollToEntry(entryIndex);
    }

    handleToggleOnlyUnread() {
        const { fetchOptions, location, router, onScrollTo } = this.props;

        onScrollTo(0, 0);

        router.push({
            pathname: location.pathname,
            query: {
                ...location.query,
                onlyUnread: fetchOptions.onlyUnread ? '0' : '1'
            }
        });
    }

    handleToggleUnreadKeeping() {
        const { keepUnread, onChangeUnreadKeeping } = this.props;

        onChangeUnreadKeeping(!keepUnread);
    }

    scrollToEntry(index: number) {
        const { onScrollTo } = this.props;
        const entryElements = document.getElementsByClassName('entry');

        if (index < entryElements.length) {
            const entryElement = entryElements[index] as HTMLElement;
            if (entryElement) {
                onScrollTo(0, entryElement.offsetTop - SCROLL_OFFSET);
            }
        } else {
            const entryElement = entryElements[entryElements.length - 1] as HTMLElement;
            if (entryElement) {
                onScrollTo(0, entryElement.offsetTop + entryElement.offsetHeight - SCROLL_OFFSET)
            }
        }
    }

    renderNavbar() {
        const {
            canMarkStreamAsRead,
            expandedEntryIndex,
            fetchOptions,
            isLoading,
            keepUnread,
            onChangeStreamView,
            onToggleSidebar,
            readEntryIndex,
            stream,
            streamView
        } = this.props;
        return (
            <StreamNavbar
                canMarkStreamAsRead={canMarkStreamAsRead}
                entries={stream ? stream.entries : []}
                feed={stream ? stream.feed : null}
                fetchOptions={fetchOptions}
                isExpanded={expandedEntryIndex > -1}
                isLoading={isLoading}
                keepUnread={keepUnread}
                onChangeEntryOrderKind={this.handleChangeEntryOrderKind}
                onChangeStreamView={onChangeStreamView}
                onClearReadEntries={this.handleClearReadEntries}
                onCloseEntry={this.handleCloseEntry}
                onMarkStreamAsRead={this.handleMarkStreamAsRead}
                onReloadEntries={this.handleReloadEntries}
                onScrollToEntry={this.handleScrollToEntry}
                onToggleOnlyUnread={this.handleToggleOnlyUnread}
                onToggleSidebar={onToggleSidebar}
                onToggleUnreadKeeping={this.handleToggleUnreadKeeping}
                readEntryIndex={readEntryIndex}
                streamView={streamView}
                title={stream ? stream.title : ''} />
        );
    }

    renderStreamHeader() {
        const {
            categories,
            category,
            categoryUnreadCount,
            onAddToCategory,
            onCreateCategory,
            onRemoveFromCategory,
            onSubscribe,
            onUnsubscribe,
            stream,
            subscription
        } = this.props;

        if (stream) {
            if (stream.feed) {
                return (
                    <FeedHeader
                        categories={categories}
                        feed={stream.feed}
                        numEntries={stream.entries.length}
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
                        numEntries={stream.entries.length}
                        unreadCount={categoryUnreadCount} />
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
            isScrolling,
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
                isLoaded={isLoaded}
                isLoading={isLoading}
                isScrolling={isScrolling}
                onChangeActiveEntry={this.handleChangeActiveEnetry}
                onExpand={onChangeExpandedEntry}
                onFetchComments={onFetchEntryComments}
                onFetchFullContent={onFetchFullContent}
                onHideComments={onHideEntryComments}
                onHideFullContents={onHideFullContents}
                onPin={onPinEntry}
                onShowComments={onShowEntryComments}
                onShowFullContents={onShowFullContents}
                onUnpin={onUnpinEntry}
                sameOrigin={!!(stream && stream.feed)}
                streamView={streamView} />
        );
    }

    renderFooter() {
        const { canMarkStreamAsRead, isLoading, stream } = this.props;

        return (
            <StreamFooter
                canMarkStreamAsRead={canMarkStreamAsRead}
                hasMoreEntries={!!(stream && stream.continuation)}
                isLoading={isLoading}
                onLoadMoreEntries={this.handleLoadMoreEntries}
                onMarkAllAsRead={this.handleMarkAllAsRead} />
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
}

export default connect(() => {
    const categoriesSelector = createSortedCategoriesSelector();

    const fetchOptionsSelector = createSelector(
        (state: State) => state.streams.defaultFetchOptions,
        (state: State, props: StreamPageProps) => props.location.query,
        (defaultFetchOptions, query) => {
            const fetchOptions = Object.assign({}, defaultFetchOptions);

            if (query.numEntries != null) {
                fetchOptions.numEntries = parseInt(query.numEntries);
            }

            if (query.onlyUnread != null) {
                fetchOptions.onlyUnread = !!parseInt(query.onlyUnread);
            }

            if (query.entryOrder === 'newest' || query.entryOrder === 'oldest') {
                fetchOptions.entryOrder = query.entryOrder as EntryOrderKind;
            }

            return fetchOptions;
        }
    );

    const streamSelector = createSelector(
        (state: State) => state.streams.items,
        (state: State, props: StreamPageProps) => props.params['stream_id'],
        fetchOptionsSelector,
        (streams, streamId, fetchOptions) => {
            const stream = CacheMap.get(streams, streamId);
            return stream && shallowEqual(stream.fetchOptions, fetchOptions)
                ? stream
                : null;
        }
    );

    const entriesSelector = createSelector(
        streamSelector,
        (stream) => stream ? stream.entries : []
    );

    const readEntriesSelector = createSelector(
        entriesSelector,
        (state: State) => state.ui.readEntryIndex,
        (entries, readEntryIndex) => entries.slice(0, readEntryIndex + 1).filter((entry) => !entry.markedAsRead)
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

    const categoryUnreadCountSelector = createSelector(
        categorySelector,
        (state: State) => state.subscriptions.items,
        (category, subscriptions) => {
            if (!category) {
                return 0;
            }

            const label = category.label;

            return Object.values(subscriptions)
                .reduce((acc, subscription) => {
                    if (!subscription.labels.includes(label)
                        || subscription.unreadCount < subscription.readCount) {
                        return acc;
                    }
                    return acc + (subscription.unreadCount - subscription.readCount);
                }, 0);
        }
    );

    const canMarkStreamAsReadSelector = createSelector(
        streamSelector,
        entriesSelector,
        subscriptionSelector,
        categorySelector,
        (state: State) => state.streams.isMarking,
        (stream, entries, subscription, category, isMarking) => {
            if (isMarking
                || !stream
                || entries.every((entry) => entry.markedAsRead)) {
                return false;
            }
            return stream.streamId === ALL_STREAM_ID || !!subscription || !!category;
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
            canMarkStreamAsRead: canMarkStreamAsReadSelector(state, props),
            categories: categoriesSelector(state),
            category: categorySelector(state, props),
            categoryUnreadCount: categoryUnreadCountSelector(state, props),
            expandedEntryIndex: state.ui.expandedEntryIndex,
            fetchOptions: fetchOptionsSelector(state, props),
            isLoaded: state.streams.isLoaded,
            isLoading: state.streams.isLoading,
            isScrolling: state.ui.isScrolling,
            keepUnread: state.streams.keepUnread,
            readEntries: readEntriesSelector(state, props),
            readEntryIndex: state.ui.readEntryIndex,
            shouldFetchStream: shouldFetchStreamSelector(state, props),
            stream: streamSelector(state, props),
            streamView: state.ui.streamView,
            subscription: subscriptionSelector(state, props) as Subscription | null
        }),
        mapDispatchToProps: bindActions({
            onAddToCategory: addToCategory,
            onChangeActiveEntry: changeActiveEntry,
            onChangeExpandedEntry: changeExpandedEntry,
            onChangeReadEntry: changeReadEntry,
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
            onScrollTo: scrollTo,
            onSelectStream: selectStream,
            onShowEntryComments: showEntryComments,
            onShowFullContents: showFullContents,
            onSubscribe: subscribe,
            onToggleSidebar: toggleSidebar,
            onUnpinEntry: unpinEntry,
            onUnselectStream: unselectStream,
            onUnsubscribe: unsubscribe
        })
    };
})(StreamPage);
