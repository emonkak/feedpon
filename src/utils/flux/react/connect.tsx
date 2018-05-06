import React, { PureComponent, createElement } from 'react';
import { createSelector } from 'reselect';

import { StoreContext, StoreContextValue } from './StoreContext';

interface Connection<TStateProps, TDispatchProps, TOwnProps> {
    mapDispatchToProps?: (dispatch: (event: any) => void) => TDispatchProps;
    mapStateToProps?: ((state: any, ownProps: any) => TStateProps);
    mergeProps?: (stateProps: TStateProps, dispatchProps: TDispatchProps, ownProps: TOwnProps) => TStateProps & TDispatchProps & TOwnProps;
}

export default function connect<TStateProps, TDispatchProps, TOwnProps>(
    connection: Connection<TStateProps, TDispatchProps, TOwnProps> | (() => Connection<TStateProps, TDispatchProps, TOwnProps>)
) {
    return <TProps extends TStateProps & TDispatchProps & TOwnProps & { children?: React.ReactNode }>(WrappedComponent: React.ComponentType<TProps>): React.ComponentType<Partial<TProps>> => {
        return class StoreSubscriber extends PureComponent<Partial<TProps>, TStateProps> {
            private readonly _renderer: (context: StoreContextValue, ownProps: Partial<TProps>) => React.ReactNode;

            constructor(props: Partial<TProps>) {
                super(props);

                const {
                    mapDispatchToProps = returnEmptyProps as any,
                    mapStateToProps = returnEmptyProps as any,
                    mergeProps = defaultMergeProps as any
                } = typeof connection === 'function' ? connection() : connection;

                const ownPropsSelector = (context: StoreContextValue, ownProps: Partial<TProps>) => ownProps;

                const dispatchPropsSelector = createSelector(
                    ({ dispatch }: StoreContextValue) => dispatch,
                    (dispatch) => mapDispatchToProps(dispatch)
                );

                const statePropsSelector = createSelector(
                    ({ storeState }: StoreContextValue) => storeState,
                    ownPropsSelector,
                    (storeState, ownProps) => mapStateToProps(storeState, ownProps)
                );

                const propsSelector: (context: StoreContextValue, ownProps: Partial<TProps>) => TProps = createSelector(
                    statePropsSelector,
                    dispatchPropsSelector,
                    ownPropsSelector,
                    mergeProps
                );

                this._renderer = createSelector(
                    propsSelector,
                    (props) => createElement(WrappedComponent, props, props.children)
                );
            }

            render() {
                return (
                    <StoreContext.Consumer>
                        {this._renderChild}
                    </StoreContext.Consumer>
                );
            }

            private _renderChild = (context: StoreContextValue) => {
                return this._renderer(context, this.props);
            };
        };
    };
}

function defaultMergeProps<TStateProps, TDispatchProps, TOwnProps>(stateProps: TStateProps, dispatchProps: TDispatchProps, ownProps: TOwnProps): TStateProps & TDispatchProps & TOwnProps {
    return Object.assign({}, stateProps, dispatchProps, ownProps);
}

function returnEmptyProps(): any {
    return {};
}
