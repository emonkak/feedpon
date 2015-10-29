import React from 'react'

export default class Counter extends React.Component {
    static propTypes = {
        count: React.PropTypes.number,
        onChanged: React.PropTypes.func
    }

    constructor(props) {
        super(props)
    }

    handleIncrement() {
        if (this.props.onChanged) this.props.onChanged({ delta: 1 })
    }

    handleDecrement() {
        if (this.props.onChanged) this.props.onChanged({ delta: -1 })
    }

    render() {
        return (
            <div>
                <button onClick={this.handleIncrement.bind(this)}>increment</button>
                <button onClick={this.handleDecrement.bind(this)}>decrement</button>
                <p>Counter: <strong>{this.props.count}</strong></p>
            </div>
        )
    }
}
