import type { RenderContext, TemplateResult } from '@emonkak/ebit';
import { component, optional } from '@emonkak/ebit/directives.js';
import type { SubscriptionOrderKind } from 'feedpon-messaging';
import { Menu } from '../primitives/Menu';

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
  const [isOpened, setIsOpened] = context.useState(false);
  const toggleId = context.useId();

  const closeDropdown = context.useCallback(() => {
    setIsOpened(false);
  }, []);

  const toggleDropdown = context.useCallback(() => {
    setIsOpened((isOpened) => !isOpened);
  }, []);

  const checkmark = context.html`<i class="icon icon-16 icon-checkmark"></i>`;

  const menuChildren = context.html`
    <div class="MenuSection">
      <div class="MenuHeading" role="heading">Order</div>
      <button
        class="MenuItem"
        role="menuitem"
        type="button"
        @click=${context.useCallback(() => {
          onChangeSubscriptionOrder('id');
          closeDropdown();
        }, [onChangeSubscriptionOrder])}
      >
        <div class="MenuItem-icon">
          <${optional(subscriptionOrder === 'id' ? checkmark : null)}>
        </div>
        <div class="MenuItem-content">ID</div>
      </button>
      <button
        class="MenuItem"
        role="menuitem"
        type="button"
        @click=${context.useCallback(() => {
          onChangeSubscriptionOrder('title');
          closeDropdown();
        }, [onChangeSubscriptionOrder])}
      >
        <div class="MenuItem-icon">
          <${optional(subscriptionOrder === 'title' ? checkmark : null)}>
        </div>
        <div class="MenuItem-content">Title</div>
      </button>
      <button
        class="MenuItem"
        role="menuitem"
        type="button"
        @click=${context.useCallback(() => {
          onChangeSubscriptionOrder('newest');
          closeDropdown();
        }, [onChangeSubscriptionOrder])}
      >
        <div class="MenuItem-icon">
          <${optional(subscriptionOrder === 'newest' ? checkmark : null)}>
        </div>
        <div class="MenuItem-content">Newest first</div>
      </button>
      <button
        class="MenuItem"
        role="menuitem"
        type="button"
        @click=${context.useCallback(() => {
          onChangeSubscriptionOrder('oldest');
          closeDropdown();
        }, [onChangeSubscriptionOrder])}
      >
        <div class="MenuItem-icon">
          <${optional(subscriptionOrder === 'oldest' ? checkmark : null)}>
        </div>
        <div class="MenuItem-content">Oldest first</div>
      </button>
    </div>
    <hr class="MenuSeparator">
    <button
      class="MenuItem"
      role="menuitem"
      type="button"
      @click=${context.useCallback(() => {
        onChangeOnlyUnread(!onlyUnread);
        closeDropdown();
      }, [onlyUnread, onChangeOnlyUnread])}
    >
      <div class="MenuItem-icon">
        <${optional(onlyUnread ? checkmark : null)}>
      </div>
      <div class="MenuItem-content">Only unread</div>
    </button>
    <hr class="MenuSeparator">
    <button
      class="MenuItem"
      role="menuitem"
      type="button"
      @click=${context.useCallback(() => {
        onManageSubscriptions();
        closeDropdown();
      }, [onManageSubscriptions])}
    >
      <div class="MenuItem-content">Manage subscriptions...</div>
    </button>
  `;

  return context.html`
    <div class="Dropdown">
      <button
        aria-label="Open subscription display menu"
        class="link-soft u-flex-shrink-0"
        disabled=${isLoading}
        id=${toggleId}
        type="button"
        @click=${toggleDropdown}
      >
        <i
          aria-hidden="true"
          class="icon icon-16 icon-width-32 icon-menu-2"
          role="img"
        ></i>
      </button>
      <${component(Menu, {
        anchorTarget: toggleId,
        children: menuChildren,
        onClose: closeDropdown,
        open: isOpened,
      })}>
    </div>
  `;
}
