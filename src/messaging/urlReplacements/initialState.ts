import { UrlReplacements } from 'messaging/types';

const urlReplacements: UrlReplacements = {
    items: [
        {
            pattern: '^http://www\\.infoq\\.com',
            replacement: 'https://www.infoq.com',
            flags: ''
        },
        {
            pattern: '^http://diamond\\.jp',
            replacement: 'https://diamond.jp',
            flags: ''
        },
        {
            pattern: '[?&]utm_(?:source|medium|term|content|campaign)=[^&]*',
            replacement: '',
            flags: 'g'
        },
        {
            pattern: '\\?rss$',
            replacement: '',
            flags: ''
        }
    ],
    version: 0
};

export default urlReplacements;
