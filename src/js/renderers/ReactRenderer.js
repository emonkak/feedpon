import AppContainer from '../components/react/AppContainer'
import AppRoot from '../components/react/AppRoot'
import React from 'react'
import ReactDOM from 'react-dom'

export default class ReactRenderer {
    constructor(actionDispatcher) {
        this.actionDispatcher = actionDispatcher
    }

    render(element, state) {
        return ReactDOM.render(
            <AppContainer actionDispatcher={this.actionDispatcher}>
                <AppRoot {...state} />
            </AppContainer>,
            element
        )
    }
}
