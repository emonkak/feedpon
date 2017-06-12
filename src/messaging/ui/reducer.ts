import { Event, UI } from 'messaging/types';

export default function uiReducer(ui: UI, event: Event): UI {
    switch (event.type) {
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

        default:
            return ui;
    }
}
