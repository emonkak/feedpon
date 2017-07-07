import * as Trie from 'utils/containers/Trie';
import { Event, KeyMappings } from 'messaging/types';

export default function reducer(keyMappings: KeyMappings, event: Event) {
    switch (event.type) {
        case 'KEY_MAPPING_UPDATED':
            return {
                ...keyMappings,
                items: Trie.update(keyMappings.items, event.keys, event.mapping)
            };

        case 'KEY_MAPPING_DELETED':
            return {
                ...keyMappings,
                items: Trie.remove(keyMappings.items, event.keys)
            };

        default:
            return keyMappings;
    }
}
