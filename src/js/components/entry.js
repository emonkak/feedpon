import EntryContent from './entryContent'
import PureRenderMixin from 'react-addons-pure-render-mixin'
import React from 'react'
import actionTypes from '../constants/actionTypes'

export default class Entry extends React.Component {
    static propTypes = {
        entry: React.PropTypes.object.isRequired
    }

    static contextTypes = {
        dispatch: React.PropTypes.func.isRequired,
        getObservable: React.PropTypes.func.isRequired
    }

    constructor(props) {
        super(props)

        const { content } = this.props.entry

        this.state = {
            content: content ? content.content : null
        }
    }

    handleGetFullContent() {
        this.context.dispatch({
                actionType: actionTypes.GET_FULL_CONTENT,
                url: this.props.entry.alternate[0].href
            })
            .then(content => {
                if (content) {
                    this.setState({ content })
                }
            })
    }

    render() {
        const { entry } = this.props
        const { content } = this.state

        return (
            <li className="entry">
                <h2 className="entry-title">
                    <a href={entry.alternate[0].href} target="_blank">{entry.title}</a>
                </h2>

                <p className="entry-url">
                    <a href={entry.alternate[0].href} target="_blank">{entry.alternate[0].href}</a>
                </p>

                {content ? <EntryContent content={content} /> : null}

                <footer className="entry-footer">
                    <time className="entry-timestamp">{new Date(entry.published).toLocaleString()}</time>
                    <button className="button button-default button-fill" onClick={::this.handleGetFullContent}>Get Full Content</button>
                </footer>
            </li>
        )
    }
}

Object.assign(Entry.prototype, PureRenderMixin)
