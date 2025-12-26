import { createComponent, type RenderContext } from 'barebind';
import { LocalAtom } from 'barebind/addons/signal';
import type { Category, Subscription } from 'feedpon-store';
import { openAlertDialog } from '../primitives/AlertDialog.ts';
import { Dropdown } from '../primitives/Dropdown.ts';
import type { MenuItem } from '../primitives/Menu.ts';

interface SubscriptionDropdownProps {
  categories: Category[];
  onCategoryCreate: (label: string) => Promise<void>;
  onSubscriptionDelete: (subscriptionId: string) => Promise<void>;
  onSubscriptionUpdate: (
    subscriptionId: string,
    labels: string[],
  ) => Promise<void>;
  subscription: Subscription;
}

export const SubscriptionDropdown = createComponent(
  function SubscriptionDropdown(
    {
      categories,
      onCategoryCreate,
      onSubscriptionDelete,
      onSubscriptionUpdate,
      subscription,
    }: SubscriptionDropdownProps,
    $: RenderContext,
  ): unknown {
    const newLabel$ = $.use(LocalAtom(''));

    const handleCategoryCreate = $.useCallback(
      async (event: Event) => {
        event.preventDefault();
        const newLabel = newLabel$.value;
        newLabel$.value = '';
        await onCategoryCreate(newLabel);
        await onSubscriptionUpdate(
          subscription.id,
          subscription.categories
            .map((category) => category.label)
            .filter((label) => label !== undefined && label !== newLabel)
            .concat(newLabel) as string[],
        );
      },
      [subscription, onCategoryCreate, onSubscriptionUpdate],
    );

    const handleAddToCategory = $.useCallback(
      async (event: Event, key: string) => {
        event.preventDefault();
        await onSubscriptionUpdate(
          subscription.id,
          subscription.categories
            .map((category) => category.label)
            .filter((label) => label !== undefined)
            .concat(key) as string[],
        );
      },
      [subscription, onSubscriptionUpdate],
    );

    const removeFromCategory = $.useCallback(
      (event: Event, key: string) => {
        event.preventDefault();
        onSubscriptionUpdate(
          subscription.id,
          subscription.categories
            .map((category) => category.label)
            .filter(
              (label) => label !== undefined && label !== key,
            ) as string[],
        );
      },
      [subscription, onSubscriptionUpdate],
    );

    const handleNewCategoryLabelChange = $.useCallback((event: Event) => {
      newLabel$.value = (event.currentTarget as HTMLInputElement).value;
    }, []);

    const handleUnsubscribe = $.useCallback(() => {
      openAlertDialog(
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
            onSubscriptionDelete(subscription.id);
          },
          title: `Unsubscribe "${subscription.title}"`,
          message: 'Are you sure you want to unsubscribe the feed?',
        },
        $,
      );
    }, []);

    const categoryMenuItems = categories.map((category) => {
      const isAdded = subscription.categories.some(
        (category) => category.label === category.label,
      );
      const icon = isAdded
        ? $.html`<i aria-hidden class="icon icon-16 icon-checkmark" role="img"></i></div>`
        : null;
      const handleAction = isAdded ? removeFromCategory : handleAddToCategory;

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
      trigger: ({ id, onMenuToggle, open }, context) => context.html`
        <button
          aria-expanded=${open.toString()}
          type="button"
          class="link-soft u-margin-left-2"
          id=${id}
          @click=${onMenuToggle}
        >
          <i
            class="icon icon-20 icon-width-32 icon-menu-2"
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
                    $value=${newLabel$}
                    @change=${handleNewCategoryLabelChange}
                  >
                  <button
                    type="submit"
                    class="button button-positive"
                  >
                    OK
                  </button>
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
