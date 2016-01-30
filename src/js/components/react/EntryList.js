import Entry from './Entry'
import PureRenderMixin from 'react-addons-pure-render-mixin'
import React from 'react'
import ReactDOM from 'react-dom'
import ScrollSpy from './ScrollSpy'
import Waypoint from 'react-waypoint'
import appContextTypes from './appContextTypes'
import filter from '../../shared/collections/filter'
import maxBy from '../../shared/collections/maxBy'
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
                <Entry key={item.id} entry={item} isActive={activeEntry && item.id === activeEntry.id} />
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
        const scrollTop = container.scrollY
        const scrollBottom = scrollTop + container.innerHeight

        const element = elements
            ::filter(element => element instanceof Entry)
            ::maxBy(element => {
                const node = ReactDOM.findDOMNode(element)
                const offsetTop = node.offsetTop
                const offsetBottom = offsetTop + node.offsetHeight

                if (offsetTop >= scrollTop && offsetBottom <= scrollBottom) {
                    return scrollBottom - offsetTop
                }

                const displayTop = offsetTop < scrollTop ? scrollTop : offsetTop
                const displayBottom = offsetBottom > scrollBottom ? scrollBottom : offsetBottom

                return displayBottom - displayTop
            })

        if (element
            && (this.props.activeEntry == null
                || element.props.entry.id !== this.props.activeEntry.id)) {
            this.context.dispatchEvent({
                eventType: EntryActivated,
                entry: element.props.entry
            })
        }
    }
}

Object.assign(EntryList.prototype, PureRenderMixin)

