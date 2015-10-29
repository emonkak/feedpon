import Counter from './counter'
import React from 'react'
import actionTypes from '../constants/actionTypes'

export default class App extends React.Component {
    static contextTypes = {
        dispatcher: React.PropTypes.object.isRequired,
        channels: React.PropTypes.object.isRequired
    }

    constructor(props) {
        super(props)

        this.state = { count: 0 }
    }

    componentDidMount() {
        this.subscriber = this.context.channels.count
            .subscribe(count => this.setState({ count }))
    }

    componentWillUnmount() {
        this.subscriber.dispose()
    }

    handleCountChanged({ delta }) {
        this.context.dispatcher.dispatch({ type: actionTypes.COUNT, delta })
    }

    render() {
        return (
            <Counter count={this.state.count} onChanged={this.handleCountChanged.bind(this)} />
        )
    }
}
