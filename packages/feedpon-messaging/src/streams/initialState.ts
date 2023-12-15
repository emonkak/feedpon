import * as CacheMap from 'feedpon-utils/CacheMap';
import type { Stream, Streams } from '../index';

const streams: Streams = {
  defaultFetchOptions: {
    entryOrder: 'newest',
    numEntries: 50,
    onlyUnread: true,
  },
  defaultStreamView: 'expanded',
  isLoaded: false,
  isLoading: false,
  isMarking: false,
  items: CacheMap.empty<Stream>(10),
  keepUnread: false,
  version: 1,
};

export default streams;
