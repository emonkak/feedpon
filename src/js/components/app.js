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

    handleAuthenticate() {
        this.context.dispatch({ type: actionTypes.AUTHENTICATE })
    }

    handleGetSubscriptions() {
        this.context.dispatch({ type: actionTypes.GET_SUBSCRIPTIONS })
    }

    render() {
        return (
            <div>
                <header className="l-header">
                    <div className="notification"></div>
                    <nav className="nav">
                        <ul>
                        </ul>
                    </nav>
                </header>
                <main>
                    <div className="l-sidebar">
                        <ul className="subscrition-list">
                            <li><a href="#">Subscription Title</a></li>
                        </ul>
                    </div>
                    <div className="l-content">
                        <button onClick={this.handleAuthenticate.bind(this)}>Authenticate</button>
                        <button onClick={this.handleGetSubscriptions.bind(this)}>Get Subscriptions</button>
                    </div>
                </main>
            </div>
        )
    }
}

export default App
