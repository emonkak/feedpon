import React, { PureComponent } from 'react';
import classnames from 'classnames';

interface SubscribeButtonProps {
    isSubscribed: boolean;
    isLoading: boolean;
    onClick?: (event: React.MouseEvent<any>) => void;
    onKeyDown?: (event: React.KeyboardEvent<any>) => void;
}

export default class SubscribeButton extends PureComponent<SubscribeButtonProps, {}> {
    render() {
        const { isSubscribed, isLoading, onClick, onKeyDown } = this.props;

        if (isSubscribed) {
            return (
                <button 
                    onClick={onClick}
                    onKeyDown={onKeyDown}
                    className="button button-outline-default dropdown-arrow"
                    disabled={isLoading}>
                    <i className={classnames(
                        'icon icon-20',
                        isLoading ? 'icon-spinner icon-rotating' : 'icon-settings'
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
                        isLoading ? 'icon-spinner icon-rotating' : 'icon-plus-math'
                    )} />
                </button>
            );
        }
    }
}
