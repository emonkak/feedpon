import * as CacheMap from 'utils/containers/CacheMap';
import * as streamActions from 'messaging/streams/actions';
import * as subscriptionActions from 'messaging/subscriptions/actions';
import * as uiActions from 'messaging/ui/actions';
import { Command, Entry, Store, Stream, Thunk } from 'messaging/types';
import { smoothScrollTo, smoothScrollBy } from 'utils/dom/smoothScroll';

const SCROLL_ANIMATION_DURATION = 1000 / 60 * 10;
const SCROLL_OFFSET = 48;

export const gotoFirstLine: Command = {
    title: 'Go to first line',
    thunk(store) {
        return scrollTo(store, 0, 0);
    }
};

export const gotoLastLine: Command = {
    title: 'Go to last line',
    thunk(store) {
        return scrollTo(
            store,
            0,
            document.documentElement.scrollHeight - document.documentElement.clientHeight
        );
    }
};

export const fetchFullContent: Command = {
    title: 'Fetch full content',
    thunk({ dispatch }) {
        const entry = dispatch(getActiveEntry);

        if (entry && entry.url) {
            if (entry.fullContents.isLoaded) {
                const lastFullContent = entry.fullContents.items[entry.fullContents.items.length - 1];

                if (lastFullContent && lastFullContent.nextPageUrl) {
                    dispatch(streamActions.fetchFullContent(entry.entryId, lastFullContent.nextPageUrl));
                } else {
                    if (entry.fullContents.isShown) {
                        dispatch(streamActions.hideFullContents(entry.entryId));
                    } else {
                        dispatch(streamActions.showFullContents(entry.entryId));
                    }
                }
            } else {
                dispatch(streamActions.fetchFullContent(entry.entryId, entry.url));
            }
        }
    }
};

export const pinOrUnpinEntry: Command = {
    title: 'Pin/Unpin entry',
    thunk({ dispatch }) {
        const entry = dispatch(getActiveEntry);

        if (entry) {
            if (entry.isPinned) {
                dispatch(streamActions.unpinEntry(entry.entryId));
            } else {
                dispatch(streamActions.pinEntry(entry.entryId));
            }
        }
    }
};

export const reloadSubscriptions: Command = {
    title: 'Reload subscriptions',
    thunk({ dispatch }) {
        dispatch(subscriptionActions.fetchSubscriptions());
    }
};

export const scrollUp: Command = {
    title: 'Scroll up',
    thunk(store) {
        return scrollBy(store, 0, -200);
    }
};

export const scrollDown: Command = {
    title: 'Scroll down',
    thunk(store) {
        return scrollBy(store, 0, 200);
    }
};

export const scrollHalfPageUp: Command = {
    title: 'Scroll half page up',
    thunk(store) {
        return scrollBy(store, 0, -document.documentElement.clientHeight / 2);
    }
};

export const scrollHalfPageDown: Command = {
    title: 'Scroll half page down',
    thunk(store) {
        return scrollBy(store, 0, document.documentElement.clientHeight / 2);
    }
};

export const scrollPageUp: Command = {
    title: 'Scroll page up',
    thunk(store) {
        return scrollBy(store, 0, -document.documentElement.clientHeight);
    }
};

export const scrollPageDown: Command = {
    title: 'Scroll page down',
    thunk(store) {
        return scrollBy(store, 0, document.documentElement.clientHeight);
    }
};

export const searchSubscriptions: Command = {
    title: 'Search subscriptions',
    thunk({ dispatch, getState }) {
        const { ui } = getState();

        if (!ui.sidebarIsOpened) {
            dispatch(uiActions.openSidebar());
        }

        const searchInput = document.querySelector('.input-search-box') as HTMLElement | null;

        if (searchInput) {
            searchInput.focus();
        }
    }
};

