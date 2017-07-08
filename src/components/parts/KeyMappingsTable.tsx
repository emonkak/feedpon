import Enumerable from '@emonkak/enumerable';
import React, { PureComponent } from 'react';

import '@emonkak/enumerable/extensions/select';
import '@emonkak/enumerable/extensions/toArray';

import * as Trie from 'utils/containers/Trie';
import { Command, KeyMapping } from 'messaging/types';

interface KeyMappingsTableProps {
    commands: { [key: string]: Command<any> };
    keyMappings: Trie.Trie<KeyMapping>;
}

export default class KeyMappingsTable extends PureComponent<KeyMappingsTableProps, {}> {
    renderRow(keys: string[], keyMapping: KeyMapping) {
        const { commands } = this.props;
        const command = commands[keyMapping.commandId as keyof typeof commands] as Command<any>;
        const commandName = command ? command.name : `<${keyMapping.commandId}>`;

        return (
            <tr key={keys.join('')}>
                <td>{keys.map((key, index) => <kbd key={index}>{key}</kbd>)}</td>
                <td>{commandName}</td>
            </tr>
        );
    }

    render() {
        const { keyMappings } = this.props;

        const rows = new Enumerable(Trie.iterate(keyMappings))
            .select(([keys, keyMapping]) => this.renderRow(keys, keyMapping))
            .toArray();

        return (
            <table className="table">
                <thead>
                    <tr>
                        <th>Key</th>
                        <th>Command</th>
                    </tr>
                </thead>
                <tbody>{rows}</tbody>
            </table>
        );
    }
}
