import PropTypes from 'prop-types';
import { ComponentClass, PureComponent, createElement } from 'react';

import { Store } from '../types';

export default function connect<TStateProps, TDispatchProps>(
    mapStateToProps: (state: any) => TStateProps,
    mapDispatchToProps?: (dispatch: (event: any) => void) => TDispatchProps
): <TProps extends TStateProps & TDispatchProps>(component: ComponentClass<TProps>) => ComponentClass<Partial<TProps>> {
    if (!mapDispatchToProps) {
        mapDispatchToProps = (dispatch) => ({}) as any;
    }

    return <TProps extends TStateProps & TDispatchProps>(
        component: ComponentClass<TProps>
    ): ComponentClass<Partial<TProps>> => {
        return class StoreSubscriber extends PureComponent<Partial<TProps>, TStateProps> {
            static contextTypes = {
                store: PropTypes.shape({
                    getState: PropTypes.func.isRequired,
                    replaceState: PropTypes.func.isRequired,
                    dispatch: PropTypes.func.isRequired,
                    subscribe: PropTypes.func.isRequired
                }).isRequired
            };

            context: { store: Store<any, any> };

            private dispatchProps: TDispatchProps | null = null;

            private subscription: (() => void) | null = null;

            constructor(props: Partial<TProps>, context: any) {
                super(props, context);

                this.state = mapStateToProps(context.store.getState());
            }

            componentWillMount() {
                const store = this.context.store;

                this.dispatchProps = mapDispatchToProps!(store.dispatch);
                this.subscription = store.subscribe(
                    (state: any) => this.setState(mapStateToProps(state))
                );
            }

            componentWillUnmount() {
                if (this.subscription) {
                    this.subscription();
                    this.subscription = null;
                }
            }

            render() {
                const { children } = this.props;
                const props = Object.assign(
                    {},
                    this.state,
                    this.dispatchProps,
                    this.props
                ) as TProps;

                return createElement(component, props, children);
            }
        };
    };
}
