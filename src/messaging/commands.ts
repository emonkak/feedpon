import * as CacheMap from 'utils/containers/CacheMap';
import * as streamActions from 'messaging/streams/actions';
import * as subscriptionActions from 'messaging/subscriptions/actions';
import * as uiActions from 'messaging/ui/actions';
import { Command, Entry, Stream, Thunk } from 'messaging/types';

const SCROLL_OFFSET = 48;

export const gotoFirstLine: Command = {
    title: 'Go to first line',
    thunk({ dispatch }) {
        dispatch(uiActions.scrollTo(0, 0));
    },
    skipNotification: true
};

export const gotoLastLine: Command = {
    title: 'Go to last line',
    thunk({ dispatch }) {
        dispatch(uiActions.scrollTo(
            0,
            document.documentElement.scrollHeight - document.documentElement.clientHeight
        ));
    },
    skipNotification: true
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

export const fetchComments: Command = {
    title: 'Fetch comments',
    thunk({ dispatch }) {
        const entry = dispatch(getActiveEntry);

        if (entry && entry.url) {
            if (entry.comments.isLoaded) {
                if (entry.comments.isShown) {
                    dispatch(streamActions.hideEntryComments(entry.entryId));
                } else {
                    dispatch(streamActions.showEntryComments(entry.entryId));
                }
            } else {
                dispatch(streamActions.fetchEntryComments(entry.entryId, entry.url));
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

export const reloadStream: Command = {
    title: 'Reload stream',
    thunk({ getState, dispatch }) {
        const { ui, streams } = getState();

        if (ui.selectedStreamId) {
            dispatch(streamActions.fetchStream(ui.selectedStreamId, streams.defaultFetchOptions));
        }
    }
};

export const scrollUp: Command = {
    title: 'Scroll up',
    thunk({ getState, dispatch }) {
        const { keyMappings } = getState();

        dispatch(uiActions.scrollBy(0, -keyMappings.scrollAmount));
    },
    skipNotification: true
};

export const scrollDown: Command = {
    title: 'Scroll down',
    thunk({ getState, dispatch }) {
        const { keyMappings } = getState();

        dispatch(uiActions.scrollBy(0, keyMappings.scrollAmount));
    },
    skipNotification: true
};

export const scrollHalfPageUp: Command = {
    title: 'Scroll half page up',
    thunk({ dispatch }) {
        dispatch(uiActions.scrollBy(0, -document.documentElement.clientHeight / 2));
    },
    skipNotification: true
};

export const scrollHalfPageDown: Command = {
    title: 'Scroll half page down',
    thunk({ dispatch }) {
        dispatch(uiActions.scrollBy(0, document.documentElement.clientHeight / 2));
    },
    skipNotification: true
};

export const scrollPageUp: Command = {
    title: 'Scroll page up',
    thunk({ dispatch }) {
        dispatch(uiActions.scrollBy(0, -document.documentElement.clientHeight));
    },
    skipNotification: true
};

export const scrollPageDown: Command = {
    title: 'Scroll page down',
    thunk({ dispatch }) {
        dispatch(uiActions.scrollBy(0, document.documentElement.clientHeight));
    },
    skipNotification: true
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
    thunk({ getState, dispatch }, { router }) {
        const { ui } = getState();

        if (ui.isScrolling || !ui.selectedStreamId) {
            return;
        }

        const elements = document.getElementsByClassName('entry');
        const scrollY = window.scrollY + SCROLL_OFFSET;

        for (let i = 0; i < elements.length; i++) {
            const element = elements[i] as HTMLElement;
            if (element.offsetTop > scrollY) {
                dispatch(uiActions.scrollTo(0, element.offsetTop - SCROLL_OFFSET));
                return;
            }
        }

        const y = document.documentElement.scrollHeight - window.innerHeight;

        if (window.scrollY === y) {
            const stream = dispatch(getSelectedStream);

            if (stream && stream.continuation) {
                dispatch(streamActions.fetchMoreEntries(stream.streamId, stream.continuation, stream.fetchOptions));
            }
        } else {
            dispatch(uiActions.scrollTo(0, y));
        }
    },
    skipNotification: true
};

export const selectPreviousEntry: Command = {
    title: 'Select previous entry',
    thunk({ dispatch, getState }, { router }) {
        const { ui } = getState();

        if (ui.isScrolling || !ui.selectedStreamId) {
            return;
        }

        const elements = document.getElementsByClassName('entry');
        const scrollY = window.scrollY + SCROLL_OFFSET;

        for (let i = elements.length - 1; i >= 0; i--) {
            const element = elements[i] as HTMLElement;
            if (element.offsetTop < scrollY) {
                dispatch(uiActions.scrollTo(0, element.offsetTop - SCROLL_OFFSET));
                return;
            }
        }

        if (window.scrollY !== 0) {
            dispatch(uiActions.scrollTo(0, 0));
        }
    },
    skipNotification: true
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
        const sortedCategories = selectors.sortedCategoriesSelector(state);

        if (streamId) {
            const selectedCategoryIndex = sortedCategories
                .findIndex((category) => category.streamId === streamId);
            const nextCategory = selectedCategoryIndex > -1
                ? sortedCategories[selectedCategoryIndex + 1]
                : sortedCategories[0];

            if (nextCategory) {
                router.push(`/streams/${encodeURIComponent(nextCategory.streamId)}`);
            }
        } else if (sortedCategories.length > 0) {
            const lastCategory = sortedCategories[sortedCategories.length - 1];

            router.push(`/streams/${encodeURIComponent(lastCategory.streamId)}`);
        }
    }
};

export const selectPreviousCategory: Command = {
    title: 'Select previous category',
    thunk({ dispatch, getState }, { router, selectors }) {
        const state = getState();
        const streamId = state.ui.selectedStreamId;
        const sortedCategories = selectors.sortedCategoriesSelector(state);

        if (streamId) {
            const selectedCategoryIndex = sortedCategories
                .findIndex((category) => category.streamId === streamId);
            const previousCategory = selectedCategoryIndex > -1
                ? sortedCategories[selectedCategoryIndex - 1]
                : sortedCategories[sortedCategories.length - 1];

            if (previousCategory) {
                router.push(`/streams/${encodeURIComponent(previousCategory.streamId)}`);
            }
        } else if (sortedCategories.length > 0) {
            const firstCategory = sortedCategories[0];

            router.push(`/streams/${encodeURIComponent(firstCategory.streamId)}`);
        }
    }
};

export const selectNextSubscription: Command = {
    title: 'Select next subscription',
    thunk({ dispatch, getState }, { router, selectors }) {
        const state = getState();
        const streamId = state.ui.selectedStreamId;
        const visibleSubscriptions = selectors.visibleSubscriptionsSelector(state);

        if (streamId) {
            const selectedSubscriptionIndex = visibleSubscriptions
                .findIndex((subscription) => subscription.streamId === streamId);
            const nextSubscription = selectedSubscriptionIndex > -1
                ? visibleSubscriptions[selectedSubscriptionIndex + 1]
                : visibleSubscriptions[0];

            if (nextSubscription) {
                router.push(`/streams/${encodeURIComponent(nextSubscription.streamId)}`);
            }
        } else if (visibleSubscriptions.length > 0) {
            const firstSubscription = visibleSubscriptions[0];

            router.push(`/streams/${encodeURIComponent(firstSubscription.streamId)}`);
        }
    }
};

export const selectPreviousSubscription: Command = {
    title: 'Select previous subscription',
    thunk({ dispatch, getState }, { router, selectors }) {
        const state = getState();
        const streamId = state.ui.selectedStreamId;
        const visibleSubscriptions = selectors.visibleSubscriptionsSelector(state);

        if (streamId) {
            const selectedSubscriptionIndex = visibleSubscriptions
                .findIndex((subscription) => subscription.streamId === streamId);
            const previousSubscription = selectedSubscriptionIndex > -1
                ? visibleSubscriptions[selectedSubscriptionIndex - 1]
                : visibleSubscriptions[visibleSubscriptions.length - 1];

            if (previousSubscription) {
                router.push(`/streams/${encodeURIComponent(previousSubscription.streamId)}`);
            }
        } else if (visibleSubscriptions.length > 0) {
            const lastSubscription = visibleSubscriptions[visibleSubscriptions.length - 1];

            router.push(`/streams/${encodeURIComponent(lastSubscription.streamId)}`);
        }
    }
};

export const showHelp: Command = {
    title: 'Show help',
    thunk({ dispatch }) {
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
