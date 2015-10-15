/// <reference path="../../DefinitelyTyped/react/react.d.ts" />

import * as React from 'react'

interface Props {
    count: number
    onChanged: (count: number) => void
}

interface State {
    count: number
}

export default class Counter extends React.Component<Props, State> {
    static propTypes: React.ValidationMap<any> = {
        count: React.PropTypes.number,
        onChanged: React.PropTypes.func
    }

    constructor(props) {
        super(props)

        this.state = { count: this.props.count }
    }

    componentWillReceiveProps(nextProps) {
        this.setState({ count: nextProps.count })
    }

    handleClick() {
        this.setState(function(state) {
            const count = state.count + 1

            if (this.props.onChanged) this.props.onChanged(count)

            return { count }
        })
    }

    render() {
        return (
            <p><button onClick={this.handleClick.bind(this)}>click!</button> Counter: <strong>{this.state.count}</strong></p>
        )
    }
}
