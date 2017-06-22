import * as Trie from 'utils/containers/Trie';
import * as commands from 'messaging/commands';
import { KeyMappings } from 'messaging/types';

const initialState: KeyMappings = {
    items: Trie.create<keyof typeof commands>([
        [['<C-b>'], 'scrollPageUp'],
        [['<C-d>'], 'scrollHalfPageDown'],
        [['<C-f>'], 'scrollPageDown'],
        [['<C-u>'], 'scrollHalfPageUp'],
        [['<S-Space>'], 'scrollHalfPageUp'],
        [['<Space>'], 'scrollHalfPageDown'],
        [['G'], 'gotoLastLine'],
        [['c'], 'toggleStreamView'],
        [['g', 'g'], 'gotoFirstLine'],
        [['g', 'j'], 'scrollDown'],
        [['g', 'k'], 'scrollUp'],
        [['h'], 'closeEntry'],
        [['j'], 'selectNextEntry'],
        [['k'], 'selectPreviousEntry'],
        [['l'], 'openEntry'],
        [['z'], 'toggleSidebar']
    ]),
    version: 1
};

export default initialState;
