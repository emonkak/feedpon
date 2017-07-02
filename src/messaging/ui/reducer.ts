import { Event, UI } from 'messaging/types';

export default function uiReducer(ui: UI, event: Event): UI {
    switch (event.type) {
        case 'APPLICATION_INITIALIZED':
            return {
                ...ui,
                isScrolling: false
            };

        case 'ACTIVATED_ENTRY_CAHNGED':
            return {
                ...ui,
                activeEntryIndex: event.index
            };

        case 'EXPANDED_ENTRY_CHANGED':
            return {
                ...ui,
                expandedEntryIndex: event.index
            };

        case 'READ_ENTRY_CHANGED':
            return {
                ...ui,
                readEntryIndex: event.index
            };

        case 'SIDEBAR_OPENED':
            return {
                ...ui,
                sidebarIsOpened: true
            };

        case 'SIDEBAR_CLOSED':
            return {
                ...ui,
                sidebarIsOpened: false
            };

        case 'SCROLL_STARTED':
            return {
                ...ui,
                isScrolling: true
            };

        case 'SCROLL_ENDED':
            return {
                ...ui,
                isScrolling: false
            };

        case 'STREAM_VIEW_CHANGED':
            return {
                ...ui,
                streamView: event.streamView
            };

        case 'STREAM_SELECTED':
            return {
                ...ui,
                activeEntryIndex: -1,
                expandedEntryIndex: -1,
                readEntryIndex: -1
            };

        case 'THEME_CHANGED':
            return {
                ...ui,
                theme: event.theme
            };

        default:
            return ui;
    }
}
