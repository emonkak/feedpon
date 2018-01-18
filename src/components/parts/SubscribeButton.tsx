import React from 'react';
import classnames from 'classnames';

interface SubscribeButtonProps {
    isSubscribed: boolean;
    isLoading: boolean;
    onClick?: React.MouseEventHandler<any>;
    onKeyDown?: React.KeyboardEventHandler<any>;
}

const SubscribeButton: React.SFC<SubscribeButtonProps> = ({
    isSubscribed,
    isLoading,
    onClick,
    onKeyDown
}) => {
    if (isSubscribed) {
        return (
            <button
                onClick={onClick}
                onKeyDown={onKeyDown}
                className="button button-outline-default dropdown-arrow"
                disabled={isLoading}>
                <i className={classnames(
                    'icon icon-20',
                    isLoading ? 'icon-spinner a-rotating' : 'icon-settings'
                )} />
            </button>
        );
    } else {
        return (
            <button
                onClick={onClick}
                onKeyDown={onKeyDown}
                className="button button-outline-positive dropdown-arrow"
                disabled={isLoading}>
                <i className={classnames(
                    'icon icon-20',
                    isLoading ? 'icon-spinner a-rotating' : 'icon-plus-math'
                )} />
            </button>
        );
    }
};

export default SubscribeButton;
