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

export default function toSwipeable<TProps>(Component: React.ComponentType<TProps & SwipeableProps>): React.ComponentType<TProps> {
    return class Swipeable extends PureComponent<TProps, SwipeableState> {
        constructor(props: TProps, context: any) {
            super(props, context);

            this.state = {
                isSwiping: false,
                initialX: 0,
                initialY: 0,
                destX: 0,
                destY: 0
            };
        }

        render() {
            const props = Object.assign(
                {
                    handleTouchStart: this._handleTouchStart,
                    handleTouchMove: this._handleTouchMove,
                    handleTouchEnd: this._handleTouchEnd
                },
                this.state,
                this.props
            );

            return createElement(Component, props, props.children);
        }

        private _handleTouchStart = (event: React.TouchEvent<any>): void => {
            const { clientX, clientY } = event.targetTouches[0];

            this.setState({
                isSwiping: true,
                initialX: clientX,
                initialY: clientY,
                destX: clientX,
                destY: clientY
            });
        }

        private _handleTouchMove = (event: React.TouchEvent<any>): void => {
            event.preventDefault();

            const { clientX, clientY } = event.targetTouches[0];

            this.setState({
                destX: clientX,
                destY: clientY
            });
        }

        private _handleTouchEnd = (event: React.TouchEvent<any>): void => {
            this.setState({
                isSwiping: false
            });
        }
    };
}
