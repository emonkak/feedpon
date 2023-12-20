import React from 'react';
import classnames from 'classnames';

interface SubscribeButtonProps {
  isSubscribed: boolean;
  isLoading: boolean;
  onClick?: React.MouseEventHandler<any>;
  onKeyDown?: React.KeyboardEventHandler<any>;
}

export default function SubscribeButton({
  isSubscribed,
  isLoading,
  onClick,
  onKeyDown,
}: SubscribeButtonProps) {
  if (isSubscribed) {
    return (
      <button
        onClick={onClick}
        onKeyDown={onKeyDown}
        className="button button-outline-default dropdown-arrow"
        disabled={isLoading}
      >
        <i
          className={classnames(
            'icon icon-20',
            isLoading ? 'icon-spinner animation-rotating' : 'icon-settings',
          )}
        />
      </button>
    );
  } else {
    return (
      <button
        onClick={onClick}
        onKeyDown={onKeyDown}
        className="button button-outline-positive dropdown-arrow"
        disabled={isLoading}
      >
        <i
          className={classnames(
            'icon icon-20',
            isLoading ? 'icon-spinner animation-rotating' : 'icon-plus-math',
          )}
        />
      </button>
    );
  }
}
