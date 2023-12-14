import React, { PureComponent, createElement } from 'react';
import { findDOMNode } from 'react-dom';

export interface PopupProps {
  children?: React.ReactNode;
  closePopup: () => void;
  isOpened: boolean;
  openPopup: () => void;
  popupStyle: React.CSSProperties;
  pullDirection: PullDirection;
}

interface PopupState {
  isOpened: boolean;
  popupStyle: React.CSSProperties;
  pullDirection: PullDirection;
}

type PullDirection = 'left' | 'right' | 'up' | 'down';

type WithChildren<T> = T & { children?: React.ReactNode };

export default function toPopup<TProps>(
  PopupComponent: React.ComponentType<WithChildren<TProps> & PopupProps>,
  pullDirections: PullDirection[] = ['down', 'up', 'right', 'left'],
): React.ComponentType<WithChildren<TProps>> {
  return class Popup extends PureComponent<WithChildren<TProps>, PopupState> {
    constructor(props: WithChildren<TProps>) {
      super(props);

      this.state = {
        isOpened: false,
        popupStyle: {},
        pullDirection: 'down',
      };
    }

    override render() {
      const props = Object.assign(
        {
          closePopup: this._closePopup,
          openPopup: this._openPopup,
        },
        this.state,
        this.props,
      );

      return createElement(PopupComponent, props, props.children);
    }

    private _openPopup = (): void => {
      const container = findDOMNode(this) as Element;
      if (!container) {
        return;
      }

      const containerRect = container.getBoundingClientRect();

      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      const pullDirection = getFittedPullDirection(
        containerRect,
        viewportWidth,
        viewportHeight,
        pullDirections,
      );
      if (pullDirection === null) {
        return;
      }

      const popupStyle = getPopupStyle(containerRect, pullDirection);

      this.setState({
        isOpened: true,
        popupStyle,
        pullDirection,
      });
    };

    private _closePopup = (): void => {
      this.setState({
        isOpened: false,
      });
    };
  };
}

function getFittedPullDirection(
  containerRect: ClientRect,
  viewportWidth: number,
  viewportHeight: number,
  pullDirections: PullDirection[],
): PullDirection | null {
  const spaces: Record<PullDirection, number> = {
    up: containerRect.top,
    down: viewportHeight - containerRect.bottom,
    left: containerRect.left,
    right: viewportWidth - containerRect.right,
  };

  let maximumSpace = 0;
  let fittedPullDirection: PullDirection | null = null;

  for (const pullDirection of pullDirections) {
    const space = spaces[pullDirection];
    if (maximumSpace < space) {
      maximumSpace = space;
      fittedPullDirection = pullDirection;
    }
  }

  return fittedPullDirection;
}

function getPopupStyle(
  containerRect: ClientRect,
  pullDirection: PullDirection,
): React.CSSProperties {
  let popupStyle: React.CSSProperties = {};

  switch (pullDirection) {
    case 'down':
      popupStyle.top = containerRect.bottom;
      popupStyle.left = (containerRect.left + containerRect.right) / 2;
      popupStyle.maxHeight = `calc(100% - ${containerRect.bottom}px)`;
      popupStyle.maxWidth = '100%';
      break;

    case 'up':
      popupStyle.bottom = `calc(100% - ${containerRect.top}px)`;
      popupStyle.left = (containerRect.left + containerRect.right) / 2;
      popupStyle.maxHeight = `calc(100% - (100% - ${containerRect.top}px))`;
      popupStyle.maxWidth = '100%';
      break;

    case 'right':
      popupStyle.top = (containerRect.top + containerRect.bottom) / 2;
      popupStyle.left = containerRect.right;
      popupStyle.maxHeight = '100%';
      popupStyle.maxWidth = `calc(100% - ${containerRect.right}px)`;
      break;

    case 'left':
      popupStyle.top = (containerRect.top + containerRect.bottom) / 2;
      popupStyle.right = `calc(100% - ${containerRect.left}px)`;
      popupStyle.maxWidth = `calc(100% - (100% - ${containerRect.left}px))`;
      popupStyle.maxHeight = '100%';
      break;
  }

  return popupStyle;
}
