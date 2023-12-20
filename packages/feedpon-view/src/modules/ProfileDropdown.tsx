import React, { useState } from 'react';

import ConfirmModal from '../components/ConfirmModal';
import Dropdown from '../components/Dropdown';
import Portal from '../components/Portal';
import { MenuItem } from '../components/Menu';
import type { Profile } from 'feedpon-messaging';
import useEvent from '../hooks/useEvent';

interface ProfileDropdownProps {
  isLoading: boolean;
  onLogout: () => void;
  onRefresh: () => void;
  profile: Profile;
}

type Action = { type: 'REFRESH' } | { type: 'LOGOUT' };

export default function ProfileDropdown({
  isLoading,
  onLogout,
  onRefresh,
  profile,
}: ProfileDropdownProps) {
  const [isLogouting, setIsLogouting] = useState(false);

  const handleSelectAction = useEvent((action: Action) => {
    switch (action.type) {
      case 'REFRESH': {
        onRefresh();
        break;
      }
      case 'LOGOUT':
        setIsLogouting(true);
        break;
    }
  });

  const handleCloseLogoutModal = useEvent(() => {
    setIsLogouting(false);
  });

  const icon = profile.picture ? (
    <img
      className="u-flex-shrink-0 u-rounded-circle"
      height="40"
      width="40"
      src={profile.picture}
    />
  ) : (
    <span className="u-flex-shrink-0">
      <i className="icon icon-40 icon-contacts" />
    </span>
  );

  return (
    <>
      <Dropdown
        onSelect={handleSelectAction}
        toggleButton={
          <button
            className="button button-outline-default button-block"
            disabled={isLoading}
          >
            <div className="u-flex u-flex-align-items-center dropdown-arrow">
              {icon}
              <span className="u-flex-grow-1 u-margin-left-1 u-text-left">
                <div className="u-text-wrap u-text-7">
                  <strong>{profile.userName}</strong>
                </div>
                <div className="u-text-wrap u-text-7">
                  via <strong>{profile.source}</strong>
                </div>
              </span>
            </div>
          </button>
        }
      >
        <MenuItem value={{ type: 'REFRESH' }} primaryText="Refresh" />
        <MenuItem value={{ type: 'LOGOUT' }} primaryText="Logout..." />
      </Dropdown>
      <Portal>
        <ConfirmModal
          confirmButtonClassName="button button-negative"
          confirmButtonLabel="Logout"
          isOpened={isLogouting}
          message="Are you sure you want to logout in current user?"
          onClose={handleCloseLogoutModal}
          onConfirm={onLogout}
          title={`Logout "${profile.userName}"`}
        />
      </Portal>
    </>
  );
}
