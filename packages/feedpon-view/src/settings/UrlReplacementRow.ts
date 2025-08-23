import { createComponent, type RenderContext } from 'barebind';
import type { UrlReplacement } from 'feedpon-messaging';

import { openAlertDialog } from '../primitives/AlertDialog.ts';
import { Dialog } from '../primitives/Dialog.ts';
import { UrlReplacementForm } from './UrlReplacementForm.ts';

interface UrlReplacementRowProps {
  index: number;
  item: UrlReplacement;
  onDelete: (index: number) => void;
  onUpdate: (index: number, item: UrlReplacement) => void;
}

export const UrlReplacementRow = createComponent(function UrlReplacementRow(
  { index, item, onDelete, onUpdate }: UrlReplacementRowProps,
  $: RenderContext,
): unknown {
  const [isEditing, setIsEditing] = $.useState(false);

  const handleStartEditing = $.useCallback(() => {
    setIsEditing(true);
  }, []);

  const handleCancelEditing = $.useCallback(() => {
    setIsEditing(false);
  }, []);

  const handleDelete = $.useCallback(() => {
    openAlertDialog(
      {
        confirmButton: ({ onConfirm }, context) => context.html`
          <button class="button button-negative" type="button" @click=${onConfirm}>Delete</button>
        `,
        cancelButton: ({ onCancel }, context) => context.html`
          <button class="button button-outline-default" type="button" @click=${onCancel}>Cancel</button>
        `,
        onConfirm: () => {
          onDelete(index);
        },
        title: `Delete #${index + 1}`,
        message: 'Are you sure you want to delete the pattern?',
      },
      $,
    );
  }, [onDelete]);

  const handleUpdate = $.useCallback((item: UrlReplacement) => {
    onUpdate(index, item);
    setIsEditing(false);
  }, []);

  return $.html`
    <tr>
      <td class="u-text-nowrap">${index + 1}</td>
      <td class="u-text-nowrap">
        <code>${item.pattern}</code>
      </td>
      <td class="u-text-nowrap">
        <code>${item.replacement}</code>
      </td>
      <td class="u-text-nowrap">
        <code>${item.flags}</code>
      </td>
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
        <${Dialog({
          open: isEditing,
          children: UrlReplacementForm({
            item,
            onSubmit: handleUpdate,
          }),
          onClose: handleCancelEditing,
        })}>
      </td>
    </tr>
  `;
});
