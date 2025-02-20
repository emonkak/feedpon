import type { RenderContext, TemplateResult } from '@emonkak/ebit';
import { nonKeyedList } from '@emonkak/ebit/directives.js';
import type { Command, KeyMapping } from 'feedpon-messaging';
import * as Trie from 'feedpon-utils/Trie.ts';

interface KeyMappingsTableProps {
  commandTable: { [key: string]: Command<any> };
  keyMappings: Trie.Trie<KeyMapping>;
}

export function KeyMappingsTable(
  { commandTable, keyMappings }: KeyMappingsTableProps,
  context: RenderContext,
): TemplateResult {
  const rows = nonKeyedList(Trie.toArray(keyMappings), ([keys, keyMapping]) => {
    const name =
      commandTable[keyMapping.commandId]?.name ?? `<${keyMapping.commandId}>`;

    return context.html`
      <tr>
        <td><${nonKeyedList(keys, (key) => context.html`<kbd>${key}</kbd>`)}></td>
        <td>${name}</td>
      </tr>
    `;
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
