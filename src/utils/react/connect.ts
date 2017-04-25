import PropTypes from 'prop-types';
import { ComponentClass, PureComponent, createElement } from 'react';

import Store from '../Store';

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

            private dispatchProps: TDispatchProps | null = null;

            private subscription: { unsubscribe: () => void } | null = null;

            constructor(props: Partial<TProps>, context: any) {
                super(props, context);

                this.state = mapStateToProps(context.store.state);
            }

            componentWillMount() {
                const store = this.context.store as Store<any, any>;

                this.dispatchProps = mapDispatchToProps!(store.dispatch.bind(store));

                this.subscription = store.subscribe(
                    state => this.setState(mapStateToProps(state))
                );
            }

            componentWillUnmount() {
                if (this.subscription) {
                    this.subscription.unsubscribe();
                }
            }

            render() {
                const { children } = this.props;
                const props = Object.assign({}, this.state, this.dispatchProps, this.props) as TProps;

                return createElement(component, props, children);
            }
        };
    };
}
