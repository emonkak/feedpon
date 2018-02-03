import { Event, UI } from 'messaging/types';

export default function uiReducer(ui: UI, event: Event): UI {
    switch (event.type) {
        case 'CUSTOM_STYLE_CHANGED':
            return {
                ...ui,
                customStyles: event.customStyles,
                isScrolling: false
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

        case 'STREAM_FETCHED':
            return {
                ...ui
            };

        case 'STREAM_SELECTED':
            return {
                ...ui,
                selectedStreamId: event.streamId
            };

        case 'STREAM_UNSELECTED':
            return {
                ...ui,
                selectedStreamId: ''
            };

        case 'THEME_CHANGED':
            return {
                ...ui,
                theme: event.theme
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

        default:
            return ui;
    }
}
