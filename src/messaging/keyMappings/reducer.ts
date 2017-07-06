import * as Trie from 'utils/containers/Trie';
import { Event, KeyMappings } from 'messaging/types';

const KEY_SEQEUNCE_PATTERN = /(?:<(?:[SCAM]-)*(?:[A-Z][0-9A-Z]+|.)>|.)/gi;

export default function reducer(keyMappings: KeyMappings, event: Event) {
    switch (event.type) {
        case 'KEY_MAPPING_ADDED':
            return {
                ...keyMappings,
                items: Trie.update(keyMappings.items, splitKeySequence(event.keySequence), event.commandId)
            };

        case 'KEY_MAPPING_REMOVED':
            return {
                ...keyMappings,
                items: Trie.remove(keyMappings.items, splitKeySequence(event.keySequence))
            };

        case 'SCROLL_AMOUNT_CHANGED':
            return {
                ...keyMappings,
                scrollAmount: event.scrollAmount
            };

        default:
            return keyMappings;
    }
}

function splitKeySequence(keySequence: string): string[] {
    return keySequence.match(KEY_SEQEUNCE_PATTERN) || [];
}
