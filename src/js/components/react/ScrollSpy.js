import React from 'react'
import ReactDOM from 'react-dom'
import deepEqual from 'deep-equal'
import except from '../../shared/collections/except'
import inViewport from 'in-viewport'
import toArray from '../../shared/collections/toArray'
import { FromEventObservable } from 'rxjs/observable/fromEvent'
import { Subscription } from 'rxjs/Subscription'
import { debounceTime } from 'rxjs/operator/debounceTime'
import { distinctUntilChanged } from 'rxjs/operator/distinctUntilChanged'
import { map } from 'rxjs/operator/map'
import { pairwise } from 'rxjs/operator/pairwise'
import { share } from 'rxjs/operator/share'
import { startWith } from 'rxjs/operator/startWith'

export default class ScrollSpy extends React.Component {
    static propTypes = {
        className: React.PropTypes.string,
        onInViewport: React.PropTypes.func,
        onEnter: React.PropTypes.func,
        onLeave: React.PropTypes.func,
        scrollDebounceTime: React.PropTypes.number,
        useWindowAsScrollContainer: React.PropTypes.bool
    }

    static defaultProps = {
        scrollDebounceTime: 200,
        useWindowAsScrollContainer: false
    }

    componentDidMount() {
        const { useWindowAsScrollContainer, scrollDebounceTime } = this.props

        const container = useWindowAsScrollContainer ? window : this.refs.scrollable

        const onInViewport$ = FromEventObservable.create(container, 'scroll')
            ::debounceTime(scrollDebounceTime)
            ::map(event => {
                return React.Children.map(this.props.children, (element, i) => {
                        return this.refs[i]
                    })
                    .filter(ref => inViewport(ReactDOM.findDOMNode(ref)))
            })
            ::share()
        const pairwiseOnInViewport$ = onInViewport$
            ::startWith([])
            ::distinctUntilChanged(deepEqual)
            ::pairwise()

        this._subscription = new Subscription()
        this._subscription.add(onInViewport$.subscribe(current => {
            const { onInViewport } = this.props

            if (onInViewport) {
                onInViewport(current, container)
            }
        }))
        this._subscription.add(pairwiseOnInViewport$.subscribe(([prev, current]) => {
            const { onEnter, onLeave } = this.props

            if (onEnter) {
                const entered = current::except(prev)::toArray()
                onEnter(entered, container)
            }

            if (onLeave) {
                const leaved = prev::except(current)::toArray()
                onLeave(leaved, container)
            }
        }))
    }

    componentWillUnmount() {
        this._subscription.unsubscribe()
    }

    render() {
        const { children, className } = this.props

        return (
            <ul className={className} ref="scrollable">
                {React.Children.map(children, (element, i) => {
                    return React.cloneElement(element, { ref: i })
                })}
            </ul>
        )
    }
}
