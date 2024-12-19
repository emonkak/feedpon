import type { Category, Subscription } from 'feedpon-messaging';

import type { RenderContext, TemplateResult } from '@emonkak/ebit';
import { classMap, component, keyedList } from '@emonkak/ebit/directives.js';
import { AlertDialog } from '../primitives/AlertDialog';
import { Dropdown } from '../primitives/Dropdown';

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

export function SubscriptionDropdown(
  {
    categories,
    onAddToCategory,
    onCreateCategory,
    onRemoveFromCategory,
    onUnsubscribe,
    subscription,
  }: SubscriptionDropdownProps,
  context: RenderContext,
): TemplateResult {
  const [categoryLabel, setCategoryLabel] = context.useState('');

  const handleCreateCategory = context.useCallback(() => {
    onCreateCategory(categoryLabel, () => {
      onAddToCategory(subscription, categoryLabel);
    });
    setCategoryLabel('');
  }, [onCreateCategory]);

  const handleRemoveFromCategory = context.useCallback(
    (event: Event) => {
      const label = (event.currentTarget as HTMLElement).dataset['label']!;
      onRemoveFromCategory(subscription, label);
    },
    [subscription, onRemoveFromCategory],
  );

  const handleAddToCategory = context.useCallback(
    (event: Event) => {
      const label = (event.currentTarget as HTMLElement).dataset['label']!;
      onAddToCategory(subscription, label);
    },
    [subscription, onAddToCategory],
  );

  const handleChangeCategoryLabel = context.useCallback((event: Event) => {
    setCategoryLabel((event.currentTarget as HTMLInputElement).value);
  }, []);

  const handleUnsubscribe = context.useCallback(() => {
    AlertDialog.open(
      {
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
      },
      context,
    );
  }, []);

  const categoryMenuItems = keyedList(
    categories,
    (category) => category.categoryId,
    (category) => {
      const isAdded = subscription.labels.includes(category.label);
      const icon = isAdded
        ? context.html`<i aria-hidden class="icon icon-16 icon-checkmark" role="img"></i></div>`
        : null;
      const handleClick = isAdded
        ? handleRemoveFromCategory
        : handleAddToCategory;

      return context.html`
        <button
          class="MenuItem"
          role="menuitem"
          data-label=${category.label}
          disabled=${subscription.isLoading}
          type="button"
          @click=${handleClick}
        >
          <div class="MenuItem-content">${category.label}</div>
          <div class="MenuItem-icon"><${icon}></div>
        </button>
      `;
    },
  );

  const dropdown = component(Dropdown, {
    children: context.html`
      <div class="MenuSection">
        <div class="MenuHeading" role="heading">Category</div>
        <${categoryMenuItems}>
      </div>
      <hr class="MenuSeparator">
      <div class="MenuSection">
        <div class="MenuHeading" role="heading">New Category</div>
        <form class="MenuItem" role="menuitem" @submit=${handleCreateCategory}>
          <div class="MenuItem-content">
            <div class="input-group">
              <input
                type="text"
                class="form-control"
                style="width: 12rem"
                value=${categoryLabel}
                disabled=${subscription.isLoading}
                @change=${handleChangeCategoryLabel}
              />
              <button
                type="submit"
                class="button button-positive"
                disabled=${subscription.isLoading}
              >
                OK
              </button>
            </div>
          </div>
        </form>
      </div>
      <hr class="MenuSeparator">
      <button
        class="MenuItem"
        role="menuitem"
        type="button"
        disabled=${subscription.isLoading}
        @click=${handleUnsubscribe}
      >
        <div class="MenuItem-content">
          Unsubscribe...
        </div>
      </button>
    `,
    toggleButton: ({ toggle, id, opened }, context) => context.html`
      <button
        aria-expanded=${opened.toString()}
        type="button"
        class="link-soft u-margin-left-2"
        disabled=${subscription.isLoading}
        id=${id}
        @click=${toggle}
      >
        <i
          aria-hidden
          class=${classMap({
            icon: true,
            'icon-20': true,
            'icon-width-32': true,
            [subscription.isLoading
              ? 'icon-spinner animation-rotating'
              : 'icon-menu-2']: true,
          })}
          role="img"
        ></i>
      </button>
    `,
  });

  return context.html`<${dropdown}>`;
}
