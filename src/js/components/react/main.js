import Entry from './entry'
import PureRenderMixin from 'react-addons-pure-render-mixin'
import React from 'react'

export default class Main extends React.Component {
    static propTypes = {
        contents: React.PropTypes.object
    }

    render() {
        const { contents } = this.props

        const entries = contents ? contents.items.map(::this.renderEntry) : []

        return (
            <div>
                <ul className="entry-list">{entries}</ul>
            </div>
        )
    }

    renderEntry(entry) {
        return (
            <Entry key={entry.id} entry={entry} />
        )
    }
}

Object.assign(Main.prototype, PureRenderMixin)
