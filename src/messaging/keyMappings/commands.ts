import * as CacheMap from 'utils/containers/CacheMap';
import * as streamActions from 'messaging/streams/actions';
import * as subscriptionActions from 'messaging/subscriptions/actions';
import * as uiActions from 'messaging/ui/actions';
import { Command, Entry, Stream, Thunk } from 'messaging/types';

const SCROLL_OFFSET = 48;

const TEMPLATE_PATTERN = /\${([A-Z_]\w+)}/i;

export const gotoFirstLine: Command<{}> = {
    commandId: 'gotoFirstLine',
    name: 'Go to first line',
    description: 'Command description here.',
    action() {
        return uiActions.scrollTo(0, 0);
    }
};

export const gotoLastLine: Command<{}> = {
    commandId: 'gotoLastLine',
    name: 'Go to last line',
    description: 'Command description here.',
    action() {
        return uiActions.scrollTo(
            0,
            document.documentElement.scrollHeight - document.documentElement.clientHeight
        );
    }
};

export const fetchFullContent: Command<{}> = {
    commandId: 'fetchFullContent',
    name: 'Fetch full content',
    description: 'Command description here.',
    action() {
        return ({ dispatch }) => {
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
    }
};

export const fetchComments: Command<{}> = {
    commandId: 'fetchComments',
    name: 'Fetch comments',
    description: 'Command description here.',
    action() {
        return ({ dispatch }) => {
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
    }
};

export const pinOrUnpinEntry: Command<{}> = {
    commandId: 'pinOrUnpinEntry',
    name: 'Pin/Unpin entry',
    description: 'Command description here.',
    action() {
        return ({ dispatch }) => {
            const entry = dispatch(getActiveEntry);

            if (entry) {
                if (entry.isPinned) {
                    dispatch(streamActions.unpinEntry(entry.entryId));
                } else {
                    dispatch(streamActions.pinEntry(entry.entryId));
                }
            }
        };
    }
};

export const reloadSubscriptions: Command<{}> = {
    commandId: 'reloadSubscriptions',
    name: 'Reload subscriptions',
    description: 'Command description here.',
    action() {
        return subscriptionActions.fetchSubscriptions();
    }
};

export const reloadStream: Command<{}> = {
    commandId: 'reloadStream',
    name: 'Reload stream',
    description: 'Command description here.',
    action() {
        return ({ getState, dispatch }) => {
            const { ui, streams } = getState();

            if (ui.selectedStreamId) {
                dispatch(streamActions.fetchStream(ui.selectedStreamId, streams.defaultFetchOptions));
            }
        }
    }
};

export const scrollUp: Command<{ scrollAmount: number }> = {
    commandId: 'scrollUp',
    name: 'Scroll up',
    description: 'Command description here.',
    defaultParams: {
        scrollAmount: 200
    },
    action({ scrollAmount }) {
        return uiActions.scrollBy(0, scrollAmount);
    }
};

export const scrollDown: Command<{ scrollAmount: number }> = {
    commandId: 'scrollDown',
    name: 'Scroll down',
    description: 'Command description here.',
    defaultParams: {
        scrollAmount: 200
    },
    action({ scrollAmount }) {
        return uiActions.scrollBy(0, scrollAmount);
    }
};

export const scrollPageUp: Command<{ numPages: number }> = {
    commandId: 'scrollPageUp',
    name: 'Scroll page up',
    description: 'Command description here.',
    defaultParams: {
        numPages: 1
    },
    action({ numPages }) {
        return uiActions.scrollBy(0, -document.documentElement.clientHeight * numPages);
    }
};

export const scrollPageDown: Command<{ numPages: number }> = {
    commandId: 'scrollPageDown',
    name: 'Scroll page down',
    description: 'Command description here.',
    defaultParams: {
        numPages: 1
    },
    action({ numPages }) {
        return uiActions.scrollBy(0, document.documentElement.clientHeight * numPages);
    }
};

export const searchSubscriptions: Command<{}> = {
    commandId: 'searchSubscriptions',
    name: 'Search subscriptions',
    description: 'Command description here.',
    action() {
        return ({ dispatch, getState }) => {
            const { ui } = getState();

            if (!ui.sidebarIsOpened) {
                dispatch(uiActions.openSidebar());
            }

            const searchInput = document.querySelector('.input-search-box') as HTMLElement | null;

            if (searchInput) {
                searchInput.focus();
            }
        };
    }
};

export const selectNextEntry: Command<{}> = {
    commandId: 'selectNextEntry',
    name: 'Select next entry',
    description: 'Command description here.',
    action() {
        return ({ getState, dispatch }, { router }) => {
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
        };
    }
};

export const selectPreviousEntry: Command<{}> = {
    commandId: 'selectPreviousEntry',
    name: 'Select previous entry',
    description: 'Command description here.',
    action() {
        return ({ dispatch, getState }, { router }) => {
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
        };
    }
};

export const openEntry: Command<{}> = {
    commandId: 'openEntry',
    name: 'Open entry',
    description: 'Command description here.',
    action() {
        return ({ getState, dispatch }) => {
            const { ui } = getState();

            dispatch(uiActions.changeExpandedEntry(ui.activeEntryIndex));
        };
    }
};

export const closeEntry: Command<{}> = {
    commandId: 'closeEntry',
    name: 'Close entry',
    description: 'Command description here.',
    action() {
        return uiActions.changeExpandedEntry(-1);
    }
};

export const selectNextCategory: Command<{}> = {
    commandId: 'selectNextCategory',
    name: 'Select next category',
    description: 'Command description here.',
    action() {
        return ({ dispatch, getState }, { router, selectors }) => {
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
        };
    }
};

export const selectPreviousCategory: Command<{}> = {
    commandId: 'selectPreviousCategory',
    name: 'Select previous category',
    description: 'Command description here.',
    action() {
        return ({ dispatch, getState }, { router, selectors }) => {
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
        };
    }
};

export const selectNextSubscription: Command<{}> = {
    commandId: 'selectNextSubscription',
    name: 'Select next subscription',
    description: 'Command description here.',
    action() {
        return ({ getState }, { router, selectors }) => {
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
        };
    }
};

export const selectPreviousSubscription: Command<{}> = {
    commandId: 'selectPreviousSubscription',
    name: 'Select previous subscription',
    description: 'Command description here.',
    action() {
        return ({ getState }, { router, selectors }) => {
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
        };
    }
};

export const showHelp: Command<{}> = {
    commandId: 'showHelp',
    name: 'Show help',
    description: 'Command description here.',
    action() {
        return () => {
            window.alert('help');
        }
    }
};

export const toggleSidebar: Command<{}> = {
    commandId: 'toggleSidebar',
    name: 'Toggle sidebar',
    description: 'Command description here.',
    action() {
        return ({ getState, dispatch }) => {
            const { ui } = getState();

            if (ui.sidebarIsOpened) {
                dispatch(uiActions.closeSidebar());
            } else {
                dispatch(uiActions.openSidebar());
            }
        }
    }
};

export const closeSidebar: Command<{}> = {
    commandId: 'closeSidebar',
    name: 'Close sidebar',
    description: 'Command description here.',
    action() {
        return uiActions.closeSidebar();
    }
};

export const toggleStreamView: Command<{}> = {
    commandId: 'toggleStreamView',
    name: 'Toggle stream view',
    description: 'Command description here.',
    defaultParams: {
        inBackground: false
    },
    action() {
        return ({ getState, dispatch }) => {
            const { ui } = getState();

            if (ui.streamView === 'expanded') {
                dispatch(uiActions.changeStreamView('collapsible'));
            } else {
                dispatch(uiActions.changeStreamView('expanded'));
            }
        };
    }
};

export const visitWebsite: Command<{ inBackground: boolean }> = {
    commandId: 'visitWebsite',
    name: 'Visit website',
    description: 'Command description here.',
    defaultParams: {
        inBackground: false
    },
    action({ inBackground }) {
        return ({ dispatch }) => {
            const entry = dispatch(getActiveEntry);

            if (entry && entry.url) {
                if (inBackground) {
                    openUrlInBackground(entry.url);
                } else {
                    window.open(entry.url);
                }
            }
        }
    }
};

export const openUrl: Command<{ template: string, inBackground: boolean }> = {
    commandId: 'openUrl',
    name: 'Open URL',
    description: 'Open URL',
    defaultParams: {
        template: 'https://www.example.com/?url=${url}&title=${title}',
        inBackground: false
    },
    action({ template, inBackground }) {
        return ({ dispatch }) => {
            const entry = dispatch(getActiveEntry);

            if (entry && entry.url) {
                const variables = {
                    url: entry.url,
                    title: entry.title
                } as { [key: string]: string };

                const url = template.replace(TEMPLATE_PATTERN, (match, p1) => {
                    console.log(variables[p1]);

                    return encodeURIComponent(variables[p1] || '');
                });

                if (inBackground) {
                    openUrlInBackground(url);
                } else {
                    window.open(url);
                }
            }
        };
    }
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
