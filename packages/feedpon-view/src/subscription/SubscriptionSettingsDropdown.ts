import { component, type RenderContext } from 'barebind';
import { Atom } from 'barebind/extensions/signal';
import type { Category, Feed, Subscription } from 'feedpon-messaging';

import { AlertDialog } from '../primitives/AlertDialog.ts';
import { Dropdown } from '../primitives/Dropdown.ts';
import type { MenuItem } from '../primitives/Menu.ts';

interface SubscriptionSettingsDropdownProps {
  categories: Category[];
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

export function SubscriptionSettingsDropdown(
  {
    categories,
    feed,
    onAddToCategory,
    onCreateCategory,
    onRemoveFromCategory,
    onSubscribe,
    onUnsubscribe,
    subscription,
  }: SubscriptionSettingsDropdownProps,
  context: RenderContext,
): unknown {
  const categoryLabel$ = context.use(Atom.untracked(''));

  const handleCreateCategory = context.useCallback(
    (event: Event) => {
      event.preventDefault();
      const categoryLabel = categoryLabel$.value;
      if (subscription !== null) {
        onCreateCategory(categoryLabel, () =>
          onAddToCategory(subscription, categoryLabel),
        );
      } else {
        onCreateCategory(categoryLabel, () =>
          onSubscribe(feed, [categoryLabel]),
        );
      }
      categoryLabel$.value = '';
    },
    [onAddToCategory, onCreateCategory, onSubscribe, subscription],
  );

  const handleChangeCategoryLabel = context.useCallback((event: Event) => {
    categoryLabel$.value = (event.currentTarget as HTMLInputElement).value;
  }, []);

  const handleUnsubscribe = context.useCallback(() => {
    AlertDialog.open({
      confirmButton: ({ onConfirm }, context) => context.html`
          <button class="button button-negative" type="button" @click=${onConfirm}>Unsubscribe</button>
        `,
      cancelButton: ({ onCancel }, context) => context.html`
          <button class="button button-outline-default" type="button" @click=${onCancel}>Cancel</button>
        `,
      onConfirm: () => {
        if (subscription !== null) {
          onUnsubscribe(subscription);
        }
      },
      title: `Unsubscribe "${feed.title}"`,
      message: 'Are you sure you want to unsubscribe the feed?',
    });
  }, [feed, onUnsubscribe]);

  const categoryMenuItems: MenuItem[] =
    subscription !== null
      ? categories.map((category) => {
          const isAdded = subscription.labels.includes(category.label);
          const icon = isAdded
            ? context.html`<i aria-hidden="true" class="icon icon-16 icon-checkmark" role="img"></i>`
            : null;
          const handleAction = isAdded
            ? () => {
                onRemoveFromCategory(subscription, category.label);
              }
            : () => {
                onAddToCategory(subscription, category.label);
              };
          return {
            type: 'button',
            key: category.label,
            checked: isAdded,
            children: context.html`
              <div class="MenuItem-icon"><${icon}></div>
              <div class="MenuItem-content">${category.label}</div>
            `,
            onAction: handleAction,
          };
        })
      : categories.map((category) => ({
          type: 'button',
          key: category.label,
          children: context.html`
            <div class="MenuItem-content">${category.label}</div>
          `,
          onAction: () => {
            onSubscribe(feed, [category.label]);
          },
        }));
  const dropdown = component(Dropdown, {
    trigger: ({ id, onToggle, open }, context) => context.html`
      <button
        aria-expanded=${open.toString()}
        aria-label="Toggle subscription settings dropdown"
        class=${subscription !== null ? 'button button-outline-default dropdown-arrow' : 'button button-outline-positive dropdown-arrow'}
        disabled=${feed.isLoading}
        id=${id}
        type="button"
        @click=${onToggle}
      >
        <i
          aria-hidden="true"
          :classlist=${[
            'icon',
            'icon-20',
            feed.isLoading
              ? 'icon-spinner'
              : subscription !== null
                ? 'icon-settings'
                : 'icon-plus-math',
            {
              'animation-rotating': feed.isLoading,
            },
          ]}
          role="img"
        ></i>
      </button>
    `,
    items: [
      {
        type: 'group',
        key: 'categories',
        label: 'Categories',
        childItems: categoryMenuItems,
      },
      {
        type: 'separator',
        key: 'separator1',
      },
      {
        type: 'group',
        key: 'categories',
        label: 'New category',
        childItems: [
          {
            type: 'form',
            key: 'new_category',
            ariaLabel: 'New category',
            children: context.html`
              <div class="MenuItem-content">
                <div class="input-group">
                  <input
                    type="text"
                    class="form-control"
                    style="width: 12ch"
                    $value=${categoryLabel$}
                    @change=${handleChangeCategoryLabel}
                  >
                  <button type="submit" class="button button-positive">OK</button>
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
        children: context.html`
          <div class="MenuItem-content">Unsubscribe...</div>
        `,
        onAction: handleUnsubscribe,
      },
    ],
  });

  return context.html`<${dropdown}>`;
}
