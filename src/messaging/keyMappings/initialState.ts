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
        [['F'], 'fetchComments'],
        [['G'], 'gotoLastLine'],
        [['R'], 'reloadSubscriptions'],
        [['S'], 'selectNextCategory'],
        [['V'], 'visitWebsite'],
        [['a'], 'selectPreviousSubscription'],
        [['c'], 'toggleStreamView'],
        [['f'], 'fetchFullContent'],
        [['g', 'g'], 'gotoFirstLine'],
        [['h'], 'closeEntry'],
        [['j'], 'selectNextEntry'],
        [['k'], 'selectPreviousEntry'],
        [['l'], 'openEntry'],
        [['p'], 'pinOrUnpinEntry'],
        [['r'], 'reloadStream'],
        [['s'], 'selectNextSubscription'],
        [['v'], 'visitWebsiteInBackground'],
        [['z'], 'toggleSidebar']
    ]),
    scrollAmount: 200,
    version: 1
};

export default initialState;
