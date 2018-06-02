import * as Trie from 'utils/containers/Trie';
import { KeyMapping, KeyMappings } from 'messaging/types';

const initialState: KeyMappings = {
    items: Trie.create<KeyMapping>([
        [['/'], { commandId: 'searchSubscriptions', params: {} }],
        [['<Escape>'], { commandId: 'closeSidebar', params: {} }],
        [['<S-Space>'], { commandId: 'scrollPageUp', params: { numPages: 0.5 } }],
        [['<Space>'], { commandId: 'scrollPageDown', params: { numPages: 0.5 } }],
        [['?'], { commandId: 'showHelp', params: {} }],
        [['A'], { commandId: 'selectPreviousCategory', params: {} }],
        [['G'], { commandId: 'gotoLastLine', params: {} }],
        [['R'], { commandId: 'reloadStream', params: {} }],
        [['S'], { commandId: 'selectNextCategory', params: {} }],
        [['V'], { commandId: 'visitWebsite', params: { inBackground: true } }],
        [['a'], { commandId: 'selectPreviousSubscription', params: {} }],
        [['b'], { commandId: 'toggleComments', params: {} }],
        [['c'], { commandId: 'toggleStreamView', params: {} }],
        [['f'], { commandId: 'fetchFullContent', params: {} }],
        [['g', 'c'], { commandId: 'clearReadPosition', params: {} }],
        [['g', 'g'], { commandId: 'gotoFirstLine', params: {} }],
        [['g', 'm'], { commandId: 'markAllEntriesAsRead', params: {} }],
        [['h'], { commandId: 'closeEntry', params: {} }],
        [['i'], { commandId: 'openUrl', params: { template: 'http://b.hatena.ne.jp/entry/${url}', inBackground: false } }],
        [['j'], { commandId: 'selectNextEntry', params: {} }],
        [['k'], { commandId: 'selectPreviousEntry', params: {} }],
        [['l'], { commandId: 'expandEntry', params: {} }],
        [['p'], { commandId: 'pinOrUnpinEntry', params: {} }],
        [['r'], { commandId: 'reloadSubscriptions', params: {} }],
        [['s'], { commandId: 'selectNextSubscription', params: {} }],
        [['v'], { commandId: 'visitWebsite', params: { inBackground: false } }],
        [['z'], { commandId: 'toggleSidebar', params: {} }]
    ]),
    version: 2
};

export default initialState;
