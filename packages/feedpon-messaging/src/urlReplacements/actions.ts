import type { Event, UrlReplacement } from '../index';

export function addUrlReplacement(item: UrlReplacement): Event {
    return {
        type: 'URL_REPLACEMENT_ADDED',
        item
    };
}

export function updateUrlReplacement(index: number, item: UrlReplacement): Event {
    return {
        type: 'URL_REPLACEMENT_UPDATED',
        index,
        item
    };
}

export function deleteUrlReplacement(index: number): Event {
    return {
        type: 'URL_REPLACEMENT_DELETED',
        index
    };
}

export function resetUrlReplacements(): Event {
    return {
        type: 'URL_REPLACEMENTS_RESERT'
    };
}
