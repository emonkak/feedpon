import * as CacheMap from 'utils/containers/CacheMap';
import * as streamActions from 'messaging/streams/actions';
import * as subscriptionActions from 'messaging/subscriptions/actions';
import * as uiActions from 'messaging/ui/actions';
import { Command, Entry, Stream, Thunk } from 'messaging/types';

const SCROLL_OFFSET = 48;
const TEMPLATE_PATTERN = /\${([A-Z_]\w+)}/i;

export const clearReadEntries: Command<{}> = {
    name: 'Clear read entries',
    description: 'Clear read entries in the current selected stream.',
    defaultParams: {},
    action() {
        return ({ dispatch }) => {
            dispatch(uiActions.scrollTo(0, 0, () => {
                dispatch(uiActions.resetReadEntry());
            }));
        };
    }
};

export const closeEntry: Command<{}> = {
    name: 'Close entry',
    description: 'Close the active entry if expanded.',
    defaultParams: {},
    action() {
        return uiActions.changeExpandedEntry(-1);
    }
};

export const closeSidebar: Command<{}> = {
    name: 'Close sidebar',
    description: 'Close the sidebar if opened.',
    defaultParams: {},
    action() {
        return uiActions.closeSidebar();
    }
};

export const expandEntry: Command<{}> = {
    name: 'Expand entry',
    description: 'Expand the active entry if collapsed.',
    defaultParams: {},
    action() {
        return ({ getState, dispatch }) => {
            const { ui } = getState();

            if (ui.streamView === 'collapsible') {
                dispatch(uiActions.changeExpandedEntry(ui.activeEntryIndex));
            }
        };
    }
};

export const toggleComments: Command<{}> = {
    name: 'Toggle comments',
    description: 'Toggle comments display on the active entry',
    defaultParams: {},
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
        };
    }
};

