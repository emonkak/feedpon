import React, { PureComponent } from 'react';

interface SwipeableProps {
    render: (props: SwipableRenderProps) => React.ReactNode;
    onSwipeStart?: (swipe: Swipe) => void;
    onSwipeEnd?: (swipe: Swipe) => void;
}

interface SwipeableState {
    swiping: boolean;
    initialX: number;
    initialY: number;
    x: number;
    y: number;
}

export interface SwipableRenderProps {
    onTouchEnd: (event: React.TouchEvent<any>) => void;
    onTouchMove: (event: React.TouchEvent<any>) => void;
    onTouchStart: (event: React.TouchEvent<any>) => void;
    swiping: boolean;
    initialX: number;
    initialY: number;
    x: number;
    y: number;
}

export interface Swipe {
    initialX: number;
    initialY: number;
    x: number;
    y: number;
}

export default class Swipeable extends PureComponent<SwipeableProps, SwipeableState> {
    constructor(props: SwipeableProps, context: any) {
        super(props, context);

        this.state = {
            swiping: false,
            initialX: 0,
            initialY: 0,
            x: 0,
            y: 0
        };
    }

    render() {
        const { render } = this.props;
        const { swiping, initialX, initialY, x, y } = this.state;

        return render({
            swiping,
            initialX,
            initialY,
            x,
            y,
            onTouchStart: this._handleTouchStart,
            onTouchMove: this._handleTouchMove,
            onTouchEnd: this._handleTouchEnd
        });
    }

    private _handleTouchStart = (event: React.TouchEvent<any>): void => {
        const { clientX, clientY } = event.targetTouches[0];
        const { onSwipeStart } = this.props;

        if (onSwipeStart) {
            onSwipeStart({
                initialX: clientX,
                initialY: clientY,
                x: clientX,
                y: clientY
            });
        }

        this.setState({
            swiping: true,
            initialX: clientX,
            initialY: clientY,
            x: clientX,
            y: clientY
        });
    };

    private _handleTouchMove = (event: React.TouchEvent<any>): void => {
        const { clientX, clientY } = event.targetTouches[0];

        this.setState({
            x: clientX,
            y: clientY
        });
    };

    private _handleTouchEnd = (event: React.TouchEvent<any>): void => {
        const { initialX, initialY, x, y } = this.state;
        const { onSwipeEnd } = this.props;

        if (onSwipeEnd) {
            onSwipeEnd({ initialX, initialY, x, y });
        }

        this.setState({
            swiping: false
        });
    };
}
