import EntryList from './EntryList'
import PureRenderMixin from 'react-addons-pure-render-mixin'
import React from 'react'
import appContextTypes from './appContextTypes'
import { Router, Route } from 'react-router'
import { SelectStream } from '../../constants/actionTypes'

export default class Content extends React.Component {
    static propTypes = {
        contents: React.PropTypes.object
    }

    static contextTypes = appContextTypes

    constructor() {
        super()
        this.state = { isLoading: false }
    }

    handleLoading() {
        const { contents } = this.props
        if (contents) {
            this.setState({ isLoading: true })

            this.dispatch({
                actionType: SelectStream,
                continuation: contents.continuation
            }).then(() => {
                this.setState({ isLoading: false })
            })
        }
    }

    render() {
        const { contents } = this.props
        return (
            <div>
                {contents ? <EntryList contents={contents} /> : null}
            </div>
        )
    }
}

Object.assign(Content.prototype, PureRenderMixin)
