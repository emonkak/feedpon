import React, { useEffect } from 'react';
import CSSTransition from 'react-transition-group/CSSTransition';

import useEvent from '../hooks/useEvent';

interface ModalProps {
  children?: React.ReactNode;
  isOpened?: boolean;
  onClose?: () => void;
}

export default function Modal({
  children,
  isOpened = false,
  onClose,
}: ModalProps) {
  const handleDocumentKeyDown = useEvent((event: KeyboardEvent) => {
    if (isOpened) {
      event.stopPropagation();

      if (event.key === 'Escape') {
        if (onClose) {
          onClose();
        }
      }
    }
  });

  const handleCloseModal = useEvent((event: React.MouseEvent<any>) => {
    if (event.target === event.currentTarget) {
      event.preventDefault();

      if (onClose) {
        onClose();
      }
    }
  });

  useEffect(() => {
    document.addEventListener('keydown', handleDocumentKeyDown, true);

    return () => {
      document.removeEventListener('keydown', handleDocumentKeyDown, true);
    };
  }, []);

  useEffect(() => {
    updateModalStatus(isOpened);

    () => {
      updateModalStatus(false);
    };
  }, [isOpened]);

  return (
    <CSSTransition
      in={isOpened}
      mountOnEnter
      unmountOnExit
      classNames="modal"
      timeout={200}
    >
      <div className="modal" onClick={handleCloseModal}>
        <div className="modal-dialog">{children}</div>
      </div>
    </CSSTransition>
  );
}

function updateModalStatus(isOpened: boolean) {
  const availableModals = document.getElementsByClassName('modal').length;

  if (availableModals <= 1) {
    if (isOpened) {
      document.documentElement.classList.add('modal-is-opened');
    } else {
      document.documentElement.classList.remove('modal-is-opened');
    }
  }
}
