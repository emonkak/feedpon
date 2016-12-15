import { ComponentClass, PureComponent, createElement } from 'react';
import Store from '../Store';

export default function connect<TAction, TState>(mapStateToProps?: (state: TState) => any,
                                                 mapDispatchToProps?: (dispatch: (action: TAction) => void) => any): (component: ComponentClass<any>) => ComponentClass<any> {
    if (!mapStateToProps) {
        mapStateToProps = state => state;
    }

    if (!mapDispatchToProps) {
        mapDispatchToProps = dispatch => ({});
    }

    return (component: ComponentClass<any>) => {
        return class StateWrapper extends PureComponent<any, TState> {
            private dispatchProps: any;

            private subscription: { unsubscribe: () => void };

            componentWillMount() {
                const store = this.context.store as Store<TAction, TState>;

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
                const props = Object.assign(this.dispatchProps, this.state, this.props);

                return createElement(component, props, this.props.children);
            }
        }
    };
}
