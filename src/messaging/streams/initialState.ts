import { Stream, Streams } from 'messaging/types';
import * as CacheMap from 'utils/CacheMap';

const streams: Streams = {
    cacheLifetime: 10 * 60 * 1000,
    defaultFetchOptions: {
        entryOrder: 'newest',
        numEntries: 20,
        onlyUnread: true
    },
    defaultStreamView: 'expanded',
    isLoaded: false,
    isLoading: false,
    isMarking: false,
    items: CacheMap.empty<Stream>(10),
    keepUnread: true,
    version: 1
};

export default streams;
