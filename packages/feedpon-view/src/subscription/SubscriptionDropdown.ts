import { createComponent, type RenderContext } from 'barebind';
import type { Category, Subscription } from 'feedpon-messaging';

import { openAlertDialog } from '../primitives/AlertDialog.ts';
import { Dropdown } from '../primitives/Dropdown.ts';
import type { MenuItem } from '../primitives/Menu.ts';

interface SubscriptionDropdownProps {
  categories: Category[];
  onAddToCategory: (subscription: Subscription, label: string) => void;
  onCreateCategory: (
    label: string,
    callback: (category: Category) => void,
  ) => void;
  onRemoveFromCategory: (subscription: Subscription, label: string) => void;
  onUnsubscribe: (subscription: Subscription) => void;
  subscription: Subscription;
}

export const SubscriptionDropdown = createComponent(
  function SubscriptionDropdown(
    {
      categories,
      onAddToCategory,
      onCreateCategory,
      onRemoveFromCategory,
      onUnsubscribe,
      subscription,
    }: SubscriptionDropdownProps,
    $: RenderContext,
  ): unknown {
    const [categoryLabel, setCategoryLabel] = $.useState('');

    const handleCreateCategory = $.useCallback(
      (event: Event) => {
        event.preventDefault();
        onCreateCategory(categoryLabel, () => {
          onAddToCategory(subscription, categoryLabel);
        });
        setCategoryLabel('');
      },
      [onCreateCategory],
    );

    const handleRemoveFromCategory = $.useCallback(
      (_event: Event, key: string) => {
        onRemoveFromCategory(subscription, key);
      },
      [subscription, onRemoveFromCategory],
    );

    const handleAddToCategory = $.useCallback(
      (_event: Event, key: string) => {
        onAddToCategory(subscription, key);
      },
      [subscription, onAddToCategory],
    );

    const handleChangeCategoryLabel = $.useCallback((event: Event) => {
      setCategoryLabel((event.currentTarget as HTMLInputElement).value);
    }, []);

    const handleUnsubscribe = $.useCallback(() => {
      openAlertDialog({
        confirmButton: ({ onConfirm }, context) => context.html`
          <button
            class="button button-negative"
            type="button"
            @click=${onConfirm}
          >
            Logout
          </button>
        `,
        cancelButton: ({ onCancel }, context) => context.html`
          <button
            class="button button-outline-default"
            type="button"
            @click=${onCancel}
          >
            Cancel
          </button>
        `,
        onConfirm: () => {
          onUnsubscribe(subscription);
        },
        title: `Unsubscribe "${subscription.title}"`,
        message: 'Are you sure you want to unsubscribe the feed?',
      });
    }, []);

    const categoryMenuItems = categories.map((category) => {
      const isAdded = subscription.labels.includes(category.label);
      const icon = isAdded
        ? $.html`<i aria-hidden class="icon icon-16 icon-checkmark" role="img"></i></div>`
        : null;
      const handleAction = isAdded
        ? handleRemoveFromCategory
        : handleAddToCategory;

      return {
        type: 'button',
        checked: isAdded,
        key: category.label,
        children: $.html`
          <div class="MenuItem-content">${category.label}</div>
          <div class="MenuItem-icon"><${icon}></div>
        `,
        onAction: handleAction,
      } as MenuItem;
    });

    return Dropdown({
      trigger: ({ id, onToggle, open }, context) => context.html`
        <button
          aria-expanded=${open.toString()}
          type="button"
          class="link-soft u-margin-left-2"
          disabled=${subscription.isLoading}
          id=${id}
          @click=${onToggle}
        >
          <i
            :class=${[
              'icon icon-20 icon-width-32',
              subscription.isLoading
                ? 'icon-spinner animation-rotating'
                : 'icon-menu-2',
            ]}
            aria-hidden
            role="img"
          ></i>
        </button>
      `,
      items: [
        {
          type: 'group',
          key: 'categories',
          label: 'Category',
          childItems: categoryMenuItems,
        },
        {
          type: 'separator',
          key: 'separator1',
        },
        {
          type: 'group',
          key: 'new_category',
          label: 'New Category',
          childItems: [
            {
              type: 'form',
              key: 'create_new_category',
              ariaLabel: 'Create new category',
              children: $.html`
              <div class="MenuItem-content">
                <div class="input-group">
                  <input
                    type="text"
                    class="form-control"
                    style="width: 12rem"
                    value=${categoryLabel}
                    disabled=${subscription.isLoading}
                    @change=${handleChangeCategoryLabel}
                  >
                  <button
                    type="submit"
                    class="button button-positive"
                    disabled=${subscription.isLoading}
                  >
                    OK
                  </button>
                </div>
              </div>
            `,
              onAction: handleCreateCategory,
            },
          ],
        },
        {
          type: 'separator',
          key: 'separator2',
        },
        {
          type: 'button',
          key: 'unsubscribe',
          children: $.html`
          <div class="MenuItem-content">Unsubscribe...</div>
        `,
          onAction: handleUnsubscribe,
        },
      ],
    });
  },
);
