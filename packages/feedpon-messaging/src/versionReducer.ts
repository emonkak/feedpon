import type { Event } from './types.ts';

export default function versionReducer(version: string, event: Event): string {
  if (event.type === 'APPLICATION_INITIALIZED') {
    return event.version;
  }
  return version;
}
