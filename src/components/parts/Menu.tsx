import React, { Children, PropTypes, PureComponent, cloneElement } from 'react';
import classnames from 'classnames';

import createChainedFunction from 'utils/createChainedFunction';

export default class Menu extends PureComponent<any, any> {
    static propTypes = {
        children: PropTypes.node.isRequired,
        onSelect: PropTypes.func,
        pullRight: PropTypes.bool,
    };

    renderChild(child: React.ReactElement<any>) {
        const { onSelect } = this.props;
        const childKey = child.key;

        return cloneElement(child, {
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
            <div className={classnames('menu', {
                'menu-right': pullRight,
            })}>
                {Children.map(children, this.renderChild.bind(this))}
            </div>
        );
    }
}
