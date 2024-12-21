import type { RenderContext, TemplateResult } from '@emonkak/ebit';
import { component, optional } from '@emonkak/ebit/directives.js';
import type { SubscriptionOrderKind } from 'feedpon-messaging';
import { Dropdown } from '../primitives/Dropdown';
import type { MenuItem } from '../primitives/Menu';

interface SubscriptionDisplayDropdownProps {
  isLoading: boolean;
  onChangeOnlyUnread: (onlyUnread: boolean) => void;
  onChangeSubscriptionOrder: (order: SubscriptionOrderKind) => void;
  onManageSubscriptions: () => void;
  onlyUnread: boolean;
  subscriptionOrder: SubscriptionOrderKind;
}

export function SubscriptionDisplayDropdown(
  {
    isLoading,
    onChangeSubscriptionOrder,
    onChangeOnlyUnread,
    onManageSubscriptions,
    onlyUnread,
    subscriptionOrder,
  }: SubscriptionDisplayDropdownProps,
  context: RenderContext,
): TemplateResult {
  const checkmark = context.html`<i class="icon icon-16 icon-checkmark"></i>`;

  const handleChangeSubscriptionOrder = context.useCallback(
    (event: Event) => {
      const order = (event.currentTarget as HTMLElement).dataset[
        'key'
      ]! as SubscriptionOrderKind;
      onChangeSubscriptionOrder(order);
    },
    [onChangeSubscriptionOrder],
  );

  const handleToggleOnlyUnread = context.useCallback(() => {
    onChangeOnlyUnread(!onlyUnread);
  }, [onlyUnread, onChangeOnlyUnread]);

  const handleManageSubscriptions = context.useCallback(() => {
    onManageSubscriptions();
  }, [onManageSubscriptions]);

  const dropdown = component(Dropdown, {
    trigger: ({ id, onToggle, open }) => context.html`
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
              children: context.html`
                <div class="MenuItem-icon">
                  <${optional(subscriptionOrder === key ? checkmark : null)}>
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
        children: context.html`
          <div class="MenuItem-icon">
            <${optional(onlyUnread ? checkmark : null)}>
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
        children: context.html`
          <div class="MenuItem-content">Manage subscriptions...</div>
        `,
        onAction: handleManageSubscriptions,
      },
    ],
  });

  return context.html`<${dropdown}>`;
}
