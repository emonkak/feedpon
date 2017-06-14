import { Streams } from 'messaging/types';

const streams: Streams = {
    current: {
        streamId: '',
        title: 'Loading...',
        entries: [],
        continuation: null,
        feed: null,
        category: null,
        options: {
            numEntries: 20,
            onlyUnread: true,
            order: 'newest',
            view: 'expanded'
        }
    },
    isLoaded: false,
    isLoading: false,
    isMarking: false,
    keepUnread: true,
    version: 1
};

export default streams;
