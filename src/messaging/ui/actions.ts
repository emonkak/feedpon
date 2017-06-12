import { Event } from 'messaging/types';

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
