import { Children, PropTypes, PureComponent } from 'react';

import Store from 'supports/Store';

type Props = {
    store: Store<any, any>
};

export default class StoreContext extends PureComponent<Props, {}> {
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
