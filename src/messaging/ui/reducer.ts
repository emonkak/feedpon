import { Event, UI } from 'messaging/types';

export default function uiReducer(ui: UI, event: Event): UI {
    switch (event.type) {
        case 'APPLICATION_INITIALIZED':
            return {
                ...ui,
                isBooting: false,
                isScrolling: false
            };

        case 'ACTIVE_ENTRY_CAHNGED':
            return {
                ...ui,
                activeEntryIndex: event.index
            };

        case 'CUSTOM_STYLE_CHANGED':
            return {
                ...ui,
                customStyles: event.customStyles
            };

        case 'EXPANDED_ENTRY_CHANGED':
            return {
                ...ui,
                expandedEntryIndex: event.index
            };

        case 'HELP_OPENED':
            return {
                ...ui,
                helpIsOpened: true
            };

        case 'HELP_CLOSED':
            return {
                ...ui,
                helpIsOpened: false
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
                streamView: event.streamView,
                expandedEntryIndex: -1
            };

        case 'STREAM_FETCHED':
            return {
                ...ui,
                activeEntryIndex: -1,
                expandedEntryIndex: -1,
                readEntryIndex: -1
            };

        case 'STREAM_SELECTED':
            return {
                ...ui,
                activeEntryIndex: -1,
                expandedEntryIndex: -1,
                readEntryIndex: -1,
                selectedStreamId: event.streamId
            };

        case 'STREAM_UNSELECTED':
            return {
                ...ui,
                activeEntryIndex: -1,
                expandedEntryIndex: -1,
                readEntryIndex: -1,
                selectedStreamId: ''
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
