import EntryContent from './entryContent'
import PureRenderMixin from 'react-addons-pure-render-mixin'
import React from 'react'
import { GetFullContent } from '../constants/actionTypes'

export default class Entry extends React.Component {
    static propTypes = {
        entry: React.PropTypes.object.isRequired
    }

    static contextTypes = {
        dispatch: React.PropTypes.func.isRequired
    }

    handleGetFullContent() {
        const { entry } = this.props
        const fullContents = entry._fullContents || []

        const url = fullContents.length > 0
            ? fullContents[fullContents.length - 1].nextLink
            : entry.alternate[0].href

        if (url != null) {
            this.context.dispatch({
                actionType: GetFullContent,
                streamId: entry.id,
                url
            })
        }
    }

    render() {
        const { entry } = this.props
        const fullContents = entry._fullContents || []

        const body = fullContents.length > 0
            ? fullContents.map(({ content }, i) => <EntryContent key={i} content={content} />)
            : entry.content ? <EntryContent content={entry.content.content} /> : null

        return (
            <li className="entry">
                <h2 className="entry-title">
                    <a href={entry.alternate[0].href} target="_blank">{entry.title}</a>
                </h2>

                <p className="entry-url">
                    <a href={entry.alternate[0].href} target="_blank">{entry.alternate[0].href}</a>
                </p>

                <div className="entry-body">{body}</div>

                <footer className="entry-footer">
                    <time className="entry-timestamp">{new Date(entry.published).toLocaleString()}</time>
                    <button className="button button-default button-fill" onClick={::this.handleGetFullContent}>Get Full Content</button>
                </footer>
            </li>
        )
    }
}

Object.assign(Entry.prototype, PureRenderMixin)
