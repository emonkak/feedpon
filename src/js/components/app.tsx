/// <reference path="../../DefinitelyTyped/react/react.d.ts" />

import * as React from 'react'
import Counter from './counter'

interface Props {
    name: string
}
interface State {
    count: number
}

export default class App extends React.Component<Props, State> {
    static propTypes: React.ValidationMap<any> = {
        name: React.PropTypes.string
    }

    static contextTypes: React.ValidationMap<any> = {
        dispatcher: React.PropTypes.object.isRequired
    }

    constructor(props) {
        super(props)

        this.state = { count: 0 }
    }

    handleIncrement() {
        this.setState(function(state) {
            return { count: state.count + 1 }
        })
    }

    handleReset() {
        this.setState({ count: 0 })
    }

    handleCountChanged(count) {
        (this.context as any).dispatcher.dispatch({ type: 'count', count })

        this.setState({ count })
    }

    render() {
        return (
            <div>
                <p>hello <strong>{this.props.name}</strong></p>
                <button onClick={this.handleIncrement.bind(this)}>Increment</button>
                <button onClick={this.handleReset.bind(this)}>Reset</button>
                <Counter count={this.state.count} onChanged={this.handleCountChanged.bind(this)} />
                <div>{this.state.count}</div>
            </div>
        )
    }
}
