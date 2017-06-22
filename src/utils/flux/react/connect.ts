import PropTypes from 'prop-types';
import { ComponentType, PureComponent, createElement } from 'react';

import { Store } from '../types';

interface Connection<TStateProps, TDispatchProps, TOwnProps> {
    mapDispatchToProps?: (dispatch: (event: any) => void, ownProps: TOwnProps) => TDispatchProps;
    mapStateToProps?: ((state: any, ownProps: any) => TStateProps);
    mergeProps?: (stateProps: TStateProps, dispatchProps: TDispatchProps, ownProps: TOwnProps) => TStateProps & TDispatchProps & TOwnProps;
}

export default function connect<TStateProps, TDispatchProps, TOwnProps>(
    connectionOrConnector: Connection<TStateProps, TDispatchProps, TOwnProps> | (() => Connection<TStateProps, TDispatchProps, TOwnProps>)
): <TProps extends TStateProps & TDispatchProps & TOwnProps>(WrappedComponent: ComponentType<TProps>) => ComponentType<Partial<TProps>> {
    return <TProps extends TStateProps & TDispatchProps & TOwnProps>(WrappedComponent: ComponentType<TProps>): ComponentType<Partial<TProps>> => {
        return class StoreSubscriber extends PureComponent<Partial<TProps>, TStateProps> {
            static contextTypes = {
                store: PropTypes.shape({
                    getState: PropTypes.func.isRequired,
                    dispatch: PropTypes.func.isRequired,
                    subscribe: PropTypes.func.isRequired
                }).isRequired
            };

            context: { store: Store<any, any> };

            private readonly mapStateToProps: (state: any, ownProps: any) => TStateProps;

            private readonly mapDispatchToProps: (dispatch: (event: any) => void, ownProps: any) => TDispatchProps;

            private readonly mergeProps: (stateProps: TStateProps, dispatchProps: TDispatchProps, ownProps: Partial<TProps>) => TProps;

            private dispatchProps: TDispatchProps;

            private subscription: (() => void) | null = null;

            constructor(props: Partial<TProps>, context: { store: Store<any, any> }) {
                super(props, context);

                const { mapDispatchToProps, mapStateToProps, mergeProps } = typeof connectionOrConnector === 'function'
                    ? connectionOrConnector()
                    : connectionOrConnector;
                const { store } = context;

                this.mapStateToProps = mapStateToProps || (() => ({}) as any);
                this.mapDispatchToProps = mapDispatchToProps || (() => ({}) as any);
                this.mergeProps = mergeProps || ((stateProps, dispatchProps, ownProps) => Object.assign({}, stateProps, dispatchProps, ownProps) as any);

                this.state = this.mapStateToProps(store.getState(), props);
                this.dispatchProps = this.mapDispatchToProps(store.dispatch, props);
            }

            componentWillMount() {
                const { store } = this.context;

                this.subscription = store.subscribe(
                    (state: any) => this.setState(this.mapStateToProps(state, this.props))
                );
            }

            componentWillReceiveProps(nextProps: Partial<TProps>) {
                if (this.mapStateToProps.length === 2) {
                    const { store } = this.context;

                    this.setState(this.mapStateToProps(store.getState(), nextProps));
                }

                if (this.mapDispatchToProps.length === 2) {
                    const { store } = this.context;

                    this.dispatchProps = this.mapDispatchToProps(store.getState(), nextProps);
                }
            }

            componentWillUnmount() {
                if (this.subscription) {
                    this.subscription();
                    this.subscription = null;
                }
            }

            render() {
                const { children } = this.props;

                const props = this.mergeProps(
                    this.state,
                    this.dispatchProps,
                    this.props
                );

                return createElement<TProps>(WrappedComponent as any, props, children);
            }
        };
    };
}
