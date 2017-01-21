import * as React from 'react';

import Store from 'supports/Store';

type Props = {
    store: Store<any, any>,
};

export default class StoreContext extends React.PureComponent<Props, {}> {
    static propTypes = {
        store: React.PropTypes.instanceOf(Store).isRequired,
        children: React.PropTypes.element.isRequired,
    };

    static childContextTypes = {
        store: React.PropTypes.instanceOf(Store).isRequired,
    };

    getChildContext() {
        const { store } = this.props;
        return { store };
    }

    render() {
        return React.Children.only(this.props.children);
    }
}
