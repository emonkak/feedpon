import { Streams } from 'messaging/types';

const streams: Streams = {
    current: {
        streamId: null,
        title: 'Loading...',
        entries: [],
        continuation: null,
        feed: null,
        options: {
            numEntries: 20,
            onlyUnread: true,
            order: 'newest',
            view: 'expanded'
        }
    },
    isLoading: false,
    isLoaded: false,
    version: 1
};

export default streams;
