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

    handleAuthorize() {
        this.context.dispatch({ type: actionTypes.AUTH })
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
                        <button onClick={this.handleAuthorize.bind(this)}>Authorize</button>
                    </div>
                </main>
            </div>
        )
    }
}

export default App
