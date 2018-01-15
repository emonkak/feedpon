import * as Trie from 'utils/containers/Trie';
import { KeyMapping, KeyMappings } from 'messaging/types';

const initialState: KeyMappings = {
    items: Trie.create<KeyMapping>([
        [['/'], { commandId: 'searchSubscriptions', params: {}, preventNotification: true }],
        [['<Escape>'], { commandId: 'closeSidebar', params: {}, preventNotification: true }],
        [['<S-Space>'], { commandId: 'scrollPageUp', params: { numPages: 0.5 }, preventNotification: true }],
        [['<Space>'], { commandId: 'scrollPageDown', params: { numPages: 0.5 }, preventNotification: true }],
        [['?'], { commandId: 'showHelp', params: {}, preventNotification: true }],
        [['A'], { commandId: 'selectPreviousCategory', params: {} }],
        [['G'], { commandId: 'gotoLastLine', params: {}, preventNotification: true }],
        [['R'], { commandId: 'reloadStream', params: {} }],
        [['S'], { commandId: 'selectNextCategory', params: {} }],
        [['V'], { commandId: 'visitWebsite', params: { inBackground: true } }],
        [['a'], { commandId: 'selectPreviousSubscription', params: {} }],
        [['b'], { commandId: 'toggleComments', params: {} }],
        [['c'], { commandId: 'toggleStreamView', params: {} }],
        [['f'], { commandId: 'fetchFullContent', params: {} }],
        [['g', 'c'], { commandId: 'clearReadPosition', params: {} }],
        [['g', 'g'], { commandId: 'gotoFirstLine', params: {}, preventNotification: true }],
        [['g', 'm'], { commandId: 'markAllEntriesAsRead', params: {} }],
        [['h'], { commandId: 'closeEntry', params: {}, preventNotification: true }],
        [['i'], { commandId: 'openUrl', params: { template: 'http://b.hatena.ne.jp/entry/${url}', inBackground: false } }],
        [['j'], { commandId: 'selectNextEntry', params: {}, preventNotification: true }],
        [['k'], { commandId: 'selectPreviousEntry', params: {}, preventNotification: true }],
        [['l'], { commandId: 'expandEntry', params: {}, preventNotification: true }],
        [['p'], { commandId: 'pinOrUnpinEntry', params: {} }],
        [['r'], { commandId: 'reloadSubscriptions', params: {} }],
        [['s'], { commandId: 'selectNextSubscription', params: {} }],
        [['v'], { commandId: 'visitWebsite', params: { inBackground: false } }],
        [['z'], { commandId: 'toggleSidebar', params: {}, preventNotification: true }]
    ]),
    version: 2
};

export default initialState;
