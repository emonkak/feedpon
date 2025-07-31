import { type RenderContext, repeat } from 'barebind';
import type { Command, KeyMapping } from 'feedpon-messaging';
import * as Trie from 'feedpon-utils/Trie.ts';

interface KeyMappingsTableProps {
  commandTable: { [key: string]: Command<any> };
  keyMappings: Trie.Trie<KeyMapping>;
}

export function KeyMappingsTable(
  { commandTable, keyMappings }: KeyMappingsTableProps,
  context: RenderContext,
): unknown {
  const rows = repeat({
    source: Trie.toArray(keyMappings),
    valueSelector: ([keys, keyMapping]) => {
      const name =
        commandTable[keyMapping.commandId]?.name ?? `<${keyMapping.commandId}>`;

      return context.html`
        <tr>
          <td>
            <${repeat({
              source: keys,
              valueSelector: (key) => context.html`<kbd>${key}</kbd>`,
            })}>
          </td>
          <td>${name}</td>
        </tr>
      `;
    },
  });

  return context.html`
    <table class="table">
      <thead>
        <tr>
          <th>Key</th>
          <th>Command</th>
        </tr>
      </thead>
      <tbody><${rows}></tbody>
    </table>
  `;
}
