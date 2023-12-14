import React, { PureComponent, createElement } from 'react';

export interface SwipeableProps {
  handleTouchEnd: (event: React.TouchEvent<any>) => void;
  handleTouchMove: (event: React.TouchEvent<any>) => void;
  handleTouchStart: (event: React.TouchEvent<any>) => void;
  isSwiping: boolean;
  initialX: number;
  initialY: number;
  destX: number;
  destY: number;
}

export interface SwipeableState {
  isSwiping: boolean;
  initialX: number;
  initialY: number;
  destX: number;
  destY: number;
}

type WithChildren<T> = T & { children?: React.ReactNode };

export default function toSwipeable<TProps>(
  Component: React.ComponentType<WithChildren<TProps> & SwipeableProps>,
): React.ComponentType<WithChildren<TProps>> {
  return class Swipeable extends PureComponent<
    WithChildren<TProps>,
    SwipeableState
  > {
    constructor(props: WithChildren<TProps>) {
      super(props);

      this.state = {
        isSwiping: false,
        initialX: 0,
        initialY: 0,
        destX: 0,
        destY: 0,
      };
    }

    override render() {
      const props = Object.assign(
        {
          handleTouchStart: this._handleTouchStart,
          handleTouchMove: this._handleTouchMove,
          handleTouchEnd: this._handleTouchEnd,
        },
        this.state,
        this.props,
      );

      return createElement(Component, props, props.children);
    }

    private _handleTouchStart = (event: React.TouchEvent<any>): void => {
      if (event.targetTouches.length === 0) {
        return;
      }

      const { clientX, clientY } = event.targetTouches[0]!;

      this.setState({
        isSwiping: true,
        initialX: clientX,
        initialY: clientY,
        destX: clientX,
        destY: clientY,
      });
    };

    private _handleTouchMove = (event: React.TouchEvent<any>): void => {
      if (event.targetTouches.length === 0) {
        return;
      }

      event.preventDefault();

      const { clientX, clientY } = event.targetTouches[0]!;

      this.setState({
        destX: clientX,
        destY: clientY,
      });
    };

    private _handleTouchEnd = (_event: React.TouchEvent<any>): void => {
      this.setState({
        isSwiping: false,
      });
    };
  };
}
