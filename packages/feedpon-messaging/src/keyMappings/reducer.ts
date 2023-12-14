import * as Trie from 'feedpon-utils/containers/Trie';
import initialState from './initialState';
import type { Event, KeyMapping, KeyMappings } from '../index';

export default function reducer(keyMappings: KeyMappings, event: Event) {
  switch (event.type) {
    case 'APPLICATION_INITIALIZED':
      if (keyMappings.version === 1) {
        return {
          ...keyMappings,
          items: Trie.map<KeyMapping, KeyMapping>(
            keyMappings.items,
            (path, keyMapping) => {
              if (keyMapping.commandId === 'clearReadEntries') {
                return [
                  path,
                  {
                    ...keyMapping,
                    commandId: 'clearReadPosition',
                  },
                ];
              }
              return [path, keyMapping];
            },
          ),
          version: 2,
        };
      }
      return keyMappings;

    case 'KEY_MAPPING_UPDATED':
      return {
        ...keyMappings,
        items: Trie.update(keyMappings.items, event.keys, event.mapping),
      };

    case 'KEY_MAPPING_DELETED':
      return {
        ...keyMappings,
        items: Trie.remove(keyMappings.items, event.keys),
      };

    case 'KEY_MAPPINGS_RESET':
      return {
        ...keyMappings,
        items: initialState.items,
      };

    default:
      return keyMappings;
  }
}
