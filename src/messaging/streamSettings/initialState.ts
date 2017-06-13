import { StreamSettings } from 'messaging/types';

const streamSettings: StreamSettings = {
    defaultSetting: {
        entryOrder: 'newest',
        numEntries: 20,
        onlyUnread: true,
        streamView: 'expanded'
    },
    version: 1
};

export default streamSettings;
