import { createComponent, type RenderContext, Repeat } from 'barebind';
import type { Command, KeyMapping } from 'feedpon-messaging';

import { openAlertDialog } from '../primitives/AlertDialog.ts';
import { Dialog } from '../primitives/Dialog.ts';
import { KeyMappingForm } from './KeyMappingForm.ts';

interface KeyMappingRowProps {
  commandTable: { [commandId: string]: Command<any> };
  keyMapping: KeyMapping;
  keys: string[];
  onDelete: (keyStroke: string) => void;
  onUpdate: (keyStroke: string, keyMapping: KeyMapping) => void;
}

export const KeyMappingRow = createComponent(function KeyMappingRow(
  { commandTable, keyMapping, keys, onDelete, onUpdate }: KeyMappingRowProps,
  $: RenderContext,
): unknown {
  const [isEditing, setIsEditing] = $.useState(false);

  const handleStartEditing = $.useCallback(() => {
    setIsEditing(true);
  }, []);

  const handleEndEditing = $.useCallback(() => {
    setIsEditing(false);
  }, []);

  const handleSubmit = $.useCallback(
    (keyStroke: string, keyMapping: KeyMapping) => {
      onUpdate(keyStroke, keyMapping);
      setIsEditing(false);
    },
    [onUpdate],
  );

  const handleDelete = $.useCallback(() => {
    openAlertDialog({
      confirmButton: ({ onConfirm }, $) => $.html`
          <button class="button button-negative" type="button" @click=${onConfirm}>Delete</button>
        `,
      cancelButton: ({ onCancel }, $) => $.html`
          <button class="button button-outline-default" type="button" @click=${onCancel}>Cancel</button>
        `,
      onConfirm: () => {
        onDelete(keys.join(''));
      },
      title: `Delete "${keys.join('')}" mapping`,
      message: 'Are you sure you want to delete this key mapping?',
    });
  }, [keys, onDelete]);

  const command = commandTable[keyMapping.commandId];
  const commandName = command ? command.name : `<${keyMapping.commandId}>`;
  const keyStroke = Repeat({
    source: keys,
    keySelector: (key) => $.html`<kbd>${key}</kbd>`,
  });

  const keyMappingModal = Dialog({
    open: isEditing,
    children: $.html`
      <${KeyMappingForm({
        keyStroke: keys.join(''),
        keyMapping,
        commandTable,
        onCancel: handleEndEditing,
        onSubmit: handleSubmit,
      })}>
    `,
    onClose: handleEndEditing,
  });

  return $.html`
    <tr>
      <td><${keyStroke}></td>
      <td>${commandName}</td>
      <td class="u-text-nowrap">
        <div class="button-toolbar">
          <button
            type="button"
            class="button button-small button-outline-default"
            @click=${handleStartEditing}
          >
            <i class="icon icon-16 icon-edit"></i>
          </button>
          <button
            type="button"
            class="button button-small button-outline-negative"
            @click=${handleDelete}
          >
            <i class="icon icon-16 icon-trash"></i>
          </button>
        </div>
        <${keyMappingModal}>
      </td>
    </tr>
  `;
});
