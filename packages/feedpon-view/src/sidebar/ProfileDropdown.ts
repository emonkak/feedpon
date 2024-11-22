import type { RenderContext, TemplateResult } from '@emonkak/ebit';
import { component } from '@emonkak/ebit/directives.js';
import type { Profile } from 'feedpon-messaging';
import { ConfirmModal } from '../primitives/ConfirmModal';
import { Menu } from '../primitives/Menu';

interface ProfileDropdownProps {
  isLoading: boolean;
  onLogout: () => void;
  onRefresh: () => void;
  profile: Profile;
}

export function ProfileDropdown(
  { isLoading, onLogout, onRefresh, profile }: ProfileDropdownProps,
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

  const handleRefresh = context.useCallback(() => {
    closeDropdown();
    onRefresh();
  }, [onRefresh]);

  const handleLogout = context.useCallback(() => {
    ConfirmModal.open(
      {
        confirmButton: (callback, context) => context.html`
          <button class="button button-negative" type="button" @click=${callback}>Logout</button>
        `,
        cancelButton: (callback, context) => context.html`
          <button class="button button-outline-default" type="button" @click=${callback}>Cancel</button>
        `,
        onConfirm: () => {
          onLogout();
        },
        title: `Logout ${profile.userName}...`,
        message: 'Are you sure you want to logout of the current session?',
      },
      context,
    );
    closeDropdown();
  }, [onLogout, profile]);

  // biome-ignore format:
  const profileIcon = profile.picture !== '' ? context.html`
    <img
      class="u-flex-shrink-0 u-rounded-circle"
      height="40"
      width="40"
      src=${profile.picture}
    >
  ` : context.html`
    <span class="u-flex-shrink-0">
      <i class="icon icon-40 icon-contacts"></i>
    </span>
  `;

  const menuChildren = context.html`
    <button
      class="MenuItem"
      role="menuitem"
      type="button"
      @click=${handleRefresh}
    >
      <div class="MenuItem-content">Refresh</div>
    </button>
    <button
      class="MenuItem"
      role="menuitem"
      type="button"
      @click=${handleLogout}
    >
      <div class="MenuItem-content">Logout...</div>
    </button>
  `;

  return context.html`
    <div class="Dropdown">
      <button
        class="button button-outline-default button-block"
        disabled=${isLoading}
        id=${toggleId}
        type="button"
        @click=${toggleDropdown}
      >
        <div class="u-flex u-flex-align-items-center DropdownArrow">
          <${profileIcon}>
          <span class="u-flex-grow-1 u-margin-left-1 u-text-left">
            <div class="u-text-wrap u-text-7">
              <strong>${profile.userName}</strong>
            </div>
            <div class="u-text-wrap u-text-7">
              via <strong>${profile.source}</strong>
            </div>
          </span>
        </div>
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
