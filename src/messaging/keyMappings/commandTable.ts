import * as CacheMap from 'utils/containers/CacheMap';
import * as streamActions from 'messaging/streams/actions';
import * as subscriptionActions from 'messaging/subscriptions/actions';
import * as uiActions from 'messaging/ui/actions';
import { Command, Entry, Stream, Thunk } from 'messaging/types';
import { getNextEntryScrollPosition, getPreviousEntryScrollPosition, openUrlInBackground } from 'messaging/domActions';
import { sendInstantNotification } from 'messaging/instantNotifications/actions';
import { smoothScrollBy } from 'utils/dom/smoothScroll';

const TEMPLATE_PATTERN = /\${([A-Z_]\w+)}/i;

export const clearReadPosition: Command<{}> = {
    name: 'Clear read position',
    description: 'Clear read position in the current selected stream.',
    defaultParams: {},
    action() {
        return ({ dispatch, getState }) => {
            const state = getState();
            const streamId = state.ui.selectedStreamId;

            if (streamId) {
                window.scrollTo(0, 0);

                dispatch(uiActions.resetReadEntry(streamId));

                dispatch(sendInstantNotification(this.name));
            }
        };
    }
};

export const closeEntry: Command<{}> = {
    name: 'Close entry',
    description: 'Close the active entry if expanded.',
    defaultParams: {},
    action() {
        return ({ dispatch, getState }) => {
            const state = getState();
            const streamId = state.ui.selectedStreamId;

            if (streamId) {
                dispatch(uiActions.changeExpandedEntry(streamId, -1));
            }
        };
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
            const selectedStream = dispatch(getSelectedStream);

            if (selectedStream && selectedStream.streamView === 'collapsible') {
                dispatch(uiActions.changeExpandedEntry(selectedStream.streamId, selectedStream.activeEntryIndex));
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

                        dispatch(sendInstantNotification('Hide comments'));
                    } else {
                        dispatch(streamActions.showEntryComments(entry.entryId));

                        dispatch(sendInstantNotification('Show comments'));
                    }
                } else {
                    dispatch(streamActions.fetchEntryComments(entry.entryId, entry.url));

                    dispatch(sendInstantNotification('Fetch comments'));
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

                        dispatch(sendInstantNotification('Fetch full content'));
                    } else {
                        if (entry.fullContents.isShown) {
                            dispatch(streamActions.hideFullContents(entry.entryId));

                            dispatch(sendInstantNotification('Hide full contents'));
                        } else {
                            dispatch(streamActions.showFullContents(entry.entryId));

                            dispatch(sendInstantNotification('Show full contents'));
                        }
                    }
                } else {
                    if (entry.ampUrl) {
                        dispatch(streamActions.fetchFullContent(entry.entryId, entry.ampUrl));
                    } else {
                        dispatch(streamActions.fetchFullContent(entry.entryId, entry.url));
                    }

                    dispatch(sendInstantNotification('Fetch full content'));
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
        return () => window.scrollTo(0, 0);
    }
};

export const gotoLastLine: Command<{}> = {
    name: 'Go to last line',
    description: 'Scroll to last line.',
    defaultParams: {},
    action() {
        return () => {
            window.scrollTo(
                0,
                document.documentElement.scrollHeight - document.documentElement.clientHeight
            );
        };
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

                    dispatch(sendInstantNotification(this.name));
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

                dispatch(sendInstantNotification(this.name));
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

                    dispatch(sendInstantNotification('Unpin entry'));
                } else {
                    dispatch(streamActions.pinEntry(entry.entryId));

                    dispatch(sendInstantNotification('Pin entry'));
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
            const selectedStream = dispatch(getSelectedStream);

            if (selectedStream) {
                window.scrollTo(0, 0);

                dispatch(streamActions.fetchStream(
                    selectedStream.streamId,
                    selectedStream.streamView,
                    selectedStream.fetchOptions
                ));

                dispatch(sendInstantNotification(this.name));
            }
        };
    }
};

export const reloadSubscriptions: Command<{}> = {
    name: 'Reload subscriptions',
    description: 'Reload subscriptions and categories.',
    defaultParams: {},
    action() {
        return ({ dispatch }) => {
            dispatch(subscriptionActions.fetchSubscriptions());

            dispatch(sendInstantNotification(this.name));
        };
    }
};

export const scrollDown: Command<{ scrollAmount: number }> = {
    name: 'Scroll down',
    description: 'Scroll down by the specified pixel.',
    defaultParams: {
        scrollAmount: 200
    },
    action({ scrollAmount }) {
        return () => {
            smoothScrollBy(window, 0, scrollAmount);
        };
    }
};

