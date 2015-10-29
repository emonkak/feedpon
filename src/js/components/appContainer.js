import React from 'react'

export default class AppContainer extends React.Component<Props, State> {
    static propTypes = {
        dispatcher: React.PropTypes.object.isRequired,
        channels: React.PropTypes.object.isRequired
    }

    static childContextTypes = {
        dispatcher: React.PropTypes.object.isRequired,
        channels: React.PropTypes.object.isRequired
    }

    render() {
        return (<div>{this.props.children}</div>)
    }

    getChildContext() {
        return {
            dispatcher: this.props.dispatcher,
            channels: this.props.channels
        }
    }
}
