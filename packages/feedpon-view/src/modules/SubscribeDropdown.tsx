import React, { useState } from 'react';

import ConfirmModal from '../components/ConfirmModal';
import Dropdown from '../components/Dropdown';
import Portal from '../components/Portal';
import SubscribeButton from './SubscribeButton';
import type { Category, Feed, Subscription } from 'feedpon-messaging';
import { MenuForm, MenuItem } from '../components/Menu';
import useEvent from '../hooks/useEvent';

interface SubscribeDropdownProps {
  categories: Category[];
  className?: string;
  feed: Feed;
  onAddToCategory: (subscription: Subscription, label: string) => void;
  onCreateCategory: (
    label: string,
    callback: (category: Category) => void,
  ) => void;
  onRemoveFromCategory: (subscription: Subscription, label: string) => void;
  onSubscribe: (feed: Feed, labels: string[]) => void;
  onUnsubscribe: (subscription: Subscription) => void;
  subscription: Subscription | null;
}

type Action =
  | { type: 'ADD_TO_CATEGORY'; category: Category }
  | { type: 'CREATE_CATEGORY' }
  | { type: 'REMOVE_FROM_CATEGORY'; category: Category }
  | { type: 'SUBSCRIBE'; category: Category }
  | { type: 'UNSUBSCRIBE' };

export default function SubscribeDropdown({
  categories,
  className,
  feed,
  onAddToCategory,
  onCreateCategory,
  onRemoveFromCategory,
  onSubscribe,
  onUnsubscribe,
  subscription,
}: SubscribeDropdownProps) {
  const [categoryLabel, setCategoryLabel] = useState('');
  const [isUnsubscribing, setIsUnsubscribing] = useState(false);

  const handleSelectAction = useEvent((action: Action) => {
    switch (action.type) {
      case 'ADD_TO_CATEGORY':
        if (subscription) {
          onAddToCategory(subscription, action.category.label);
        }
        break;
      case 'CREATE_CATEGORY':
        if (subscription) {
          onCreateCategory(categoryLabel, () =>
            onAddToCategory(subscription, categoryLabel),
          );
        } else {
          onCreateCategory(categoryLabel, () =>
            onSubscribe(feed, [categoryLabel]),
          );
        }

        setCategoryLabel('');
        break;
      case 'REMOVE_FROM_CATEGORY':
        if (subscription) {
          onRemoveFromCategory(subscription, action.category.label);
        }
        break;
      case 'SUBSCRIBE':
        onSubscribe(feed, [action.category.label]);
        break;
      case 'UNSUBSCRIBE':
        setIsUnsubscribing(true);
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
    if (subscription) {
      onUnsubscribe(subscription);
    }
  });

  const menuItems = subscription
    ? categories.map((category) => {
        const isAdded = subscription.labels.includes(category.label);

        return (
          <MenuItem
            value={
              isAdded
                ? { type: 'REMOVE_FROM_CATEGORY', category }
                : { type: 'ADD_TO_CATEGORY', category }
            }
            key={category.label}
            icon={
              isAdded ? <i className="icon icon-16 icon-checkmark" /> : null
            }
            primaryText={category.label}
          />
        );
      })
    : categories.map((category) => (
        <MenuItem
          value={{ type: 'SUBSCRIBE', category }}
          key={category.categoryId}
          primaryText={category.label}
        />
      ));

  return (
    <>
      <Dropdown
        onSelect={handleSelectAction}
        className={className}
        toggleButton={
          <SubscribeButton
            isSubscribed={!!subscription}
            isLoading={feed.isLoading}
          />
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
              onChange={handleChangeCategoryLabel}
            />
            <button type="submit" className="button button-positive">
              OK
            </button>
          </div>
        </MenuForm>
        <div className="menu-divider" />
        <MenuItem
          value={{ type: 'UNSUBSCRIBE' }}
          isDisabled={!subscription}
          primaryText="Unsubscribe..."
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
          title={`Unsubscribe "${feed.title}"`}
        />
      </Portal>
    </>
  );
}
