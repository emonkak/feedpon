import PureRenderMixin from 'react-addons-pure-render-mixin'
import React from 'react'
import appContextTypes from './appContextTypes'
import baseStyle from '../../../less/base.less'

function wrapContent(body) {
    return `<html><head><base target="_blank"><style>${baseStyle}</style></head><body>${body}</body></html>`
}

export default class EntryContent extends React.Component {
    static propTypes = {
        content: React.PropTypes.string.isRequired
    }

    static contextTypes = appContextTypes

    constructor(props) {
        super(props)

        this.state = { height: 0 }
    }

    componentDidMount() {
        this.windowResizeListener = ::this.handleHeightChanged
        window.addEventListener('resize', this.windowResizeListener)
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.windowResizeListener)
    }

    handleHeightChanged(event) {
        const target = this.refs.entryContent
        const html = target.contentDocument.documentElement
        this.setState({ height: html.offsetHeight })
    }

    render() {
        const { content } = this.props
        const { height } = this.state

        return (
            <iframe ref="entryContent"
                    className="entry-content"
                    srcDoc={wrapContent(content)}
                    height={height}
                    seamless="seamless"
                    sandbox="allow-same-origin"
                    onLoad={::this.handleHeightChanged} />
        )
    }
}

Object.assign(EntryContent.prototype, PureRenderMixin)
