import React, { PureComponent } from 'react';

import { Profile } from 'messaging/types';

interface ProfileButtonProps {
    isLoading: boolean;
    onClick?: (event: React.MouseEvent<any>) => void;
    profile: Profile;
}

export default class ProfileButton extends PureComponent<ProfileButtonProps, {}> {
    render() {
        const { isLoading, onClick, profile } = this.props;

        const icon = profile.picture
            ? <img className="u-flex-shrink-0 u-rounded-circle" height="40" width="40" src={profile.picture} />
            : <span className="u-flex-shrink-0"><i className="icon icon-40 icon-contacts" /></span>;

        return (
            <button
                className="button button-outline-default button-block"
                disabled={isLoading}
                onClick={onClick}>
                <div className="u-flex u-flex-align-items-center dropdown-arrow">
                    {icon}
                    <span className="u-flex-grow-1 u-margin-left-1 u-text-left">
                        <div><strong>{profile.userId}</strong></div>
                        <div className="u-text-small">via <strong>{profile.source}</strong></div>
                    </span>
                </div>
            </button>
        );
    }
}
