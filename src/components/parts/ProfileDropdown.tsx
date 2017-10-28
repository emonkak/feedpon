import React, { PureComponent } from 'react';

import ConfirmModal from 'components/widgets/ConfirmModal';
import Dropdown from 'components/widgets/Dropdown';
import Portal from 'components/widgets/Portal';
import { MenuItem } from 'components/widgets/Menu';
import { Profile } from 'messaging/types';

interface ProfileDropdownProps {
    isLoading: boolean;
    onLogout: () => void;
    onRefresh: () => void;
    profile: Profile;
}

interface ProfileDropdownState {
    logoutModalIsOpened: boolean;
}

export default class ProfileDropdown extends PureComponent<ProfileDropdownProps, ProfileDropdownState> {
    constructor(props: ProfileDropdownProps, context: any) {
        super(props, context);

        this.state = {
            logoutModalIsOpened: false
        };

        this.handleCloseLogoutModal = this.handleCloseLogoutModal.bind(this);
        this.handleOpenLogoutModal = this.handleOpenLogoutModal.bind(this);
    }

    handleCloseLogoutModal() {
        this.setState({
            logoutModalIsOpened: false
        });
    }

    handleOpenLogoutModal() {
        this.setState({
            logoutModalIsOpened: true
        });
    }

    render() {
        const { isLoading, onLogout, onRefresh, profile } = this.props;
        const { logoutModalIsOpened } = this.state;

        const icon = profile.picture
            ? <img className="u-flex-shrink-0 u-rounded-circle" height="40" width="40" src={profile.picture} />
            : <span className="u-flex-shrink-0"><i className="icon icon-40 icon-contacts" /></span>;

        return (
            <Portal overlay={
                <ConfirmModal
                    confirmButtonClassName="button button-negative"
                    confirmButtonLabel="Logout"
                    isOpened={logoutModalIsOpened}
                    message="Are you sure you want to logout in current user?"
                    onClose={this.handleCloseLogoutModal}
                    onConfirm={onLogout}
                    title={`Logout "${profile.userName}"`} />
            }>
                <Dropdown
                    className="dropdown-block"
                    toggleButton={
                        <button
                            className="button button-outline-default button-block"
                            disabled={isLoading}>
                            <div className="u-flex u-flex-align-items-center dropdown-arrow">
                                {icon}
                                <span className="u-flex-grow-1 u-margin-left-1 u-text-left">
                                    <div className="u-text-wrap u-text-small"><strong>{profile.userName}</strong></div>
                                    <div className="u-text-wrap u-text-small">via <strong>{profile.source}</strong></div>
                                </span>
                            </div>
                        </button>
                    }>
                    <MenuItem
                        onSelect={onRefresh}
                        primaryText="Refresh" />
                    <MenuItem
                        onSelect={this.handleOpenLogoutModal}
                        primaryText="Logout..." />
                </Dropdown>
            </Portal>
        );
    }
}
