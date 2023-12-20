import React, { useState } from 'react';

import ConfirmModal from '../components/ConfirmModal';
import KeyMappingForm from './KeyMappingForm';
import Modal from '../components/Modal';
import type { Command, KeyMapping } from 'feedpon-messaging';
import useEvent from '../hooks/useEvent';

interface KeyMappingItemProps {
  commandTable: { [commandId: string]: Command<any> };
  keyMapping: KeyMapping;
  keys: string[];
  onDelete: (keyStroke: string) => void;
  onUpdate: (keyStroke: string, keyMapping: KeyMapping) => void;
}

export default function KeyMappingItem({
  commandTable,
  keyMapping,
  keys,
  onDelete,
  onUpdate,
}: KeyMappingItemProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const handleCancelDeleting = useEvent(() => {
    setIsDeleting(false);
  });

  const handleCancelEditing = useEvent(() => {
    setIsEditing(false);
  });

  const handleDelete = useEvent(() => {
    onDelete(keys.join(''));
  });

  const handleStartDeleting = useEvent(() => {
    setIsDeleting(true);
  });

  const handleStartEditing = useEvent(() => {
    setIsEditing(true);
  });

  const handleUpdate = useEvent((keyStroke: string, keyMapping: KeyMapping) => {
    onUpdate(keyStroke, keyMapping);

    setIsEditing(false);
  });

  const command = commandTable[keyMapping.commandId];
  const commandName = command ? command.name : `<${keyMapping.commandId}>`;

  return (
    <tr key={keys.join('')}>
      <td>
        {keys.map((key, index) => (
          <kbd key={index}>{key}</kbd>
        ))}
      </td>
      <td>
        <span>{commandName}</span>
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
          confirmButtonClassName="button button-negative"
          confirmButtonLabel="Delete"
          isOpened={isDeleting}
          message="Are you sure you want to delete this key mapping?"
          onClose={handleCancelDeleting}
          onConfirm={handleDelete}
          title={`Delete "${keys.join('')}" mapping`}
        />
        <Modal isOpened={isEditing} onClose={handleCancelEditing}>
          <KeyMappingForm
            keyStroke={keys.join('')}
            keyMapping={keyMapping}
            commandTable={commandTable}
            legend="Edit key mapping"
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
          </KeyMappingForm>
        </Modal>
      </td>
    </tr>
  );
}
