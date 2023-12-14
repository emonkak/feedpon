import type { Event, KeyMapping } from '../index';

const KEY_STROKE_PATTERN = /(?:<(?:[SCAM]-)*(?:[A-Z][0-9A-Z]+|.)>|.)/gi;

export function updateKeyMapping(keyStroke: string, mapping: KeyMapping): Event {
    return {
        type: 'KEY_MAPPING_UPDATED',
        keys: splitKeyStroke(keyStroke),
        mapping
    };
}

export function deleteKeyMapping(keyStroke: string): Event {
    return {
        type: 'KEY_MAPPING_DELETED',
        keys: splitKeyStroke(keyStroke)
    };
}

export function resetKeyMappings(): Event {
    return {
        type: 'KEY_MAPPINGS_RESET'
    };
}

function splitKeyStroke(keyStroke: string): string[] {
    return keyStroke.match(KEY_STROKE_PATTERN) || [];
}
