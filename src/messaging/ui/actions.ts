import { Event, StreamViewKind, ThemeKind } from 'messaging/types';

export function changeActiveEntry(index: number): Event {
    return {
        type: 'ACTIVATED_ENTRY_CAHNGED',
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

export function startScroll(): Event {
    return {
        type: 'SCROLL_STARTED'
    };
}

export function endScroll(): Event {
    return {
        type: 'SCROLL_ENDED'
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
