import React, { useState } from 'react';

import ConfirmModal from '../components/ConfirmModal';
import Modal from '../components/Modal';
import UrlReplacementForm from './UrlReplacementForm';
import type { UrlReplacement } from 'feedpon-messaging';
import useEvent from '../hooks/useEvent';

interface UrlReplacementItemProps {
  index: number;
  item: UrlReplacement;
  onDelete: (index: number) => void;
  onUpdate: (index: number, item: UrlReplacement) => void;
}

export default function UrlReplacementItem({
  index,
  item,
  onDelete,
  onUpdate,
}: UrlReplacementItemProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const handleCancelDeleting = useEvent(() => {
    setIsDeleting(false);
  });

  const handleCancelEditing = useEvent(() => {
    setIsEditing(false);
  });

  const handleDelete = useEvent(() => {
    onDelete(index);
  });

  const handleStartDeleting = useEvent(() => {
    setIsDeleting(true);
  });

  const handleStartEditing = useEvent(() => {
    setIsEditing(true);
  });

  const handleUpdate = useEvent((item: UrlReplacement) => {
    onUpdate(index, item);

    setIsEditing(false);
  });

  return (
    <tr>
      <td className="u-text-nowrap">{index + 1}</td>
      <td className="u-text-nowrap">
        <code>{item.pattern}</code>
      </td>
      <td className="u-text-nowrap">
        <code>{item.replacement}</code>
      </td>
      <td className="u-text-nowrap">
        <code>{item.flags}</code>
      </td>
      <td className="u-text-nowrap">
        <div className="button-toolbar">
          <button
            className="button button-small button-outline-default"
            onClick={handleStartEditing}
          >
            <i className="icon icon-16 icon-edit" />
          </button>
          <button
            className="button button-small button-outline-negative"
            onClick={handleStartDeleting}
          >
            <i className="icon icon-16 icon-trash" />
          </button>
        </div>
        <ConfirmModal
          confirmButtonClassName="button button-outline-negative"
          confirmButtonLabel="Delete"
          isOpened={isDeleting}
          message="Are you sure you want to delete this pattern?"
          onClose={handleCancelDeleting}
          onConfirm={handleDelete}
          title={`Delete #${index + 1}`}
        />
        <Modal isOpened={isEditing} onClose={handleCancelEditing}>
          <UrlReplacementForm
            item={item}
            legend="Edit URL replacement rule"
            onSubmit={handleUpdate}
          >
            <div className="button-toolbar">
              <button type="submit" className="button button-outline-positive">
                Update
              </button>
              <button
                className="button button-outline-default"
                onClick={handleCancelEditing}
              >
                Cancel
              </button>
            </div>
          </UrlReplacementForm>
        </Modal>
      </td>
    </tr>
  );
}
