import { createComponent, type RenderContext } from 'barebind';

import { openAlertDialog } from '../primitives/AlertDialog.ts';

interface TrackingUrlPatternRowProps {
  onDelete: (pattern: string) => void;
  pattern: string;
}

export const TrackingUrlPatternRow = createComponent(
  function TrackingUrlPatternRow(
    { onDelete, pattern }: TrackingUrlPatternRowProps,
    $: RenderContext,
  ): unknown {
    const handleDelete = $.useCallback(() => {
      openAlertDialog({
        confirmButton: ({ onConfirm }, $) => $.html`
          <button class="button button-negative" type="button" @click=${onConfirm}>Delete</button>
        `,
        cancelButton: ({ onCancel }, $) => $.html`
          <button class="button button-outline-default" type="button" @click=${onCancel}>Cancel</button>
        `,
        onConfirm: () => {
          onDelete(pattern);
        },
        title: `Delete "${pattern}"`,
        message: 'Are you sure you want to delete this pattern?',
      });
    }, [onDelete]);

    return $.html`
    <tr>
      <td>
        <code>${pattern}</code>
      </td>
      <td class="u-text-nowrap">
        <button
          class="button button-small button-outline-negative"
          type="button"
          @click=${handleDelete}
        >
          <i class="icon icon-16 icon-trash"></i>
        </button>
      </td>
    </tr>
  `;
  },
);
