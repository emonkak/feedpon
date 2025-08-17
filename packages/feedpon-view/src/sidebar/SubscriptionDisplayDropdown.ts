import { createComponent, type RenderContext } from 'barebind';
import type { SubscriptionOrderKind } from 'feedpon-messaging';

import { Dropdown } from '../primitives/Dropdown.ts';
import type { MenuItem } from '../primitives/Menu.ts';

interface SubscriptionDisplayDropdownProps {
  isLoading: boolean;
  onChangeOnlyUnread: (onlyUnread: boolean) => void;
  onChangeSubscriptionOrder: (order: SubscriptionOrderKind) => void;
  onManageSubscriptions: () => void;
  onlyUnread: boolean;
  subscriptionOrder: SubscriptionOrderKind;
}

export const SubscriptionDisplayDropdown = createComponent(
  function SubscriptionDisplayDropdown(
    {
      isLoading,
      onChangeSubscriptionOrder,
      onChangeOnlyUnread,
      onManageSubscriptions,
      onlyUnread,
      subscriptionOrder,
    }: SubscriptionDisplayDropdownProps,
    $: RenderContext,
  ): unknown {
    const checkmark = $.html`<i class="icon icon-16 icon-checkmark"></i>`;

    const handleChangeSubscriptionOrder = $.useCallback(
      (_event: Event, key: string) => {
        onChangeSubscriptionOrder(key as SubscriptionOrderKind);
      },
      [onChangeSubscriptionOrder],
    );

    const handleToggleOnlyUnread = $.useCallback(() => {
      onChangeOnlyUnread(!onlyUnread);
    }, [onlyUnread, onChangeOnlyUnread]);

    const handleManageSubscriptions = $.useCallback(() => {
      onManageSubscriptions();
    }, [onManageSubscriptions]);

    return Dropdown({
      trigger: ({ id, onToggle, open }) => $.html`
        <button
          aira-expanded=${open}
          aria-label="Toggle subscription display dropdown"
          class="link-soft u-flex-shrink-0"
          disabled=${isLoading}
          id=${id}
          type="button"
          @click=${onToggle}
        >
          <i
            aria-hidden="true"
            class="icon icon-16 icon-width-32 icon-menu-2"
            role="img"
          ></i>
        </button>
      `,
      items: [
        {
          type: 'group',
          label: 'Order',
          key: 'order',
          childItems: [
            { key: 'id', label: 'ID' },
            { key: 'title', label: 'Title' },
            { key: 'newest', label: 'Newest first' },
            { key: 'oldest', label: 'Oldest first' },
          ].map(
            ({ key, label }) =>
              ({
                type: 'button',
                key,
                checked: subscriptionOrder === key,
                children: $.html`
                <div class="MenuItem-icon">
                  <${subscriptionOrder === key ? checkmark : null}>
                </div>
                <div class="MenuItem-content">${label}</div>
              `,
                onAction: handleChangeSubscriptionOrder,
              }) as MenuItem,
          ),
        },
        {
          type: 'separator',
          key: 'separator1',
        },
        {
          type: 'button',
          key: 'toggle_only_unread',
          checked: onlyUnread,
          children: $.html`
          <div class="MenuItem-icon">
            <${onlyUnread ? checkmark : null}>
          </div>
          <div class="MenuItem-content">Only unread</div>
        `,
          onAction: handleToggleOnlyUnread,
        },
        {
          type: 'separator',
          key: 'separator2',
        },
        {
          type: 'button',
          key: 'manage_subscriptions',
          children: $.html`
          <div class="MenuItem-content">Manage subscriptions...</div>
        `,
          onAction: handleManageSubscriptions,
        },
      ],
    });
  },
);
