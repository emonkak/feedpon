import type { SiteinfoItem } from 'feedpon-messaging';
import type {
  deleteUserSiteinfoItem,
  updateUserSiteinfoItem,
} from 'feedpon-messaging/userSiteinfo';

import type { RenderContext, TemplateResult } from '@emonkak/ebit';
import { component } from '@emonkak/ebit/directives.js';
import { AlertDialog } from '../primitives/AlertDialog';
import { Dialog } from '../primitives/Dialog';
import { UserSiteinfoForm } from './UserSiteinfoForm';

interface UserSiteinfoRowProps {
  item: SiteinfoItem;
  onDelete: typeof deleteUserSiteinfoItem;
  onUpdate: typeof updateUserSiteinfoItem;
}

export function UserSiteinfoRow(
  { item, onDelete, onUpdate }: UserSiteinfoRowProps,
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
          onDelete(item.id);
        },
        title: `Delete "${item.name}"`,
        message: 'Are you sure you want to delete this item?',
      },
      context,
    );
  }, [item, onDelete]);

  const handleSubmit = context.useCallback(
    (item: SiteinfoItem) => {
      onUpdate(item);
      setIsEditing(false);
    },
    [item, onUpdate],
  );

  const editDialog = component(Dialog, {
    children: context.html`
      <${component(UserSiteinfoForm, {
        item,
        onSubmit: handleSubmit,
      })}>
    `,
    onClose: handleCancelEditing,
    open: isEditing,
  });

  return context.html`
    <tr>
      <td>${item.name}</td>
      <td>
        <code>${item.urlPattern}</code>
      </td>
      <td>
        <div class="button-toolbar u-text-nowrap">
          <button
            type="button"
            class="button button-outline-default"
            @click=${handleStartEditing}
          >
            <i class="icon icon-16 icon-edit"></i>
          </button>
          <button
            type="button"
            class="button button-outline-negative"
            @click=${handleDelete}
          >
            <i class="icon icon-16 icon-trash"></i>
          </button>
        </div>
        <${editDialog}>
      </td>
    </tr>
  `;
}
