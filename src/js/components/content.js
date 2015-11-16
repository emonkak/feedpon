import Entry from './entry'
import PureRenderMixin from 'react-addons-pure-render-mixin'
import React from 'react'
import actionTypes from '../constants/actionTypes'

export default class Content extends React.Component {
    static propTypes = {
        contents: React.PropTypes.object
    }

    static contextTypes = {
        dispatch: React.PropTypes.func.isRequired,
        getObservable: React.PropTypes.func.isRequired
    }

    handleAuthenticate() {
        this.context.dispatch({ actionType: actionTypes.AUTHENTICATE })
    }

    handleUpdate() {
        this.context.dispatch({ actionType: actionTypes.GET_SUBSCRIPTIONS })
        this.context.dispatch({ actionType: actionTypes.GET_UNREAD_COUNTS })
        this.context.dispatch({ actionType: actionTypes.GET_CATEGORIES })
    }

    render() {
        const { contents } = this.props

        return (
            <div>
                <button className="button button-default button-fill" onClick={::this.handleAuthenticate}>Authenticate</button>
                <button className="button button-default button-fill" onClick={::this.handleUpdate}>Update</button>
                <ul className="entry-list">
                    {contents ? contents.items.map(::this.renderEntry) : []}
                </ul>
            </div>
        )
    }

    renderEntry(entry) {
        return (
            <Entry key={entry.id} entry={entry} />
        )
    }
}

Object.assign(Content.prototype, PureRenderMixin)
