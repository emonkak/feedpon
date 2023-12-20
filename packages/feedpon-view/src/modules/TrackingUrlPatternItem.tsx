import React, { useState } from 'react';

import ConfirmModal from '../components/ConfirmModal';
import useEvent from '../hooks/useEvent';

interface TrackingUrlPatternItemProps {
  onDelete: (pattern: string) => void;
  pattern: string;
}

export default function TrackingUrlPatternItem({
  onDelete,
  pattern,
}: TrackingUrlPatternItemProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleCancelDeleting = useEvent(() => {
    setIsDeleting(false);
  });

  const handleDelete = useEvent(() => {
    onDelete(pattern);
  });

  const handleStartDeleting = useEvent(() => {
    setIsDeleting(true);
  });

  return (
    <tr>
      <td>
        <code>{pattern}</code>
      </td>
      <td className="u-text-nowrap">
        <button
          className="button button-small button-outline-negative"
          onClick={handleStartDeleting}
        >
          <i className="icon icon-16 icon-trash" />
        </button>
        <ConfirmModal
          confirmButtonClassName="button button-outline-negative"
          confirmButtonLabel="Delete"
          isOpened={isDeleting}
          message="Are you sure you want to delete this pattern?"
          onClose={handleCancelDeleting}
          onConfirm={handleDelete}
          title={`Delete "${pattern}"`}
        />
      </td>
    </tr>
  );
}
