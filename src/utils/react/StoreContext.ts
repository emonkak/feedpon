import PropTypes from 'prop-types';
import { Children, PureComponent } from 'react';

import Store from '../Store';

interface StoreContextProps {
    store: Store<any, any>;
}

export default class StoreContext extends PureComponent<StoreContextProps, {}> {
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
