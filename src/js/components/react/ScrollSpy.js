import React from 'react'
import ReactDOM from 'react-dom'
import difference from 'lodash.difference'
import inViewport from 'in-viewport'
import { FromEventObservable } from 'rxjs/observable/fromEvent'
import { Subscription } from 'rxjs/Subscription'
import { debounceTime } from 'rxjs/operator/debounceTime'
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
        scrollDebounceTime: 200
    }

    componentDidMount() {
        const { children, useWindowAsScrollContainer, onInViewport, onEnter, onLeave, scrollDebounceTime } = this.props

        const container = useWindowAsScrollContainer ? window : this.refs.scrollable
        const childNodes = React.Children.map(children, (element, i) => {
            const ref = this.refs[i]
            return ReactDOM.findDOMNode(ref)
        })

        const onInViewport$ = FromEventObservable.create(container, 'scroll')
            ::debounceTime(scrollDebounceTime)
            ::map(event => {
                for (let i = 0, l = childNodes.length; i < l; i++) {
                    if (inViewport(childNodes[i])) {
                        const result = [this.refs[i]]
                        for (let j = i + 1; j < l && inViewport(childNodes[j]); j++) {
                            result.push(this.refs[j])
                        }
                        return result
                    }
                }
                return []
            })
            ::share()
        const onEnter$ = onInViewport$
            ::startWith([])
            ::pairwise()
            ::map(([prev, current]) => difference(current, prev))
        const onLeave$ = onInViewport$
            ::startWith([])
            ::pairwise()
            ::map(([prev, current]) => difference(prev, current))

        this._subscription = new Subscription()

        if (onInViewport) {
            this._subscription.add(
                onInViewport$.subscribe(elements => onInViewport(elements, container))
            )
        }
        if (onEnter) {
            this._subscription.add(
                onEnter$.subscribe(elements => onEnter(elements, container))
            )
        }
        if (onLeave) {
            this._subscription.add(
                onLeave$.subscribe(elements => onLeave(elements, container))
            )
        }
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
