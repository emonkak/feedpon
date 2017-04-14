import { Children, PropTypes, PureComponent } from 'react';

import Store from '../Store';

type StoreContextProps = {
    store: Store<any, any>
};

export default class StoreContext extends PureComponent<StoreContextProps, {}> {
    static propTypes = {
        store: PropTypes.instanceOf(Store).isRequired,
        children: PropTypes.element.isRequired
    };

    static childContextTypes = {
        store: PropTypes.instanceOf(Store).isRequired
    };

    getChildContext() {
        const { store } = this.props;
        return { store };
    }

    render() {
        return Children.only(this.props.children);
    }
}
