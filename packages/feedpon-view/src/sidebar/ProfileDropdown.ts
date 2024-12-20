import type { RenderContext, TemplateResult } from '@emonkak/ebit';
import { component } from '@emonkak/ebit/directives.js';
import type { Profile } from 'feedpon-messaging';
import { AlertDialog } from '../primitives/AlertDialog';
import { Dropdown } from '../primitives/Dropdown';

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
  const handleRefresh = context.useCallback(() => {
    onRefresh();
  }, [onRefresh]);

  const handleLogout = context.useCallback(() => {
    AlertDialog.open(
      {
        confirmButton: ({ onConfirm }, context) => context.html`
          <button class="button button-negative" type="button" @click=${onConfirm}>Logout</button>
        `,
        cancelButton: ({ onCancel }, context) => context.html`
          <button class="button button-outline-default" type="button" @click=${onCancel}>Cancel</button>
        `,
        onConfirm: () => {
          onLogout();
        },
        title: `Logout ${profile.userName}...`,
        message: 'Are you sure you want to logout of the current session?',
      },
      context,
    );
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

  const dropdown = component(Dropdown, {
    trigger: ({ id, onToggle, open }) => context.html`
      <button
        aria-expanded=${open.toString()}
        aria-label="Toggle profile dropdown"
        class="button button-outline-default button-block"
        disabled=${isLoading}
        id=${id}
        type="button"
        @click=${onToggle}
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
    `,
    items: [
      {
        type: 'button',
        key: 'refresh',
        children: context.html`
          <div class="MenuItem-content">Refresh</div>
        `,
        onAction: handleRefresh,
      },
      {
        type: 'button',
        key: 'logout',
        children: context.html`
          <div class="MenuItem-content">Logout...</div>
        `,
        onAction: handleLogout,
      },
    ],
  });

  return context.html`<${dropdown}>`;
}
