import Entry from './Entry'
import PureRenderMixin from 'react-addons-pure-render-mixin'
import React from 'react'
import ReactDOM from 'react-dom'
import ScrollSpy from './ScrollSpy'
import Waypoint from 'react-waypoint'
import appContextTypes from './appContextTypes'
import maxBy from 'lodash.maxby'
import { EntryActivated } from '../../constants/eventTypes'
import { FetchContents } from '../../constants/actionTypes'

export default class EntryList extends React.Component {
    static propTypes = {
        contents: React.PropTypes.object.isRequired,
        activeEntry: React.PropTypes.object
    }

    static contextTypes = appContextTypes

    constructor() {
        super()
        this.state = { isLoading: false }
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.contents !== nextProps.contents) {
            this.setState({ isLoading: false })
        }
    }

    render() {
        return (
            <ScrollSpy className="entry-list"
                       useWindowAsScrollContainer
                       onInViewport={::this.handleInViewport}>
                {this.renderEntries()}
                {this.renderWaypont()}
            </ScrollSpy>
        )
    }

    renderEntries(entry) {
        const { contents, activeEntry } = this.props
        return contents.items.map(item => {
            return (
                <Entry key={item.id} entry={item} isActive={item === activeEntry} />
            )
        })
    }

    renderWaypont() {
        const { isLoading } = this.state
        if (isLoading) return null

        return <Waypoint onEnter={::this.handleLoading} threshold={2.0} />
    }

    handleLoading() {
        const { contents } = this.props

        this.setState({ isLoading: true })

        this.context.dispatch({
            actionType: FetchContents,
            payload: {
                streamId: contents.id,
                continuation: contents.continuation
            }
        })
    }

    handleInViewport(elements, container) {
        const element = maxBy(elements, element => {
            const node = ReactDOM.findDOMNode(element)

            let scrollTop = container.scrollY
            let scrollBottom = scrollTop + container.innerHeight
            let offsetTop = node.offsetTop
            let offsetBottom = offsetTop + node.offsetHeight

            if (offsetTop < scrollTop) {
                offsetTop = scrollTop
            }
            if (offsetBottom > scrollBottom) {
                offsetBottom = scrollBottom
            }

            return offsetBottom - offsetTop
        })
        if (element && (element.props.entry !== this.props.activeEntry)) {
            this.context.dispatchEvent({
                eventType: EntryActivated,
                entry: element.props.entry
            })
        }
    }
}

Object.assign(EntryList.prototype, PureRenderMixin)

