import { Component } from 'react';

import * as Trie from 'utils/containers/Trie';

const SPECIAL_KEYS_TABLE: { [key: string]: string } = {
    ' ': 'Space',
    '|': 'Bar',
    '\\': 'Bslash',
    '<': 'Lt'
};

interface KeyMapperProps {
    keyMappings: Trie.Trie<any>;
    onInvokeKeyMapping: (keyMappings: any) => void;
    timeoutLength?: number;
}

export default class KeyMapper extends Component<KeyMapperProps, {}> {
    static defaultProps = {
        timeoutLength: 1000
    };

    pendingKeys: string[] = [];

    timer: number | null = null;

    constructor(props: KeyMapperProps, context: any) {
        super(props, context);

        this.handleKeyDown = this.handleKeyDown.bind(this);
    }

    componentDidMount() {
        document.addEventListener('keydown', this.handleKeyDown);
    }

    componentWillUnmount() {
        document.removeEventListener('keydown', this.handleKeyDown);
    }

    shouldComponentUpdate() {
        return false;
    }

    handleKeyDown(event: KeyboardEvent) {
        if (shouldIgnoreEvent(event)) {
            return;
        }

        if (this.timer != null) {
            clearTimeout(this.timer);
            this.timer = null;
        }

        const { keyMappings, onInvokeKeyMapping, timeoutLength } = this.props;
        const keyString = keyEventToKeyString(event);
        const keys = [...this.pendingKeys, keyString];
        const node = Trie.find(keyMappings, keys);

        if (!node) {
            this.pendingKeys = [];
            return;
        }

        const mapping = node.value;
        const hasNextMapping = !Trie.isEmpty(node.children);

        if (mapping) {
            event.preventDefault();

            if (hasNextMapping) {
                this.timer = setTimeout(() => {
                    onInvokeKeyMapping(mapping);
                    this.timer = null;
                    this.pendingKeys = [];
                }, timeoutLength);
                this.pendingKeys = keys;
            } else {
                onInvokeKeyMapping(mapping);
                this.pendingKeys = [];
            }
        } else {
            this.pendingKeys = hasNextMapping ? keys : [];
        }
    }

    render() {
        return null;
    }
}

function keyEventToKeyString(event: KeyboardEvent): string {
    const key = SPECIAL_KEYS_TABLE[event.key] || event.key;
    let s = '';
    if (event.shiftKey && key.length > 1) {
        s += 'S-';
    }
    if (event.ctrlKey) {
        s += 'C-';
    }
    if (event.altKey) {
        s += 'A-';
    }
    if (event.metaKey) {
        s += 'M-';
    }
    s += key;
    return s.length > 1 ? '<' + s + '>' : s;
}

function shouldIgnoreEvent(event: KeyboardEvent): boolean {
    if (isModifier(event.key)) {
        return true;
    }

    if (event.target instanceof HTMLElement) {
        const element = event.target;

        if (element.tagName === 'INPUT' ||
            element.tagName === 'SELECT' ||
            element.tagName === 'TEXTAREA' ||
            element.isContentEditable) {
            return true;
        }
    }

    return false;
}

function isModifier(key: string): boolean {
    if (key === 'Control'
        || key === 'Shift'
        || key === 'Alt'
        || key === 'Meta') {
        return true;
    }
    return false;
}
