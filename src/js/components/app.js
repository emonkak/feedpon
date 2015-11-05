import Counter from './counter'
import React from 'react'
import actionTypes from '../constants/actionTypes'

class App extends React.Component {
    static contextTypes = {
        dispatch: React.PropTypes.func.isRequired,
        getObservable: React.PropTypes.func.isRequired
    }

    constructor(props) {
        super(props)

        this.state = { count: 0 }
    }

    componentDidMount() {
    }

    componentWillUnmount() {
    }

    render() {
        return (
            <Counter count={this.state.count} onChanged={this.handleCountChanged.bind(this)} />
        )
    }
}

export default App
