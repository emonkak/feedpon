import React, { Children, PureComponent } from 'react';

import { StoreContext, StoreContextValue } from './StoreContext';
import { Store } from '../types';

export interface StoreProviderProps {
    store: Store<any, any>;
}

type StoreProviderState = StoreContextValue;

export default class StoreProvider extends PureComponent<StoreProviderProps, StoreProviderState> {
    private _unsubscribe: (() => void) | null = null;

    constructor(props: StoreProviderProps) {
        super(props);

        const { store } = props;

        this.state = {
            storeState: store.getState(),
            dispatch: store.dispatch
        };
    }

    componentDidMount() {
        const { store } = this.props;

        this._unsubscribe = store.subscribe((state) => {
            this.setState({
                storeState: state
            });
        });
    }

    componentWillUnmount() {
        if (this._unsubscribe) {
            this._unsubscribe();
            this._unsubscribe = null;
        }
    }

    render() {
        return (
            <StoreContext.Provider value={this.state}>
                {Children.only(this.props.children)}
            </StoreContext.Provider>
        );
    }
}
