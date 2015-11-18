import Entry from './entry'
import PureRenderMixin from 'react-addons-pure-render-mixin'
import React from 'react'

export default class Content extends React.Component {
    static propTypes = {
        contents: React.PropTypes.object
    }

    render() {
        const { contents } = this.props

        return (
            <div>
                <ul className="entry-list">
                    {contents ? contents.items.map(::this.renderEntry) : []}
                </ul>
            </div>
        )
    }

    renderEntry(entry) {
        return (
            <Entry key={entry.id} entry={entry} />
        )
    }
}

Object.assign(Content.prototype, PureRenderMixin)
