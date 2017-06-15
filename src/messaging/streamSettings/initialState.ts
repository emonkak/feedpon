import { StreamSettings } from 'messaging/types';

const streamSettings: StreamSettings = {
    defaultOptions: {
        entryOrder: 'newest',
        numEntries: 20,
        onlyUnread: true
    },
    defaultStreamView: 'expanded',
    version: 1
};

export default streamSettings;
