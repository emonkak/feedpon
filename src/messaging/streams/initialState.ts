import { Streams } from 'messaging/types';

const streams: Streams = {
    current: {
        streamId: '',
        title: '',
        entries: [],
        continuation: null,
        feed: null,
        category: null,
        options: null
    },
    isLoaded: false,
    isLoading: false,
    isMarking: false,
    keepUnread: true,
    version: 1
};

export default streams;
