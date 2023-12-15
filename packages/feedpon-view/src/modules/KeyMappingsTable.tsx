import React, { PureComponent } from 'react';

import type { Command, KeyMapping } from 'feedpon-messaging';
import * as Trie from 'feedpon-utils/Trie';

interface KeyMappingsTableProps {
  commandTable: { [key: string]: Command<any> };
  keyMappings: Trie.Trie<KeyMapping>;
}

export default class KeyMappingsTable extends PureComponent<KeyMappingsTableProps> {
  renderRow(keys: string[], keyMapping: KeyMapping) {
    const { commandTable } = this.props;
    const command = commandTable[keyMapping.commandId];
    const commandName = command ? command.name : `<${keyMapping.commandId}>`;

    return (
      <tr key={keys.join('')}>
        <td>
          {keys.map((key, index) => (
            <kbd key={index}>{key}</kbd>
          ))}
        </td>
        <td>{commandName}</td>
      </tr>
    );
  }

  override render() {
    const { keyMappings } = this.props;

    const rows = Trie.toArray(keyMappings).map(([keys, keyMapping]) =>
      this.renderRow(keys, keyMapping),
    );

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
