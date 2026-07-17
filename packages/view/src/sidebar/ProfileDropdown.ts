import type { Profile } from '@feedpon/model';
import { Dropdown, openAlertDialog } from '@feedpon/primitives';
import { createComponent, html } from 'barebind';

interface ProfileDropdownProps {
  isLoading: boolean;
  onLogout: () => void;
  onReload: () => void;
  profile: Profile;
}

export const ProfileDropdown = createComponent<ProfileDropdownProps>(
  function ProfileDropdown({ isLoading, onLogout, onReload, profile }) {
    const handleLogout = this.useCallback(() => {
      openAlertDialog({
        confirmButton: ({ onConfirm }) => html`
          <button class="button button-negative" type="button" @click=${onConfirm}>Logout</button>
        `,
        cancelButton: ({ onCancel }) => html`
          <button class="button button-outline-default" type="button" @click=${onCancel}>Cancel</button>
        `,
        onConfirm: () => {
          onLogout();
        },
        title: `Logout ${profile.client}...`,
        message: 'Are you sure you want to logout of the current session?',
      });
    }, [onLogout, profile]);

    const profileIcon =
      profile.picture !== ''
        ? html`
        <img
          class="u-flex-shrink-0 u-rounded-circle"
          height="40"
          width="40"
          src=${profile.picture}
        >
        `
        : html`
    <span class="u-flex-shrink-0">
      <i class="icon icon-40 icon-contacts"></i>
    </span>
        `;

    return Dropdown({
      trigger: ({ id, onMenuToggle, open }) => html`
        <button
          aria-expanded=${open.toString()}
          aria-label="Toggle profile dropdown"
          class="button button-outline-default button-block"
          disabled=${isLoading}
          id=${id}
          type="button"
          @click=${onMenuToggle}
        >
          <div class="u-flex u-flex-align-items-center DropdownArrow">
            <${profileIcon}>
            <span class="u-flex-grow-1 u-margin-left-1 u-text-left">
              <div class="u-text-wrap u-text-7">
                <strong>${profile?.fullName ?? 'Anonymous'}</strong>
              </div>
              <div class="u-text-wrap u-text-7">
                via <strong>${profile.client}</strong>
              </div>
            </span>
          </div>
        </button>
      `,
      items: [
        {
          type: 'button',
          key: 'reload',
          children: html`
            <div class="MenuItem-content">Reload</div>
          `,
          onAction: onReload,
        },
        {
          type: 'button',
          key: 'logout',
          children: html`
            <div class="MenuItem-content">Logout...</div>
          `,
          onAction: handleLogout,
        },
      ],
    });
  },
);