export const selectNextEntry: Command = {
    title: 'Select next entry',
    thunk(store, { router }) {
        const { ui } = store.getState();
        if (ui.isScrolling) {
            return;
        }

        const elements = document.getElementsByClassName('entry');
        const scrollY = window.scrollY + SCROLL_OFFSET;

        for (let i = 0; i < elements.length; i++) {
            const element = elements[i] as HTMLElement;
            if (element.offsetTop > scrollY) {
                scrollTo(store, 0, element.offsetTop - SCROLL_OFFSET);
                return;
            }
        }

        const y = document.documentElement.scrollHeight - window.innerHeight;

        if (window.scrollY === y) {
            const stream = store.dispatch(getSelectedStream);

            if (stream && stream.continuation) {
                store.dispatch(streamActions.fetchMoreEntries(stream.streamId, stream.continuation, stream.fetchOptions));
            }
        } else {
            scrollTo(store, 0, y);
        }
    }
};

export const selectPreviousEntry: Command = {
    title: 'Select previous entry',
    thunk(store, { router }) {
        const { ui } = store.getState();
        if (ui.isScrolling) {
            return;
        }

        const elements = document.getElementsByClassName('entry');
        const scrollY = window.scrollY + SCROLL_OFFSET;

        for (let i = elements.length - 1; i >= 0; i--) {
            const element = elements[i] as HTMLElement;
            if (element.offsetTop < scrollY) {
                scrollTo(store, 0, element.offsetTop - SCROLL_OFFSET);
                return;
            }
        }

        if (window.scrollY !== 0) {
            scrollTo(store, 0, 0);
        }
    }
};

export const openEntry: Command = {
    title: 'Open entry',
    thunk({ getState, dispatch }) {
        const { ui } = getState();

        dispatch(uiActions.changeExpandedEntry(ui.activeEntryIndex));
    }
};

export const closeEntry: Command = {
    title: 'Close entry',
    thunk({ dispatch }) {
        dispatch(uiActions.changeExpandedEntry(-1));
    }
};

export const selectNextCategory: Command = {
    title: 'Select next category',
    thunk({ dispatch, getState }, { router, selectors }) {
        const state = getState();
        const streamId = state.ui.selectedStreamId;

        if (streamId) {
            const sortedCategories = selectors.sortedCategoriesSelector(state);
            const selectedCategoryIndex = sortedCategories
                .findIndex((category) => category.streamId === streamId);
            const nextCategory = selectedCategoryIndex > -1
                ? sortedCategories[selectedCategoryIndex + 1]
                : sortedCategories[0];

            if (nextCategory) {
                router.push(`/streams/${encodeURIComponent(nextCategory.streamId)}`);
            }
        }
    }
};

export const selectPreviousCategory: Command = {
    title: 'Select previous category',
    thunk({ dispatch, getState }, { router, selectors }) {
        const state = getState();
        const streamId = state.ui.selectedStreamId;

        if (streamId) {
            const sortedCategories = selectors.sortedCategoriesSelector(state);
            const selectedCategoryIndex = sortedCategories
                .findIndex((category) => category.streamId === streamId);
            const previousCategory = selectedCategoryIndex > -1
                ? sortedCategories[selectedCategoryIndex - 1]
                : sortedCategories[sortedCategories.length - 1];

            if (previousCategory) {
                router.push(`/streams/${encodeURIComponent(previousCategory.streamId)}`);
            }
        }
    }
};

export const selectNextSubscription: Command = {
    title: 'Select next subscription',
    thunk({ dispatch, getState }, { router, selectors }) {
        const state = getState();
        const streamId = state.ui.selectedStreamId;

        if (streamId) {
            const visibleSubscriptions = selectors.visibleSubscriptionsSelector(state);
            const selectedSubscriptionIndex = visibleSubscriptions
                .findIndex((subscription) => subscription.streamId === streamId);
            const nextSubscription = selectedSubscriptionIndex > -1
                ? visibleSubscriptions[selectedSubscriptionIndex + 1]
                : visibleSubscriptions[0];

            if (nextSubscription) {
                router.push(`/streams/${encodeURIComponent(nextSubscription.streamId)}`);
            }
        }
    }
};

