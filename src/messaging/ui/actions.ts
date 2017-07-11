import { Event, StreamViewKind, ThemeKind, Thunk } from 'messaging/types';
import { smoothScrollTo, smoothScrollBy } from 'utils/dom/smoothScroll';

const SCROLL_ANIMATION_DURATION = 1000 / 60 * 10;

export function changeActiveEntry(index: number): Event {
    return {
        type: 'ACTIVE_ENTRY_CAHNGED',
        index
    };
}

export function changeExpandedEntry(index: number): Event {
    return {
        type: 'EXPANDED_ENTRY_CHANGED',
        index
    };
}

export function changeReadEntry(index: number): Event {
    return {
        type: 'READ_ENTRY_CHANGED',
        index
    };
}

export function changeCustomStyles(customStyles: string): Event {
    return {
        type: 'CUSTOM_STYLE_CHANGED',
        customStyles
    };
}

export function toggleSidebar(): Thunk {
    return ({ getState, dispatch }) => {
        const { ui } = getState();

        if (ui.sidebarIsOpened) {
            dispatch(closeSidebar());
        } else {
            dispatch(openSidebar());
        }
    };
}

export function openSidebar(): Event {
    return {
        type: 'SIDEBAR_OPENED'
    };
}

export function closeSidebar(): Event {
    return {
        type: 'SIDEBAR_CLOSED'
    };
}

export function openHelp(): Event {
    return {
        type: 'HELP_OPENED'
    };
}

export function closeHelp(): Event {
    return {
        type: 'HELP_CLOSED'
    };
}

export function changeTheme(theme: ThemeKind): Event {
    return {
        type: 'THEME_CHANGED',
        theme
    };
}

export function changeStreamView(streamView: StreamViewKind): Event {
    return {
        type: 'STREAM_VIEW_CHANGED',
        streamView
    };
}

export function selectStream(streamId: string): Event {
    return {
        type: 'STREAM_SELECTED',
        streamId
    };
}

export function unselectStream(): Event {
    return {
        type: 'STREAM_UNSELECTED'
    };
}

export function scrollBy(dx: number, dy: number, callback?: () => void): Thunk {
    return ({ getState, dispatch }) => {
        const { ui } = getState();

        if (!ui.isScrolling) {
            dispatch({
                type: 'SCROLL_STARTED'
            });
        }

        window.requestAnimationFrame(() => {
            smoothScrollBy(document.body, dx, dy, SCROLL_ANIMATION_DURATION)
                .then(() => {
                    dispatch({
                        type: 'SCROLL_ENDED'
                    });
                });
        });
    };
}

export function scrollTo(x: number, y: number, callback?: () => void): Thunk {
    return ({ getState, dispatch }) => {
        const { ui } = getState();

        if (!ui.isScrolling) {
            dispatch({
                type: 'SCROLL_STARTED'
            });
        }

        window.requestAnimationFrame(() => {
            smoothScrollTo(document.body, x, y, SCROLL_ANIMATION_DURATION)
                .then(() => {
                    dispatch({
                        type: 'SCROLL_ENDED'
                    });

                    if (callback) {
                        callback();
                    }
                });
        });
    };
}
