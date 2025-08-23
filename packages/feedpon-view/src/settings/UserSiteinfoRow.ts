import { createComponent, type RenderContext } from 'barebind';
import type { SiteinfoItem } from 'feedpon-messaging';
import type {
  deleteUserSiteinfoItem,
  updateUserSiteinfoItem,
} from 'feedpon-messaging/userSiteinfo';

import { openAlertDialog } from '../primitives/AlertDialog.ts';
import { Dialog } from '../primitives/Dialog.ts';
import { UserSiteinfoForm } from './UserSiteinfoForm.ts';

interface UserSiteinfoRowProps {
  item: SiteinfoItem;
  onDelete: typeof deleteUserSiteinfoItem;
  onUpdate: typeof updateUserSiteinfoItem;
}

export const UserSiteinfoRow = createComponent(function UserSiteinfoRow(
  { item, onDelete, onUpdate }: UserSiteinfoRowProps,
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
          onDelete(item.id);
        },
        title: `Delete "${item.name}"`,
        message: 'Are you sure you want to delete this item?',
      },
      $,
    );
  }, [item, onDelete]);

  const handleSubmit = $.useCallback(
    (item: SiteinfoItem) => {
      onUpdate(item);
      setIsEditing(false);
    },
    [item, onUpdate],
  );

  const editDialog = Dialog({
    children: UserSiteinfoForm({
      item,
      onSubmit: handleSubmit,
    }),
    onClose: handleCancelEditing,
    open: isEditing,
  });

  return $.html`
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
});
