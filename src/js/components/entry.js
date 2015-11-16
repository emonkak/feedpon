import EntryContent from './entryContent'
import PureRenderMixin from 'react-addons-pure-render-mixin'
import React from 'react'

export default class Entry extends React.Component {
    static propTypes = {
        entry: React.PropTypes.object.isRequired
    }

    constructor(props) {
        super(props)

        this.state = { contentHeight: 0 }
    }

    componentDidMount() {
        this.windowResizeListener = ::this.handleContentHeightChanged
        window.addEventListener('resize', this.windowResizeListener)
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.windowResizeListener)
    }

    handleContentHeightChanged() {
        const target = this.refs.entryContent
        if (target) {
            const { contentDocument } = target
            const html = contentDocument.documentElement
            const body = contentDocument.body
            const contentHeight = html.offsetHeight
            this.setState({ contentHeight })
        }
    }

    render() {
        const { entry } = this.props
        const { contentHeight } = this.state

        return (
            <li className="entry">
                <h2 className="entry-title">
                    <a href={entry.alternate[0].href} target="_blank">{entry.title}</a>
                </h2>

                <p className="entry-url">
                    <a href={entry.alternate[0].href} target="_blank">{entry.alternate[0].href}</a>
                </p>

                {entry.content ? <EntryContent content={entry.content.content} /> : null}

                <footer className="entry-footer">
                    <time className="entry-timestamp">{new Date(entry.published).toLocaleString()}</time>
                </footer>
            </li>
        )
    }
}

Object.assign(Entry.prototype, PureRenderMixin)
