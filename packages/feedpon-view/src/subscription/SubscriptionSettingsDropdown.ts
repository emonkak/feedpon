import { createComponent, type RenderContext } from 'barebind';
import { LocalAtom } from 'barebind/addons/signal';
import type { Category, Feed, Subscription } from 'feedpon-store';

import { openAlertDialog } from '../primitives/AlertDialog.ts';
import { Dropdown } from '../primitives/Dropdown.ts';
import type { MenuItem } from '../primitives/Menu.ts';

interface SubscriptionSettingsDropdownProps {
  categories: Category[];
  feed: Feed;
  onCategoryCreate: (label: string) => Promise<void>;
  onSubscriptionCreate: (feed: Feed, labels: string[]) => Promise<void>;
  onSubscriptionDelete: (subscriptionId: string) => Promise<void>;
  onSubscriptionUpdate: (
    subscriptionId: string,
    labels: string[],
  ) => Promise<void>;
  subscription: Subscription | null;
}

export const SubscriptionSettingsDropdown = createComponent(
  function SubscriptionSettingsDropdown(
    {
      categories,
      feed,
      onCategoryCreate,
      onSubscriptionCreate,
      onSubscriptionDelete,
      onSubscriptionUpdate,
      subscription,
    }: SubscriptionSettingsDropdownProps,
    $: RenderContext,
  ): unknown {
    const newLabel$ = $.use(LocalAtom(''));

    const handleCategoryCreate = $.useCallback(
      async (event: Event) => {
        event.preventDefault();
        const newLabel = newLabel$.value;
        newLabel$.value = '';
        await onCategoryCreate(newLabel);
        if (subscription !== null) {
          const newLabels = subscription.categories
            .map((category) => category.label)
            .filter((label) => label !== undefined && label !== newLabel)
            .concat(newLabel) as string[];
          await onSubscriptionUpdate(subscription.id, newLabels);
        } else {
          await onSubscriptionCreate(feed, [newLabel]);
        }
      },
      [
        onCategoryCreate,
        onSubscriptionCreate,
        onSubscriptionUpdate,
        subscription,
      ],
    );

    const handleChangeCategoryLabel = $.useCallback((event: Event) => {
      newLabel$.value = (event.currentTarget as HTMLInputElement).value;
    }, []);

    const handleUnsubscribe = $.useCallback(() => {
      openAlertDialog(
        {
          confirmButton: ({ onConfirm }, $) => $.html`
          <button class="button button-negative" type="button" @click=${onConfirm}>Unsubscribe</button>
        `,
          cancelButton: ({ onCancel }, $) => $.html`
          <button class="button button-outline-default" type="button" @click=${onCancel}>Cancel</button>
        `,
          onConfirm: () => {
            if (subscription !== null) {
              onSubscriptionDelete(subscription.id);
            }
          },
          title: `Unsubscribe "${feed.title}"`,
          message: 'Are you sure you want to unsubscribe the feed?',
        },
        $,
      );
    }, [feed, onSubscriptionDelete]);

    const categoryMenuItems: MenuItem[] =
      subscription !== null
        ? categories
            .filter((category) => category.label !== undefined)
            .map((category) => {
              const isAdded = subscription.categories.some(
                (subscriptionCategory) =>
                  subscriptionCategory.label === category.label,
              );
              const icon = isAdded
                ? $.html`<i aria-hidden="true" class="icon icon-16 icon-checkmark" role="img"></i>`
                : null;
              const handleAction = async () => {
                const newLabels = isAdded
                  ? (subscription.categories
                      .map((subscriptionCategory) => subscriptionCategory.label)
                      .filter(
                        (label) =>
                          label !== undefined && label !== category.label,
                      ) as string[])
                  : (subscription.categories
                      .map((subscriptionCategory) => subscriptionCategory.label)
                      .filter(
                        (label) =>
                          label !== undefined && label !== category.label,
                      )
                      .concat(category.label) as string[]);
                await onSubscriptionUpdate(subscription.id, newLabels);
              };
              return {
                type: 'button',
                key: category.label!,
                checked: isAdded,
                children: $.html`
                  <div class="MenuItem-icon"><${icon}></div>
                  <div class="MenuItem-content">${category.label}</div>
                `,
                onAction: handleAction,
              };
            })
        : categories
            .filter((category) => category.label !== undefined)
            .map((category) => ({
              type: 'button',
              key: category.label!,
              children: $.html`
                <div class="MenuItem-content">${category.label}</div>
              `,
              onAction: () => {
                onSubscriptionCreate(feed, [category.label!]);
              },
            }));

    return Dropdown({
      trigger: ({ id, onMenuToggle, open }, $) => $.html`
        <button
          aria-expanded=${open.toString()}
          aria-label="Toggle subscription settings dropdown"
          class=${subscription !== null ? 'button button-outline-default dropdown-arrow' : 'button button-outline-positive dropdown-arrow'}
          id=${id}
          type="button"
          @click=${onMenuToggle}
        >
          <i
            :class=${[
              'icon icon-20',
              subscription !== null ? 'icon-settings' : 'icon-plus-math',
            ]}
            aria-hidden="true"
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
              children: $.html`
                <div class="MenuItem-content">
                  <div class="input-group">
                    <input
                      type="text"
                      class="form-control"
                      style="width: 12ch"
                      $value=${newLabel$}
                      @change=${handleChangeCategoryLabel}
                    >
                    <button type="submit" class="button button-positive">OK</button>
                  </div>
                </div>
              `,
              onAction: handleCategoryCreate,
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
