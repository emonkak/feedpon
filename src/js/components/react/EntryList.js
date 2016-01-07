import Entry from './Entry'
import PureRenderMixin from 'react-addons-pure-render-mixin'
import React from 'react'
import Waypoint from 'react-waypoint'
import appContextTypes from './appContextTypes'
import { GetContents } from '../../constants/actionTypes'

export default class EntryList extends React.Component {
    static propTypes = {
        contents: React.PropTypes.object.isRequired
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

    handleLoading() {
        const { contents } = this.props

        this.setState({ isLoading: true })

        this.context.dispatch({
            actionType: GetContents,
            payload: {
                streamId: contents.id,
                continuation: contents.continuation
            }
        })
    }

    render() {
        return (
            <ul className="entry-list">
                {this.renderEntries()}
                {this.renderWaypont()}
            </ul>
        )
    }

    renderEntries(entry) {
        const { contents } = this.props
        return contents.items.map(item => <Entry key={item.id} entry={item} />)
    }

    renderWaypont() {
        const { isLoading } = this.state
        if (isLoading) return null

        return <Waypoint onEnter={::this.handleLoading} threshold={2.0} />
    }
}

Object.assign(EntryList.prototype, PureRenderMixin)

