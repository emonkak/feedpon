import React, { useState } from 'react';
import classnames from 'classnames';

import ConfirmModal from '../components/ConfirmModal';
import Dropdown from '../components/Dropdown';
import Portal from '../components/Portal';
import type { Category, Subscription } from 'feedpon-messaging';
import { MenuForm, MenuItem } from '../components/Menu';
import useEvent from '../hooks/useEvent';

interface SubscriptionDropdownProps {
  categories: Category[];
  className?: string;
  onAddToCategory: (subscription: Subscription, label: string) => void;
  onCreateCategory: (
    label: string,
    callback: (category: Category) => void,
  ) => void;
  onRemoveFromCategory: (subscription: Subscription, label: string) => void;
  onUnsubscribe: (subscription: Subscription) => void;
  subscription: Subscription;
}

type Action =
  | { type: 'CREATE_CATEGORY' }
  | { type: 'UNSUBSCRIBE' }
  | { type: 'REMOVE_FROM_CATEGORY'; category: Category }
  | { type: 'ADD_TO_CATEGORY'; category: Category };

export default function SubscriptionDropdown({
  categories,
  className,
  onAddToCategory,
  onCreateCategory,
  onRemoveFromCategory,
  onUnsubscribe,
  subscription,
}: SubscriptionDropdownProps) {
  const [categoryLabel, setCategoryLabel] = useState('');
  const [isUnsubscribing, setIsUnsubscribing] = useState(false);

  const handleSelectAction = useEvent((action: Action) => {
    switch (action.type) {
      case 'CREATE_CATEGORY':
        onCreateCategory(categoryLabel, () =>
          onAddToCategory(subscription, categoryLabel),
        );

        setCategoryLabel('');
        break;
      case 'UNSUBSCRIBE': {
        setIsUnsubscribing(true);
        break;
      }
      case 'ADD_TO_CATEGORY':
        onAddToCategory(subscription, action.category.label);
        break;

      case 'REMOVE_FROM_CATEGORY':
        onRemoveFromCategory(subscription, action.category.label);
        break;
    }
  });

  const handleChangeCategoryLabel = useEvent(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const categoryLabel = event.currentTarget.value;

      setCategoryLabel(categoryLabel);
    },
  );

  const handleCloseUnsubscribeModal = useEvent(() => {
    setIsUnsubscribing(false);
  });

  const handleUnsubscribe = useEvent(() => {
    onUnsubscribe(subscription);
  });

  const menuItems = categories.map((category) => {
    const isAdded = subscription.labels.includes(category.label);

    return (
      <MenuItem<Action>
        icon={isAdded ? <i className="icon icon-16 icon-checkmark" /> : null}
        isDisabled={subscription.isLoading}
        key={category.categoryId}
        primaryText={category.label}
        value={
          isAdded
            ? { type: 'REMOVE_FROM_CATEGORY', category }
            : { type: 'ADD_TO_CATEGORY', category }
        }
      />
    );
  });

  return (
    <>
      <Dropdown
        className={className}
        onSelect={handleSelectAction}
        toggleButton={
          <button
            className="link-soft u-margin-left-2"
            disabled={subscription.isLoading}
          >
            <i
              className={classnames(
                'icon icon-20 icon-width-32',
                subscription.isLoading
                  ? 'icon-spinner animation-rotating'
                  : 'icon-menu-2',
              )}
            />
          </button>
        }
      >
        <div className="menu-heading">Category</div>
        {menuItems}
        <div className="menu-divider" />
        <div className="menu-heading">New category</div>
        <MenuForm<Action> value={{ type: 'CREATE_CATEGORY' }}>
          <div className="input-group">
            <input
              type="text"
              className="form-control"
              style={{ width: '12rem' }}
              value={categoryLabel}
              disabled={subscription.isLoading}
              onChange={handleChangeCategoryLabel}
            />
            <button
              type="submit"
              className="button button-positive"
              disabled={subscription.isLoading}
            >
              OK
            </button>
          </div>
        </MenuForm>
        <div className="menu-divider" />
        <MenuItem<Action>
          value={{ type: 'UNSUBSCRIBE' }}
          primaryText="Unsubscribe..."
          isDisabled={subscription.isLoading}
        />
      </Dropdown>
      <Portal>
        <ConfirmModal
          confirmButtonClassName="button button-negative"
          confirmButtonLabel="Unsubscribe"
          isOpened={isUnsubscribing}
          message="Are you sure you want to unsubscribe this feed?"
          onClose={handleCloseUnsubscribeModal}
          onConfirm={handleUnsubscribe}
          title={`Unsubscribe "${subscription.title}"`}
        />
      </Portal>
    </>
  );
}