export const scrollPageDown: Command<{ numPages: number }> = {
    name: 'Scroll page down',
    description: 'Scroll down by the specified number of pages.',
    defaultParams: {
        numPages: 1
    },
    action({ numPages }) {
        return ({ dispatch }) => {
            smoothScrollBy(window, 0, document.documentElement.clientHeight * numPages);
        };
    }
};

export const scrollPageUp: Command<{ numPages: number }> = {
    name: 'Scroll page up',
    description: 'Scroll up by the specified number of pages.',
    defaultParams: {
        numPages: 1
    },
    action({ numPages }) {
        return ({ dispatch }) => {
            smoothScrollBy(window, 0, -document.documentElement.clientHeight * numPages);
        };
    }
};

export const scrollUp: Command<{ scrollAmount: number }> = {
    name: 'Scroll up',
    description: 'Scroll up by the specified pixel.',
    defaultParams: {
        scrollAmount: 200
    },
    action({ scrollAmount }) {
        return () => {
            smoothScrollBy(window, 0, -scrollAmount);
        };
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
            const groupedSubscriptions = selectors.groupedSubscriptionsSelector(state);
            const visibleCategories = selectors.sortedCategoriesSelector(state)
                .filter((category) => groupedSubscriptions.hasOwnProperty(category.label));

            let targetIndex: number;

            if (streamId) {
                const selectedIndex = visibleCategories.findIndex((category) =>
                    category.streamId === streamId ||
                        (groupedSubscriptions[category.label] &&
                         groupedSubscriptions[category.label].items.findIndex((subscription) => subscription.streamId === streamId) !== -1)
                );
                targetIndex = selectedIndex > -1 ? selectedIndex + 1 : 0;
            } else {
                targetIndex = 0;
            }

            if (visibleCategories[targetIndex]) {
                const targetCategory = visibleCategories[targetIndex];
                router.push(`/streams/${encodeURIComponent(targetCategory.streamId)}`);
            }
        };
    }
};

export const selectNextEntry: Command<{}> = {
    name: 'Select next entry',
    description: 'Scroll to the next entry.',
    defaultParams: {},
    action() {
        return ({ getState, dispatch }, { router }) => {
            const { ui, streams } = getState();

            if (!ui.selectedStreamId || ui.isScrolling) {
                return;
            }

            const dy = getNextEntryScrollPosition();

            if (dy !== 0) {
                smoothScrollBy(window, 0, dy);
            } else if (!streams.isLoading) {
                const stream = dispatch(getSelectedStream);

                if (stream && stream.continuation) {
                    dispatch(streamActions.fetchMoreEntries(stream.streamId, stream.continuation, stream.fetchOptions));
                }
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
            const groupedSubscriptions = selectors.groupedSubscriptionsSelector(state);
            const visibleCategories = selectors.sortedCategoriesSelector(state)
                .filter((category) => groupedSubscriptions.hasOwnProperty(category.label));

            let targetIndex: number;

            if (streamId) {
                const selectedIndex = visibleCategories.findIndex((category) =>
                    category.streamId === streamId ||
                        (groupedSubscriptions[category.label] &&
                         groupedSubscriptions[category.label].items.findIndex((subscription) => subscription.streamId === streamId) !== -1)
                );
                if (selectedIndex > -1) {
                    const selectedCategory = visibleCategories[selectedIndex];
                    targetIndex = selectedCategory.streamId === streamId ? selectedIndex - 1 : selectedIndex;
                } else {
                    targetIndex = visibleCategories.length - 1;
                }
            } else {
                targetIndex = visibleCategories.length - 1;
            }

            if (visibleCategories[targetIndex]) {
                const targetCategory = visibleCategories[targetIndex];
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

            if (!ui.selectedStreamId || ui.isScrolling) {
                return;
            }

            const dy = getPreviousEntryScrollPosition();

            if (dy !== 0) {
                smoothScrollBy(window, 0, dy);
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
            const selectedStream = dispatch(getSelectedStream);

            if (selectedStream) {
                const newStreamView = selectedStream.streamView === 'collapsible' ? 'expanded' : 'collapsible';

                dispatch(uiActions.changeStreamView(selectedStream.streamId, newStreamView));
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

                dispatch(sendInstantNotification(this.name));
            }
        };
    }
};

const getActiveEntry: Thunk<Entry | null> = ({ getState, dispatch }) => {
    const selectedStream = dispatch(getSelectedStream);

    if (selectedStream) {
        const entry = selectedStream.entries[selectedStream.activeEntryIndex];

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
