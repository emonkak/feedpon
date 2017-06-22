import PropTypes from 'prop-types';
import { Children, PureComponent } from 'react';

import { Store } from '../types';

interface StoreContextProps {
    store: Store<any, any>;
}

export default class StoreProvider extends PureComponent<StoreContextProps, {}> {
    context: { store: Store<any, any> };

    static childContextTypes = {
        store: PropTypes.shape({
            getState: PropTypes.func.isRequired,
            dispatch: PropTypes.func.isRequired,
            subscribe: PropTypes.func.isRequired
        }).isRequired
    };

    getChildContext() {
        const { store } = this.props;
        return { store };
    }

    render() {
        return Children.only(this.props.children);
    }
}
