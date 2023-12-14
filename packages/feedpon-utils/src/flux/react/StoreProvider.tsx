import React, { Children, PureComponent, } from 'react';

import { StoreContext } from './StoreContext';
import { Store } from '../types';

export interface StoreProviderProps {
    store: Store<any, any>;
    children?: React.ReactNode,
}

type StoreProviderState = StoreContext;

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

    override componentDidMount() {
        const { store } = this.props;

        this._unsubscribe = store.subscribe((state) => {
            this.setState({
                storeState: state
            });
        });
    }

    override componentWillUnmount() {
        if (this._unsubscribe) {
            this._unsubscribe();
            this._unsubscribe = null;
        }
    }

    override render() {
        return (
            <StoreContext.Provider value={this.state}>
                {Children.only(this.props.children)}
            </StoreContext.Provider>
        );
    }
}
