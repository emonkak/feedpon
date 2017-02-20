import * as React from 'react';
import * as classnames from 'classnames';

import createChainedFunction from 'utils/createChainedFunction';

export default class Menu extends React.PureComponent<any, any> {
    static propTypes = {
        children: React.PropTypes.node.isRequired,
        onSelect: React.PropTypes.func,
        pullRight: React.PropTypes.bool,
    };

    renderChild(child: React.ReactElement<any>) {
        const { onSelect } = this.props;
        const childKey = child.key;

        return React.cloneElement(child, {
            ...child.props,
            onSelect: createChainedFunction(
                child.props.onSelect,
                event => onSelect(event, childKey)
            ),
        });
    }

    render() {
        const { children, pullRight } = this.props;

        return (
            <ul className={classnames('menu', {
                'menu-right': pullRight,
            })}>
                {React.Children.map(children, this.renderChild.bind(this))}
            </ul>
        );
    }
}
