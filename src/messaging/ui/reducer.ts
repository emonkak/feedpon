import { Event, UI } from 'messaging/types';

export default function uiReducer(ui: UI, event: Event): UI {
    switch (event.type) {
        case 'APPLICATION_INITIALIZED':
            return {
                ...ui,
                isScrolling: false
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

        default:
            return ui;
    }
}
