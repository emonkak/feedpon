import EntryList from './EntryList'
import PureRenderMixin from 'react-addons-pure-render-mixin'
import React from 'react'
import appContextTypes from './appContextTypes'
import { Router, Route } from 'react-router'
import { FetchContents } from '../../constants/actionTypes'

export default class Content extends React.Component {
    static propTypes = {
        contents: React.PropTypes.object,
        activeEntry: React.PropTypes.object
    }

    static contextTypes = appContextTypes

    constructor() {
        super()
        this.state = { isLoading: false }
    }

    componentWillMount() {
        const { params } = this.props

        this.context.dispatch({
            actionType: FetchContents,
            payload: {
                streamId: params.streamId
            }
        })
    }

    componentDidUpdate(prevProps) {
        const { params } = this.props

        if (params.streamId !== prevProps.params.streamId) {
            this.context.dispatch({
                actionType: FetchContents,
                payload: {
                    streamId: params.streamId
                }
            })
        }
    }

    handleLoading() {
        const { contents } = this.props
        if (contents) {
            this.setState({ isLoading: true })

            this.dispatch({
                actionType: FetchContents,
                payload: {
                    streamId: contents.id,
                    continuation: contents.continuation
                }
            }).then(() => {
                this.setState({ isLoading: false })
            })
        }
    }

    render() {
        const { contents, activeEntry } = this.props
        return (
            <div>
                {contents ? <EntryList contents={contents} activeEntry={activeEntry} /> : null}
            </div>
        )
    }
}

Object.assign(Content.prototype, PureRenderMixin)
