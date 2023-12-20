import React from 'react';

import type { Command, KeyMapping } from 'feedpon-messaging';
import * as Trie from 'feedpon-utils/Trie';

interface KeyMappingsTableProps {
  commandTable: { [key: string]: Command<any> };
  keyMappings: Trie.Trie<KeyMapping>;
}

export default function KeyMappingsTable({
  commandTable,
  keyMappings,
}: KeyMappingsTableProps) {
  const rows = Trie.toArray(keyMappings).map(([keys, keyMapping]) => {
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
  });

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
