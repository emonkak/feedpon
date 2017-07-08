import * as Trie from 'utils/containers/Trie';
import { KeyMapping, KeyMappings } from 'messaging/types';

const initialState: KeyMappings = {
    items: Trie.create<KeyMapping>([
        [['/'], { commandId: 'searchSubscriptions', params: {} }],
        [['<Escape>'], { commandId: 'closeSidebar', params: {} }],
        [['<S-Space>'], { commandId: 'scrollPageUp', params: { numPages: 0.5 }, preventNotification: true }],
        [['<Space>'], { commandId: 'scrollPageDown', params: { numPages: 0.5 }, preventNotification: true }],
        [['?'], { commandId: 'showHelp', params: {} }],
        [['A'], { commandId: 'selectPreviousCategory', params: {} }],
        [['F'], { commandId: 'fetchComments', params: {} }],
        [['G'], { commandId: 'gotoLastLine', params: {}, preventNotification: true }],
        [['R'], { commandId: 'reloadSubscriptions', params: {} }],
        [['S'], { commandId: 'selectNextCategory', params: {} }],
        [['V'], { commandId: 'visitWebsite', params: { inBackground: true } }],
        [['a'], { commandId: 'selectPreviousSubscription', params: {} }],
        [['b'], { commandId: 'openUrl', params: { template: 'http://b.hatena.ne.jp/entry/${url}', inBackground: false } }],
        [['c'], { commandId: 'toggleStreamView', params: {} }],
        [['f'], { commandId: 'fetchFullContent', params: {} }],
        [['g', 'c'], { commandId: 'clearReadEntries', params: {} }],
        [['g', 'g'], { commandId: 'gotoFirstLine', params: {}, preventNotification: true }],
        [['h'], { commandId: 'closeEntry', params: {} }],
        [['j'], { commandId: 'selectNextEntry', params: {} }],
        [['k'], { commandId: 'selectPreviousEntry', params: {} }],
        [['l'], { commandId: 'openEntry', params: {} }],
        [['p'], { commandId: 'pinOrUnpinEntry', params: {} }],
        [['r'], { commandId: 'reloadStream', params: {} }],
        [['s'], { commandId: 'selectNextSubscription', params: {} }],
        [['v'], { commandId: 'visitWebsite', params: { inBackground: false } }],
        [['z'], { commandId: 'toggleSidebar', params: {} }]
    ]),
    version: 1
};

export default initialState;
