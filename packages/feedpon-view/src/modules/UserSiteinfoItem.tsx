import React, { useState } from 'react';

import ConfirmModal from '../components/ConfirmModal';
import Modal from '../components/Modal';
import UserSiteinfoForm from './UserSiteinfoForm';
import type { SiteinfoItem } from 'feedpon-messaging';
import {
  deleteUserSiteinfoItem,
  updateUserSiteinfoItem,
} from 'feedpon-messaging/userSiteinfo';
import useEvent from '../hooks/useEvent';

interface UserSiteinfoItemProps {
  item: SiteinfoItem;
  onDelete: typeof deleteUserSiteinfoItem;
  onUpdate: typeof updateUserSiteinfoItem;
}

export default function UserSiteinfoItem({
  item,
  onDelete,
  onUpdate,
}: UserSiteinfoItemProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const handleCancelDeleting = useEvent(() => {
    setIsDeleting(false);
  });

  const handleCancelEditing = useEvent(() => {
    setIsEditing(false);
  });

  const handleDelete = useEvent(() => {
    onDelete(item.id);
  });

  const handleStartDeleting = useEvent(() => {
    setIsDeleting(true);
  });

  const handleStartEditing = useEvent(() => {
    setIsEditing(true);
  });

  const handleSubmit = useEvent((item: SiteinfoItem) => {
    onUpdate(item);

    setIsEditing(false);
  });

  return (
    <tr>
      <td>{item.name}</td>
      <td>
        <code>{item.urlPattern}</code>
      </td>
      <td>
        <div className="button-toolbar u-text-nowrap">
          <button
            className="button button-outline-default"
            onClick={handleStartEditing}
          >
            <i className="icon icon-16 icon-edit" />
          </button>
          <button
            className="button button-outline-negative"
            onClick={handleStartDeleting}
          >
            <i className="icon icon-16 icon-trash" />
          </button>
        </div>
        <Modal isOpened={isEditing} onClose={handleCancelEditing}>
          <UserSiteinfoForm
            legend="Edit existing item"
            item={item}
            onSubmit={handleSubmit}
          >
            <div className="button-toolbar">
              <button className="button button-outline-positive" type="submit">
                Save
              </button>
              <button
                className="button button-outline-default"
                onClick={handleCancelEditing}
              >
                Cancel
              </button>
            </div>
          </UserSiteinfoForm>
        </Modal>
        <ConfirmModal
          confirmButtonClassName="button button-outline-negative"
          confirmButtonLabel="Delete"
          isOpened={isDeleting}
          message="Are you sure you want to delete this item?"
          onClose={handleCancelDeleting}
          onConfirm={handleDelete}
          title={`Delete "${item.name}"`}
        />
      </td>
    </tr>
  );
}