export const selectPreviousSubscription: Command = {
    title: 'Select previous subscription',
    thunk({ dispatch, getState }, { router, selectors }) {
        const state = getState();
        const streamId = state.ui.selectedStreamId;

        if (streamId) {
            const visibleSubscriptions = selectors.visibleSubscriptionsSelector(state);
            const selectedSubscriptionIndex = visibleSubscriptions
                .findIndex((subscription) => subscription.streamId === streamId);
            const previousSubscription = selectedSubscriptionIndex > -1
                ? visibleSubscriptions[selectedSubscriptionIndex - 1]
                : visibleSubscriptions[visibleSubscriptions.length - 1];

            if (previousSubscription) {
                router.push(`/streams/${encodeURIComponent(previousSubscription.streamId)}`);
            }
        }
    }
};

export const showHelp: Command = {
    title: 'Show help',
    thunk(store) {
        window.alert('help');
    }
};

export const toggleSidebar: Command = {
    title: 'Toggle sidebar',
    thunk({ getState, dispatch }) {
        const { ui } = getState();

        if (ui.sidebarIsOpened) {
            dispatch(uiActions.closeSidebar());
        } else {
            dispatch(uiActions.openSidebar());
        }
    }
};

export const toggleStreamView: Command = {
    title: 'Toggle stream view',
    thunk({ getState, dispatch }) {
        const { ui } = getState();

        if (ui.streamView === 'expanded') {
            dispatch(uiActions.changeStreamView('collapsible'));
        } else {
            dispatch(uiActions.changeStreamView('expanded'));
        }
    }
};

export const visitWebsite: Command = {
    title: 'Visit website',
    thunk({ dispatch }) {
        const entry = dispatch(getActiveEntry);

        if (entry && entry.url) {
            window.open(entry.url);
        }
    }
};

export const visitWebsiteInBackground: Command = {
    title: 'Visit website in background',
    thunk({ dispatch }) {
        const entry = dispatch(getActiveEntry);

        if (entry && entry.url) {
            openUrlInBackground(entry.url);
        }
    }
};

function scrollBy({ getState, dispatch }: Store, dx: number, dy: number): Promise<void> {
    const { ui } = getState();

    if (!ui.isScrolling) {
        dispatch(uiActions.startScroll());
    }

    return smoothScrollBy(document.body, dx, dy, SCROLL_ANIMATION_DURATION)
        .then(() => {
            dispatch(uiActions.endScroll());
        });
}

function scrollTo({ getState, dispatch }: Store, x: number, y: number): Promise<void> {
    const { ui } = getState();

    if (!ui.isScrolling) {
        dispatch(uiActions.startScroll());
    }

    return smoothScrollTo(document.body, x, y, SCROLL_ANIMATION_DURATION)
        .then(() => {
            dispatch(uiActions.endScroll());
        });
}

function openUrlInBackground(url: string): void {
    if (chrome) {
        chrome.tabs.create({ url, active: false });
    } else {
        const a = document.createElement('a');
        a.href = url;

        const event = document.createEvent('MouseEvents');
        event.initMouseEvent(
            'click', true, true, window,
            0, 0, 0, 0, 0,
            false, false, false, false,
            1, null
        );

        a.dispatchEvent(event);
    }
}

const getSelectedStream: Thunk<Stream | null> = ({ getState }) => {
    const { ui, streams } = getState();

    if (ui.selectedStreamId) {
        const stream = CacheMap.get(streams.items, ui.selectedStreamId);

        if (stream) {
            return stream;
        }
    }

    return null;
};

const getActiveEntry: Thunk<Entry | null> = ({ getState, dispatch }) => {
    const seletedStream = dispatch(getSelectedStream);

    if (seletedStream) {
        const { ui } = getState();
        const entry = seletedStream.entries[ui.activeEntryIndex];

        if (entry) {
            return entry;
        }
    }

    return null;
};
