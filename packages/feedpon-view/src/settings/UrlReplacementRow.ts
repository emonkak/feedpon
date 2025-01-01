import type { RenderContext, TemplateResult } from '@emonkak/ebit';
import { component } from '@emonkak/ebit/directives.js';
import type { UrlReplacement } from 'feedpon-messaging';

import { AlertDialog } from '../primitives/AlertDialog';
import { Dialog } from '../primitives/Dialog';
import { UrlReplacementForm } from './UrlReplacementForm';

interface UrlReplacementRowProps {
  index: number;
  item: UrlReplacement;
  onDelete: (index: number) => void;
  onUpdate: (index: number, item: UrlReplacement) => void;
}

export function UrlReplacementRow(
  { index, item, onDelete, onUpdate }: UrlReplacementRowProps,
  context: RenderContext,
): TemplateResult {
  const [isEditing, setIsEditing] = context.useState(false);

  const handleStartEditing = context.useCallback(() => {
    setIsEditing(true);
  }, []);

  const handleCancelEditing = context.useCallback(() => {
    setIsEditing(false);
  }, []);

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
          onDelete(index);
        },
        title: `Delete #${index + 1}`,
        message: 'Are you sure you want to delete the pattern?',
      },
      context,
    );
  }, [onDelete]);

  const handleUpdate = context.useCallback((item: UrlReplacement) => {
    onUpdate(index, item);
    setIsEditing(false);
  }, []);

  return context.html`
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
        <${component(Dialog, {
          open: isEditing,
          children: context.html`
            <${component(UrlReplacementForm, {
              item,
              onSubmit: handleUpdate,
            })}>
          `,
          onClose: handleCancelEditing,
        })}>
      </td>
    </tr>
  `;
}
