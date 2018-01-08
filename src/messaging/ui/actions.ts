import { Event, StreamViewKind, ThemeKind, Thunk } from 'messaging/types';

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

export function resetReadEntry(): Event {
    return {
        type: 'READ_ENTRY_RESET'
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
