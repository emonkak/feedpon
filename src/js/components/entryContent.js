import PureRenderMixin from 'react-addons-pure-render-mixin'
import React from 'react'

const STYLE = `
<style>
html, body {
  padding: 0;
  margin: 0;
}

body {
  font-family: 'Optima', 'YuMincho', serif;
  font-size: 16px;
  line-height: 1.5;
}

a {
  text-decoration: underline;
  color: black;
}

a:visited {
color: inherit;
}

h1, h2, h3, h4, h5, h6, b, em, strong {
  font-family: 'Gill Sans', 'YuGothic', sans-serif;
}

pre, code, var, samp, kbd, tt {
  font-family: 'Consolas', 'YuGothic', monospace;
}
</style>`

export default class EntryContent extends React.Component {
    static propTypes = {
        content: React.PropTypes.string.isRequired
    }

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
                    srcDoc={STYLE + content}
                    height={height}
                    seamless="seamless"
                    sandbox="allow-same-origin"
                    onLoad={::this.handleHeightChanged} />
        )
    }
}

Object.assign(EntryContent.prototype, PureRenderMixin)
