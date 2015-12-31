import PureRenderMixin from 'react-addons-pure-render-mixin'
import React from 'react'
import appContextTypes from './appContextTypes'
import baseStyle from '../../../less/base.less'
import escape from 'lodash.escape'

function wrapContent(body, url) {
    return `<html><head><base href="${escape(url)}" target="_blank"><style>${baseStyle}</style></head><body>${body}</body></html>`
}

export default class EntryContent extends React.Component {
    static propTypes = {
        url: React.PropTypes.string.isRequired,
        content: React.PropTypes.string.isRequired
    }

    static contextTypes = appContextTypes

    constructor(props) {
        super(props)

        this.state = { height: 0 }
        this.heightChangedListener = this.handleHeightChanged.bind(this)
    }

    componentDidMount() {
        window.addEventListener('resize', this.heightChangedListener)
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.heightChangedListener)
    }

    handleHeightChanged(event) {
        const { frame } = this.refs
        this.setState({ height: frame.contentDocument.documentElement.offsetHeight })
    }

    render() {
        const { content, url } = this.props
        const { height } = this.state

        return (
            <iframe ref="frame"
                    className="entry-content"
                    srcDoc={wrapContent(content, url)}
                    height={height}
                    seamless="seamless"
                    sandbox="allow-popups allow-same-origin"
                    onLoad={this.heightChangedListener} />
        )
    }
}

Object.assign(EntryContent.prototype, PureRenderMixin)
