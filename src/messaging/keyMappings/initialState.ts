import * as Trie from 'utils/containers/Trie';
import * as commands from 'messaging/commands';
import { KeyMappings } from 'messaging/types';

const initialState: KeyMappings = {
    items: Trie.create<keyof typeof commands>([
        [['/'], 'searchSubscriptions'],
        [['<C-b>'], 'scrollPageUp'],
        [['<C-d>'], 'scrollHalfPageDown'],
        [['<C-f>'], 'scrollPageDown'],
        [['<C-u>'], 'scrollHalfPageUp'],
        [['<S-Space>'], 'scrollHalfPageUp'],
        [['<Space>'], 'scrollHalfPageDown'],
        [['?'], 'showHelp'],
        [['A'], 'selectPreviousCategory'],
        [['J'], 'gotoLastLine'],
        [['K'], 'gotoFirstLine'],
        [['S'], 'selectNextCategory'],
        [['V'], 'visitWebsiteInBackground'],
        [['a'], 'selectPreviousSubscription'],
        [['c'], 'toggleStreamView'],
        [['g'], 'fetchFullContent'],
        [['h'], 'closeEntry'],
        [['j'], 'selectNextEntry'],
        [['k'], 'selectPreviousEntry'],
        [['l'], 'openEntry'],
        [['p'], 'pinOrUnpinEntry'],
        [['r'], 'reloadSubscriptions'],
        [['s'], 'selectNextSubscription'],
        [['v'], 'visitWebsite'],
        [['z'], 'toggleSidebar']
    ]),
    version: 1
};

export default initialState;
