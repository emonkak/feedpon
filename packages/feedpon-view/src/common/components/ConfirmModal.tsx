import React from 'react';

import { useEvent } from '../hooks/useEvent';
import { Modal } from './Modal';

interface ConfirmModalProps {
  cancelButtonClassName?: string;
  cancelButtonLabel?: string;
  confirmButtonClassName?: string;
  confirmButtonLabel?: string;
  containerClassName?: string;
  isOpened?: boolean;
  message: string;
  onCancel?: () => void;
  onClose?: () => void;
  onConfirm?: () => void;
  title: string;
}

export function ConfirmModal({
  cancelButtonClassName = 'button button-outline-default',
  cancelButtonLabel = 'Cancel',
  confirmButtonClassName = 'button button-outline-positive',
  confirmButtonLabel = 'OK',
  isOpened = false,
  message,
  onCancel,
  onClose,
  onConfirm,
  title,
}: ConfirmModalProps) {
  const handleCancel = useEvent(() => {
    onCancel?.();
    onClose?.();
  });

  const handleConfirm = useEvent(() => {
    onConfirm?.();
    onClose?.();
  });

  return (
    <Modal isOpened={isOpened} onClose={onClose}>
      <button type="button" className="close u-pull-right" onClick={onClose} />
      <h1 className="modal-title">{title}</h1>
      <p>{message}</p>
      <p className="button-toolbar">
        <button
          type="button"
          className={confirmButtonClassName}
          onClick={handleConfirm}
        >
          {confirmButtonLabel}
        </button>
        <button
          type="button"
          className={cancelButtonClassName}
          onClick={handleCancel}
        >
          {cancelButtonLabel}
        </button>
      </p>
    </Modal>
  );
}
