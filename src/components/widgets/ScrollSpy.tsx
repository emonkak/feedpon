import React, { Children, PureComponent, cloneElement, isValidElement } from 'react';
import throttle from 'lodash.throttle';
import { findDOMNode } from 'react-dom';

interface ScrollSpyProps {
    marginBottom?: number;
    marginTop?: number;
    onUpdate: (activeIndex: number) => void;
    scrollThrottleTime?: number;
}

interface Rectangle {
    top: number;
    bottom: number;
}

export default class ScrollSpy extends PureComponent<ScrollSpyProps, {}> {
    static defaultProps = {
        marginBottom: 0,
        marginTop: 0,
        scrollThrottleTime: 100
    };

    private readonly _handleScroll: () => void;

    private readonly _scheduleUpdate = createScheduledTask(
        () => this._update(),
        window.requestIdleCallback || window.requestAnimationFrame
    );

    private readonly _refs: { [index: string]: React.ReactInstance } = {};

    private _rectangles: Rectangle[] = [];

    constructor(props: ScrollSpyProps, context: any) {
        super(props, context);

        this._handleScroll = throttle(
            createScheduledTask(() => this._update(), window.requestAnimationFrame),
            props.scrollThrottleTime!,
            {
                trailing: true
            }
        );
    }

    componentDidMount() {
        window.addEventListener('scroll', this._handleScroll, { passive: true } as any);

        this._postRenderProcessing();
    }

    componentDidUpdate() {
        this._postRenderProcessing();
    }

    componentWillUnmount() {
        window.removeEventListener('scroll', this._handleScroll, { passive: true } as any);
    }

    render() {
        return Children.map(this.props.children, this._renderChild.bind(this));
    }

    private _renderChild(child: React.ReactChild, index: number) {
        if (!isValidElement<any>(child)) {
            return child;
        }

        const originalRef = (child as any).ref;
        const ref = (instance: React.ReactInstance | null) => {
            if (instance) {
                this._refs[index] = instance;
            } else {
                delete this._refs[index];
            }
            if (originalRef) {
                originalRef();
            }
        };

        return cloneElement(child, { ref });
    }

    private _postRenderProcessing(): void {
        this._rectangles = this._computeRectangles();

        this._scheduleUpdate();
    }

    private _update(): void {
        const { onUpdate } = this.props;
        const activeIndex = this._getActiveIndex();

        onUpdate(activeIndex);
    }

    private _getActiveIndex(): number {
        const rectangles = this._rectangles;

        if (rectangles.length === 0) {
            return -1;
        }

        const viewportRectangle = this._getRelativeViewportRectangle();
        const latestRectangle = rectangles[rectangles.length - 1];

        if (Math.abs(latestRectangle.bottom - viewportRectangle.top) < 1) {
            return Children.count(this.props.children);
        }

        let activeIndex = -1;
        let maxVisibleHeight = 0;

        for (let i = 0, l = rectangles.length; i < l; i++) {
            const rectangle = rectangles[i];
            if (rectangle.top >= viewportRectangle.top &&
                rectangle.bottom <= viewportRectangle.bottom) {
                return i;
            }

            if (rectangle.top < viewportRectangle.bottom &&
                rectangle.bottom > viewportRectangle.top) {
                const visibleHeight =
                    Math.min(rectangle.bottom, viewportRectangle.bottom) -
                    Math.max(rectangle.top, viewportRectangle.top);
                if (visibleHeight > maxVisibleHeight) {
                    maxVisibleHeight = visibleHeight;
                    activeIndex = i;
                }
            } else {
                if (activeIndex > -1) {
                    return activeIndex;
                }
            }
        }

        return activeIndex;
    }

    private _computeRectangles(): Rectangle[] {
        const rectangles = [];

        let top = 0;
        for (let i = 0, l = Children.count(this.props.children); i < l; i++) {
            const ref = this._refs[i];
            if (ref) {
                const element = findDOMNode(ref) as HTMLElement;
                const height = element.getBoundingClientRect().height;
                rectangles.push({
                    top,
                    bottom: top + height
                });
                top += height;
            }
        }

        return rectangles;
    }

    private _getRelativeViewportRectangle(): Rectangle {
        const { marginTop, marginBottom } = this.props;

        const listElement = findDOMNode(this) as HTMLElement;
        const top = -listElement.getBoundingClientRect().top;
        const bottom = top + window.innerHeight;

        return {
            top: top + marginTop!,
            bottom: bottom - marginBottom!
        };
    }
}

function createScheduledTask(task: () => void, scheduler: (task: () => void) => number): () => number {
    let token: number | null = null;

    function runTask() {
        token = null;
        task();
    }

    return () => {
        if (token === null) {
            token = scheduler(runTask);
        }
        return token;
    };
}
