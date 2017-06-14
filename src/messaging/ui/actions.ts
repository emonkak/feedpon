import { Event, Theme } from 'messaging/types';

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

export function changeTheme(theme: Theme): Event {
    return {
        type: 'THEME_CHANGED',
        theme
    };
}
