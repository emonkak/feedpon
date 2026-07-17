import type {
  SubscriptionsOrdering,
  SubscriptionsSettings,
} from '@feedpon/model';
import type { MenuItem } from '@feedpon/primitives';
import { Dropdown } from '@feedpon/primitives';
import { createComponent, html } from 'barebind';

interface SubscriptionsSettingsDropdownProps {
  onSubscriptionsOrganize: () => void;
  onSubscriptionsSettingsUpdate: (
    subscriptionsSettings: SubscriptionsSettings,
  ) => void;
  disabled: boolean;
  subscriptionsSettings: SubscriptionsSettings;
}

export const SubscriptionsSettingsDropdown =
  createComponent<SubscriptionsSettingsDropdownProps>(
    function SubscriptionsSettingsDropdown({
      disabled,
      onSubscriptionsOrganize,
      onSubscriptionsSettingsUpdate,
      subscriptionsSettings,
    }) {
      const checkmark = html`<i class="icon icon-16 icon-checkmark"></i>`;

      const handleOrderingChange = this.useCallback(
        (_event: Event, key: string) => {
          onSubscriptionsSettingsUpdate({
            ...subscriptionsSettings,
            ordering: key as SubscriptionsOrdering,
          });
        },
        [onSubscriptionsSettingsUpdate, subscriptionsSettings],
      );

      const handleToggleOnlyUnread = this.useCallback(() => {
        onSubscriptionsSettingsUpdate({
          ...subscriptionsSettings,
          onlyUnread: !subscriptionsSettings.onlyUnread,
        });
      }, [onSubscriptionsSettingsUpdate, subscriptionsSettings]);

      return Dropdown({
        trigger: ({ id, onMenuToggle, open }) => html`
          <button
            aira-expanded=${open}
            aria-label="Toggle subscription display dropdown"
            class="link-soft u-flex-shrink-0"
            disabled=${disabled}
            id=${id}
            type="button"
            @click=${onMenuToggle}
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
            label: 'Ordering',
            key: 'ordering',
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
                  checked: subscriptionsSettings.ordering === key,
                  children: html`
                    <div class="MenuItem-icon">
                      <${subscriptionsSettings.ordering === key ? checkmark : null}>
                    </div>
                    <div class="MenuItem-content">${label}</div>
                  `,
                  onAction: handleOrderingChange,
                }) as MenuItem,
            ),
          },
          {
            type: 'separator',
            key: 'separator1',
          },
          {
            type: 'button',
            key: 'onlyUnread',
            checked: subscriptionsSettings.onlyUnread,
            children: html`
              <div class="MenuItem-icon">
                <${subscriptionsSettings.onlyUnread ? checkmark : null}>
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
            key: 'organizeSubscriptions',
            children: html`
              <div class="MenuItem-content">Organize subscriptions...</div>
            `,
            onAction: onSubscriptionsOrganize,
          },
        ],
      });
    },
  );
