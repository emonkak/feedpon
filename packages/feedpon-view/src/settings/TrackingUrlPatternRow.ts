import type { RenderContext, TemplateResult } from '@emonkak/ebit';
import { AlertDialog } from '../primitives/AlertDialog';

interface TrackingUrlPatternRowProps {
  onDelete: (pattern: string) => void;
  pattern: string;
}

export function TrackingUrlPatternRow(
  { onDelete, pattern }: TrackingUrlPatternRowProps,
  context: RenderContext,
): TemplateResult {
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
          onDelete(pattern);
        },
        title: `Delete "${pattern}"`,
        message: 'Are you sure you want to delete this pattern?',
      },
      context,
    );
  }, [onDelete]);

  return context.html`
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
}
