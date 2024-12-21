import type { RenderContext, TemplateResult } from '@emonkak/ebit';
import { component, nonKeyedList } from '@emonkak/ebit/directives.js';
import type { Command, KeyMapping } from 'feedpon-messaging';
import { AlertDialog } from '../primitives/AlertDialog';
import { Dialog } from '../primitives/Dialog';

import { KeyMappingForm } from './KeyMappingForm';

interface KeyMappingRowProps {
  commandTable: { [commandId: string]: Command<any> };
  keyMapping: KeyMapping;
  keys: string[];
  onDelete: (keyStroke: string) => void;
  onUpdate: (keyStroke: string, keyMapping: KeyMapping) => void;
}

export function KeyMappingRow(
  { commandTable, keyMapping, keys, onDelete, onUpdate }: KeyMappingRowProps,
  context: RenderContext,
): TemplateResult {
  const [isEditing, setIsEditing] = context.useState(false);

  const handleStartEditing = context.useCallback(() => {
    setIsEditing(true);
  }, []);

  const handleEndEditing = context.useCallback(() => {
    setIsEditing(false);
  }, []);

  const handleSubmit = context.useCallback(
    (keyStroke: string, keyMapping: KeyMapping) => {
      onUpdate(keyStroke, keyMapping);
      setIsEditing(false);
    },
    [onUpdate],
  );

  const handleDelete = context.useCallback(() => {
    AlertDialog.open(
      {
        confirmButton: ({ onConfirm }, context) => context.html`
          <button class="button button-negative" type="button" @click=${onConfirm}>Delete</button>
        `,
        cancelButton: ({ onCancel }, context) => context.html`
          <button class="button button-outline-default" type="button" @click=${onCancel}>Cancel</button>
        `,
        onConfirm: () => {
          onDelete(keys.join(''));
        },
        title: `Delete "${keys.join('')}" mapping`,
        message: 'Are you sure you want to delete this key mapping?',
      },
      context,
    );
  }, [keys, onDelete]);

  const command = commandTable[keyMapping.commandId];
  const commandName = command ? command.name : `<${keyMapping.commandId}>`;
  const keyStroke = nonKeyedList(
    keys,
    (key) => context.html`<kbd>${key}</kbd>`,
  );

  const keyMappingModal = component(Dialog, {
    open: isEditing,
    children: context.html`
      <${component(KeyMappingForm, {
        keyStroke: keys.join(''),
        keyMapping,
        commandTable,
        onCancel: handleEndEditing,
        onSubmit: handleSubmit,
      })}>
    `,
    onClose: handleEndEditing,
  });

  return context.html`
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
}