export const fetchFullContent: Command<{}> = {
    name: 'Fetch full content',
    description: 'Fetch contents on the active entry',
    defaultParams: {},
    action() {
        return ({ dispatch }) => {
            const entry = dispatch(getActiveEntry);

            if (entry && entry.url && !entry.fullContents.isLoading) {
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
        };
    }
};

export const gotoFirstLine: Command<{}> = {
    name: 'Go to first line',
    description: 'Scroll to first line.',
    defaultParams: {},
    action() {
        return uiActions.scrollTo(0, 0);
    }
};

export const gotoLastLine: Command<{}> = {
    name: 'Go to last line',
    description: 'Scroll to last line.',
    defaultParams: {},
    action() {
        return uiActions.scrollTo(
            0,
            document.documentElement.scrollHeight - document.documentElement.clientHeight
        );
    }
};

export const markAllEntriesAsRead: Command<{}> = {
    name: 'Mark all entries as read',
    description: 'Mark all viewing entries as read.',
    defaultParams: {},
    action() {
        return ({ dispatch }) => {
            const stream = dispatch(getSelectedStream);

            if (stream) {
                const unreadEntries = stream.entries.filter((entry) => !entry.markedAsRead);

                if (unreadEntries.length > 0) {
                    dispatch(streamActions.markAsRead(unreadEntries));
                }
            }
        };
    }
};

export const openUrl: Command<{ template: string, inBackground: boolean }> = {
    name: 'Open URL',
    description: 'Open the URL from template format.',
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
};

export const pinOrUnpinEntry: Command<{}> = {
    name: 'Pin/Unpin entry',
    description: 'Toggle pinned state on the active entry.',
    defaultParams: {},
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

export const reloadStream: Command<{}> = {
    name: 'Reload stream',
    description: 'Reload the current selected stream.',
    defaultParams: {},
    action() {
        return ({ getState, dispatch }) => {
            const { ui, streams } = getState();

            if (ui.selectedStreamId) {
                dispatch(uiActions.scrollTo(0, 0, () => {
                    dispatch(streamActions.fetchStream(ui.selectedStreamId, streams.defaultFetchOptions));
                }));
            }
        };
    }
};

export const reloadSubscriptions: Command<{}> = {
    name: 'Reload subscriptions',
    description: 'Reload subscriptions and categories.',
    defaultParams: {},
    action() {
        return subscriptionActions.fetchSubscriptions();
    }
};

export const scrollDown: Command<{ scrollAmount: number }> = {
    name: 'Scroll down',
    description: 'Scroll down by the specified pixel.',
    defaultParams: {
        scrollAmount: 200
    },
    action({ scrollAmount }) {
        return uiActions.scrollBy(0, scrollAmount);
    }
};

export const scrollPageDown: Command<{ numPages: number }> = {
    name: 'Scroll page down',
    description: 'Scroll down by the specified number of pages.',
    defaultParams: {
        numPages: 1
    },
    action({ numPages }) {
        return uiActions.scrollBy(0, document.documentElement.clientHeight * numPages);
    }
};

export const scrollPageUp: Command<{ numPages: number }> = {
    name: 'Scroll page up',
    description: 'Scroll up by the specified number of pages.',
    defaultParams: {
        numPages: 1
    },
    action({ numPages }) {
        return uiActions.scrollBy(0, -document.documentElement.clientHeight * numPages);
    }
};

export const scrollUp: Command<{ scrollAmount: number }> = {
    name: 'Scroll up',
    description: 'Scroll up by the specified pixel.',
    defaultParams: {
        scrollAmount: 200
    },
    action({ scrollAmount }) {
        return uiActions.scrollBy(0, scrollAmount);
    }
};

export const searchSubscriptions: Command<{}> = {
    name: 'Search subscriptions',
    description: 'Focus to the search form.',
    defaultParams: {},
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

export const selectNextCategory: Command<{}> = {
    name: 'Select next category',
    description: 'Select the next category.',
    defaultParams: {},
    action() {
        return ({ dispatch, getState }, { router, selectors }) => {
            const state = getState();
            const streamId = state.ui.selectedStreamId;
            const categories = selectors.sortedCategoriesSelector(state);
            const groupedSubscriptions = selectors.groupedSubscriptionsSelector(state);

            let targetIndex: number;

            if (streamId) {
                const selectedIndex = categories.findIndex((category) =>
                    category.streamId === streamId ||
                        (groupedSubscriptions[category.label] &&
                         groupedSubscriptions[category.label].items.findIndex((subscription) => subscription.streamId === streamId) !== -1)
                );
                targetIndex = selectedIndex > -1 ? selectedIndex + 1 : 0;
            } else {
                targetIndex = 0;
            }

            if (categories[targetIndex]) {
                const targetCategory = categories[targetIndex];
                router.push(`/streams/${encodeURIComponent(targetCategory.streamId)}`);
            }
        };
    }
};

export const selectNextEntry: Command<{}> = {
    name: 'Select next entry',
    description: 'Scroll to the previous entry.',
    defaultParams: {},
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

export const selectNextSubscription: Command<{}> = {
    name: 'Select next subscription',
    description: 'Select the next subscription.',
    defaultParams: {},
    action() {
        return ({ getState }, { router, selectors }) => {
            const state = getState();
            const streamId = state.ui.selectedStreamId;
            const visibleSubscriptions = selectors.visibleSubscriptionsSelector(state);

            let targetIndex: number;

            if (streamId) {
                const sortedCategories = selectors.sortedCategoriesSelector(state);
                const selectedCategory = sortedCategories.find((category) => category.streamId === streamId);

                if (selectedCategory) {
                    targetIndex = visibleSubscriptions
                        .findIndex((subscription) => subscription.labels.indexOf(selectedCategory.label) !== -1);
                } else {
                    const selectedIndex = visibleSubscriptions
                        .findIndex((subscription) => subscription.streamId === streamId);
                    targetIndex = selectedIndex > -1 ? selectedIndex + 1 : 0;
                }
            } else {
                targetIndex = 0;
            }

            if (visibleSubscriptions[targetIndex]) {
                const targetSubscription = visibleSubscriptions[targetIndex];
                router.push(`/streams/${encodeURIComponent(targetSubscription.streamId)}`);
            }
        };
    }
};

export const selectPreviousCategory: Command<{}> = {
    name: 'Select previous category',
    description: 'Select the previous category.',
    defaultParams: {},
    action() {
        return ({ dispatch, getState }, { router, selectors }) => {
            const state = getState();
            const streamId = state.ui.selectedStreamId;
            const categories = selectors.sortedCategoriesSelector(state);
            const groupedSubscriptions = selectors.groupedSubscriptionsSelector(state);

            let targetIndex: number;

            if (streamId) {
                const selectedIndex = categories.findIndex((category) =>
                    category.streamId === streamId ||
                        (groupedSubscriptions[category.label] &&
                         groupedSubscriptions[category.label].items.findIndex((subscription) => subscription.streamId === streamId) !== -1)
                );
                if (selectedIndex > -1) {
                    const selectedCategory = categories[selectedIndex];
                    targetIndex = selectedCategory.streamId === streamId ? selectedIndex - 1 : selectedIndex;
                } else {
                    targetIndex = categories.length - 1;
                }
            } else {
                targetIndex = categories.length - 1;
            }

            if (categories[targetIndex]) {
                const targetCategory = categories[targetIndex];
                router.push(`/streams/${encodeURIComponent(targetCategory.streamId)}`);
            }
        };
    }
};

export const selectPreviousEntry: Command<{}> = {
    name: 'Select previous entry',
    description: 'Scroll to the previous entry.',
    defaultParams: {},
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

export const selectPreviousSubscription: Command<{}> = {
    name: 'Select previous subscription',
    description: 'Select the previous subscription.',
    defaultParams: {},
    action() {
        return ({ getState }, { router, selectors }) => {
            const state = getState();
            const streamId = state.ui.selectedStreamId;
            const visibleSubscriptions = selectors.visibleSubscriptionsSelector(state);

            let targetIndex: number;
            if (streamId) {
                const sortedCategories = selectors.sortedCategoriesSelector(state);
                const selectedCategory = sortedCategories.find((category) => category.streamId === streamId);

                if (selectedCategory) {
                    const firstIndex = visibleSubscriptions
                        .findIndex((subscription) => subscription.labels.indexOf(selectedCategory.label) !== -1);
                    targetIndex = firstIndex > -1 ? firstIndex - 1 : visibleSubscriptions.length - 1;
                } else {
                    const selectedIndex = visibleSubscriptions
                        .findIndex((subscription) => subscription.streamId === streamId);
                    targetIndex = selectedIndex > -1 ? selectedIndex - 1 : visibleSubscriptions.length - 1;
                }
            } else {
                targetIndex = visibleSubscriptions.length - 1;
            }

            if (visibleSubscriptions[targetIndex]) {
                const targetSubscription = visibleSubscriptions[targetIndex];
                router.push(`/streams/${encodeURIComponent(targetSubscription.streamId)}`);
            }
        };
    }
};

export const showHelp: Command<{}> = {
    name: 'Show help',
    description: 'Show the current key mappings.',
    defaultParams: {},
    action() {
        return ({ getState, dispatch }) => {
            const { ui } = getState();

            if (ui.helpIsOpened) {
                dispatch(uiActions.closeHelp());
            } else {
                dispatch(uiActions.openHelp());
            }
        };
    }
};

export const toggleSidebar: Command<{}> = {
    name: 'Toggle sidebar',
    description: 'Toggle the sidebar display.',
    defaultParams: {},
    action() {
        return ({ getState, dispatch }) => {
            const { ui } = getState();

            if (ui.sidebarIsOpened) {
                dispatch(uiActions.closeSidebar());
            } else {
                dispatch(uiActions.openSidebar());
            }
        };
    }
};

export const toggleStreamView: Command<{}> = {
    name: 'Toggle stream view',
    description: 'Toggle between expanded stream view and collapsible stream view.',
    defaultParams: {},
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
    name: 'Visit website',
    description: 'Open the permalink of the active entry.',
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
        };
    }
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

function openUrlInBackground(url: string): void {
    if (chrome) {
        chrome.tabs.getCurrent((tab) => {
            chrome.tabs.create({
                url,
                index: tab ? tab.index + 1 : 0,
                active: false
            });
        });
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
