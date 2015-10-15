/// <reference path="../../DefinitelyTyped/react/react.d.ts" />

import * as React from 'react'

export default class Subscription extends React.Component {
    static propTypes: React.ValidationMap<any> = {
        title: React.PropTypes.string.isRequired,
        iconUrl: React.PropTypes.string,
        onClick: React.PropTypes.function
    }

    render() {
        let badge = ''
        if (this.props.unreadCount > 0) {
            badge = <span className="subscription-badge">{this.props.unreadCount}</span>
        }

        return (
            <li>
                <a className="subscription-item" onClick={this.props.onClick}>
                    <img className="subscription-icon" alt={this.props.title} src={this.props.iconUrl} width="16" height="16" />
                    <span className="subscription-title">{this.props.title}</span>
                    {badge}
                </a>
            </li>
        )
    }
}
