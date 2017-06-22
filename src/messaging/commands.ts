import * as CacheMap from 'utils/containers/CacheMap';
import { Command, Store } from 'messaging/types';
import { Location } from 'history';
import { changeExpandedEntry, changeStreamView, closeSidebar, endScroll, openSidebar, startScroll } from 'messaging/ui/actions';
import { smoothScrollTo, smoothScrollBy } from 'utils/dom/smoothScroll';

const SCROLL_ANIMATION_DURATION = 1000 / 60 * 10;
const SCROLL_OFFSET = 48;

const STREAM_PATH_PATTERN = /^\/streams\/([^\/]+)/;

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

export const pinEntry: Command = {
    title: 'Pin entry',
    thunk(store) {
    }
};

export const reloadSubscriptions: Command = {
    title: 'Reload subscriptions',
    thunk(store) {
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
    thunk(store) {
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

        const lastElement = elements[elements.length - 1] as HTMLElement;
        if (lastElement) {
            scrollTo(store, 0, lastElement.offsetTop + lastElement.offsetHeight + SCROLL_OFFSET);
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

        scrollTo(store, 0, 0);
    }
};

export const openEntry: Command = {
    title: 'Open entry',
    thunk({ getState, dispatch }) {
        const { ui } = getState();

        dispatch(changeExpandedEntry(ui.activeEntryIndex));
    }
};

export const closeEntry: Command = {
    title: 'Close entry',
    thunk({ dispatch }) {
        dispatch(changeExpandedEntry(-1));
    }
};

export const selectNextCategory: Command = {
    title: 'Select next category',
    thunk(store) {
    }
};

export const selectPreviousCategory: Command = {
    title: 'Select previous feed',
    thunk(store) {
    }
};

export const selectNextFeed: Command = {
    title: 'Select next feed',
    thunk(store) {
    }
};

export const selectPreviousFeed: Command = {
    title: 'Select previous feed',
    thunk(store) {
    }
};

export const showHelp: Command = {
    title: 'Show help',
    thunk(store) {
    }
};

export const toggleSidebar: Command = {
    title: 'Toggle sidebar',
    thunk({ getState, dispatch }) {
        const { ui } = getState();

        if (ui.sidebarIsOpened) {
            dispatch(closeSidebar());
        } else {
            dispatch(openSidebar());
        }
    }
};

export const toggleStreamView: Command = {
    title: 'Toggle stream view',
    thunk({ getState, dispatch }) {
        const { ui } = getState();

        if (ui.streamView === 'expanded') {
            dispatch(changeStreamView('collapsible'));
        } else {
            dispatch(changeStreamView('expanded'));
        }
    }
};

export const visitWebsite: Command = {
    title: 'Visit website',
    thunk(store, { router }) {
        const location = router.getCurrentLocation();
        const streamId = getStreamIdFromLocation(location);
        if (streamId == null) {
            return;
        }

        const { streams } = store.getState();
        const stream = CacheMap.get(streams.items, streamId);

        if (stream) {
            console.log(stream);
        }
    }
};


function scrollBy({ getState, dispatch }: Store, dx: number, dy: number): Promise<void> {
    const { ui } = getState();

    if (!ui.isScrolling) {
        dispatch(startScroll());
    }

    return smoothScrollBy(document.body, dx, dy, SCROLL_ANIMATION_DURATION)
        .then(() => {
            dispatch(endScroll());
        });
}

function scrollTo({ getState, dispatch }: Store, x: number, y: number): Promise<void> {
    const { ui } = getState();

    if (!ui.isScrolling) {
        dispatch(startScroll());
    }

    return smoothScrollTo(document.body, x, y, SCROLL_ANIMATION_DURATION)
        .then(() => {
            dispatch(endScroll());
        });
}

function getStreamIdFromLocation(location: Location): string | null {
    const matches = location.pathname.match(STREAM_PATH_PATTERN);

    return matches
        ? decodeURIComponent(matches[1])
        : null;
}
