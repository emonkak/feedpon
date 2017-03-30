import { ComponentClass, PropTypes, PureComponent, createElement } from 'react';

import Store from 'supports/Store';

export default function connect<TStateProps, TDispatchProps>(
    mapStateToProps: (state: any) => TStateProps,
    mapDispatchToProps?: (dispatch: (event: any) => void) => TDispatchProps
): <TProps extends TStateProps & TDispatchProps>(component: ComponentClass<TProps>) => ComponentClass<Partial<TProps>> {
    if (!mapDispatchToProps) {
        mapDispatchToProps = (dispatch) => ({}) as any;
    }

    return <TProps extends TStateProps & TDispatchProps>(component: ComponentClass<TProps>): ComponentClass<Partial<TProps>> => {
        return class StoreSubscriber extends PureComponent<Partial<TProps>, TStateProps> {
            static contextTypes = {
                store: PropTypes.instanceOf(Store).isRequired
            };

            private dispatchProps: TDispatchProps;

            private subscription: { unsubscribe: () => void };

            constructor(props: Partial<TProps>, context: any) {
                super(props, context);

                this.state = mapStateToProps(context.store.state);
            }

            componentWillMount() {
                const store = this.context.store as Store<any, any>;

                this.dispatchProps = mapDispatchToProps(store.dispatch.bind(store));

                this.subscription = store.subscribe(
                    state => this.setState(mapStateToProps(state))
                );
            }

            componentWillUnmount() {
                this.subscription.unsubscribe();

                this.dispatchProps = null;
                this.subscription = null;
            }

            render() {
                const { children } = this.props;
                const props = Object.assign({}, this.state, this.dispatchProps, this.props);

                return createElement(component, props, children);
            }
        };
    };
}
