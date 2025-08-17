import { createComponent, type RenderContext, Repeat } from 'barebind';
import type { Command, KeyMapping } from 'feedpon-messaging';
import * as Trie from 'feedpon-utils/Trie.ts';

interface KeyMappingsTableProps {
  commandTable: { [key: string]: Command<any> };
  keyMappings: Trie.Trie<KeyMapping>;
}

export const KeyMappingsTable = createComponent(function KeyMappingsTable(
  { commandTable, keyMappings }: KeyMappingsTableProps,
  $: RenderContext,
): unknown {
  const rows = Repeat({
    source: Trie.toArray(keyMappings),
    valueSelector: ([keys, keyMapping]) => {
      const name =
        commandTable[keyMapping.commandId]?.name ?? `<${keyMapping.commandId}>`;

      return $.html`
        <tr>
          <td>
            <${Repeat({
              source: keys,
              valueSelector: (key) => $.html`<kbd>${key}</kbd>`,
            })}>
          </td>
          <td>${name}</td>
        </tr>
      `;
    },
  });

  return $.html`
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
});
