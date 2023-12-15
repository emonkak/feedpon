import * as CacheMap from 'feedpon-utils/CacheMap';
import type { Event, Histories } from '../index';

export default function historiesReducer(
  histories: Histories,
  event: Event,
): Histories {
  switch (event.type) {
    case 'STREAM_FETCHED':
      return {
        ...histories,
        recentlyReadStreams: CacheMap.set(
          histories.recentlyReadStreams,
          event.stream.streamId,
          event.stream.fetchedAt,
        ),
      };

    case 'STREAM_HISTORY_OPTIONS_CHANGED':
      return {
        ...histories,
        recentlyReadStreams: CacheMap.extend(
          histories.recentlyReadStreams,
          event.numStreamHistories,
        ),
      };

    default:
      return histories;
  }
}
