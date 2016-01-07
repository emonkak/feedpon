import EntryList from './EntryList'
import PureRenderMixin from 'react-addons-pure-render-mixin'
import React from 'react'
import appContextTypes from './appContextTypes'
import { Router, Route } from 'react-router'
import { GetContents } from '../../constants/actionTypes'

export default class Content extends React.Component {
    static propTypes = {
        contents: React.PropTypes.object
    }

    static contextTypes = appContextTypes

    constructor() {
        super()
        this.state = { isLoading: false }
    }

    componentDidMount() {
        const { params } = this.props

        this.context.dispatch({
            actionType: GetContents,
            payload: {
                streamId: params.streamId
            }
        })
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.params.streamId !== nextProps.params.streamId) {
            this.context.dispatch({
                actionType: GetContents,
                payload: {
                    streamId: nextProps.params.streamId
                }
            })
        }
    }

    handleLoading() {
        const { contents } = this.props
        if (contents) {
            this.setState({ isLoading: true })

            this.dispatch({
                actionType: GetContents,
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
        const { contents } = this.props
        return (
            <div>
                {contents ? <EntryList contents={contents} /> : null}
            </div>
        )
    }
}

Object.assign(Content.prototype, PureRenderMixin)
