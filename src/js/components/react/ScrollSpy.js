/* global window */

import React from 'react';
import ReactDOM from 'react-dom';
import deepEqual from 'deep-equal';
import firstOrDefault from '@emonkak/enumerable/firstOrDefault';
import inViewport from 'in-viewport';
import maxBy from '@emonkak/enumerable/maxBy';
import { Subscription } from 'rxjs/Subscription';
import { debounceTime } from 'rxjs/operator/debounceTime';
import { distinctUntilChanged } from 'rxjs/operator/distinctUntilChanged';
import { filter } from 'rxjs/operator/filter';
import { fromEvent } from 'rxjs/observable/fromEvent';
import { map } from 'rxjs/operator/map';
import { pairwise } from 'rxjs/operator/pairwise';
import { share } from 'rxjs/operator/share';
import { startWith } from 'rxjs/operator/startWith';

export default class ScrollSpy extends React.Component {
    static propTypes = {
        className: React.PropTypes.string,
        onActivated: React.PropTypes.func,
        onDeactivated: React.PropTypes.func,
        scrollDebounceTime: React.PropTypes.number,
        useWindowAsScrollContainer: React.PropTypes.bool
    };

    static defaultProps = {
        scrollDebounceTime: 200,
        useWindowAsScrollContainer: false
    };

    componentDidMount() {
        const { useWindowAsScrollContainer, scrollDebounceTime } = this.props;

        const container = useWindowAsScrollContainer ? window : this.refs.scrollable;

        const elementsInViewport$ = fromEvent(container, 'scroll')
            ::debounceTime(scrollDebounceTime)
            ::map(event => {
                return React.Children.toArray(this.props.children)
                    .map((element, i) => {
                        const ref = this.refs[i];
                        return [ref, ReactDOM.findDOMNode(ref)];
                    })
                    .filter(([ref, node]) => inViewport(node));
            });
        const activeElementChanged$ = elementsInViewport$
            ::map(elements => {
                const scrollTop = container.scrollY || container.scrollTop;
                const scrollBottom = scrollTop + (container.innerHeight || container.scrollHeight);

                return elements
                    ::maxBy(element => {
                        const [ref, node] = element;
                        const offsetTop = node.offsetTop;
                        const offsetBottom = offsetTop + node.offsetHeight;

                        if (offsetTop >= scrollTop && offsetBottom <= scrollBottom) {
                            return scrollBottom - offsetTop;
                        }

                        const displayTop = offsetTop < scrollTop ? scrollTop : offsetTop;
                        const displayBottom = offsetBottom > scrollBottom ? scrollBottom : offsetBottom;

                        return displayBottom - displayTop;
                    })
                    ::firstOrDefault();
            })
            ::distinctUntilChanged(deepEqual)
            ::share();
        const activeElement$ = activeElementChanged$
            ::filter(x => x != null);
        const inactiveElement$ = activeElementChanged$
            ::pairwise()
            ::map(x => x[0])
            ::filter(x => x != null);

        this._subscription = new Subscription();
        this._subscription.add(activeElement$.subscribe(element => {
            const [ref, node] = element;
            const { onActivated } = this.props;

            if (onActivated) {
                onActivated(ref, node, container);
            }
        }));
        this._subscription.add(inactiveElement$.subscribe(element => {
            const [ref, node] = element;
            const { onDeactivated } = this.props;

            if (onDeactivated) {
                onDeactivated(ref, node, container);
            }
        }));
    }

    componentWillUnmount() {
        this._subscription.unsubscribe();
    }

    render() {
        const { children, className } = this.props;

        return (
            <ul className={className} ref="scrollable">
                {React.Children.map(children, (element, i) => {
                    return React.cloneElement(element, { ref: i });
                })}
            </ul>
        );
    }
}
