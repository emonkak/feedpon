import initialState from 'messaging/urlReplacements/initialState';
import { Event, UrlReplacements } from 'messaging/types';

export default function reduceUrlReplacement(urlReplacements: UrlReplacements, event: Event): UrlReplacements {
    switch (event.type) {
        case 'URL_REPLACEMENT_ADDED':
            return {
                ...urlReplacements,
                items: [...urlReplacements.items, event.item]
            };

        case 'URL_REPLACEMENT_DELETED':
            return {
                ...urlReplacements,
                items: urlReplacements.items.filter((item, index) => index !== event.index)
            };

        case 'URL_REPLACEMENT_UPDATED':
            return {
                ...urlReplacements,
                items: urlReplacements.items.map((item, index) => index === event.index ? event.item : item)
            };

        case 'URL_REPLACEMENTS_RESERT':
            return initialState;

        default:
            return urlReplacements;
    }
}
