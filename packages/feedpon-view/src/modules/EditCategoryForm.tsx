import React, { useState } from 'react';

import ConfirmModal from '../components/ConfirmModal';
import type { Category } from 'feedpon-messaging';

import useEvent from '../hooks/useEvent';
import usePrevious from '../hooks/usePrevious';

interface EditCategoryFormProps {
  category: Category;
  onDelete: (categoryId: string | number, label: string) => void;
  onUpdate: (category: Category, newLabel: string) => void;
}

export default function EditCategoryForm({
  category,
  onDelete,
  onUpdate,
}: EditCategoryFormProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingLabel, setEditingLabel] = useState(category.label);
  const previousCategory = usePrevious(category);

  if (previousCategory !== null && previousCategory !== category) {
    setEditingLabel(category.label);
  }

  const handleCancelDeleting = useEvent(() => {
    setIsDeleting(false);
  });

  const handleCancelEditing = useEvent(() => {
    setIsEditing(false);
  });

  const handleDelete = useEvent(() => {
    onDelete(category.categoryId, category.label);
  });

  const handleStartDeleting = useEvent(() => {
    setIsDeleting(true);
  });

  const handleStartEditing = useEvent(() => {
    setIsEditing(true);
  });

  const handleUpdate = useEvent(() => {
    onUpdate(category, editingLabel);
  });

  const handleChangeLabel = useEvent(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setEditingLabel(event.currentTarget.value);
    },
  );

  return (
    <div className="form">
      <div className="form-legend">Edit Category</div>
      <div className="input-group">
        <input
          onChange={handleChangeLabel}
          type="text"
          className="form-control"
          value={editingLabel}
          required
        />
        <button
          className="button button-positive"
          disabled={
            category.isLoading ||
            editingLabel === '' ||
            editingLabel === category.label
          }
          onClick={handleStartEditing}
        >
          Rename
        </button>
        <button
          className="button button-negative"
          disabled={category.isLoading}
          onClick={handleStartDeleting}
        >
          Delete
        </button>
      </div>
      <ConfirmModal
        confirmButtonClassName="button button-negative"
        confirmButtonLabel="Delete"
        isOpened={isDeleting}
        message="Are you sure you want to delete this category?"
        onClose={handleCancelDeleting}
        onConfirm={handleDelete}
        title={`Delete "${category.label}"`}
      />
      <ConfirmModal
        confirmButtonClassName="button button-positive"
        confirmButtonLabel="Rename"
        isOpened={isEditing}
        message="Are you sure you want to change label of this category?"
        onClose={handleCancelEditing}
        onConfirm={handleUpdate}
        title={`Rename "${category.label}" to "${editingLabel}"`}
      />
    </div>
  );
}
